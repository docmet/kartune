"""
Laps API endpoints for uploading and managing telemetry lap data
"""

import hashlib
import os
from datetime import datetime
from pathlib import Path
from typing import Any, List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.api import deps
from app.core.config import settings
from app.models.driver import Driver
from app.models.equipment import Kart
from app.models.lap import Lap
from app.models.session import Session as RacingSession  # Avoid conflict with db Session
from app.models.track import Track
from app.models.user import User
from app.schemas.lap import LapResponse, LapUploadResponse
from app.schemas.telemetry import TelemetryDataPoint as TelemetryDataPointSchema
from app.services.parsers import ParserRegistry
from app.services.parsers.rf2_parser import RF2Parser  # noqa: F401 - registers parser

router = APIRouter()


def get_file_hash(file_path: str) -> str:
    """Calculate SHA256 hash of a file"""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def find_or_create_driver(db: Session, name: str, team_id: int) -> tuple[Driver, bool]:
    """Find existing driver or create new one"""
    driver = db.query(Driver).filter(Driver.name == name, Driver.team_id == team_id).first()
    if driver:
        return driver, False
    driver = Driver(name=name, team_id=team_id)
    db.add(driver)
    db.flush()
    return driver, True


def find_or_create_track(db: Session, name: str) -> tuple[Track, bool]:
    """Find existing track or create new one (tracks are global, not team-specific)"""
    track = db.query(Track).filter(Track.name == name).first()
    if track:
        return track, False
    track = Track(name=name)
    db.add(track)
    db.flush()
    return track, True


def find_or_create_kart(db: Session, name: str, team_id: int) -> tuple[Kart, bool]:
    """Find existing kart or create new one"""
    # Kart model uses 'chassis_brand' not 'name'
    kart = db.query(Kart).filter(Kart.chassis_brand == name, Kart.team_id == team_id).first()
    if kart:
        return kart, False
    kart = Kart(chassis_brand=name, chassis_model=name, team_id=team_id)
    db.add(kart)
    db.flush()
    return kart, True


def find_or_create_session(
    db: Session,
    team_id: int,
    driver_id: int,
    track_id: int,
    kart_id: int,
    session_date: datetime,
) -> tuple[RacingSession, bool]:
    """
    Find existing session or create new one based on context.
    Matches by team, driver, track, kart, and date (same day).
    """
    # Filter by date range (start of day to end of day)
    start_of_day = session_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = session_date.replace(hour=23, minute=59, second=59, microsecond=999999)

    existing_session = (
        db.query(RacingSession)
        .filter(
            RacingSession.team_id == team_id,
            RacingSession.driver_id == driver_id,
            RacingSession.track_id == track_id,
            RacingSession.kart_id == kart_id,
            RacingSession.session_date >= start_of_day,
            RacingSession.session_date <= end_of_day,
            # Prefer sessions created by telemetry import
            RacingSession.data_source == "telemetry_import",
        )
        .first()
    )

    if existing_session:
        return existing_session, False

    # Create new session
    new_session = RacingSession(
        team_id=team_id,
        driver_id=driver_id,
        track_id=track_id,
        kart_id=kart_id,
        session_date=session_date,
        session_type="Practice",  # Default, can be updated later
        data_source="telemetry_import",
        weather_condition="sunny",  # Default, will be updated from lap data
        track_condition="dry",
    )
    db.add(new_session)
    db.flush()
    return new_session, True


@router.post("/upload", response_model=LapUploadResponse)
async def upload_telemetry_files(
    files: List[UploadFile] = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Upload one or more telemetry files.
    Auto-detects format and creates entities if needed.
    """
    uploaded_laps: list[Lap] = []
    errors: list[str] = []
    created_drivers: set[str] = set()
    created_tracks: set[str] = set()
    created_karts: set[str] = set()
    touched_session_ids: set[int] = set()

    # Ensure upload directory exists
    upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.team_id), "telemetry")
    os.makedirs(upload_dir, exist_ok=True)

    for file in files:
        try:
            # Save file temporarily
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            safe_filename = f"{timestamp}_{file.filename}"
            file_path = os.path.join(upload_dir, safe_filename)

            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)

            # Detect parser
            from pathlib import Path

            parser = ParserRegistry.detect_parser(Path(file_path))
            if not parser:
                errors.append(f"{file.filename}: Unknown format")
                os.remove(file_path)
                continue

            # Parse file
            parsed = parser.parse(Path(file_path))

            # Check for duplicate by hash
            file_hash = get_file_hash(file_path)
            existing = db.query(Lap).filter(Lap.file_hash == file_hash).first()
            if existing:
                errors.append(f"{file.filename}: Duplicate file (already imported)")
                os.remove(file_path)
                continue

            # Find or create entities
            driver, driver_created = find_or_create_driver(db, parsed.metadata.driver_name, int(current_user.team_id))
            if driver_created:
                created_drivers.add(parsed.metadata.driver_name)

            track, track_created = find_or_create_track(db, parsed.metadata.track_name)
            if track_created:
                created_tracks.add(parsed.metadata.track_name)

            kart, kart_created = find_or_create_kart(db, parsed.metadata.car_name, int(current_user.team_id))
            if kart_created:
                created_karts.add(parsed.metadata.car_name)

            # Find or create session
            session, _ = find_or_create_session(
                db,
                int(current_user.team_id),
                int(driver.id),  # type: ignore
                int(track.id),  # type: ignore
                int(kart.id),  # type: ignore
                parsed.metadata.session_date,
            )
            touched_session_ids.add(int(session.id))  # type: ignore

            # Update session weather if available (first valid one wins)
            if parsed.lap_summary.weather and session.weather_condition == "sunny":
                session.weather_condition = str(parsed.lap_summary.weather)  # type: ignore

            # Create lap record
            lap = Lap(
                team_id=current_user.team_id,
                original_filename=file.filename or "unknown",
                file_path=file_path,
                file_hash=file_hash,
                source_format=parsed.metadata.source_format,
                driver_name=parsed.metadata.driver_name,
                track_name=parsed.metadata.track_name,
                car_name=parsed.metadata.car_name,
                event_type=parsed.metadata.event_type,
                lap_number=parsed.lap_summary.lap_number,
                lap_time_ms=parsed.lap_summary.lap_time_ms,
                sector1_ms=parsed.lap_summary.sector1_ms,
                sector2_ms=parsed.lap_summary.sector2_ms,
                sector3_ms=parsed.lap_summary.sector3_ms,
                sector4_ms=parsed.lap_summary.sector4_ms,
                valid=parsed.lap_summary.valid,
                weather=parsed.lap_summary.weather,
                track_temp_c=parsed.lap_summary.track_temp_c,
                air_temp_c=parsed.lap_summary.air_temp_c,
                tire_compound=parsed.lap_summary.tire_compound,
                driver_id=int(driver.id),  # type: ignore
                track_id=int(track.id),  # type: ignore
                kart_id=int(kart.id),  # type: ignore
                recorded_at=parsed.metadata.session_date,
                has_detailed_telemetry=parsed.has_detailed_telemetry,
                session_id=int(session.id),  # type: ignore
            )
            db.add(lap)
            uploaded_laps.append(lap)

        except Exception as e:
            errors.append(f"{file.filename}: {str(e)}")

    db.commit()

    # Update statistics for touched sessions
    for session_id in touched_session_ids:
        session_obj = db.query(RacingSession).filter(RacingSession.id == session_id).first()
        if session_obj:
            # Re-query laps to get aggregate stats
            stats = (
                db.query(
                    func.count(Lap.id).label("total_laps"),
                    func.min(Lap.lap_time_ms).label("best_lap"),
                    func.avg(Lap.lap_time_ms).label("avg_lap"),
                )
                .filter(Lap.session_id == session_id)
                .filter(Lap.valid.is_(True))  # Only count valid laps for time stats
                .first()
            )

            # Get total count including invalid
            total_count = db.query(func.count(Lap.id)).filter(Lap.session_id == session_id).scalar()

            if stats:
                session_obj.total_laps = total_count
                session_obj.best_lap_time_ms = stats.best_lap
                session_obj.average_lap_time_ms = int(stats.avg_lap) if stats.avg_lap else None  # type: ignore

            db.add(session_obj)

    db.commit()

    # Refresh to get IDs
    for lap in uploaded_laps:
        db.refresh(lap)

    return LapUploadResponse(
        uploaded=len(uploaded_laps),
        laps=[LapResponse.model_validate(lap) for lap in uploaded_laps],
        errors=errors,
        created_drivers=list(created_drivers),
        created_tracks=list(created_tracks),
        created_karts=list(created_karts),
    )


@router.get("/", response_model=List[LapResponse])
def list_laps(
    skip: int = 0,
    limit: int = 100,
    driver_name: str | None = None,
    track_name: str | None = None,
    valid_only: bool = False,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """List laps for current user's team with optional filters"""
    query = db.query(Lap).filter(Lap.team_id == current_user.team_id)

    if driver_name:
        query = query.filter(Lap.driver_name.ilike(f"%{driver_name}%"))
    if track_name:
        query = query.filter(Lap.track_name.ilike(f"%{track_name}%"))
    if valid_only:
        query = query.filter(Lap.valid == True)  # noqa: E712

    query = query.order_by(Lap.recorded_at.desc(), Lap.lap_time_ms.asc())
    return query.offset(skip).limit(limit).all()


@router.get("/{lap_id}", response_model=LapResponse)
def get_lap(
    lap_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get a specific lap by ID"""
    lap = db.query(Lap).filter(Lap.id == lap_id, Lap.team_id == current_user.team_id).first()
    if not lap:
        raise HTTPException(status_code=404, detail="Lap not found")
    return lap


@router.get("/{lap_id}/telemetry", response_model=List[TelemetryDataPointSchema])
def get_lap_telemetry(
    lap_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Stream telemetry data for a specific lap"""
    lap = db.query(Lap).filter(Lap.id == lap_id, Lap.team_id == current_user.team_id).first()
    if not lap:
        raise HTTPException(status_code=404, detail="Lap not found")

    if not lap.file_path or not os.path.exists(lap.file_path):
        raise HTTPException(status_code=404, detail="Telemetry file not found")

    # Detect parser
    file_path = Path(lap.file_path)
    parser = ParserRegistry.detect_parser(file_path)
    if not parser:
        # Fallback to source_format
        parser = ParserRegistry.get_parser(str(lap.source_format))

    if not parser:
        raise HTTPException(status_code=500, detail=f"No parser available for format: {lap.source_format}")

    try:
        # Stream data
        # Note: For very large files, we might want to implement downsampling here
        data_points = list(parser.stream_telemetry(file_path))
        return data_points
    except Exception as e:
        print(f"Error parsing telemetry: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse telemetry file: {str(e)}") from e


@router.delete("/{lap_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lap(
    lap_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Delete a lap and its associated file"""
    lap = db.query(Lap).filter(Lap.id == lap_id, Lap.team_id == current_user.team_id).first()
    if not lap:
        raise HTTPException(status_code=404, detail="Lap not found")

    # Delete file if exists
    if lap.file_path and os.path.exists(lap.file_path):
        os.remove(lap.file_path)

    db.delete(lap)
    db.commit()
    return None

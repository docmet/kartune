import os
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.session import Session as RacingSession
from app.models.user import User
from app.schemas.session import SessionCreate, SessionResponse, SessionUpdate, TelemetryAnalysis
from app.services.telemetry_analyzer import TelemetryAnalyzer

router = APIRouter()


@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    session_in: SessionCreate, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)
):
    """Create a new racing session"""
    # Enforce team isolation
    if session_in.team_id != current_user.team_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    session = RacingSession(**session_in.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/", response_model=List[SessionResponse])
def list_sessions(
    skip: int = 0,
    limit: int = 100,
    driver_id: int = None,
    track_id: int = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """List sessions for current user's team with optional filters"""
    query = db.query(RacingSession).filter(RacingSession.team_id == current_user.team_id)

    if driver_id:
        query = query.filter(RacingSession.driver_id == driver_id)
    if track_id:
        query = query.filter(RacingSession.track_id == track_id)

    sessions = query.offset(skip).limit(limit).all()
    return sessions


@router.get("/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)
):
    session = db.query(RacingSession).filter(RacingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.team_id != current_user.team_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return session


@router.put("/{session_id}", response_model=SessionResponse)
def update_session(
    session_id: int,
    session_in: SessionUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    session = db.query(RacingSession).filter(RacingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.team_id != current_user.team_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = session_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(session, field, value)

    db.commit()
    db.refresh(session)
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)
):
    session = db.query(RacingSession).filter(RacingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.team_id != current_user.team_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(session)
    db.commit()
    return None


@router.post("/{session_id}/upload-telemetry", response_model=TelemetryAnalysis)
async def upload_telemetry(
    session_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Upload telemetry file and analyze it"""
    session = db.query(RacingSession).filter(RacingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.team_id != current_user.team_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Save file
    upload_dir = "/app/uploads"
    os.makedirs(upload_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"session_{session_id}_{timestamp}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Update session with file path
    session.telemetry_file_path = str(file_path)  # type: ignore[assignment]

    # Analyze telemetry
    analyzer = TelemetryAnalyzer()
    analysis = analyzer.analyze_file(file_path, file.filename or "unknown")

    # Update session with analysis results
    session.best_lap_time_ms = analysis["best_lap_time_ms"]
    session.average_lap_time_ms = analysis["average_lap_time_ms"]
    session.total_laps = analysis["total_laps"]

    db.commit()

    return TelemetryAnalysis(session_id=session_id, **analysis)


@router.get("/{session_id}/analysis", response_model=TelemetryAnalysis)
def get_session_analysis(
    session_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)
):
    """Get telemetry analysis for a session"""
    session = db.query(RacingSession).filter(RacingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.team_id != current_user.team_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if not session.telemetry_file_path:
        raise HTTPException(status_code=404, detail="No telemetry data available")

    # Re-analyze the file
    analyzer = TelemetryAnalyzer()
    file_path_str = str(session.telemetry_file_path)
    analysis = analyzer.analyze_file(file_path_str, os.path.basename(file_path_str))

    return TelemetryAnalysis(session_id=session_id, **analysis)

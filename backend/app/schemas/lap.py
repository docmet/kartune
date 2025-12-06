"""Pydantic schemas for Lap model"""

from datetime import datetime

from pydantic import BaseModel


class LapBase(BaseModel):
    """Base lap schema"""

    lap_number: int
    lap_time_ms: int
    sector1_ms: int | None = None
    sector2_ms: int | None = None
    sector3_ms: int | None = None
    sector4_ms: int | None = None
    valid: bool = True
    weather: str | None = None
    track_temp_c: float | None = None
    air_temp_c: float | None = None
    tire_compound: str | None = None


class LapCreate(LapBase):
    """Schema for creating a lap"""

    driver_name: str
    track_name: str
    car_name: str
    event_type: str | None = None
    team_id: int
    session_id: int | None = None
    recorded_at: datetime | None = None


class LapResponse(LapBase):
    """Schema for lap response"""

    id: int
    session_id: int | None
    driver_name: str
    track_name: str
    car_name: str
    event_type: str | None
    source_format: str
    original_filename: str
    recorded_at: datetime | None
    imported_at: datetime
    has_detailed_telemetry: bool
    driver_id: int | None
    track_id: int | None
    kart_id: int | None
    team_id: int

    class Config:
        from_attributes = True


class LapUploadResponse(BaseModel):
    """Response from uploading telemetry files"""

    uploaded: int
    laps: list[LapResponse]
    errors: list[str] = []
    created_drivers: list[str] = []
    created_tracks: list[str] = []
    created_karts: list[str] = []


class LapFilters(BaseModel):
    """Filters for querying laps"""

    driver_name: str | None = None
    track_name: str | None = None
    car_name: str | None = None
    event_type: str | None = None
    valid_only: bool = False
    min_lap_time_ms: int | None = None
    max_lap_time_ms: int | None = None

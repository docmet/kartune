from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class SessionBase(BaseModel):
    driver_id: int
    track_id: int
    kart_id: Optional[int] = None
    engine_id: Optional[int] = None
    session_date: datetime
    session_type: Optional[str] = None  # practice/qualifying/race/simulator
    data_source: Optional[str] = None   # manual/alfano/micron5/micron6/kartsim
    
    # Weather & Track Conditions
    air_temp_celsius: Optional[float] = None
    track_temp_celsius: Optional[float] = None
    humidity_percent: Optional[float] = None
    atmospheric_pressure_hpa: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    wind_direction: Optional[str] = None
    weather_condition: Optional[str] = None
    track_condition: Optional[str] = None
    track_grip_level: Optional[int] = None
    
    # Setup Data (flexible JSON)
    setup_data: Optional[Dict[str, Any]] = None
    
    # Results
    best_lap_time_ms: Optional[int] = None
    average_lap_time_ms: Optional[int] = None
    total_laps: Optional[int] = None
    position: Optional[int] = None
    
    # Notes
    driver_feedback: Optional[str] = None
    engineer_notes: Optional[str] = None

class SessionCreate(SessionBase):
    team_id: int

class SessionUpdate(BaseModel):
    driver_id: Optional[int] = None
    track_id: Optional[int] = None
    kart_id: Optional[int] = None
    engine_id: Optional[int] = None
    session_date: Optional[datetime] = None
    session_type: Optional[str] = None
    data_source: Optional[str] = None
    air_temp_celsius: Optional[float] = None
    track_temp_celsius: Optional[float] = None
    humidity_percent: Optional[float] = None
    atmospheric_pressure_hpa: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    wind_direction: Optional[str] = None
    weather_condition: Optional[str] = None
    track_condition: Optional[str] = None
    track_grip_level: Optional[int] = None
    setup_data: Optional[Dict[str, Any]] = None
    best_lap_time_ms: Optional[int] = None
    average_lap_time_ms: Optional[int] = None
    total_laps: Optional[int] = None
    position: Optional[int] = None
    driver_feedback: Optional[str] = None
    engineer_notes: Optional[str] = None

class SessionResponse(SessionBase):
    id: int
    team_id: int
    telemetry_file_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TelemetryAnalysis(BaseModel):
    """Analysis results from telemetry data"""
    session_id: int
    best_lap_time_ms: int
    average_lap_time_ms: int
    total_laps: int
    lap_times: list[int]  # All lap times in milliseconds
    consistency_score: float  # 0-100, higher is better
    improvement_trend: str  # "improving", "stable", "declining"

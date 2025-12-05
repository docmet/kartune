from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    kart_id = Column(Integer, ForeignKey("karts.id"))
    engine_id = Column(Integer, ForeignKey("engines.id"))
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)
    
    session_date = Column(DateTime(timezone=True), nullable=False)
    session_type = Column(String)  # practice/qualifying/race/simulator
    data_source = Column(String)   # manual/alfano/micron5/micron6/kartsim

    # Weather & Track Conditions
    air_temp_celsius = Column(Float)
    track_temp_celsius = Column(Float)
    humidity_percent = Column(Float)
    atmospheric_pressure_hpa = Column(Float)
    wind_speed_kmh = Column(Float)
    wind_direction = Column(String)
    weather_condition = Column(String)  # sunny/cloudy/rain/etc
    track_condition = Column(String)    # dry/damp/wet/rubber_buildup
    track_grip_level = Column(Integer)  # 1-10

    # Setup Data (JSON - flexible)
    setup_data = Column(JSON)

    # Results
    best_lap_time_ms = Column(Integer)
    average_lap_time_ms = Column(Integer)
    total_laps = Column(Integer)
    position = Column(Integer)

    # Notes & Files
    driver_feedback = Column(Text)
    engineer_notes = Column(Text)
    telemetry_file_path = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    team = relationship("Team", backref="sessions")
    driver = relationship("Driver", backref="sessions")
    kart = relationship("Kart", backref="sessions")
    engine = relationship("Engine", backref="sessions")
    track = relationship("Track", backref="sessions")
    telemetry_data = relationship("TelemetryData", back_populates="session", uselist=False)


class TelemetryData(Base):
    __tablename__ = "telemetry_data"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), unique=True, nullable=False)
    source = Column(String)  # alfano/micron5/micron6/kartsim
    raw_file_path = Column(String)
    parsed_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("Session", back_populates="telemetry_data")

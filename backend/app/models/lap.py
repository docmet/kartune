"""
Lap model for storing individual lap data and telemetry file references
"""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Lap(Base):
    """Individual lap with telemetry file reference and conditions"""

    __tablename__ = "laps"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=True)

    # File storage
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)  # Path to stored CSV
    file_hash = Column(String(64), nullable=True)  # SHA256 for deduplication
    source_format = Column(String(50), default="RF2")  # RF2, Alfano, Micron, etc.

    # Extracted metadata
    driver_name = Column(String(100), nullable=False)
    track_name = Column(String(200), nullable=False)
    car_name = Column(String(100), nullable=False)  # Kart class
    event_type = Column(String(50), nullable=True)  # Practice, Qualifying, Race

    # Lap timing
    lap_number = Column(Integer, nullable=False)
    lap_time_ms = Column(Integer, nullable=False)
    sector1_ms = Column(Integer, nullable=True)
    sector2_ms = Column(Integer, nullable=True)
    sector3_ms = Column(Integer, nullable=True)
    sector4_ms = Column(Integer, nullable=True)
    valid = Column(Boolean, default=True)

    # Conditions at time of lap
    weather = Column(String(50), nullable=True)
    track_temp_c = Column(Float, nullable=True)
    air_temp_c = Column(Float, nullable=True)
    tire_compound = Column(String(50), nullable=True)
    conditions_json = Column(Text, nullable=True)  # Extra conditions data

    # Linked entities (optional - for auto-created entities)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=True)
    kart_id = Column(Integer, ForeignKey("karts.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)

    # Timestamps
    recorded_at = Column(DateTime, nullable=True)  # When lap was recorded
    imported_at = Column(DateTime, default=datetime.utcnow)

    # Telemetry flags
    has_detailed_telemetry = Column(Boolean, default=True)

    # Relationships
    session = relationship("Session", back_populates="laps")
    driver = relationship("Driver", backref="laps")
    track = relationship("Track", backref="laps")
    kart = relationship("Kart", backref="laps")
    team = relationship("Team", backref="laps")

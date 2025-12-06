from sqlalchemy import JSON, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    name = Column(String, nullable=False)
    date_of_birth = Column(Date)
    weight_kg = Column(Float)
    height_cm = Column(Float)
    gender = Column(String)  # M/F/Other
    experience_level = Column(String)  # beginner/intermediate/advanced/expert
    physical_strength = Column(Integer)  # 1-100 scale
    bio_metrics = Column(JSON)  # Flexible JSON for other metrics (heart rate, etc.)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    team = relationship("Team", backref="drivers")

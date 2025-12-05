from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Kart(Base):
    __tablename__ = "karts"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    chassis_brand = Column(String, nullable=False)
    chassis_model = Column(String)
    chassis_serial = Column(String)
    year = Column(Integer)
    category = Column(String)  # Mini, OK, KZ2, etc.
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    team = relationship("Team", backref="karts")


class Engine(Base):
    __tablename__ = "engines"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String)
    serial_number = Column(String)
    type_number = Column(String)
    rebuild_date = Column(Date)
    hours_since_rebuild = Column(Integer)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    team = relationship("Team", backref="engines")

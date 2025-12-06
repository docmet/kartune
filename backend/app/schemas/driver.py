from datetime import date
from typing import Any, Dict, Optional

from pydantic import BaseModel


class DriverBase(BaseModel):
    name: str
    date_of_birth: Optional[date] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    gender: Optional[str] = None
    experience_level: Optional[str] = None
    physical_strength: Optional[int] = None
    bio_metrics: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class DriverCreate(DriverBase):
    team_id: int


class DriverUpdate(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[date] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    gender: Optional[str] = None
    experience_level: Optional[str] = None
    physical_strength: Optional[int] = None
    bio_metrics: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class DriverResponse(DriverBase):
    id: int
    team_id: int

    class Config:
        from_attributes = True

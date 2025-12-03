from typing import Optional
from pydantic import BaseModel

class KartBase(BaseModel):
    chassis_brand: str
    chassis_model: Optional[str] = None
    chassis_serial: Optional[str] = None
    year: Optional[int] = None
    category: Optional[str] = None
    notes: Optional[str] = None

class KartCreate(KartBase):
    team_id: int

class KartUpdate(BaseModel):
    chassis_brand: Optional[str] = None
    chassis_model: Optional[str] = None
    chassis_serial: Optional[str] = None
    year: Optional[int] = None
    category: Optional[str] = None
    notes: Optional[str] = None

class KartResponse(KartBase):
    id: int
    team_id: int
    
    class Config:
        from_attributes = True

class EngineBase(BaseModel):
    brand: str
    model: Optional[str] = None
    serial_number: Optional[str] = None
    type_number: Optional[str] = None
    hours_since_rebuild: Optional[int] = None
    notes: Optional[str] = None

class EngineCreate(EngineBase):
    team_id: int

class EngineUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    type_number: Optional[str] = None
    hours_since_rebuild: Optional[int] = None
    notes: Optional[str] = None

class EngineResponse(EngineBase):
    id: int
    team_id: int
    
    class Config:
        from_attributes = True

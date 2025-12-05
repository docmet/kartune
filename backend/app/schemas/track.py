from typing import Optional

from pydantic import BaseModel


class TrackBase(BaseModel):
    name: str
    location: Optional[str] = None
    country: Optional[str] = None
    length_meters: Optional[int] = None
    layout_image_url: Optional[str] = None
    notes: Optional[str] = None


class TrackCreate(TrackBase):
    pass


class TrackUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    country: Optional[str] = None
    length_meters: Optional[int] = None
    layout_image_url: Optional[str] = None
    notes: Optional[str] = None


class TrackResponse(TrackBase):
    id: int

    class Config:
        from_attributes = True

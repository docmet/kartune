from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.track import Track
from app.models.user import User
from app.schemas.track import TrackCreate, TrackResponse, TrackUpdate

router = APIRouter()


@router.post("/", response_model=TrackResponse, status_code=status.HTTP_201_CREATED)
def create_track(
    track_in: TrackCreate, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)
):
    """Create a new track (available to all users)"""
    track = Track(**track_in.model_dump())
    db.add(track)
    db.commit()
    db.refresh(track)
    return track


@router.get("/", response_model=List[TrackResponse])
def list_tracks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """List all tracks"""
    tracks = db.query(Track).offset(skip).limit(limit).all()
    return tracks


@router.get("/{track_id}", response_model=TrackResponse)
def get_track(track_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    return track


@router.put("/{track_id}", response_model=TrackResponse)
def update_track(
    track_id: int,
    track_in: TrackUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    update_data = track_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(track, field, value)

    db.commit()
    db.refresh(track)
    return track


@router.delete("/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_track(
    track_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)
):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    db.delete(track)
    db.commit()
    return None

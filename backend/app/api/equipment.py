from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.equipment import Engine, Kart
from app.models.user import User
from app.schemas.equipment import EngineCreate, EngineResponse, EngineUpdate, KartCreate, KartResponse, KartUpdate

router = APIRouter()


# Kart endpoints
@router.post("/karts", response_model=KartResponse, status_code=status.HTTP_201_CREATED)
def create_kart(
    kart_in: KartCreate, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)
):
    if kart_in.team_id != current_user.team_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    kart = Kart(**kart_in.model_dump())
    db.add(kart)
    db.commit()
    db.refresh(kart)
    return kart


@router.get("/karts", response_model=List[KartResponse])
def list_karts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    karts = db.query(Kart).filter(Kart.team_id == current_user.team_id).offset(skip).limit(limit).all()
    return karts


@router.get("/karts/{kart_id}", response_model=KartResponse)
def get_kart(kart_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    kart = db.query(Kart).filter(Kart.id == kart_id).first()
    if not kart:
        raise HTTPException(status_code=404, detail="Kart not found")

    if kart.team_id != current_user.team_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return kart


@router.put("/karts/{kart_id}", response_model=KartResponse)
def update_kart(
    kart_id: int,
    kart_in: KartUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    kart = db.query(Kart).filter(Kart.id == kart_id).first()
    if not kart:
        raise HTTPException(status_code=404, detail="Kart not found")

    if kart.team_id != current_user.team_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = kart_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(kart, field, value)

    db.commit()
    db.refresh(kart)
    return kart


@router.delete("/karts/{kart_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kart(kart_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    kart = db.query(Kart).filter(Kart.id == kart_id).first()
    if not kart:
        raise HTTPException(status_code=404, detail="Kart not found")

    if kart.team_id != current_user.team_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(kart)
    db.commit()
    return None


# Engine endpoints
@router.post("/engines", response_model=EngineResponse, status_code=status.HTTP_201_CREATED)
def create_engine(
    engine_in: EngineCreate, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)
):
    if engine_in.team_id != current_user.team_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    engine = Engine(**engine_in.model_dump())
    db.add(engine)
    db.commit()
    db.refresh(engine)
    return engine


@router.get("/engines", response_model=List[EngineResponse])
def list_engines(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    engines = db.query(Engine).filter(Engine.team_id == current_user.team_id).offset(skip).limit(limit).all()
    return engines


@router.get("/engines/{engine_id}", response_model=EngineResponse)
def get_engine(engine_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    engine = db.query(Engine).filter(Engine.id == engine_id).first()
    if not engine:
        raise HTTPException(status_code=404, detail="Engine not found")

    if engine.team_id != current_user.team_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return engine


@router.put("/engines/{engine_id}", response_model=EngineResponse)
def update_engine(
    engine_id: int,
    engine_in: EngineUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    engine = db.query(Engine).filter(Engine.id == engine_id).first()
    if not engine:
        raise HTTPException(status_code=404, detail="Engine not found")

    if engine.team_id != current_user.team_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = engine_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(engine, field, value)

    db.commit()
    db.refresh(engine)
    return engine


@router.delete("/engines/{engine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_engine(
    engine_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)
):
    engine = db.query(Engine).filter(Engine.id == engine_id).first()
    if not engine:
        raise HTTPException(status_code=404, detail="Engine not found")

    if engine.team_id != current_user.team_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(engine)
    db.commit()
    return None

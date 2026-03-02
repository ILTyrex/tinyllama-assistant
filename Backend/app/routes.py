from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

import crud, schemas
from database import get_db

router = APIRouter()


# ─── Health ──────────────────────────────────────────────
@router.get("/health")
def health():
    return {"status": "ok"}


# ─── Users ───────────────────────────────────────────────
@router.post("/users", response_model=schemas.UserOut, tags=["Users"])
def create_user(data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_code(db, data.student_code)
    if existing:
        raise HTTPException(status_code=400, detail="Código de estudiante ya registrado")
    return crud.create_user(db, data)

@router.get("/users/{user_id}", response_model=schemas.UserOut, tags=["Users"])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


# ─── Conversations ───────────────────────────────────────
@router.post("/conversations", response_model=schemas.ConversationOut, tags=["Conversations"])
def start_conversation(data: schemas.ConversationCreate, db: Session = Depends(get_db)):
    user = crud.get_user(db, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return crud.create_conversation(db, data.user_id)

@router.patch("/conversations/{conversation_id}/close", response_model=schemas.ConversationOut, tags=["Conversations"])
def close_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conv = crud.close_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    return conv

@router.get("/conversations", response_model=List[schemas.ConversationOut], tags=["Conversations"])
def list_conversations(
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    return crud.get_conversations(db, user_id, status, start_date, end_date)

@router.get("/conversations/{conversation_id}/history", response_model=schemas.ConversationHistory, tags=["Conversations"])
def get_history(conversation_id: int, db: Session = Depends(get_db)):
    import models as m
    conv = db.query(m.Conversation).filter(m.Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    messages = crud.get_messages(db, conversation_id)
    return schemas.ConversationHistory(conversation=conv, messages=messages)


# ─── Messages ────────────────────────────────────────────
@router.post("/messages", response_model=schemas.MessageOut, tags=["Messages"])
def add_message(data: schemas.MessageCreate, db: Session = Depends(get_db)):
    return crud.add_message(db, data)
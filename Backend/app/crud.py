from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from typing import Optional
from app import models, schemas


# ─── Users ───────────────────────────────────────────────
def create_user(db: Session, data: schemas.UserCreate):
    user = models.User(student_code=data.student_code)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_code(db: Session, student_code: str):
    return db.query(models.User).filter(models.User.student_code == student_code).first()


# ─── Conversations ───────────────────────────────────────
def create_conversation(db: Session, user_id: int):
    conv = models.Conversation(user_id=user_id)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv

def close_conversation(db: Session, conversation_id: int):
    conv = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if conv:
        conv.status = "closed"
        conv.ended_at = datetime.utcnow()
        db.commit()
        db.refresh(conv)
    return conv

def get_active_conversation(db: Session, user_id: int):
    return db.query(models.Conversation).filter(
        and_(
            models.Conversation.user_id == user_id,
            models.Conversation.status == "active"
        )
    ).first()

def get_conversations(
    db: Session,
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
):
    query = db.query(models.Conversation)
    if user_id:
        query = query.filter(models.Conversation.user_id == user_id)
    if status:
        query = query.filter(models.Conversation.status == status)
    if start_date:
        query = query.filter(models.Conversation.started_at >= start_date)
    if end_date:
        query = query.filter(models.Conversation.started_at <= end_date)
    return query.order_by(models.Conversation.started_at.desc()).all()


# ─── Messages ────────────────────────────────────────────
def add_message(db: Session, data: schemas.MessageCreate):
    msg = models.Message(
        conversation_id=data.conversation_id,
        role=data.role,
        content=data.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def get_messages(db: Session, conversation_id: int):
    return db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).order_by(models.Message.timestamp).all()


# ─── Intents ─────────────────────────────────────────────
def get_or_create_intent(db: Session, name: str, description: str = None):
    intent = db.query(models.Intent).filter(models.Intent.name == name).first()
    if not intent:
        intent = models.Intent(name=name, description=description)
        db.add(intent)
        db.commit()
        db.refresh(intent)
    return intent

def link_message_intent(db: Session, message_id: int, intent_id: int, confidence: float):
    mi = models.MessageIntent(
        message_id=message_id,
        intent_id=intent_id,
        confidence=confidence,
    )
    db.add(mi)
    db.commit()
    db.refresh(mi)
    return mi
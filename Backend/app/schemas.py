from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ─── User ───────────────────────────────────────────────
class UserCreate(BaseModel):
    student_code: str

class UserOut(BaseModel):
    id: int
    student_code: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Conversation ────────────────────────────────────────
class ConversationCreate(BaseModel):
    user_id: int

class ConversationOut(BaseModel):
    id: int
    user_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True


# ─── Message ─────────────────────────────────────────────
class MessageCreate(BaseModel):
    conversation_id: int
    role: str       # user / assistant / system
    content: str

class MessageOut(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── Chat (endpoint principal) ───────────────────────────
class ChatRequest(BaseModel):
    user_id: int
    message: str

class ChatResponse(BaseModel):
    response: str
    intent: str
    confidence: float


# ─── Intent ──────────────────────────────────────────────
class IntentCreate(BaseModel):
    name: str
    description: Optional[str] = None

class IntentOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Historial completo ──────────────────────────────────
class ConversationHistory(BaseModel):
    conversation: ConversationOut
    messages: List[MessageOut]

    class Config:
        from_attributes = True
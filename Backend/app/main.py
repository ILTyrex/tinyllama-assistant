from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import engine, get_db, Base
from app import models
from app import schemas
from app import crud
from app.routes import router


app = FastAPI(
    title="Asistente Universitario API",
    description="Backend para asistente universitario con TinyLlama",
    version="1.0.0",
)

# 🔥 Crear tablas al iniciar correctamente
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas externas
app.include_router(router)

@app.get("/")
def root():
    return {"message": "API running correctly"}

@app.get("/health")
def health():
    return {"status": "ok"}

# ─── Endpoint de chat principal ───────────────────────────
@app.post("/chat", response_model=schemas.ChatResponse, tags=["Chat"])
def chat(request: schemas.ChatRequest, db: Session = Depends(get_db)):

    # 1. Buscar o crear conversación activa
    conversation = crud.get_active_conversation(db, request.user_id)
    if not conversation:
        conversation = crud.create_conversation(db, request.user_id)

    # 2. Guardar mensaje del usuario
    user_msg = crud.add_message(db, schemas.MessageCreate(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    ))

    # 3. Respuesta placeholder
    bot_response = "Hola, soy tu asistente universitario. Pronto estaré completamente entrenado."
    predicted_intent = "general_query"
    confidence = 0.95

    # 4. Guardar respuesta del asistente
    crud.add_message(db, schemas.MessageCreate(
        conversation_id=conversation.id,
        role="assistant",
        content=bot_response,
    ))

    # 5. Registrar intent
    intent = crud.get_or_create_intent(db, predicted_intent)
    crud.link_message_intent(db, user_msg.id, intent.id, confidence)

    return schemas.ChatResponse(
        response=bot_response,
        intent=predicted_intent,
        confidence=confidence,
    )
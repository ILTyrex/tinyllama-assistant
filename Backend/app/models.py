from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
from app import models

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    student_code = Column(String(50), unique=True, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    enrollments = relationship("Enrollment", back_populates="user")

    conversations = relationship("Conversation", back_populates="user")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    started_at = Column(TIMESTAMP, server_default=func.now())
    ended_at = Column(TIMESTAMP, nullable=True)
    status = Column(String(20), default="active")  # active / closed

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20))          # user / assistant / system
    content = Column(Text)
    timestamp = Column(TIMESTAMP, server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")
    message_intents = relationship("MessageIntent", back_populates="message")


class Intent(Base):
    __tablename__ = "intents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True)
    description = Column(Text, nullable=True)

    message_intents = relationship("MessageIntent", back_populates="intent")


class MessageIntent(Base):
    __tablename__ = "message_intents"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    intent_id = Column(Integer, ForeignKey("intents.id"), nullable=False)
    confidence = Column(Float, default=0.0)

    message = relationship("Message", back_populates="message_intents")
    intent = relationship("Intent", back_populates="message_intents")

# ─── Academic Models ─────────────────────────────────────

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True)
    name = Column(String(150))
    credits = Column(Integer)
    semester = Column(Integer)

    offerings = relationship("CourseOffering", back_populates="course")


class CourseOffering(Base):
    __tablename__ = "course_offerings"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    period = Column(String(20))
    capacity = Column(Integer)
    enrolled_count = Column(Integer, default=0)

    course = relationship("Course", back_populates="offerings")
    enrollments = relationship("Enrollment", back_populates="offering")
    waitlist = relationship("Waitlist", back_populates="offering")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    offering_id = Column(Integer, ForeignKey("course_offerings.id"))
    status = Column(String(20), default="confirmed")

    user = relationship("User", back_populates="enrollments")
    offering = relationship("CourseOffering", back_populates="enrollments")


class Waitlist(Base):
    __tablename__ = "waitlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    offering_id = Column(Integer, ForeignKey("course_offerings.id"))

    user = relationship("User")
    offering = relationship("CourseOffering", back_populates="waitlist")
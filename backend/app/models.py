from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from .db import Base

# SQLAlchemy ORM Models
class DBUser(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

    expenses = relationship("DBExpense", back_populates="user")
    budgets = relationship("DBBudget", back_populates="user")

class DBExpense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("DBUser", back_populates="expenses")

class DBBudget(Base):
    __tablename__ = "budgets"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month_id = Column(String, nullable=False)
    total_budget = Column(Float, nullable=False)
    category_budgets = Column(Text, nullable=False) # JSON string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("DBUser", back_populates="budgets")


# Pydantic Schemas for Requests and Responses
class UserRegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None

import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import (
    DBUser, 
    UserRegisterRequest, 
    UserLoginRequest, 
    ForgotPasswordRequest, 
    ResetPasswordRequest,
    TokenResponse, 
    UserResponse,
    ForgotPasswordResponse
)
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(DBUser).filter(DBUser.email.ilike(user_data.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    # Create user
    new_user = DBUser(
        full_name=user_data.full_name.strip(),
        email=user_data.email.lower().strip(),
        hashed_password=hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT
    access_token = create_access_token(data={"sub": new_user.id, "email": new_user.email})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.email.ilike(credentials.email)).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again."
        )

    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.email.ilike(req.email)).first()
    if not user:
        # Return success message anyway for privacy security
        return ForgotPasswordResponse(
            message="If an account with that email exists, password reset instructions have been sent."
        )

    # Create password reset token
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    db.commit()

    return ForgotPasswordResponse(
        message="Password reset link generated successfully. Use this token to reset your password.",
        reset_token=reset_token
    )

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.reset_token == req.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    if user.reset_token_expires:
        # Ensure timezone-aware comparison
        now = datetime.now(timezone.utc)
        expires = user.reset_token_expires
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if now > expires:
            raise HTTPException(status_code=400, detail="Reset token has expired. Please request a new one.")

    user.hashed_password = hash_password(req.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return {"message": "Password updated successfully. You can now log in with your new password."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: DBUser = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)

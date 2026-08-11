import os
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .db import get_db
from .models import DBUser

SECRET_KEY = os.environ.get("JWT_SECRET", "super-secret-key-finance-tracker-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def hash_password(password: str) -> str:
    """Secure password hashing using SHA256 + Salt (or passlib bcrypt if available)"""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt.encode('utf-8'), 
        100000
    ).hex()
    return f"{salt}${pwd_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify hashed password"""
    try:
        if "$" not in hashed_password:
            return False
        salt, pwd_hash = hashed_password.split("$", 1)
        expected_hash = hashlib.pbkdf2_hmac(
            'sha256', 
            plain_password.encode('utf-8'), 
            salt.encode('utf-8'), 
            100000
        ).hex()
        return hmac.compare_digest(pwd_hash, expected_hash)
    except Exception:
        return False

# Simple JWT implementation for lightweight portability without external dependency issues
import base64
import json

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp())})
    
    header = {"alg": ALGORITHM, "typ": "JWT"}
    encoded_header = base64url_encode(json.dumps(header).encode('utf-8'))
    encoded_payload = base64url_encode(json.dumps(to_encode).encode('utf-8'))
    
    signature_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signature_input, hashlib.sha256).digest()
    encoded_signature = base64url_encode(signature)
    
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

def decode_access_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        encoded_header, encoded_payload, encoded_signature = parts
        
        signature_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
        expected_sig = base64url_encode(hmac.new(SECRET_KEY.encode('utf-8'), signature_input, hashlib.sha256).digest())
        
        if not hmac.compare_digest(encoded_signature, expected_sig):
            return None
            
        payload_bytes = base64url_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        if "exp" in payload:
            exp = payload["exp"]
            if datetime.now(timezone.utc).timestamp() > exp:
                return None # Expired
                
        return payload
    except Exception:
        return None

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> DBUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

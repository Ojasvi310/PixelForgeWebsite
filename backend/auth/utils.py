import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash a password"""
    normalized = password.strip()
    # Bcrypt has a 72-byte limit
    if len(normalized.encode('utf-8')) > 72:
        normalized = normalized.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(normalized)
# def hash_password(password: str) -> str:
#     password = password.encode("utf-8")[:72]
#     return pwd_context.hash(password)

# def verify_password(plain_password, hashed_password):
#     return pwd_context.verify(
#         plain_password.encode("utf-8")[:72],
# #         hashed_password
#     )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    normalized = plain_password.strip()
    if len(normalized.encode('utf-8')) > 72:
        normalized = normalized.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.verify(normalized, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
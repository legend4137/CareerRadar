from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

from app.models.user import User, NormalUser

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_sub: str = payload.get("sub")
        if user_sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    if user_sub.startswith("google:"):
        user_id = user_sub.replace("google:", "")
        user = db.query(User).filter(User.id == int(user_id)).first()
    elif user_sub.startswith("normal:"):
        user_id = user_sub.replace("normal:", "")
        user = db.query(NormalUser).filter(NormalUser.id == int(user_id)).first()
    else:
        # Fallback for old tokens or unexpected format
        user = db.query(User).filter(User.id == int(user_sub)).first()
        
    if user is None:
        raise credentials_exception
    return user

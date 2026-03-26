from sqlalchemy import Boolean, Column, Integer, String
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    profile_complete = Column(Boolean, default=False)
    role = Column(String, nullable=True)

from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    profile_complete = Column(Boolean, default=False)
    role = Column(String, nullable=True)
    job_description = Column(String, nullable=True)
    resume_filepath = Column(String, nullable=True)

    preferences = relationship("UserPreference", back_populates="google_user", uselist=False, foreign_keys="UserPreference.google_user_id")

class NormalUser(Base):
    __tablename__ = "normal_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String, nullable=True)
    profile_complete = Column(Boolean, default=False)
    role = Column(String, nullable=True)
    job_description = Column(String, nullable=True)
    resume_filepath = Column(String, nullable=True)

    preferences = relationship("UserPreference", back_populates="normal_user", uselist=False, foreign_keys="UserPreference.normal_user_id")

from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    google_user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    normal_user_id = Column(Integer, ForeignKey("normal_users.id"), unique=True, nullable=True)
    
    # Store preferences as JSON (list of strings)
    job_roles = Column(JSON, nullable=True)
    locations = Column(JSON, nullable=True)
    why_hire_me = Column(Text, nullable=True)

    google_user = relationship("User", back_populates="preferences", foreign_keys=[google_user_id])
    normal_user = relationship("NormalUser", back_populates="preferences", foreign_keys=[normal_user_id])

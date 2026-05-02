import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from werkzeug.security import generate_password_hash, check_password_hash
from . import db


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name               = Column(String(345), nullable=False)
    email              = Column(String(345), unique=True, nullable=False, index=True)
    password           = Column(Text, nullable=False)
    is_verified        = Column(Boolean, default=False, nullable=False)
    is_active          = Column(Boolean, default=True, nullable=False)
    created_at         = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at         = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    reset_token        = Column(String(512), nullable=True)
    verification_token = Column(String(512), nullable=True)

    def set_password(self, password: str):
        self.password = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password, password)

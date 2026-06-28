from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id = Column(String, primary_key=True, index=True) # e.g. Z123456789
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    is_private = Column(Boolean, default=False)
    record_count = Column(Integer, default=0)

    records = relationship("DNSRecord", back_populates="hosted_zone", cascade="all, delete-orphan")

class DNSRecord(Base):
    __tablename__ = "dns_records"

    id = Column(Integer, primary_key=True, index=True)
    hosted_zone_id = Column(String, ForeignKey("hosted_zones.id"))
    name = Column(String, index=True)
    type = Column(String) # A, CNAME, etc.
    value = Column(String)
    ttl = Column(Integer, default=300)
    routing_policy = Column(String, default="Simple")

    hosted_zone = relationship("HostedZone", back_populates="records")

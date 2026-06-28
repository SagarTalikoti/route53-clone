from pydantic import BaseModel
from typing import List, Optional

class DNSRecordBase(BaseModel):
    name: str
    type: str
    value: str
    ttl: int = 300
    routing_policy: str = "Simple"

class DNSRecordCreate(DNSRecordBase):
    pass

class DNSRecord(DNSRecordBase):
    id: int
    hosted_zone_id: str

    class Config:
        from_attributes = True

class HostedZoneBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_private: bool = False

class HostedZoneCreate(HostedZoneBase):
    pass

class HostedZone(HostedZoneBase):
    id: str
    record_count: int
    records: List[DNSRecord] = []

    class Config:
        from_attributes = True

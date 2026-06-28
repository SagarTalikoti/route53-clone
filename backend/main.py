from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uuid

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Route53 Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Route53 Clone API is running"}

# --- Hosted Zones ---

@app.post("/api/hosted-zones", response_model=schemas.HostedZone)
def create_hosted_zone(zone: schemas.HostedZoneCreate, db: Session = Depends(get_db)):
    # Generate a mock AWS-like Zone ID
    zone_id = "Z" + str(uuid.uuid4().hex)[:10].upper()
    db_zone = models.HostedZone(
        id=zone_id,
        name=zone.name,
        description=zone.description,
        is_private=zone.is_private
    )
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

@app.get("/api/hosted-zones", response_model=List[schemas.HostedZone])
def read_hosted_zones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    zones = db.query(models.HostedZone).offset(skip).limit(limit).all()
    return zones

@app.get("/api/hosted-zones/{zone_id}", response_model=schemas.HostedZone)
def read_hosted_zone(zone_id: str, db: Session = Depends(get_db)):
    db_zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if db_zone is None:
        raise HTTPException(status_code=404, detail="Hosted Zone not found")
    return db_zone

@app.delete("/api/hosted-zones/{zone_id}")
def delete_hosted_zone(zone_id: str, db: Session = Depends(get_db)):
    db_zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if db_zone is None:
        raise HTTPException(status_code=404, detail="Hosted Zone not found")
    db.delete(db_zone)
    db.commit()
    return {"ok": True}

# --- DNS Records ---

@app.post("/api/hosted-zones/{zone_id}/records", response_model=schemas.DNSRecord)
def create_record(zone_id: str, record: schemas.DNSRecordCreate, db: Session = Depends(get_db)):
    db_zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if db_zone is None:
        raise HTTPException(status_code=404, detail="Hosted Zone not found")
    
    db_record = models.DNSRecord(
        hosted_zone_id=zone_id,
        name=record.name,
        type=record.type,
        value=record.value,
        ttl=record.ttl,
        routing_policy=record.routing_policy
    )
    db.add(db_record)
    
    # Update record count
    db_zone.record_count += 1
    
    db.commit()
    db.refresh(db_record)
    return db_record

@app.get("/api/hosted-zones/{zone_id}/records", response_model=List[schemas.DNSRecord])
def read_records(zone_id: str, db: Session = Depends(get_db)):
    records = db.query(models.DNSRecord).filter(models.DNSRecord.hosted_zone_id == zone_id).all()
    return records

@app.delete("/api/hosted-zones/{zone_id}/records/{record_id}")
def delete_record(zone_id: str, record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(models.DNSRecord).filter(models.DNSRecord.id == record_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Record not found")
    
    # Update record count
    db_zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if db_zone:
        db_zone.record_count = max(0, db_zone.record_count - 1)

    db.delete(db_record)
    db.commit()
    return {"ok": True}

@app.post("/api/hosted-zones/{zone_id}/records/bulk-delete")
def bulk_delete_records(zone_id: str, record_ids: List[int], db: Session = Depends(get_db)):
    db_zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not db_zone:
        raise HTTPException(status_code=404, detail="Hosted Zone not found")
        
    records = db.query(models.DNSRecord).filter(
        models.DNSRecord.hosted_zone_id == zone_id,
        models.DNSRecord.id.in_(record_ids)
    ).all()
    
    deleted_count = 0
    for r in records:
        db.delete(r)
        deleted_count += 1
        
    db_zone.record_count = max(0, db_zone.record_count - deleted_count)
    db.commit()
    return {"ok": True, "deleted_count": deleted_count}


from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    id: str
    email: str
    name: str
    role: str = "citizen"

class ReportCreate(BaseModel):
    user_id: str
    latitude: float
    longitude: float
    description: str
    severity: int
    photo_url: Optional[str] = None

class Report(ReportCreate):
    id: str
    ai_class: Optional[str] = None
    ai_confidence: Optional[float] = None
    status: str = "submitted" # Default to submitted as per new flow
    action_note: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    blockchain_tx: Optional[str] = None

class CleanupCreate(BaseModel):
    report_id: str
    actor_id: str
    notes: Optional[str] = None

class EvidenceUpload(BaseModel):
    report_id: str
    image_url: str

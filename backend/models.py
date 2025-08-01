from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# Settings Models
class NotificationSettings(BaseModel):
    success: bool = True
    failures: bool = True
    building: bool = False

class SettingsCreate(BaseModel):
    vercelApiToken: str
    autoDeployEnabled: bool = True
    defaultTeam: str = "personal"
    deploymentRegion: str = "us-east-1"
    notifications: NotificationSettings = NotificationSettings()

class Settings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str = "default"  # For future multi-user support
    vercelApiToken: str
    autoDeployEnabled: bool
    defaultTeam: str
    deploymentRegion: str
    notifications: NotificationSettings
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# Deployment Models
class DeploymentCreate(BaseModel):
    projectName: str
    emergentUrl: str
    framework: str

class Deployment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    projectName: str
    emergentUrl: str
    vercelUrl: Optional[str] = None
    vercelDeploymentId: Optional[str] = None
    status: str = "building"  # 'building', 'deployed', 'failed'
    framework: str
    deployTime: Optional[str] = None
    error: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# Activity Models
class Activity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # 'deployment', 'build', 'error', 'extension'
    message: str
    status: str  # 'success', 'error', 'info'
    deploymentId: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Stats Models
class Stats(BaseModel):
    totalDeployments: int
    successfulDeployments: int
    failedDeployments: int
    averageDeployTime: str
    totalProjects: int

# Vercel API Models
class VercelDeploymentRequest(BaseModel):
    name: str
    gitSource: Dict[str, Any]
    framework: Optional[str] = None
    
class VercelDeploymentResponse(BaseModel):
    id: str
    url: str
    status: str
    createdAt: datetime
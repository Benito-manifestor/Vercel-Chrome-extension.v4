from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime
import asyncio

# Import models and services
from models import (
    Settings, SettingsCreate, Deployment, DeploymentCreate, 
    Activity, Stats, NotificationSettings
)
from services.vercel_service import VercelService, status_vercel_to_internal, calculate_deploy_time
from services.crypto_service import crypto_service
import database as db

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(title="Emergent Deploy API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Background task to update deployment status
async def update_deployment_status_task(deployment_id: str, vercel_deployment_id: str):
    """Background task to monitor deployment status"""
    try:
        # Get settings to retrieve Vercel API token
        settings = await db.get_settings()
        if not settings:
            logger.error("No settings found for deployment status update")
            return
        
        # Decrypt Vercel API token
        vercel_token = crypto_service.decrypt(settings["vercelApiToken"])
        vercel_service = VercelService(vercel_token)
        
        # Poll deployment status
        max_attempts = 30  # 5 minutes with 10-second intervals
        for attempt in range(max_attempts):
            await asyncio.sleep(10)  # Wait 10 seconds between checks
            
            try:
                deployment_status = await vercel_service.get_deployment_status(vercel_deployment_id)
                vercel_status = deployment_status["status"]
                internal_status = status_vercel_to_internal(vercel_status)
                
                if internal_status == "deployed":
                    # Deployment successful
                    await db.update_deployment_status(
                        deployment_id, 
                        "deployed", 
                        vercel_url=deployment_status.get("url")
                    )
                    
                    # Log activity
                    await db.save_activity({
                        "id": f"act_{int(datetime.now().timestamp())}",
                        "type": "deployment",
                        "message": f"Deployment {deployment_id} completed successfully",
                        "status": "success",
                        "deploymentId": deployment_id,
                        "timestamp": datetime.utcnow()
                    })
                    break
                    
                elif internal_status == "failed":
                    # Deployment failed
                    await db.update_deployment_status(
                        deployment_id,
                        "failed",
                        error="Deployment failed on Vercel"
                    )
                    
                    # Log activity
                    await db.save_activity({
                        "id": f"act_{int(datetime.now().timestamp())}",
                        "type": "error", 
                        "message": f"Deployment {deployment_id} failed",
                        "status": "error",
                        "deploymentId": deployment_id,
                        "timestamp": datetime.utcnow()
                    })
                    break
                    
            except Exception as e:
                logger.error(f"Error checking deployment status: {str(e)}")
                
        else:
            # Max attempts reached, mark as failed
            await db.update_deployment_status(
                deployment_id,
                "failed", 
                error="Deployment timeout"
            )
            
    except Exception as e:
        logger.error(f"Error in deployment status update task: {str(e)}")

# Settings endpoints
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    """Get user settings"""
    try:
        settings_data = await db.get_settings()
        if not settings_data:
            # Return default settings if none exist
            default_settings = Settings(
                vercelApiToken="",
                autoDeployEnabled=True,
                defaultTeam="personal",
                deploymentRegion="us-east-1",
                notifications=NotificationSettings()
            )
            return default_settings
        
        # Decrypt API token for response
        if settings_data.get("vercelApiToken"):
            try:
                settings_data["vercelApiToken"] = crypto_service.decrypt(settings_data["vercelApiToken"])
            except:
                settings_data["vercelApiToken"] = ""
        
        return Settings(**settings_data)
    except Exception as e:
        logger.error(f"Error getting settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve settings")

@api_router.put("/settings", response_model=Settings)
async def update_settings(settings: SettingsCreate):
    """Update user settings"""
    try:
        # Encrypt API token before saving
        encrypted_token = ""
        if settings.vercelApiToken:
            encrypted_token = crypto_service.encrypt(settings.vercelApiToken)
        
        settings_data = {
            "userId": "default",
            "vercelApiToken": encrypted_token,
            "autoDeployEnabled": settings.autoDeployEnabled,
            "defaultTeam": settings.defaultTeam,
            "deploymentRegion": settings.deploymentRegion,
            "notifications": settings.notifications.dict(),
            "updatedAt": datetime.utcnow()
        }
        
        saved_settings = await db.save_settings(settings_data)
        
        # Return decrypted token in response
        if saved_settings.get("vercelApiToken"):
            saved_settings["vercelApiToken"] = settings.vercelApiToken
        
        return Settings(**saved_settings)
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update settings")

# Deployments endpoints
@api_router.get("/deployments", response_model=List[Deployment])
async def get_deployments(status: Optional[str] = None, limit: int = 50):
    """Get deployments with optional status filter"""
    try:
        deployments = await db.get_deployments(limit=limit, status_filter=status)
        return [Deployment(**deployment) for deployment in deployments]
    except Exception as e:
        logger.error(f"Error getting deployments: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve deployments")

@api_router.post("/deployments", response_model=Deployment)
async def create_deployment(deployment_data: DeploymentCreate, background_tasks: BackgroundTasks):
    """Create a new deployment"""
    try:
        # Get settings for Vercel API token
        settings = await db.get_settings()
        if not settings or not settings.get("vercelApiToken"):
            raise HTTPException(status_code=400, detail="Vercel API token not configured")
        
        # Decrypt Vercel API token
        vercel_token = crypto_service.decrypt(settings["vercelApiToken"])
        vercel_service = VercelService(vercel_token)
        
        # Create deployment object
        deployment = Deployment(
            projectName=deployment_data.projectName,
            emergentUrl=deployment_data.emergentUrl,
            framework=deployment_data.framework,
            status="building"
        )
        
        # Save to database
        await db.save_deployment(deployment.dict())
        
        try:
            # Create deployment on Vercel
            vercel_deployment = await vercel_service.create_deployment(
                deployment_data.projectName,
                deployment_data.emergentUrl,
                deployment_data.framework
            )
            
            # Update deployment with Vercel info
            deployment.vercelDeploymentId = vercel_deployment["id"]
            await db.update_deployment_status(
                deployment.id,
                "building",
                vercel_url=vercel_deployment.get("url")
            )
            
            # Start background task to monitor deployment
            background_tasks.add_task(
                update_deployment_status_task,
                deployment.id,
                vercel_deployment["id"]
            )
            
            # Log activity
            await db.save_activity({
                "id": f"act_{int(datetime.now().timestamp())}",
                "type": "deployment",
                "message": f"Started deployment for {deployment_data.projectName}",
                "status": "info",
                "deploymentId": deployment.id,
                "timestamp": datetime.utcnow()
            })
            
        except Exception as vercel_error:
            # Update deployment status to failed
            await db.update_deployment_status(
                deployment.id,
                "failed",
                error=str(vercel_error)
            )
            deployment.status = "failed"
            deployment.error = str(vercel_error)
        
        return deployment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating deployment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create deployment")

# Stats and activity endpoints
@api_router.get("/stats", response_model=Stats) 
async def get_stats():
    """Get deployment statistics"""
    try:
        stats_data = await db.get_deployment_stats()
        return Stats(**stats_data)
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")

@api_router.get("/activity", response_model=List[Activity])
async def get_activity(limit: int = 10):
    """Get recent activity logs"""
    try:
        activities = await db.get_recent_activity(limit=limit)
        return [Activity(**activity) for activity in activities]
    except Exception as e:
        logger.error(f"Error getting activity: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve activity logs")

# Health check
@api_router.get("/")
async def root():
    return {"message": "Emergent Deploy API is running", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    pass
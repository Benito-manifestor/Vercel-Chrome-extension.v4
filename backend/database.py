from motor.motor_asyncio import AsyncIOMotorClient
import os
from typing import Optional
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017') 
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'emergent_deploy')]

# Collections
settings_collection = db.settings
deployments_collection = db.deployments  
activity_collection = db.activity

async def get_settings(user_id: str = "default") -> Optional[dict]:
    """Get user settings from database"""
    return await settings_collection.find_one({"userId": user_id})

async def save_settings(settings_data: dict) -> dict:
    """Save or update user settings"""
    user_id = settings_data.get("userId", "default")
    
    # Check if settings exist
    existing = await settings_collection.find_one({"userId": user_id})
    
    if existing:
        # Update existing settings
        await settings_collection.update_one(
            {"userId": user_id},
            {"$set": settings_data}
        )
    else:
        # Insert new settings
        await settings_collection.insert_one(settings_data)
    
    return await settings_collection.find_one({"userId": user_id})

async def save_deployment(deployment_data: dict) -> dict:
    """Save deployment to database"""
    result = await deployments_collection.insert_one(deployment_data)
    deployment_data["_id"] = result.inserted_id
    return deployment_data

async def get_deployments(limit: int = 50, status_filter: Optional[str] = None) -> list:
    """Get deployments from database"""
    query = {}
    if status_filter:
        query["status"] = status_filter
    
    cursor = deployments_collection.find(query).sort("createdAt", -1).limit(limit)
    deployments = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string for each deployment
    for deployment in deployments:
        deployment["_id"] = str(deployment["_id"])
    
    return deployments

async def update_deployment_status(deployment_id: str, status: str, vercel_url: Optional[str] = None, error: Optional[str] = None) -> bool:
    """Update deployment status"""
    update_data = {
        "status": status,
        "updatedAt": datetime.utcnow()
    }
    
    if vercel_url:
        update_data["vercelUrl"] = vercel_url
    if error:
        update_data["error"] = error
    
    result = await deployments_collection.update_one(
        {"id": deployment_id},
        {"$set": update_data}
    )
    
    return result.modified_count > 0

async def save_activity(activity_data: dict) -> dict:
    """Save activity log to database"""
    result = await activity_collection.insert_one(activity_data)
    activity_data["_id"] = result.inserted_id
    return activity_data

async def get_recent_activity(limit: int = 10) -> list:
    """Get recent activity logs"""
    cursor = activity_collection.find().sort("timestamp", -1).limit(limit)
    activities = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string for each activity
    for activity in activities:
        activity["_id"] = str(activity["_id"])
    
    return activities

async def get_deployment_stats() -> dict:
    """Get deployment statistics"""
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "successful": {
                    "$sum": {"$cond": [{"$eq": ["$status", "deployed"]}, 1, 0]}
                },
                "failed": {
                    "$sum": {"$cond": [{"$eq": ["$status", "failed"]}, 1, 0]}
                },
                "avgDeployTime": {"$avg": "$deployTime"},
                "uniqueProjects": {"$addToSet": "$projectName"}
            }
        }
    ]
    
    result = await deployments_collection.aggregate(pipeline).to_list(length=1)
    
    if result:
        stats = result[0]
        unique_projects = stats.get("uniqueProjects", [])
        avg_time = stats.get('avgDeployTime')
        avg_time_str = f"{int(avg_time)}s" if avg_time is not None else "0s"
        
        return {
            "totalDeployments": stats.get("total", 0),
            "successfulDeployments": stats.get("successful", 0),
            "failedDeployments": stats.get("failed", 0),
            "averageDeployTime": avg_time_str,
            "totalProjects": len(unique_projects)
        }
    else:
        return {
            "totalDeployments": 0,
            "successfulDeployments": 0, 
            "failedDeployments": 0,
            "averageDeployTime": "0s",
            "totalProjects": 0
        }
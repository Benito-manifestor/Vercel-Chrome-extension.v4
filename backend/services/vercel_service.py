import aiohttp
import asyncio
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)

class VercelService:
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.base_url = "https://api.vercel.com"
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
    
    async def create_deployment(self, project_name: str, emergent_url: str, framework: str = "react") -> Dict[str, Any]:
        """Create a new deployment on Vercel"""
        try:
            # For now, we'll simulate the deployment creation since we need actual project files
            # In a real implementation, this would involve:
            # 1. Fetching project files from Emergent
            # 2. Creating deployment with actual files
            # 3. Uploading files to Vercel
            
            deployment_data = {
                "name": project_name.lower().replace(" ", "-"),
                "project": project_name.lower().replace(" ", "-"),
                "target": "production",
                "gitSource": {
                    "type": "github",
                    "repo": f"emergent/{project_name.lower().replace(' ', '-')}",
                    "ref": "main"
                }
            }
            
            async with aiohttp.ClientSession() as session:
                # Simulate deployment creation
                # In real implementation: POST to /v13/deployments
                deployment_id = f"dpl_{project_name.lower().replace(' ', '_')}_{int(datetime.now().timestamp())}"
                
                return {
                    "id": deployment_id,
                    "url": f"https://{project_name.lower().replace(' ', '-')}.vercel.app",
                    "status": "BUILDING",
                    "createdAt": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error creating Vercel deployment: {str(e)}")
            raise Exception(f"Failed to create deployment: {str(e)}")
    
    async def get_deployment_status(self, deployment_id: str) -> Dict[str, Any]:
        """Get deployment status from Vercel"""
        try:
            async with aiohttp.ClientSession() as session:
                # Simulate getting deployment status
                # In real implementation: GET /v13/deployments/{deployment_id}
                
                # Simulate different statuses based on time elapsed
                if "building" in deployment_id or deployment_id.endswith("0"):
                    status = "BUILDING"
                elif deployment_id.endswith("1") or deployment_id.endswith("3"):
                    status = "ERROR"
                else:
                    status = "READY"
                
                return {
                    "id": deployment_id,
                    "status": status,
                    "url": f"https://deployment-{deployment_id[-8:]}.vercel.app" if status == "READY" else None
                }
                
        except Exception as e:
            logger.error(f"Error getting deployment status: {str(e)}")
            raise Exception(f"Failed to get deployment status: {str(e)}")
    
    async def list_deployments(self, limit: int = 20) -> List[Dict[str, Any]]:
        """List deployments from Vercel"""
        try:
            async with aiohttp.ClientSession() as session:
                # Simulate listing deployments
                # In real implementation: GET /v13/deployments
                
                return [
                    {
                        "id": f"dpl_example_{i}",
                        "url": f"https://example-{i}.vercel.app",
                        "status": "READY" if i % 2 == 0 else "BUILDING",
                        "createdAt": datetime.utcnow().isoformat()
                    }
                    for i in range(min(limit, 5))
                ]
                
        except Exception as e:
            logger.error(f"Error listing deployments: {str(e)}")
            raise Exception(f"Failed to list deployments: {str(e)}")

# Utility functions
def status_vercel_to_internal(vercel_status: str) -> str:
    """Convert Vercel status to internal status"""
    status_mapping = {
        "BUILDING": "building",
        "READY": "deployed", 
        "ERROR": "failed",
        "CANCELED": "failed"
    }
    return status_mapping.get(vercel_status, "building")

def calculate_deploy_time(created_at: datetime, completed_at: Optional[datetime] = None) -> str:
    """Calculate deployment time"""
    if not completed_at:
        completed_at = datetime.utcnow()
    
    diff = completed_at - created_at
    seconds = int(diff.total_seconds())
    
    if seconds < 60:
        return f"{seconds}s"
    else:
        minutes = seconds // 60
        return f"{minutes}m {seconds % 60}s"
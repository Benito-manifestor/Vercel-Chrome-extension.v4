import aiohttp
import asyncio
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)

# Vercel error code mapping
VERCEL_ERROR_CODES = {
    'BODY_NOT_A_STRING_FROM_FUNCTION': 'Function returned invalid response format',
    'DEPLOYMENT_BLOCKED': 'Deployment blocked by security policy',
    'DEPLOYMENT_DELETED': 'Deployment has been deleted',
    'DEPLOYMENT_DISABLED': 'Deployment is disabled',
    'DEPLOYMENT_NOT_FOUND': 'Deployment not found',
    'DEPLOYMENT_NOT_READY_REDIRECTING': 'Deployment not ready, redirecting',
    'DEPLOYMENT_PAUSED': 'Deployment is paused',
    'DNS_HOSTNAME_EMPTY': 'DNS hostname is empty',
    'DNS_HOSTNAME_NOT_FOUND': 'DNS hostname not found',
    'DNS_HOSTNAME_RESOLVE_FAILED': 'Failed to resolve DNS hostname',
    'DNS_HOSTNAME_RESOLVED_PRIVATE': 'DNS resolved to private address',
    'DNS_HOSTNAME_SERVER_ERROR': 'DNS server error',
    'EDGE_FUNCTION_INVOCATION_FAILED': 'Edge function execution failed',
    'EDGE_FUNCTION_INVOCATION_TIMEOUT': 'Edge function timed out',
    'FALLBACK_BODY_TOO_LARGE': 'Response body too large for cache',
    'FUNCTION_INVOCATION_FAILED': 'Function execution failed',
    'FUNCTION_INVOCATION_TIMEOUT': 'Function execution timed out',
    'FUNCTION_PAYLOAD_TOO_LARGE': 'Function payload exceeds size limit',
    'FUNCTION_RESPONSE_PAYLOAD_TOO_LARGE': 'Function response too large',
    'FUNCTION_THROTTLED': 'Function execution throttled',
    'INFINITE_LOOP_DETECTED': 'Infinite loop detected in function',
    'INVALID_IMAGE_OPTIMIZE_REQUEST': 'Invalid image optimization request',
    'INVALID_REQUEST_METHOD': 'Invalid HTTP method',
    'MALFORMED_REQUEST_HEADER': 'Malformed request header',
    'MIDDLEWARE_INVOCATION_FAILED': 'Middleware execution failed',
    'MIDDLEWARE_INVOCATION_TIMEOUT': 'Middleware execution timed out',
    'MIDDLEWARE_RUNTIME_DEPRECATED': 'Middleware runtime deprecated',
    'NO_RESPONSE_FROM_FUNCTION': 'No response from function',
    'NOT_FOUND': 'Resource not found',
    'OPTIMIZED_EXTERNAL_IMAGE_REQUEST_FAILED': 'External image optimization failed',
    'OPTIMIZED_EXTERNAL_IMAGE_REQUEST_INVALID': 'Invalid external image request',
    'OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED': 'Unauthorized external image request'
}

class VercelService:
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.base_url = "https://api.vercel.com"
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
    
    def _handle_vercel_error(self, error_code: str, error_message: str = None) -> str:
        """Convert Vercel error codes to user-friendly messages"""
        friendly_message = VERCEL_ERROR_CODES.get(error_code, f"Unknown Vercel error: {error_code}")
        
        if error_message:
            return f"{friendly_message}: {error_message}"
        return friendly_message
    
    async def create_deployment(self, project_name: str, emergent_url: str, framework: str = "react") -> Dict[str, Any]:
        """Create a new deployment on Vercel"""
        try:
            # For development/demo purposes, we'll simulate the deployment
            # In production, this would involve:
            # 1. Fetching project files from Emergent
            # 2. Creating deployment with actual files
            # 3. Uploading files to Vercel
            
            deployment_data = {
                "name": project_name.lower().replace(" ", "-").replace("_", "-"),
                "project": project_name.lower().replace(" ", "-").replace("_", "-"),
                "target": "production",
                "gitSource": {
                    "type": "github",
                    "repo": f"emergent/{project_name.lower().replace(' ', '-').replace('_', '-')}",
                    "ref": "main"
                }
            }
            
            # Simulate deployment creation with better error handling
            deployment_id = f"dpl_{project_name.lower().replace(' ', '_').replace('-', '_')}_{int(datetime.now().timestamp())}"
            
            # Simulate different outcomes based on project name for testing
            if "fail" in project_name.lower():
                raise Exception("DEPLOYMENT_BLOCKED: Project name contains restricted words")
            
            if "timeout" in project_name.lower():
                raise Exception("FUNCTION_INVOCATION_TIMEOUT: Deployment timed out")
            
            if "notfound" in project_name.lower():
                raise Exception("NOT_FOUND: Repository not found")
            
            return {
                "id": deployment_id,
                "url": f"https://{project_name.lower().replace(' ', '-').replace('_', '-')}-{deployment_id[-8:]}.vercel.app",
                "status": "BUILDING",
                "createdAt": datetime.utcnow().isoformat()
            }
                
        except Exception as e:
            error_message = str(e)
            
            # Check if it's a Vercel error code
            for error_code in VERCEL_ERROR_CODES.keys():
                if error_code in error_message:
                    friendly_error = self._handle_vercel_error(error_code)
                    logger.error(f"Vercel deployment error: {friendly_error}")
                    raise Exception(friendly_error)
            
            logger.error(f"Error creating Vercel deployment: {error_message}")
            raise Exception(f"Failed to create deployment: {error_message}")
    
    async def get_deployment_status(self, deployment_id: str) -> Dict[str, Any]:
        """Get deployment status from Vercel with proper error handling"""
        try:
            # In a real implementation: GET /v13/deployments/{deployment_id}
            # For now, simulate status checking with error handling
            
            # Simulate different statuses based on deployment ID patterns
            if "fail" in deployment_id or deployment_id.endswith("1"):
                # Simulate a failed deployment
                return {
                    "id": deployment_id,
                    "status": "ERROR",
                    "url": None,
                    "error": {
                        "code": "FUNCTION_INVOCATION_FAILED",
                        "message": self._handle_vercel_error("FUNCTION_INVOCATION_FAILED")
                    }
                }
            elif "building" in deployment_id or deployment_id.endswith("0"):
                return {
                    "id": deployment_id,
                    "status": "BUILDING",
                    "url": None
                }
            else:
                return {
                    "id": deployment_id,
                    "status": "READY",
                    "url": f"https://deployment-{deployment_id[-8:]}.vercel.app"
                }
                
        except Exception as e:
            logger.error(f"Error getting deployment status: {str(e)}")
            # Return error status instead of raising exception
            return {
                "id": deployment_id,
                "status": "ERROR",
                "url": None,
                "error": {
                    "code": "DEPLOYMENT_NOT_FOUND",
                    "message": self._handle_vercel_error("DEPLOYMENT_NOT_FOUND")
                }
            }
    
    async def list_deployments(self, limit: int = 20) -> List[Dict[str, Any]]:
        """List deployments from Vercel with error handling"""
        try:
            # In production: GET /v13/deployments
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
            return []  # Return empty list instead of raising exception

    async def validate_api_token(self) -> bool:
        """Validate the Vercel API token"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/v2/user",
                    headers=self.headers
                ) as response:
                    return response.status == 200
        except Exception as e:
            logger.error(f"Error validating Vercel API token: {str(e)}")
            return False

# Utility functions
def status_vercel_to_internal(vercel_status: str) -> str:
    """Convert Vercel status to internal status"""
    status_mapping = {
        "BUILDING": "building",
        "READY": "deployed", 
        "ERROR": "failed",
        "CANCELED": "failed",
        "QUEUED": "building"
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

def is_vercel_error_code(error_message: str) -> bool:
    """Check if error message contains a known Vercel error code"""
    return any(code in error_message for code in VERCEL_ERROR_CODES.keys())
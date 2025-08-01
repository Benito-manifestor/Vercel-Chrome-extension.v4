import os
from cryptography.fernet import Fernet
import base64
import logging

logger = logging.getLogger(__name__)

class CryptoService:
    def __init__(self):
        # In production, this should be loaded from environment variables
        encryption_key = os.environ.get('ENCRYPTION_KEY')
        if not encryption_key:
            # Generate a key for development (in production, use a persistent key)
            encryption_key = Fernet.generate_key().decode()
            logger.warning("Using generated encryption key. In production, set ENCRYPTION_KEY environment variable.")
        
        if isinstance(encryption_key, str):
            encryption_key = encryption_key.encode()
            
        self.fernet = Fernet(encryption_key)
    
    def encrypt(self, data: str) -> str:
        """Encrypt sensitive data"""
        try:
            encrypted_data = self.fernet.encrypt(data.encode())
            return base64.b64encode(encrypted_data).decode()
        except Exception as e:
            logger.error(f"Encryption error: {str(e)}")
            raise Exception("Failed to encrypt data")
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        try:
            decoded_data = base64.b64decode(encrypted_data.encode())
            decrypted_data = self.fernet.decrypt(decoded_data)
            return decrypted_data.decode()
        except Exception as e:
            logger.error(f"Decryption error: {str(e)}")
            raise Exception("Failed to decrypt data")

# Global crypto service instance
crypto_service = CryptoService()
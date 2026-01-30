from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging
import asyncio
from contextlib import asynccontextmanager

from app.websocket.routes import router as websocket_router
from app.services.pubsub import pubsub_service
from app.services.user_manager import user_manager

# configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Request/Response models
class CreateUserRequest(BaseModel):
    username: str
    profile_pic: str = None


class UserResponse(BaseModel):
    username: str
    profile_pic: str = None
    status: str
    last_seen: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    logger.info("Starting up chat backend...")
    try:
        await pubsub_service.connect()
        logger.info("Connected to Redis successfully")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        # Continue without Redis for development
    
    yield
    
    # Shutdown
    logger.info("Shutting down chat backend...")
    try:
        await pubsub_service.disconnect()
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


# Create FastAPI app
app = FastAPI(
    title="Sage Chat Backend",
    description="Real-time chat backend with WebSocket and pub-sub support",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include WebSocket routes
app.include_router(websocket_router, prefix="/chat")


# Health check endpoint
@app.get("/")
async def root():
    return {"message": "Sage Chat Backend is running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check Redis connection
        redis_status = "connected"
        try:
            if pubsub_service.redis_client:
                await pubsub_service.redis_client.ping()
            else:
                redis_status = "disconnected"
        except Exception:
            redis_status = "error"
        
        return {
            "status": "healthy",
            "services": {
                "redis": redis_status,
                "websocket": "active"
            },
            "online_users": len(user_manager.get_online_users())
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )


@app.get("/users")
async def get_users():
    """Get list of all users from Redis"""
    try:
        # Get all users from Redis (persisted data)
        users = await pubsub_service.get_all_users()
        
        # Update status for currently connected users
        for user in users:
            if user_manager.is_user_online(user["username"]):
                user["status"] = UserStatus.ONLINE.value
        
        return {"users": users}
    except Exception as e:
        logger.error(f"Error getting users: {e}")
        raise HTTPException(status_code=500, detail="Failed to get users")


@app.post("/users")
async def create_user(user_request: CreateUserRequest):
    """Create a new user (registers them for future connections)"""
    try:
        username = user_request.username.strip()
        
        if not username:
            raise HTTPException(status_code=400, detail="Username cannot be empty")
        
        if len(username) < 2:
            raise HTTPException(status_code=400, detail="Username must be at least 2 characters")
        
        if len(username) > 50:
            raise HTTPException(status_code=400, detail="Username must be less than 50 characters")
        
        # Check if user already exists
        existing_user = user_manager.get_user(username)
        if existing_user:
            # Update profile pic if provided
            if user_request.profile_pic:
                existing_user.profile_pic = user_request.profile_pic
                # Update in Redis too
                await pubsub_service.set_user_online(username, user_request.profile_pic)
            
            return {
                "message": "User already exists",
                "user": {
                    "username": existing_user.username,
                    "profile_pic": existing_user.profile_pic,
                    "status": existing_user.status,
                    "last_seen": existing_user.last_seen.isoformat()
                }
            }
        
        # create user with offline status (they're not connected yet)
        # adding with a dummy connection id
        dummy_connection_id = f"offline_{username}"
        user = await user_manager.add_user(username, dummy_connection_id, user_request.profile_pic)
        
        # set user as offline since this is just registration
        await user_manager.remove_user_connection(username, dummy_connection_id)
        
        return {
            "message": "User created successfully",
            "user": {
                "username": user.username,
                "profile_pic": user.profile_pic,
                "status": user.status,
                "last_seen": user.last_seen.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user")


@app.get("/users/{username}")
async def get_user(username: str):
    """Get specific user information"""
    try:
        user = user_manager.get_user(username)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "user": {
                "username": user.username,
                "profile_pic": user.profile_pic,
                "status": user.status,
                "last_seen": user.last_seen.isoformat(),
                "is_online": user_manager.is_user_online(username)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user")


@app.put("/users/{username}")
async def update_user(username: str, user_request: CreateUserRequest):
    """Update user information"""
    try:
        user = user_manager.get_user(username)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # update profile picture if provided
        if user_request.profile_pic:
            user.profile_pic = user_request.profile_pic
        
        return {
            "message": "User updated successfully",
            "user": {
                "username": user.username,
                "profile_pic": user.profile_pic,
                "status": user.status,
                "last_seen": user.last_seen.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user")


@app.delete("/users/{username}")
async def delete_user(username: str):
    """Delete a user (removes them from system)"""
    try:
        user = user_manager.get_user(username)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # force disconnect all connections for this user
        connections = user_manager.get_user_connections(username)
        for connection_id in connections.copy():
            await user_manager.remove_user_connection(username, connection_id)
        
        # remove user from connected users
        if username in user_manager.connected_users:
            del user_manager.connected_users[username]
        
        return {"message": f"User {username} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete user")


@app.get("/users/{username}/history")
async def get_user_history(username: str, with_user: str, limit: int = 50):
    """Get conversation history between two users"""
    try:
        messages = await pubsub_service.get_conversation_history(
            username, with_user, limit
        )
        return {
            "conversation": {
                "participants": [username, with_user],
                "messages": messages
            }
        }
    except Exception as e:
        logger.error(f"Error getting conversation history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversation history")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
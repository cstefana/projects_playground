import logging
from typing import Dict, Set, Optional
from datetime import datetime
from app.models import User, UserStatus
from app.services.pubsub import pubsub_service

logger = logging.getLogger(__name__)


class UserManager:
    def __init__(self):
        self.connected_users: Dict[str, User] = {}
        self.user_connections: Dict[str, Set[str]] = {}  # username -> set of connection_ids
        
    async def add_user(self, username: str, connection_id: str, profile_pic: str = None) -> User:
        """Add or update a user and track their connection"""
        try:
            # Create or get existing user
            if username not in self.connected_users:
                # Try to get profile pic from Redis if not provided
                if not profile_pic:
                    profile_pic = await pubsub_service.get_user_profile_pic(username)
                
                user = User(
                    username=username,
                    profile_pic=profile_pic,
                    status=UserStatus.ONLINE,
                    last_seen=datetime.now()
                )
                self.connected_users[username] = user
                logger.info(f"New user created: {username}")
            else:
                # Update existing user
                user = self.connected_users[username]
                user.status = UserStatus.ONLINE
                user.last_seen = datetime.now()
                if profile_pic:
                    user.profile_pic = profile_pic
                elif not user.profile_pic:
                    # Try to get from Redis if user doesn't have one
                    user.profile_pic = await pubsub_service.get_user_profile_pic(username)
                logger.info(f"Existing user updated: {username}")
            
            # Track connection
            if username not in self.user_connections:
                self.user_connections[username] = set()
            self.user_connections[username].add(connection_id)
            
            # Set user online in Redis (with profile pic)
            await pubsub_service.set_user_online(username, user.profile_pic)
            
            return user
            
        except Exception as e:
            logger.error(f"Failed to add user {username}: {e}")
            raise

    async def remove_user_connection(self, username: str, connection_id: str):
        """Remove a user connection and set offline if no more connections"""
        try:
            if username in self.user_connections:
                self.user_connections[username].discard(connection_id)
                
                # If no more connections, set user offline
                if not self.user_connections[username]:
                    del self.user_connections[username]
                    if username in self.connected_users:
                        self.connected_users[username].status = UserStatus.OFFLINE
                        self.connected_users[username].last_seen = datetime.now()
                    
                    # Set user offline in Redis
                    await pubsub_service.set_user_offline(username)
                    logger.info(f"User {username} went offline")
                
        except Exception as e:
            logger.error(f"Failed to remove user connection for {username}: {e}")

    def get_user(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.connected_users.get(username)

    def get_online_users(self) -> Dict[str, User]:
        """Get all online users"""
        return {
            username: user for username, user in self.connected_users.items()
            if user.status == UserStatus.ONLINE
        }

    def get_user_connections(self, username: str) -> Set[str]:
        """Get all connection IDs for a user"""
        return self.user_connections.get(username, set())

    def is_user_online(self, username: str) -> bool:
        """Check if user is online"""
        return username in self.user_connections and len(self.user_connections[username]) > 0

    async def set_user_typing(self, username: str, is_typing: bool = True):
        """Set user typing status"""
        try:
            if username in self.connected_users:
                status = UserStatus.TYPING if is_typing else UserStatus.ONLINE
                self.connected_users[username].status = status
                
                # Publish typing status
                await pubsub_service.publish_message("user_status", {
                    "action": "user_typing" if is_typing else "user_stopped_typing",
                    "username": username,
                    "status": status.value
                })
                
        except Exception as e:
            logger.error(f"Failed to set typing status for {username}: {e}")

    def get_users_for_user_list(self) -> list:
        """Get formatted user list for frontend (all users with their status)"""
        users = []
        for username, user in self.connected_users.items():
            users.append({
                "username": username,
                "profile_pic": user.profile_pic,
                "status": user.status,
                "last_seen": user.last_seen.isoformat()
            })
        return users


# Global instance
user_manager = UserManager()
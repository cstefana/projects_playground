import redis.asyncio as redis
import json
import logging
from datetime import datetime
from typing import Dict, Set, Optional, Any
from app.models import Message, User, UserStatus

logger = logging.getLogger(__name__)


class PubSubService:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self.redis_client: Optional[redis.Redis] = None
        self.pubsub: Optional[redis.client.PubSub] = None
        
    async def connect(self):
        """Connect to Redis"""
        try:
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
            self.pubsub = self.redis_client.pubsub()
            await self.redis_client.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise

    async def disconnect(self):
        """Disconnect from Redis"""
        if self.pubsub:
            await self.pubsub.close()
        if self.redis_client:
            await self.redis_client.close()
        logger.info("Disconnected from Redis")

    async def publish_message(self, channel: str, message: dict):
        """Publish a message to a Redis channel"""
        try:
            if not self.redis_client:
                raise Exception("Redis client not connected")
            
            message_json = json.dumps(message, default=str)
            await self.redis_client.publish(channel, message_json)
            logger.debug(f"Published message to channel {channel}: {message}")
        except Exception as e:
            logger.error(f"Failed to publish message: {e}")
            raise

    async def subscribe_to_channel(self, channel: str):
        """Subscribe to a Redis channel"""
        try:
            if not self.pubsub:
                raise Exception("PubSub not initialized")
            
            await self.pubsub.subscribe(channel)
            logger.info(f"Subscribed to channel: {channel}")
        except Exception as e:
            logger.error(f"Failed to subscribe to channel {channel}: {e}")
            raise

    async def unsubscribe_from_channel(self, channel: str):
        """Unsubscribe from a Redis channel"""
        try:
            if not self.pubsub:
                return
            
            await self.pubsub.unsubscribe(channel)
            logger.info(f"Unsubscribed from channel: {channel}")
        except Exception as e:
            logger.error(f"Failed to unsubscribe from channel {channel}: {e}")

    async def listen_for_messages(self):
        """Listen for messages from subscribed channels"""
        try:
            if not self.pubsub:
                raise Exception("PubSub not initialized")
            
            async for message in self.pubsub.listen():
                if message['type'] == 'message':
                    try:
                        data = json.loads(message['data'])
                        yield {
                            'channel': message['channel'],
                            'data': data
                        }
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to decode message: {e}")
                        continue
        except Exception as e:
            logger.error(f"Error listening for messages: {e}")
            raise

    # user management methods
    async def set_user_online(self, username: str, profile_pic: str = None):
        """Set user status to online"""
        try:
            user_key = f"user:{username}"
            await self.redis_client.hset(user_key, "status", UserStatus.ONLINE.value)
            await self.redis_client.hset(user_key, "last_seen", str(datetime.now()))
            
            # Store profile pic if provided
            if profile_pic:
                await self.redis_client.hset(user_key, "profile_pic", profile_pic)
            
            # Add to online users set
            await self.redis_client.sadd("online_users", username)
            
            # Notify others about user coming online
            await self.publish_message("user_status", {
                "action": "user_online",
                "username": username,
                "status": UserStatus.ONLINE.value
            })
        except Exception as e:
            logger.error(f"Failed to set user online: {e}")

    async def set_user_offline(self, username: str):
        """Set user status to offline"""
        try:
            user_key = f"user:{username}"
            await self.redis_client.hset(user_key, "status", UserStatus.OFFLINE.value)
            await self.redis_client.hset(user_key, "last_seen", str(datetime.now()))
            
            # Remove from online users set
            await self.redis_client.srem("online_users", username)
            
            # Notify others about user going offline
            await self.publish_message("user_status", {
                "action": "user_offline",
                "username": username,
                "status": UserStatus.OFFLINE.value
            })
        except Exception as e:
            logger.error(f"Failed to set user offline: {e}")

    async def get_online_users(self) -> Set[str]:
        """Get list of online users"""
        try:
            online_users = await self.redis_client.smembers("online_users")
            return set(online_users) if online_users else set()
        except Exception as e:
            logger.error(f"Failed to get online users: {e}")
            return set()

    async def get_user_profile_pic(self, username: str) -> str:
        """Get user's profile picture from Redis"""
        try:
            user_key = f"user:{username}"
            profile_pic = await self.redis_client.hget(user_key, "profile_pic")
            return profile_pic
        except Exception as e:
            logger.error(f"Failed to get user profile pic: {e}")
            return None

    async def get_all_users(self) -> list:
        """Get all users from Redis (both online and offline)"""
        try:
            # Get all user keys
            user_keys = []
            async for key in self.redis_client.scan_iter(match="user:*"):
                user_keys.append(key)
            
            users = []
            for user_key in user_keys:
                username = user_key.split(":", 1)[1]
                user_data = await self.redis_client.hgetall(user_key)
                if user_data:
                    users.append({
                        "username": username,
                        "profile_pic": user_data.get("profile_pic"),
                        "status": user_data.get("status", UserStatus.OFFLINE.value),
                        "last_seen": user_data.get("last_seen", str(datetime.now()))
                    })
            
            return users
        except Exception as e:
            logger.error(f"Failed to get all users: {e}")
            return []

    async def store_message(self, message: Message):
        """Store a message in Redis"""
        try:
            # Create a conversation key (sorted usernames)
            if message.to_user:
                users = sorted([message.from_user, message.to_user])
                conversation_key = f"conversation:{users[0]}:{users[1]}"
            else:
                conversation_key = f"conversation:broadcast"
            
            message_data = message.dict()
            await self.redis_client.lpush(conversation_key, json.dumps(message_data, default=str))
            
            await self.redis_client.ltrim(conversation_key, 0, 999)
            
        except Exception as e:
            logger.error(f"Failed to store message: {e}")

    async def get_conversation_history(self, user1: str, user2: str, limit: int = 50):
        """Get conversation history between two users"""
        try:
            users = sorted([user1, user2])
            conversation_key = f"conversation:{users[0]}:{users[1]}"
            
            messages_json = await self.redis_client.lrange(conversation_key, 0, limit - 1)
            messages = []
            
            for msg_json in reversed(messages_json):  # Reverse to get chronological order
                try:
                    message_data = json.loads(msg_json)
                    messages.append(message_data)
                except json.JSONDecodeError:
                    continue
            
            return messages
        except Exception as e:
            logger.error(f"Failed to get conversation history: {e}")
            return []


# Global instance
pubsub_service = PubSubService()
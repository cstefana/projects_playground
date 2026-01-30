import logging
import json
import uuid
from typing import Dict, List
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from app.models import Message, WebSocketMessage, MessageType
from app.services.pubsub import pubsub_service
from app.services.user_manager import user_manager

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}  # connection_id -> websocket
        self.user_connections: Dict[str, str] = {}  # connection_id -> username
        self.connection_users: Dict[str, List[str]] = {}  # username -> list of connection_ids

    async def connect(self, websocket: WebSocket, username: str) -> str:
        """Accept new WebSocket connection"""
        await websocket.accept()
        connection_id = str(uuid.uuid4())
        
        # store connection
        self.active_connections[connection_id] = websocket
        self.user_connections[connection_id] = username
        
        # tracking user connections
        if username not in self.connection_users:
            self.connection_users[username] = []
        self.connection_users[username].append(connection_id)
        
        # add user to user manager
        await user_manager.add_user(username, connection_id)
        
        logger.info(f"User {username} connected with connection {connection_id}")
        
        # send welcome message and user list
        await self.send_personal_message({
            "type": "connection_established",
            "message": "Connected successfully",
            "username": username
        }, connection_id)
        
        # send current online users
        online_users = user_manager.get_users_for_user_list()
        await self.send_personal_message({
            "type": "user_list",
            "users": online_users
        }, connection_id)
        
        # the new user joined the chat
        await self.broadcast_user_status(username, "joined")
        
        return connection_id

    async def disconnect(self, connection_id: str):
        """Handle WebSocket disconnection"""
        if connection_id in self.active_connections:
            username = self.user_connections.get(connection_id)
            
            # remove connection
            del self.active_connections[connection_id]
            del self.user_connections[connection_id]
            
            # remove from user connections
            if username and username in self.connection_users:
                self.connection_users[username].remove(connection_id)
                if not self.connection_users[username]:
                    del self.connection_users[username]
            
            # update user manager
            if username:
                await user_manager.remove_user_connection(username, connection_id)
                logger.info(f"User {username} disconnected")
                
                # only notify if user is completely offline
                if not user_manager.is_user_online(username):
                    await self.broadcast_user_status(username, "left")

    async def send_personal_message(self, message: dict, connection_id: str):
        """Send message to specific connection"""
        try:
            if connection_id in self.active_connections:
                websocket = self.active_connections[connection_id]
                await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send personal message to {connection_id}: {e}")
            await self.disconnect(connection_id)

    async def send_message_to_user(self, message: dict, username: str):
        """Send message to all connections of a specific user"""
        if username in self.connection_users:
            for connection_id in self.connection_users[username]:
                await self.send_personal_message(message, connection_id)

    async def broadcast_message(self, message: dict, exclude_connection: str = None):
        """Broadcast message to all connected users"""
        for connection_id in list(self.active_connections.keys()):
            if connection_id != exclude_connection:
                await self.send_personal_message(message, connection_id)

    async def broadcast_user_status(self, username: str, action: str):
        """Broadcast user status change to all users"""
        message = {
            "type": "user_status",
            "username": username,
            "action": action,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast_message(message)

    async def handle_message(self, websocket_message: WebSocketMessage, connection_id: str):
        """Handle incoming WebSocket message"""
        try:
            username = self.user_connections.get(connection_id)
            if not username:
                logger.error(f"No username found for connection {connection_id}")
                return

            action = websocket_message.action
            data = websocket_message.data

            if action == "send_message":
                await self._handle_send_message(data, username)
            elif action == "typing":
                await self._handle_typing(data, username)
            elif action == "get_history":
                await self._handle_get_history(data, username, connection_id)
            elif action == "get_users":
                await self._handle_get_users(connection_id)
            else:
                logger.warning(f"Unknown action: {action}")

        except Exception as e:
            logger.error(f"Error handling message: {e}")

    async def _handle_send_message(self, data: dict, from_username: str):
        """Handle sending a message"""
        try:
            to_username = data.get("to_user")
            content = data.get("content", "").strip()
            
            if not content:
                return

            # create message object
            message = Message(
                id=str(uuid.uuid4()),
                from_user=from_username,
                to_user=to_username,
                content=content,
                message_type=MessageType.TEXT,
                timestamp=datetime.now()
            )

            # store message in Redis
            await pubsub_service.store_message(message)

            # prepare message for broadcasting
            message_data = {
                "type": "message",
                "id": message.id,
                "from_user": message.from_user,
                "to_user": message.to_user,
                "content": message.content,
                "timestamp": message.timestamp.isoformat()
            }

            # send to recipient if private message
            if to_username:
                await self.send_message_to_user(message_data, to_username)
                # also send back to sender for confirmation
                # without sensing the message back to the sender, it would not appear in their chat window
                await self.send_message_to_user(message_data, from_username)
            else:
                # broadcast to all users
                await self.broadcast_message(message_data)

            # publish to Redis for other server instances
            await pubsub_service.publish_message("chat_messages", message_data)

        except Exception as e:
            logger.error(f"Error handling send_message: {e}")

    async def _handle_typing(self, data: dict, username: str):
        """Handle typing indicator"""
        try:
            is_typing = data.get("typing", False)
            to_user = data.get("to_user")

            await user_manager.set_user_typing(username, is_typing)

            # send typing indicator to specific user or broadcast
            typing_message = {
                "type": "typing",
                "username": username,
                "typing": is_typing,
                "to_user": to_user
            }

            if to_user:
                await self.send_message_to_user(typing_message, to_user)
            else:
                await self.broadcast_message(typing_message, 
                                           exclude_connection=None)  # don't exclude sender for typing

        except Exception as e:
            logger.error(f"Error handling typing: {e}")

    async def _handle_get_history(self, data: dict, username: str, connection_id: str):
        """Handle request for chat history"""
        try:
            other_user = data.get("with_user")
            limit = data.get("limit", 50)

            if not other_user:
                return

            # get conversation history from Redis
            messages = await pubsub_service.get_conversation_history(
                username, other_user, limit
            )

            # send history to requesting user
            await self.send_personal_message({
                "type": "chat_history",
                "with_user": other_user,
                "messages": messages
            }, connection_id)

        except Exception as e:
            logger.error(f"Error handling get_history: {e}")

    async def _handle_get_users(self, connection_id: str):
        """Handle request for user list"""
        try:
            users = user_manager.get_users_for_user_list()
            await self.send_personal_message({
                "type": "user_list",
                "users": users
            }, connection_id)
        except Exception as e:
            logger.error(f"Error handling get_users: {e}")


# Global instance
connection_manager = ConnectionManager()
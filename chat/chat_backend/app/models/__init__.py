from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum


class MessageType(str, Enum):
    TEXT = "text"
    SYSTEM = "system"
    USER_JOINED = "user_joined"
    USER_LEFT = "user_left"


class UserStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    TYPING = "typing"


class User(BaseModel):
    username: str
    profile_pic: Optional[str] = None
    status: UserStatus = UserStatus.OFFLINE
    last_seen: datetime = datetime.now()

    class Config:
        use_enum_values = True


class Message(BaseModel):
    id: Optional[str] = None
    from_user: str
    to_user: Optional[str] = None  # none for broadcast messages
    content: str
    message_type: MessageType = MessageType.TEXT
    timestamp: datetime = datetime.now()
    room_id: Optional[str] = None

    class Config:
        use_enum_values = True


class ChatRoom(BaseModel):
    room_id: str
    participants: List[str]
    messages: List[Message] = []
    created_at: datetime = datetime.now()
    last_activity: datetime = datetime.now()


class WebSocketMessage(BaseModel):
    action: str  # for example, "send_message"
    data: dict
    username: Optional[str] = None
    room_id: Optional[str] = None
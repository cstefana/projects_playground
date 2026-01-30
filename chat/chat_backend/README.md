# Sage Chat Backend

A real-time chat backend built with FastAPI, WebSockets, and Redis pub-sub architecture.

## Features

- **Real-time messaging** with WebSocket support
- **Pub-sub architecture** using Redis for scalability
- **User management** with online/offline status tracking
- **Message persistence** with conversation history
- **Typing indicators** for enhanced user experience
- **CORS support** for cross-origin requests
- **Health monitoring** with status endpoints

## Quick Start

1. **Install Dependencies**
   ```bash
   # Make sure Redis is installed and running
   brew install redis  # on macOS
   brew services start redis

   # Start the backend server
   ./start_server.sh
   ```

2. **Server will be available at:**
   - Main server: `http://localhost:8000`
   - WebSocket endpoint: `ws://localhost:8000/chat/ws`
   - Health check: `http://localhost:8000/health`
   - API docs: `http://localhost:8000/docs`

## API Endpoints

### REST Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check with service status
- `GET /users` - Get list of online users
- `GET /users/{username}/history` - Get conversation history

### WebSocket Endpoint

- `WS /chat/ws?username={username}` - WebSocket connection for real-time chat

## WebSocket Message Format

### Client to Server Messages

```json
{
  "action": "send_message",
  "data": {
    "to_user": "recipient_username",  // optional, null for broadcast
    "content": "Hello world!"
  }
}
```

```json
{
  "action": "typing",
  "data": {
    "typing": true,
    "to_user": "recipient_username"  // optional
  }
}
```

```json
{
  "action": "get_history",
  "data": {
    "with_user": "other_username",
    "limit": 50
  }
}
```

### Server to Client Messages

```json
{
  "type": "message",
  "id": "message_id",
  "from_user": "sender_username",
  "to_user": "recipient_username",
  "content": "Hello world!",
  "timestamp": "2026-01-29T10:30:00Z"
}
```

```json
{
  "type": "user_status",
  "username": "john_doe",
  "action": "joined", // or "left"
  "timestamp": "2026-01-29T10:30:00Z"
}
```

```json
{
  "type": "typing",
  "username": "john_doe",
  "typing": true,
  "to_user": "recipient_username"
}
```

### Core Components

1. **FastAPI Server** (`main.py`)
   - Handles WebSocket connections
   - Provides REST API endpoints
   - Manages application lifecycle

2. **Connection Manager** (`app/websocket/connection_manager.py`)
   - Manages WebSocket connections
   - Handles message routing
   - Implements real-time communication logic

3. **User Manager** (`app/services/user_manager.py`)
   - Tracks online users
   - Manages user status (online/offline/typing)
   - Handles user authentication

4. **Pub-Sub Service** (`app/services/pubsub.py`)
   - Redis integration for message broadcasting
   - Message persistence and history
   - Cross-instance communication support

5. **Models** (`app/models/`)
   - Data models for users, messages, and WebSocket communication
   - Type safety with Pydantic

## Environment Variables

Create a `.env` file to customize configuration:

```bash
# Server settings
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Redis settings
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_password  # optional

# Chat settings
MAX_MESSAGE_LENGTH=1000
MAX_HISTORY_MESSAGES=1000
DEFAULT_HISTORY_LIMIT=50

# CORS settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Logging
LOG_LEVEL=INFO
```

## Development

### Project Structure

```
chat_backend/
├── main.py                     # FastAPI application entry point
├── config.py                   # Configuration settings
├── requirements.txt            # Python dependencies
├── start_server.sh            # Startup script
└── app/
    ├── models/
    │   └── __init__.py        # Data models (User, Message, etc.)
    ├── services/
    │   ├── pubsub.py          # Redis pub-sub service
    │   └── user_manager.py    # User management service
    └── websocket/
        ├── connection_manager.py  # WebSocket connection handling
        └── routes.py             # WebSocket routes
```

### Running in Development

```bash
# Install dependencies
pip install -r requirements.txt

# Start Redis
redis-server

# Run the server with auto-reload
python main.py
```

### Testing WebSocket Connection

You can test the WebSocket connection using a simple JavaScript client:

```javascript
const ws = new WebSocket('ws://localhost:8000/chat/ws?username=testuser');

ws.onopen = function(event) {
    console.log('Connected to chat server');
};

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log('Received:', message);
};

// Send a message
ws.send(JSON.stringify({
    action: 'send_message',
    data: {
        content: 'Hello, World!',
        to_user: 'another_user'  // optional
    }
}));
```

## Next Steps

To connect this backend with your existing frontend:

1. **Update the JavaScript frontend** to use WebSocket connections
2. **Replace CSV data loading** with real-time user management
3. **Implement message sending/receiving** through WebSocket
4. **Add user authentication** (optional)
5. **Style the real-time features** (typing indicators, online status)

The backend is ready to handle real-time chat functionality!
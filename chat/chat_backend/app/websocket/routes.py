from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
import json
import logging
from app.models import WebSocketMessage
from app.websocket.connection_manager import connection_manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, username: str = Query(...)):
    """WebSocket endpoint for chat connections"""
    connection_id = None
    try:
        # Connect user
        connection_id = await connection_manager.connect(websocket, username)
        
        # Listen for messages
        while True:
            try:
                # Receive message from WebSocket
                data = await websocket.receive_text()
                
                # Parse message
                try:
                    message_data = json.loads(data)
                    websocket_message = WebSocketMessage(**message_data)
                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"Invalid message format from {username}: {e}")
                    await connection_manager.send_personal_message({
                        "type": "error",
                        "message": "Invalid message format"
                    }, connection_id)
                    continue
                
                # Handle the message
                await connection_manager.handle_message(websocket_message, connection_id)
                
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for user {username}")
                break
            except Exception as e:
                logger.error(f"Error processing message from {username}: {e}")
                break
                
    except Exception as e:
        logger.error(f"Error in websocket connection for {username}: {e}")
    finally:
        # Clean up connection
        if connection_id:
            await connection_manager.disconnect(connection_id)
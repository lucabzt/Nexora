
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import uuid
from sqlalchemy.orm import Session
from typing import List

from ...db.models.db_user import User
from ...services.agent_service import AgentService
from ...utils.auth import get_current_active_user
from ...db.database import get_db
from ...services.notification_service import manager as ws_manager


router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)



@router.websocket("/ws")
async def websocket_course_progress(websocket: WebSocket, user: User = Depends(get_current_active_user)):
    
    await ws_manager.connect(websocket, user.id)
    
    print(f"WebSocket connection established for user_id: {user.id}")
    try:
        while True:
            # Keep the connection alive. 
            # Client can send messages if needed, e.g., for acknowledgments or commands.
            # For now, we'll just keep it open to send progress from the server.
            # If the client sends a message, it will be received here.
            # If the connection is closed by the client, WebSocketDisconnect will be raised.
            data = await websocket.receive_text() # Or receive_bytes, receive_json

            # DO THINGS HERE


            # print(f"Received message from {task_id}: {data}") # Optional: log client messages
            # You might want to handle specific client messages here if your protocol requires it.
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for user_id: {user.id} (client closed)")
        # ws_manager.disconnect is called in the finally block
    except Exception as e:
        print(f"WebSocket error for user_id: {user.id}: {e}")
        # ws_manager.disconnect is called in the finally block
    finally:
        # Ensure cleanup happens
        ws_manager.disconnect(websocket, user.id)
        print(f"WebSocket connection properly closed for user_id: {user.id}")
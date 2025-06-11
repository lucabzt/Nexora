from fastapi import WebSocket
from typing import Dict, List, Optional
import asyncio
import json

class WebSocketConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = []
        self.active_connections[client_id].append(websocket)
        print(f"WebSocket connected for client_id: {client_id}, total connections for this client: {len(self.active_connections[client_id])}")

    def disconnect(self, websocket: WebSocket, client_id: str):
        if client_id in self.active_connections:
            if websocket in self.active_connections[client_id]:
                self.active_connections[client_id].remove(websocket)
                if not self.active_connections[client_id]: # If no more connections for this client_id
                    del self.active_connections[client_id]
                print(f"WebSocket disconnected for client_id: {client_id}")
            else:
                print(f"WebSocket not found in active connections for client_id: {client_id} during disconnect")
        else:
            print(f"Client_id: {client_id} not found during disconnect")

    async def send_json_message(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            disconnected_sockets = []
            for connection in self.active_connections[client_id]:
                try:
                    await connection.send_json(message)
                    # print(f"Sent message to {client_id}: {json.dumps(message)[:100]}...")
                except Exception as e:
                    print(f"Error sending message to WebSocket for client {client_id}: {e}. Marking for disconnection.")
                    disconnected_sockets.append(connection)
            
            # Clean up disconnected sockets
            for ws in disconnected_sockets:
                self.disconnect(ws, client_id)
        else:
            print(f"No active WebSocket connection for client_id: {client_id} to send message.")

    
    async def broadcast_json_message(self, message: dict, from_client: str = None):
        for client_id, connections in self.active_connections.items():
            if from_client and client_id == from_client:
                continue
            for connection in connections:
                try:
                    await connection.send_json(message)
                    # print(f"Broadcasted message to {client_id}: {json.dumps(message)[:100]}...")
                except Exception as e:
                    print(f"Error broadcasting message to WebSocket for client {client_id}: {e}. Marking for disconnection.")
                    disconnected_sockets.append(connection)
            
            # Clean up disconnected sockets
            for ws in disconnected_sockets:
                self.disconnect(ws, client_id)

# Global instance of the manager
manager = WebSocketConnectionManager()

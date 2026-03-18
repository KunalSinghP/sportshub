from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps match_id to list of active websockets
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, match_id: int, websocket: WebSocket):
        await websocket.accept()
        if match_id not in self.active_connections:
            self.active_connections[match_id] = []
        self.active_connections[match_id].append(websocket)

    def disconnect(self, match_id: int, websocket: WebSocket):
        if match_id in self.active_connections:
            self.active_connections[match_id].remove(websocket)
            if not self.active_connections[match_id]:
                del self.active_connections[match_id]

    async def broadcast_to_match(self, match_id: int, message: str):
        if match_id in self.active_connections:
            for connection in self.active_connections[match_id]:
                await connection.send_text(message)

manager = ConnectionManager()

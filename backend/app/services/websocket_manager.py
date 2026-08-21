"""
WebSocket manager — handles real-time push notifications for admin alerts.
Manages WebSocket connections and broadcasts high-risk transaction alerts.
"""

from typing import Dict, Set
from fastapi import WebSocket
import json


class WebSocketManager:
    """
    Manages WebSocket connections for real-time admin notifications.

    Usage:
        - Admin connects to ws://localhost:8000/ws/admin/{admin_id}
        - When a high-risk transaction is detected, broadcast alert to all connected admins
        - Supports multiple admin connections (e.g., multiple browser tabs)
    """

    def __init__(self):
        # Map of user_id -> set of active WebSocket connections
        self._admin_connections: Dict[str, Set[WebSocket]] = {}
        # All active admin connections (for broadcast)
        self._all_admin_sockets: Set[WebSocket] = set()

    async def connect_admin(self, websocket: WebSocket, admin_id: str):
        """Accept and register an admin WebSocket connection."""
        await websocket.accept()

        if admin_id not in self._admin_connections:
            self._admin_connections[admin_id] = set()

        self._admin_connections[admin_id].add(websocket)
        self._all_admin_sockets.add(websocket)

        print(f"[WS] Admin WebSocket connected: {admin_id} (total: {len(self._all_admin_sockets)})")

    async def disconnect_admin(self, websocket: WebSocket, admin_id: str):
        """Remove an admin WebSocket connection."""
        if admin_id in self._admin_connections:
            self._admin_connections[admin_id].discard(websocket)
            if not self._admin_connections[admin_id]:
                del self._admin_connections[admin_id]

        self._all_admin_sockets.discard(websocket)

        print(f"[WS] Admin WebSocket disconnected: {admin_id} (total: {len(self._all_admin_sockets)})")

    async def broadcast_alert(self, alert_data: dict):
        """
        Broadcast a high-risk alert to ALL connected admin WebSocket clients.
        This triggers the pop-up notification on the admin dashboard.
        """
        if not self._all_admin_sockets:
            print("[WARN] No admin WebSocket connections -- alert not pushed")
            return

        message = json.dumps({
            "type": "risk_alert",
            "data": alert_data,
        })

        # Send to all connected admins, remove dead connections
        dead_sockets = set()
        for ws in self._all_admin_sockets:
            try:
                await ws.send_text(message)
            except Exception:
                dead_sockets.add(ws)

        # Clean up dead connections
        for ws in dead_sockets:
            self._all_admin_sockets.discard(ws)
            for admin_id, sockets in self._admin_connections.items():
                sockets.discard(ws)

        print(f"[WS] Alert broadcast to {len(self._all_admin_sockets)} admin(s)")

    async def send_to_user(self, user_id: str, message_data: dict):
        """
        Send a message to a specific admin by user_id.
        Used for targeted notifications (e.g., review responses).
        """
        if user_id not in self._admin_connections:
            return

        message = json.dumps(message_data)
        dead_sockets = set()

        for ws in self._admin_connections[user_id]:
            try:
                await ws.send_text(message)
            except Exception:
                dead_sockets.add(ws)

        for ws in dead_sockets:
            self._admin_connections[user_id].discard(ws)
            self._all_admin_sockets.discard(ws)

    @property
    def connected_admin_count(self) -> int:
        """Number of active admin connections."""
        return len(self._all_admin_sockets)


# Singleton instance
ws_manager = WebSocketManager()

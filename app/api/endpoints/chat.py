import json
from typing import Dict, List
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import jwt
from app.core.config import settings
from app.db.database import get_db
from app.models.message import Message
from app.models.user import User
from app.schemas.chat import MessageResponse
from app.api.deps import get_current_user

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # active_connections: {user_id: [WebSocket, ...]}
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)

manager = ConnectionManager()

async def get_token_user(websocket: WebSocket, db: Session) -> User:
    # We expect token in query params for WS
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(status_code=403, detail="Missing token")
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            raise HTTPException(status_code=403, detail="Invalid token")
    except jwt.PyJWTError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(status_code=403, detail="Invalid token")
        
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(status_code=403, detail="User not found")
    return user

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    user = await get_token_user(websocket, db)
    await manager.connect(websocket, user.id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # message_data format: {"content": "...", "receiver_id": 123, "listing_id": 456}
            new_msg = Message(
                sender_id=user.id,
                receiver_id=message_data["receiver_id"],
                listing_id=message_data.get("listing_id"),
                content=message_data["content"]
            )
            db.add(new_msg)
            db.commit()
            db.refresh(new_msg)
            
            # Send real-time notification to receiver
            msg_response = MessageResponse.model_validate(new_msg).model_dump()
            msg_response["created_at"] = msg_response["created_at"].isoformat()
            
            await manager.send_personal_message(msg_response, new_msg.receiver_id)
            # Also send back to sender for confirmation
            await websocket.send_json(msg_response)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id)
    except Exception as e:
        print(f"WS error: {e}")
        manager.disconnect(websocket, user.id)

@router.get("/conversations")
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve list of unique users current user has chatted with."""
    # This is a bit simplified, but gets the job done:
    # Find all messages where current_user is sender or receiver
    messages = db.query(Message).filter(
        or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
    ).order_by(Message.created_at.desc()).all()
    
    conversations = []
    seen_users = set()
    
    for msg in messages:
        other_user_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        if other_user_id not in seen_users:
            seen_users.add(other_user_id)
            other_user = db.query(User).filter(User.id == other_user_id).first()
            if other_user:
                conversations.append({
                    "other_user_id": other_user.id,
                    "other_username": other_user.username,
                    "last_message": msg.content,
                    "created_at": msg.created_at,
                    "listing_id": msg.listing_id
                })
                
    return conversations

@router.get("/history/{other_user_id}", response_model=List[MessageResponse])
def get_chat_history(
    other_user_id: int, 
    listing_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve chat history between current user and another user."""
    query = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id)
        )
    )
    
    if listing_id:
        query = query.filter(Message.listing_id == listing_id)
        
    messages = query.order_by(Message.created_at.asc()).all()
    return messages

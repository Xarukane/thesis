import pytest

def test_get_conversations_empty(client, auth_headers):
    response = client.get("/api/chat/conversations", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []

def test_chat_websocket_and_history(client, auth_headers, test_user):
    # Register another user
    res = client.post("/api/users/register", json={
        "username": "otheruser",
        "email": "other@example.com",
        "password": "password"
    })
    other_user_id = res.json()["id"]

    # Login to get token for websocket
    res2 = client.post("/api/auth/login", data={"username": "testuser", "password": "testpassword"})
    token = res2.json()["access_token"]
    
    # We can test the websocket via client.websocket_connect
    with client.websocket_connect(f"/api/chat/ws?token={token}") as websocket:
        websocket.send_json({
            "content": "Hello",
            "receiver_id": other_user_id,
            "listing_id": None
        })
        data = websocket.receive_json()
        assert data["content"] == "Hello"
        assert data["sender_id"] == test_user["id"]
        assert data["receiver_id"] == other_user_id
        
    # Check history
    res3 = client.get(f"/api/chat/history/{other_user_id}", headers=auth_headers)
    assert res3.status_code == 200
    history = res3.json()
    assert len(history) == 1
    assert history[0]["content"] == "Hello"

    # Check conversations
    res4 = client.get("/api/chat/conversations", headers=auth_headers)
    assert res4.status_code == 200
    convs = res4.json()
    assert len(convs) == 1
    assert convs[0]["other_user_id"] == other_user_id

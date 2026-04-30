def test_register_user(client):

    response = client.post("/api/users/register", json={

        "username": "newuser",

        "email": "new@example.com",

        "password": "newpassword"

    })

    assert response.status_code == 201

    data = response.json()

    assert data["username"] == "newuser"

    assert "id" in data



def test_register_duplicate_user(client, test_user):

    response = client.post("/api/users/register", json={

        "username": "testuser",

        "email": "another@example.com",

        "password": "password"

    })

    assert response.status_code == 400



def test_read_user_profile(client, auth_headers, test_user):

    response = client.get("/api/users/me", headers=auth_headers)

    assert response.status_code == 200

    assert response.json()["username"] == "testuser"



def test_read_user_by_id(client, test_user):

    user_id = test_user["id"]

    response = client.get(f"/api/users/{user_id}")

    assert response.status_code == 200

    assert response.json()["username"] == "testuser"



def test_read_user_not_found(client):

    response = client.get("/api/users/9999")

    assert response.status_code == 404


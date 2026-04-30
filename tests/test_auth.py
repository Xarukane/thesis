def test_login_success(client, test_user):

    response = client.post("/api/auth/login", data={

        "username": "testuser",

        "password": "testpassword"

    })

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data

    assert data["token_type"] == "bearer"



def test_login_invalid_password(client, test_user):

    response = client.post("/api/auth/login", data={

        "username": "testuser",

        "password": "wrongpassword"

    })

    assert response.status_code == 401



def test_login_nonexistent_user(client):

    response = client.post("/api/auth/login", data={

        "username": "nobody",

        "password": "password"

    })

    assert response.status_code == 401


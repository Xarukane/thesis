import pytest



def test_get_all_users_as_admin(client, admin_auth_headers, test_user):

    response = client.get("/api/users/", headers=admin_auth_headers)

    assert response.status_code == 200

    data = response.json()

    assert len(data) >= 2                            

    usernames = [u["username"] for u in data]

    assert "adminuser" in usernames

    assert "testuser" in usernames



def test_get_all_users_as_regular_user(client, auth_headers):

    response = client.get("/api/users/", headers=auth_headers)

    assert response.status_code == 403



def test_delete_user_as_admin(client, admin_auth_headers, db):

                               

    client.post("/api/users/register", json={

        "username": "todelete",

        "email": "delete@example.com",

        "password": "password"

    })

    from app.models.user import User

    user = db.query(User).filter(User.username == "todelete").first()

    user_id = user.id



    response = client.delete(f"/api/users/{user_id}", headers=admin_auth_headers)

    assert response.status_code == 204



                         

    deleted_user = db.query(User).filter(User.id == user_id).first()

    assert deleted_user is None



def test_delete_user_as_regular_user(client, auth_headers, admin_user):

    admin_id = admin_user["id"]

    response = client.delete(f"/api/users/{admin_id}", headers=auth_headers)

    assert response.status_code == 403



def test_admin_can_delete_any_listing(client, admin_auth_headers, auth_headers, db):

                                    

    response = client.post("/api/listings/", json={

        "title": "User Listing",

        "description": "User description",

        "price": 100,

        "category": "Electronics",

        "location": "Test City"

    }, headers=auth_headers)

    listing_id = response.json()["id"]



                      

    response = client.delete(f"/api/listings/{listing_id}", headers=admin_auth_headers)

    assert response.status_code == 204



                            

    from app.models.listing import Listing

    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    assert listing is None


def test_create_listing(client, auth_headers):

    response = client.post("/api/listings/", headers=auth_headers, json={

        "title": "Test Listing",

        "description": "A nice description",

        "price": 100.5,

        "category": "General",

        "location": "Test City"

    })

    assert response.status_code == 201

    assert response.json()["title"] == "Test Listing"



def test_get_all_listings(client):

    response = client.get("/api/listings/")

    assert response.status_code == 200

    assert isinstance(response.json(), list)



def test_get_listing_by_id(client, auth_headers):

    res1 = client.post("/api/listings/", headers=auth_headers, json={

        "title": "Test Listing",

        "description": "A nice description",

        "price": 100.5,

        "category": "General",

        "location": "Test City"

    })

    listing_id = res1.json()["id"]

    

    res2 = client.get(f"/api/listings/{listing_id}")

    assert res2.status_code == 200

    assert res2.json()["id"] == listing_id



def test_update_listing(client, auth_headers):

    res1 = client.post("/api/listings/", headers=auth_headers, json={

        "title": "Test Listing",

        "description": "A nice description",

        "price": 100.5,

        "category": "General",

        "location": "Test City"

    })

    listing_id = res1.json()["id"]

    

    res2 = client.put(f"/api/listings/{listing_id}", headers=auth_headers, json={

        "title": "Updated Listing",

        "description": "Updated description",

        "price": 200.0,

        "category": "General",

        "location": "Test City"

    })

    assert res2.status_code == 200

    assert res2.json()["title"] == "Updated Listing"



def test_delete_listing(client, auth_headers):

    res1 = client.post("/api/listings/", headers=auth_headers, json={

        "title": "Test Listing",

        "description": "A nice description",

        "price": 100.5,

        "category": "General",

        "location": "Test City"

    })

    listing_id = res1.json()["id"]

    

    res2 = client.delete(f"/api/listings/{listing_id}", headers=auth_headers)

    assert res2.status_code == 204

    

    res3 = client.get(f"/api/listings/{listing_id}")

    assert res3.status_code == 404


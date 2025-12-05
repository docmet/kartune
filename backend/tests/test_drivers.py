def test_create_driver(client, test_user):
    response = client.post(
        "/api/drivers/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={
            "name": "John Doe",
            "team_id": test_user["user"]["team_id"],
            "weight_kg": 75.5,
            "height_cm": 180,
            "gender": "M",
            "experience_level": "intermediate",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "John Doe"
    assert data["weight_kg"] == 75.5
    assert "id" in data


def test_create_driver_wrong_team(client):
    """Users can only create drivers for their own team (team isolation)"""
    # Create first user with team 1
    client.post(
        "/api/auth/register",
        json={"email": "user1@example.com", "password": "testpass123", "full_name": "User 1", "team_name": "Team 1"},
    )

    # Create second user with team 2
    reg_response = client.post(
        "/api/auth/register",
        json={"email": "user2@example.com", "password": "testpass123", "full_name": "User 2", "team_name": "Team 2"},
    )
    team2_id = reg_response.json()["team_id"]

    # Login as user 1
    login_response = client.post("/api/auth/login", json={"email": "user1@example.com", "password": "testpass123"})
    token = login_response.json()["access_token"]

    # User 1 tries to create driver for Team 2
    response = client.post(
        "/api/drivers/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Jane Doe",
            "team_id": team2_id,  # Different team
            "weight_kg": 65.0,
        },
    )
    assert response.status_code == 403


def test_list_drivers(client, test_user):
    # Create a driver first
    client.post(
        "/api/drivers/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={"name": "Driver 1", "team_id": test_user["user"]["team_id"]},
    )

    response = client.get("/api/drivers/", headers={"Authorization": f"Bearer {test_user['token']}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Driver 1"


def test_get_driver(client, test_user):
    # Create a driver
    create_response = client.post(
        "/api/drivers/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={"name": "Test Driver", "team_id": test_user["user"]["team_id"]},
    )
    driver_id = create_response.json()["id"]

    response = client.get(f"/api/drivers/{driver_id}", headers={"Authorization": f"Bearer {test_user['token']}"})
    assert response.status_code == 200
    assert response.json()["name"] == "Test Driver"


def test_update_driver(client, test_user):
    # Create a driver
    create_response = client.post(
        "/api/drivers/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={"name": "Original Name", "team_id": test_user["user"]["team_id"]},
    )
    driver_id = create_response.json()["id"]

    # Update the driver
    response = client.put(
        f"/api/drivers/{driver_id}",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={"name": "Updated Name", "weight_kg": 80.0},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["weight_kg"] == 80.0


def test_delete_driver(client, test_user):
    # Create a driver
    create_response = client.post(
        "/api/drivers/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={"name": "To Delete", "team_id": test_user["user"]["team_id"]},
    )
    driver_id = create_response.json()["id"]

    # Delete the driver
    response = client.delete(f"/api/drivers/{driver_id}", headers={"Authorization": f"Bearer {test_user['token']}"})
    assert response.status_code == 204

    # Verify it's deleted
    get_response = client.get(f"/api/drivers/{driver_id}", headers={"Authorization": f"Bearer {test_user['token']}"})
    assert get_response.status_code == 404

import io
from datetime import datetime


def test_create_session(client, test_user):
    # First create a track
    track_response = client.post(
        "/api/tracks/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={"name": "Test Track", "location": "Test City", "country": "US", "length_meters": 1200},
    )
    track_id = track_response.json()["id"]

    # Create a driver
    driver_response = client.post(
        "/api/drivers/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={"name": "Test Driver", "team_id": test_user["user"]["team_id"]},
    )
    driver_id = driver_response.json()["id"]

    # Create session
    response = client.post(
        "/api/sessions/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={
            "team_id": test_user["user"]["team_id"],
            "driver_id": driver_id,
            "track_id": track_id,
            "session_date": datetime.now().isoformat(),
            "session_type": "practice",
            "air_temp_celsius": 25.5,
            "track_temp_celsius": 32.0,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["driver_id"] == driver_id
    assert data["track_id"] == track_id
    assert "id" in data


def test_list_sessions(client, test_user):
    # Create track and driver first
    track_response = client.post(
        "/api/tracks/", headers={"Authorization": f"Bearer {test_user['token']}"}, json={"name": "Track 1"}
    )
    track_id = track_response.json()["id"]

    driver_response = client.post(
        "/api/drivers/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={"name": "Driver 1", "team_id": test_user["user"]["team_id"]},
    )
    driver_id = driver_response.json()["id"]

    # Create session
    client.post(
        "/api/sessions/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={
            "team_id": test_user["user"]["team_id"],
            "driver_id": driver_id,
            "track_id": track_id,
            "session_date": datetime.now().isoformat(),
        },
    )

    # List sessions
    response = client.get("/api/sessions/", headers={"Authorization": f"Bearer {test_user['token']}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_upload_telemetry_csv(client, test_user):
    # Create session first
    track_response = client.post(
        "/api/tracks/", headers={"Authorization": f"Bearer {test_user['token']}"}, json={"name": "Track 1"}
    )
    track_id = track_response.json()["id"]

    driver_response = client.post(
        "/api/drivers/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={"name": "Driver 1", "team_id": test_user["user"]["team_id"]},
    )
    driver_id = driver_response.json()["id"]

    session_response = client.post(
        "/api/sessions/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={
            "team_id": test_user["user"]["team_id"],
            "driver_id": driver_id,
            "track_id": track_id,
            "session_date": datetime.now().isoformat(),
        },
    )
    session_id = session_response.json()["id"]

    # Create mock CSV file
    csv_content = """lap,lap_time_ms
1,45230
2,44890
3,44560
4,44320
5,44180"""

    files = {"file": ("telemetry.csv", io.BytesIO(csv_content.encode()), "text/csv")}

    response = client.post(
        f"/api/sessions/{session_id}/upload-telemetry",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        files=files,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == session_id
    assert data["best_lap_time_ms"] == 44180
    assert data["total_laps"] == 5
    assert "consistency_score" in data
    assert "improvement_trend" in data


def test_get_session_analysis(client, test_user):
    # Create session with telemetry
    track_response = client.post(
        "/api/tracks/", headers={"Authorization": f"Bearer {test_user['token']}"}, json={"name": "Track 1"}
    )
    track_id = track_response.json()["id"]

    driver_response = client.post(
        "/api/drivers/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={"name": "Driver 1", "team_id": test_user["user"]["team_id"]},
    )
    driver_id = driver_response.json()["id"]

    session_response = client.post(
        "/api/sessions/",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        json={
            "team_id": test_user["user"]["team_id"],
            "driver_id": driver_id,
            "track_id": track_id,
            "session_date": datetime.now().isoformat(),
        },
    )
    session_id = session_response.json()["id"]

    # Upload telemetry
    csv_content = """lap,lap_time_ms
1,45000
2,44500
3,44000"""

    files = {"file": ("telemetry.csv", io.BytesIO(csv_content.encode()), "text/csv")}
    client.post(
        f"/api/sessions/{session_id}/upload-telemetry",
        headers={"Authorization": f"Bearer {test_user['token']}"},
        files=files,
    )

    # Get analysis
    response = client.get(
        f"/api/sessions/{session_id}/analysis", headers={"Authorization": f"Bearer {test_user['token']}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["best_lap_time_ms"] == 44000
    assert data["improvement_trend"] == "improving"

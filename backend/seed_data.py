"""
Seed script to create test data for development
"""
import requests
from datetime import datetime, timedelta
import random

BASE_URL = "http://localhost/api"

def seed_data():
    # Register a test user
    print("Creating test user...")
    register_response = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "email": "demo@kartune.com",
            "password": "demo123",
            "full_name": "Demo User",
            "team_name": "Demo Racing Team",
            "country": "US"
        }
    )
    
    if register_response.status_code != 200:
        print(f"User might already exist: {register_response.json()}")
    
    # Login
    print("Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "demo@kartune.com",
            "password": "demo123"
        }
    )
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get user info
    me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    user = me_response.json()
    team_id = user["team_id"]
    
    print(f"Logged in as {user['full_name']} (Team ID: {team_id})")
    
    # Create drivers
    print("\nCreating drivers...")
    drivers = []
    driver_names = ["Alex Johnson", "Maria Garcia", "Tom Smith"]
    for name in driver_names:
        response = requests.post(
            f"{BASE_URL}/drivers/",
            headers=headers,
            json={
                "name": name,
                "team_id": team_id,
                "weight_kg": random.uniform(60, 80),
                "height_cm": random.uniform(160, 185),
                "experience_level": random.choice(["beginner", "intermediate", "advanced"])
            }
        )
        if response.status_code == 201:
            drivers.append(response.json())
            print(f"  Created driver: {name}")
    
    # Create tracks
    print("\nCreating tracks...")
    tracks = []
    track_data = [
        {"name": "Silverstone", "location": "Towcester", "country": "UK", "length_meters": 1200},
        {"name": "Lonato", "location": "Lonato del Garda", "country": "Italy", "length_meters": 1200},
        {"name": "Genk", "location": "Genk", "country": "Belgium", "length_meters": 1360},
    ]
    for track in track_data:
        response = requests.post(
            f"{BASE_URL}/tracks/",
            headers=headers,
            json=track
        )
        if response.status_code == 201:
            tracks.append(response.json())
            print(f"  Created track: {track['name']}")
    
    # Create karts
    print("\nCreating karts...")
    karts = []
    kart_brands = ["Tony Kart", "CRG", "Birel ART"]
    for brand in kart_brands:
        response = requests.post(
            f"{BASE_URL}/equipment/karts",
            headers=headers,
            json={
                "team_id": team_id,
                "chassis_brand": brand,
                "chassis_model": "Racer 401",
                "year": 2024,
                "category": "OK"
            }
        )
        if response.status_code == 201:
            karts.append(response.json())
            print(f"  Created kart: {brand}")
    
    # Create engines
    print("\nCreating engines...")
    engines = []
    engine_brands = ["IAME", "Vortex", "TM Racing"]
    for brand in engine_brands:
        response = requests.post(
            f"{BASE_URL}/equipment/engines",
            headers=headers,
            json={
                "team_id": team_id,
                "brand": brand,
                "model": "X30",
                "hours_since_rebuild": random.randint(0, 20)
            }
        )
        if response.status_code == 201:
            engines.append(response.json())
            print(f"  Created engine: {brand}")
    
    # Create sessions
    print("\nCreating sessions...")
    sessions = []
    session_types = ["practice", "qualifying", "race"]
    
    for i in range(5):
        driver = random.choice(drivers)
        track = random.choice(tracks)
        kart = random.choice(karts) if karts else None
        engine = random.choice(engines) if engines else None
        
        session_date = datetime.now() - timedelta(days=random.randint(0, 30))
        
        response = requests.post(
            f"{BASE_URL}/sessions/",
            headers=headers,
            json={
                "team_id": team_id,
                "driver_id": driver["id"],
                "track_id": track["id"],
                "kart_id": kart["id"] if kart else None,
                "engine_id": engine["id"] if engine else None,
                "session_date": session_date.isoformat(),
                "session_type": random.choice(session_types),
                "air_temp_celsius": random.uniform(15, 30),
                "track_temp_celsius": random.uniform(20, 40),
                "weather_condition": random.choice(["sunny", "cloudy", "overcast"]),
                "track_condition": "dry"
            }
        )
        if response.status_code == 201:
            sessions.append(response.json())
            print(f"  Created session: {driver['name']} at {track['name']}")
    
    print(f"\n✅ Seed data created successfully!")
    print(f"   - {len(drivers)} drivers")
    print(f"   - {len(tracks)} tracks")
    print(f"   - {len(karts)} karts")
    print(f"   - {len(engines)} engines")
    print(f"   - {len(sessions)} sessions")
    print(f"\nLogin with: demo@kartune.com / demo123")

if __name__ == "__main__":
    seed_data()

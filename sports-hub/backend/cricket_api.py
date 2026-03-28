import requests
import os
import random
import re
from dotenv import load_dotenv

# Load `.env` into environment variables securely
load_dotenv()

def fetch_rapidapi_score():
    """
    Attempts to fetch live cricket match scores via a RapidAPI provider.
    Requires RAPIDAPI_KEY to be set in backend/.env
    """
    key = os.getenv("RAPIDAPI_KEY", "")
    host = os.getenv("RAPIDAPI_HOST", "cricbuzz-cricket.p.rapidapi.com")
    
    # Do not execute if the key is missing or default
    if not key or key == "your_rapidapi_key_here":
        return None
        
    # Endpoint tailored to cricket-api-free-data provider
    url = f"https://{host}/cricket-livescores"
    headers = {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": host
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code != 200:
            print("❌ RapidAPI Error: Status", response.status_code)
            return None
            
        data = response.json()
        
        # ⚠️ NOTE TO DEVELOPER ⚠️ 
        # Every RapidAPI has a very distinct JSON response format.
        # Below is a generic parser attempting to find digit scores recursively.
        json_str = str(data)
        matches = re.findall(r'(\d+)(?:/|-)', json_str)
        if len(matches) >= 2:
            return {
                "score1": int(matches[0]), 
                "score2": int(matches[1])
            }
            
        return None
        
    except Exception as e:
        print(f"RapidAPI Fetch Error: {e}")
    
    return None

def fallback_simulated_score():
    """Fallback if API fails."""
    return {
        "score1": random.randint(150, 220),
        "score2": random.randint(100, 150)
    }

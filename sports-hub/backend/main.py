from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db, SessionLocal
from models import models
from routers import auth, communities, matches, ai, posts, predictions
from ws.manager import manager
import json
from seed import seed_database
import asyncio
import random
from cricket_api import fetch_rapidapi_score, fallback_simulated_score

# Create Database Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SportsHub API", version="1.0.0")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(communities.router)
app.include_router(matches.router)
app.include_router(ai.router)
app.include_router(posts.router)
app.include_router(predictions.router)

@app.websocket("/ws/match/{match_id}")
async def match_websocket_endpoint(websocket: WebSocket, match_id: int, db: Session = Depends(get_db)):
    # manager.connect() already calls await websocket.accept() internally
    await manager.connect(match_id, websocket)

    try:
        while True:
            data = await websocket.receive_text()

            # Parse structural payload to store independently
            split_index = data.find(":")
            if split_index > -1:
                username = data[:split_index]
                text = data[split_index+1:].strip()
            else:
                username = "System" if data.startswith("System") else "User"
                text = data

            # Commit to database persistence
            new_msg = models.MatchMessage(match_id=match_id, username=username, text=text)
            db.add(new_msg)
            db.commit()

            # Broadcasting raw text as requested by frontend Option A
            await manager.broadcast_to_match(
                match_id,
                data
            )

    except WebSocketDisconnect:
        manager.disconnect(match_id, websocket)
        
@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {"message": "Welcome to SportsHub API. Navigate to /docs for Swagger documentation."}

last_true_score = None

async def api_polling_task():
    global last_true_score
    while True:
        try:
            # Throttle the true API to once every 45 minutes (2700s) to comfortably stay 
            # under a highly restrictive 1000 request per month RapidAPI quota!
            print("Fetching exact match data from RapidAPI...")
            fresh_data = fetch_rapidapi_score()
            if fresh_data:
                last_true_score = fresh_data
        except Exception as e:
            print("API Polling Error:", e)
        await asyncio.sleep(2700) 

async def score_polling_task():
    global last_true_score
    while True:
        try:
            db = SessionLocal()
            matches_db = db.query(models.Match).all()
            for m in matches_db:
                # Add random slight increments to simulate dynamic WebSocket tracking
                off1 = random.randint(0, 3)
                off2 = random.randint(0, 1)

                if last_true_score and last_true_score["score1"] > 0:
                    # Snap reality directly down into the database
                    m.score_team1 = last_true_score["score1"]
                    m.score_team2 = last_true_score["score2"]
                    last_true_score = None # Consume it
                else:
                    # Pure smooth simulation to keep users engaged until the 45-min fetch
                    m.score_team1 += off1
                    m.score_team2 += off2
                
                db.commit()
                
                # Push event out to all listeners for this match!
                payload = json.dumps({
                    "type": "score_update",
                    "score1": m.score_team1,
                    "score2": m.score_team2
                })
                
                await manager.broadcast_to_match(m.id, payload)
            
            db.close()
        except Exception as e:
            print("WebSocket Simulation Loop failed:", e)
            
        await asyncio.sleep(10) # WebSockets STILL trigger visually every 10 seconds

@app.on_event("startup")
async def load_data():
    seed_database()
    # Trigger background live worker loops 
    asyncio.create_task(api_polling_task())
    asyncio.create_task(score_polling_task())
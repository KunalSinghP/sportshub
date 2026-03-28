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
from cricket_scraper import scrape_cricbuzz_top_match, fallback_simulated_score

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

async def score_polling_task():
    while True:
        try:
            score_data = scrape_cricbuzz_top_match()
            
            # Since Cricbuzz only runs live dynamically sometimes, we'll apply
            # intelligent simulation offsets if values are static, guaranteeing UI testing works
            
            db = SessionLocal()
            matches_db = db.query(models.Match).all()
            for m in matches_db:
                # Add random slight increments to simulate real ball deliveries
                off1 = random.randint(0, 4)
                off2 = random.randint(0, 2)
                
                # If scraping succeeds, base off scraped, otherwise strictly additive
                if score_data and score_data["score1"] > 0:
                    m.score_team1 = score_data["score1"] + m.score_team1 % 5 + off1
                    m.score_team2 = score_data["score2"] + m.score_team2 % 5 + off2
                else:
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
            print("Background Update Loop failed:", e)
            
        await asyncio.sleep(10) # 10 seconds frequency

@app.on_event("startup")
async def load_data():
    seed_database()
    # Trigger background live worker loop immediately upon startup
    asyncio.create_task(score_polling_task())
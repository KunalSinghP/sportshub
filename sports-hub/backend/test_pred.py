import sys
import os
sys.path.append(r"c:\Users\hp\Desktop\s\sports-hub\backend")

from database import SessionLocal, engine
from models import models
from sqlalchemy import text
# Drop the predictions table using an inspector to check if it exists, or just drop it directly
with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS predictions"))
    conn.commit()

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

try:
    # 1. Ensure match exists
    from datetime import datetime
    existing_match = db.query(models.Match).filter_by(id=999).first()
    if not existing_match:
        m = models.Match(id=999, team1="Team A", team2="Team B", status="upcoming", start_time=datetime.now())
        db.add(m)
        db.commit()

    # 2. Predict Team A for user 1
    p1 = schemas.PredictionGuestCreate(match_id=999, user_id="u1", username="UserOne", predicted_winner="Team A")
    res1 = create_prediction(p1, db)
    print("Created prediction:", res1.username, res1.predicted_winner)

    # 3. Predict Team B for user 1 (overwrite)
    p2 = schemas.PredictionGuestCreate(match_id=999, user_id="u1", username="UserOne", predicted_winner="Team B")
    res2 = create_prediction(p2, db)
    print("Overwritten prediction:", res2.username, res2.predicted_winner)

    # 4. Predict Team A for user 2
    p3 = schemas.PredictionGuestCreate(match_id=999, user_id="u2", username="UserTwo", predicted_winner="Team A")
    create_prediction(p3, db)

    # 5. Resolve
    resolve_match(999, "Team B", db)
    print("Resolved match with Team B")

    # 6. Leaderboard
    lb = get_leaderboard(db)
    print("Leaderboard:", lb)

except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()

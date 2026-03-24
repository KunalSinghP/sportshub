from datetime import datetime, timedelta
from database import engine, SessionLocal
from models import models
from routers.auth import get_password_hash

def seed_database():
    print("Creating tables...")
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(models.User).first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding Users...")
    user1 = models.User(username="testuser", hashed_password=get_password_hash("p123"))
    user2 = models.User(username="analyst_bob", hashed_password=get_password_hash("p123"))
    db.add_all([user1, user2])
    db.commit()

    print("Seeding Communities...")
    comm1 = models.Community(name="IPL Official", description="All about Indian Premier League.")
    comm2 = models.Community(name="Pro Kabaddi", description="Kabaddi talks.")
    db.add_all([comm1, comm2])
    db.commit()

    print("Seeding Matches...")
    now = datetime.utcnow()
    match1 = models.Match(
        team1="Mumbai Indians", team2="Chennai Super Kings", 
        score_team1=185, score_team2=184, 
        status="live", start_time=now - timedelta(minutes=45)
    )
    match2 = models.Match(
        team1="Royal Challengers", team2="Kolkata Knight Riders", 
        score_team1=0, score_team2=0, 
        status="upcoming", start_time=now + timedelta(hours=2)
    )
    db.add_all([match1, match2])
    db.commit()

    print("Seeding Posts and Comments...")
    post1 = models.Post(
        title="What a match!", content="That last boundary was insane.", 
        author_id=user1.id, community_id=comm1.id, upvotes=15
    )
    db.add(post1)
    db.commit()

    post3 = models.Post(
    title="CSK batting is shaky",
    content="They are losing too many wickets",
    author_id=user1.id, community_id=comm1.id, upvotes=10
    )

    db.add(post3)
    db.commit()

    comment1 = models.Comment(
        content="Absolutely agree, brilliant six.", 
        author_id=user2.id, post_id=post1.id
    )
    db.add(comment1)
    db.commit()

    print("Seeding complete!")
    db.close()

if __name__ == "__main__":
    seed_database()

from fastapi import APIRouter
import random

router = APIRouter(
    prefix="/ai",
    tags=["AI Insights"]
)

@router.get("/analysis/{match_id}")
def match_analysis(match_id: int):
    # MOCK AI RESPONSE
    return {
        "match_id": match_id,
        "analysis": "Based on recent historical data, the home team holds a slight advantage in possession. Their pressing strategy has consistently forced turnovers in the mid-field. The AI predicts a tight defensive battle."
    }

@router.get("/probability/{match_id}")
def win_probability(match_id: int):
    # MOCK percentages that add to 100
    team1_prob = random.randint(30, 70)
    team2_prob = 100 - team1_prob
    return {
        "match_id": match_id,
        "team1_win_probability": team1_prob,
        "team2_win_probability": team2_prob
    }

@router.get("/summary/{post_id}")
def thread_summary(post_id: int):
    return {
        "post_id": post_id,
        "summary": "The community largely agrees that the refereeing was controversial, but most users feel the ultimate result was deserved based on overall team performance."
    }

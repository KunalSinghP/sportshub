import requests
from bs4 import BeautifulSoup
import re
import random

def scrape_cricbuzz_top_match():
    """
    Attempts to scrape the top live cricket match from Cricbuzz.
    WARNING: Web scraping is brittle. If Cricbuzz changes their layout, this breaks.
    Returns: {"score1": integer, "score2": integer} or None if parsing fails.
    """
    url = "https://www.cricbuzz.com/cricket-match/live-scores"
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=5)
        if response.status_code != 200:
            return None
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the very first match score block
        score_blocks = soup.find_all("div", class_="cb-hm-scg-blk")
        
        if len(score_blocks) >= 2:
            # We assume index 0 is Team 1 and index 1 is Team 2 for the top match
            str1 = score_blocks[0].text
            str2 = score_blocks[1].text
            
            # Use regex to find the first number sequence acting as the run count
            s1_match = re.search(r'(\d+)(?:/|-)', str1) 
            s2_match = re.search(r'(\d+)(?:/|-)', str2)
            
            score1 = int(s1_match.group(1)) if s1_match else 0
            score2 = int(s2_match.group(1)) if s2_match else 0
            
            # If both are 0 but the match is active, maybe it just started.
            # E.g. "234-5 (20 Ovs)" -> group(1) is 234.
            return {"score1": score1, "score2": score2}
    except Exception as e:
        print(f"Scrape Error: {e}")
    
    return None

def fallback_simulated_score():
    """Fallback if scraper fails, to demonstrate WebSocket live capability."""
    return {
        "score1": random.randint(150, 220),
        "score2": random.randint(100, 150)
    }

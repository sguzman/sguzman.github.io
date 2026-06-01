import json
import os
from datetime import datetime

# Configuration
JSON_PATH = "tmp/repos.repolist.2000.pretty.json"
SPOTLIGHT_TOML = "data/projects_spotlight.toml"
RANKED_OUTPUT = "tmp/ranked_candidates.md"

INTERESTING_KEYWORDS = [
    "rust", "mathematica", "ai", "mcp", "bevy", "scraper", "cli", 
    "framework", "symbolic", "simulation", "parser", "compiler",
    "automation", "tooling", "engine", "platform"
]

def load_existing_repos():
    """Load repo URLs from the spotlight TOML to avoid duplicates."""
    if not os.path.exists(SPOTLIGHT_TOML):
        return set()
    
    existing = set()
    with open(SPOTLIGHT_TOML, "r") as f:
        for line in f:
            if "repo =" in line:
                # Basic string extraction to avoid dependency on tomli/toml
                url = line.split("=")[1].strip().strip('"')
                existing.add(url.lower())
    return existing

def calculate_score(repo):
    """Simple heuristic to score repo 'interestingness'."""
    score = 0
    
    # 1. Stars are a strong signal
    score += repo.get("stargazerCount", 0) * 10
    
    # 2. Activity (Recency)
    try:
        pushed_at = datetime.fromisoformat(repo["pushedAt"].replace("Z", "+00:00"))
        now = datetime.now(pushed_at.tzinfo)
        days_since_push = (now - pushed_at).days
        if days_since_push < 30:
            score += 50
        elif days_since_push < 90:
            score += 20
        elif days_since_push < 365:
            score += 5
    except:
        pass
    
    # 3. Keyword Match in description or name
    desc = (repo.get("description") or "").lower()
    name = repo.get("nameWithOwner").lower()
    for kw in INTERESTING_KEYWORDS:
        if kw in desc:
            score += 15
        if kw in name:
            score += 10
            
    # 4. Description Length (proxy for effort)
    if len(desc) > 50:
        score += 10
    if len(desc) > 100:
        score += 10
        
    # 5. Language Diversity
    lang = (repo.get("primaryLanguage") or {}).get("name")
    if lang in ["Rust", "Wolfram Language", "Haskell", "Go"]:
        score += 20
        
    return score

def main():
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found.")
        return

    with open(JSON_PATH, "r") as f:
        repos = json.load(f)

    existing = load_existing_repos()
    candidates = []

    for repo in repos:
        url = repo.get("url", "").lower()
        
        # Filters
        if repo.get("isFork"): continue
        if repo.get("isArchived"): continue
        if url in existing: continue
        if not repo.get("description"): continue
        
        # Scoring
        repo["_score"] = calculate_score(repo)
        candidates.append(repo)

    # Sort by score descending
    candidates.sort(key=lambda x: x["_score"], reverse=True)

    # Output top candidates
    with open(RANKED_OUTPUT, "w") as f:
        f.write("# Ranked Project Candidates\n\n")
        f.write("Generated on: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "\n\n")
        
        for i, repo in enumerate(candidates[:50]):
            f.write(f"## {i+1}. {repo['nameWithOwner']}\n")
            f.write(f"- **Score**: {repo['_score']}\n")
            f.write(f"- **URL**: {repo['url']}\n")
            f.write(f"- **Language**: {(repo.get('primaryLanguage') or {}).get('name', 'N/A')}\n")
            f.write(f"- **Stars**: {repo['stargazerCount']}\n")
            f.write(f"- **Pushed**: {repo['pushedAt']}\n")
            f.write(f"- **Description**: {repo['description']}\n\n")

    print(f"Analyzed {len(repos)} repos.")
    print(f"Found {len(candidates)} candidates.")
    print(f"Top 50 candidates written to {RANKED_OUTPUT}")

if __name__ == "__main__":
    main()

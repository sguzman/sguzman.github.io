#!/usr/bin/env python3
import json
import os
import tomllib
from datetime import datetime

JSON_FILE = "tmp/repos.repolist.2000.pretty.json"
SPOTLIGHT_FILE = "data/projects_spotlight.toml"

def main():
    if not os.path.exists(JSON_FILE):
        print(f"Error: {JSON_FILE} not found.")
        return

    with open(JSON_FILE, "r") as f:
        repos = json.load(f)

    already_added = set()
    if os.path.exists(SPOTLIGHT_FILE):
        with open(SPOTLIGHT_FILE, "rb") as f:
            spotlight = tomllib.load(f)
            for p in spotlight.get("projects", []):
                already_added.add(p.get("repo", "").lower().strip("/"))

    rust_repos = []
    for r in repos:
        # Check primary language
        is_rust = False
        lang_obj = r.get("primaryLanguage")
        if lang_obj and lang_obj.get("name") == "Rust":
            is_rust = True
        
        # Also check description for "rust" just in case
        desc = (r.get("description") or "").lower()
        if "rust" in desc:
            is_rust = True
            
        if not is_rust:
            continue

        # Skip forks and archives for now
        if r.get("isFork") or r.get("isArchived"):
            continue

        url = r.get("url", "").lower().strip("/")
        if url in already_added:
            continue

        rust_repos.append({
            "name": r.get("nameWithOwner"),
            "description": r.get("description"),
            "url": r.get("url"),
            "pushedAt": r.get("pushedAt"),
            "stars": r.get("stargazerCount", 0)
        })

    # Sort by pushedAt
    rust_repos.sort(key=lambda x: x["pushedAt"] or "", reverse=True)

    print(f"# Rust-Heavy Repositories (Not in Spotlight)\n")
    print(f"| Project | Description | Last Pushed | Stars |")
    print(f"| :--- | :--- | :--- | :--- |")
    for r in rust_repos:
        pushed = r["pushedAt"][:10] if r["pushedAt"] else "N/A"
        desc = r["description"] or "*No description*"
        if len(desc) > 80:
            desc = desc[:77] + "..."
        print(f"| [{r['name']}]({r['url']}) | {desc} | {pushed} | {r['stars']} |")

if __name__ == "__main__":
    main()

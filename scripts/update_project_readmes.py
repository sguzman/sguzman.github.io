#!/usr/bin/env python3
"""Sync project metadata + README pages from GitHub.

Inputs:
  - data/projects_spotlight.toml

Outputs:
  - data/projects_repo_meta.toml
  - content/projects/readme/<slug>.md
  - content/projects/<slug>/_index.md (stub, only if missing)
"""

from __future__ import annotations

import argparse
import base64
import datetime as dt
import json
import os
import re
import sys
import tomllib
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen

GITHUB_API = "https://api.github.com"
RAW_BASE = "https://raw.githubusercontent.com"
README_CANDIDATES = ("README.md", "Readme.md", "readme.md", "README.MD")
GITHUB_COLORS_URL = "https://raw.githubusercontent.com/ozh/github-colors/master/colors.json"


def http_get(url: str, extra_headers: dict[str, str] | None = None) -> tuple[int, str, dict[str, str]]:
    token = (os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN") or "").strip()
    headers = {
        "User-Agent": "projects-readme-sync/2.0",
        "Accept": "application/vnd.github+json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if extra_headers:
        headers.update(extra_headers)
    req = Request(url, headers=headers)
    try:
        with urlopen(req, timeout=25) as resp:
            code = getattr(resp, "status", 200)
            body = resp.read().decode("utf-8", errors="replace")
            resp_headers = {k.lower(): v for k, v in resp.headers.items()}
            return code, body, resp_headers
    except (HTTPError, URLError, Exception) as exc:
        if isinstance(exc, HTTPError):
            body = exc.read().decode("utf-8", errors="replace")
            exc_headers = {k.lower(): v for k, v in exc.headers.items()}
            return exc.code, body, exc_headers
        else:
            print(f"[error] Network error for {url}: {exc}")
            return 500, "", {}


def fetch_json(url: str) -> tuple[int, dict[str, object] | list[object] | None, dict[str, str]]:
    try:
        code, body, headers = http_get(url)
        if code != 200:
            return code, None, headers
        try:
            return code, json.loads(body), headers
        except json.JSONDecodeError:
            return code, None, headers
    except Exception as exc:
        print(f"[error] Failed to fetch {url}: {exc}")
        return 500, None, {}


def parse_github_repo(repo_url: str) -> tuple[str, str] | None:
    parsed = urlparse(repo_url)
    if parsed.netloc not in {"github.com", "www.github.com"}:
        return None
    parts = [p for p in parsed.path.split("/") if p]
    if len(parts) < 2:
        return None
    owner, repo = parts[0], parts[1]
    repo = re.sub(r"\.git$", "", repo)
    return owner, repo


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "project"


def toml_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def fetch_repo_info(owner: str, repo: str) -> dict[str, object] | None:
    code, payload, _ = fetch_json(f"{GITHUB_API}/repos/{owner}/{repo}")
    if code != 200 or not isinstance(payload, dict):
        return None
    return payload


def fetch_languages(owner: str, repo: str) -> dict[str, int]:
    code, payload, _ = fetch_json(f"{GITHUB_API}/repos/{owner}/{repo}/languages")
    if code != 200 or not isinstance(payload, dict):
        return {}
    out: dict[str, int] = {}
    for k, v in payload.items():
        if isinstance(v, int):
            out[str(k)] = v
    return out


def parse_last_page_from_link(link_header: str) -> int | None:
    if not link_header:
        return None
    parts = [p.strip() for p in link_header.split(",")]
    for part in parts:
        if 'rel="last"' not in part:
            continue
        m = re.search(r"<([^>]+)>", part)
        if not m:
            continue
        url = m.group(1)
        query = parse_qs(urlparse(url).query)
        page_vals = query.get("page")
        if page_vals:
            try:
                return int(page_vals[0])
            except ValueError:
                return None
    return None


def fetch_commit_count(owner: str, repo: str, branch: str | None) -> int:
    sha_q = f"&sha={branch}" if branch else ""
    url = f"{GITHUB_API}/repos/{owner}/{repo}/commits?per_page=1{sha_q}"
    code, payload, headers = fetch_json(url)
    if code != 200:
        return 0
    last_page = parse_last_page_from_link(headers.get("link", ""))
    if last_page is not None:
        return last_page
    if isinstance(payload, list):
        return len(payload)
    return 0


def fetch_readme(owner: str, repo: str, default_branch: str | None) -> tuple[str | None, str]:
    # 1. Check local tmp folder first (prefer our spruced up versions)
    tmp_dir = Path("tmp") / repo
    if tmp_dir.exists() and tmp_dir.is_dir():
        for filename in README_CANDIDATES:
            local_path = tmp_dir / filename
            if local_path.exists():
                try:
                    content = local_path.read_text(encoding="utf-8")
                    if content.strip():
                        return content, f"local:tmp/{repo}/{filename}"
                except Exception:
                    pass

    # 2. Fallback to GitHub raw URLs
    branches: list[str] = []
    if default_branch:
        branches.append(default_branch)
    for candidate in ("main", "master"):
        if candidate not in branches:
            branches.append(candidate)

    for br in branches:
        for filename in README_CANDIDATES:
            raw_url = f"{RAW_BASE}/{owner}/{repo}/{br}/{filename}"
            code, body, _ = http_get(raw_url, {"Accept": "text/plain"})
            if code == 200 and body.strip():
                return body, f"raw:{br}/{filename}"

    # 3. Fallback to GitHub API
    code, payload, _ = fetch_json(f"{GITHUB_API}/repos/{owner}/{repo}/readme")
    if code == 200 and isinstance(payload, dict):
        content = payload.get("content", "")
        if isinstance(content, str) and content:
            try:
                decoded = base64.b64decode(content).decode("utf-8", errors="replace")
                return decoded, "api:readme"
            except ValueError:
                pass
    return None, "missing"


def fetch_github_colors() -> dict[str, str]:
    code, payload, _ = fetch_json(GITHUB_COLORS_URL)
    if code != 200 or not isinstance(payload, dict):
        return {}
    out: dict[str, str] = {}
    for lang, info in payload.items():
        if isinstance(info, dict):
            color = info.get("color")
            if isinstance(color, str) and color:
                out[str(lang)] = color
    return out


def normalize_language_breakdown(
    languages: dict[str, int], colors: dict[str, str]
) -> tuple[list[dict[str, object]], str, str]:
    total = sum(languages.values())
    if total <= 0:
        return [], "", "conic-gradient(#9ea7b3 0 100%)"
    ordered = sorted(languages.items(), key=lambda kv: kv[1], reverse=True)
    breakdown: list[dict[str, object]] = []
    gradient_parts: list[str] = []
    start = 0.0
    for name, bytes_count in ordered:
        pct = (bytes_count / total) * 100.0
        color = colors.get(name) or "#9ea7b3"
        breakdown.append(
            {"name": name, "percent": round(pct, 2), "color": color}
        )
        end = min(start + pct, 100.0)
        gradient_parts.append(f"{color} {start:.2f}% {end:.2f}%")
        start = end
    primary = ordered[0][0]
    pie_css = f"conic-gradient({', '.join(gradient_parts)})"
    return breakdown, primary, pie_css


def write_readme_page(
    output_dir: Path,
    slug: str,
    title: str,
    repo_url: str,
    deepwiki_url: str,
    readme_text: str,
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    out = output_dir / f"{slug}.md"
    content = (
        "+++\n"
        f'title = "{toml_escape(title)} README"\n'
        f'description = "README mirror for {toml_escape(title)}"\n'
        "draft = false\n"
        "+++\n\n"
        f"[Repository]({repo_url}) | [DeepWiki]({deepwiki_url})\n\n"
        f"{readme_text.rstrip()}\n"
    )
    out.write_text(content, encoding="utf-8")
    return out


def write_project_stub(
    output_dir: Path,
    slug: str,
    title: str,
    description: str,
    repo_url: str,
    deepwiki_url: str,
    readme_page: str,
    project_page: str,
    commit_count: int,
    primary_language: str,
    updated_at: str,
    created_at: str,
    readme_text: str | None,
    ambition: str | None = None,
    novelty: list[str] | None = None,
) -> Path | None:
    out_dir = output_dir / slug
    out = out_dir / "_index.md"

    marker = "<!-- GENERATED: scripts/update_project_readmes.py -->"
    if out.exists():
        existing = out.read_text(encoding="utf-8", errors="replace")
        is_old_stub = "Stub page." in existing
        if (marker not in existing) and (not is_old_stub):
            return None

    out_dir.mkdir(parents=True, exist_ok=True)

    def first_paragraph(md: str) -> str:
        lines = [ln.rstrip() for ln in md.splitlines()]
        # Skip leading front matter / headings.
        cleaned: list[str] = []
        in_code = False
        for ln in lines:
            if ln.strip().startswith("```"):
                in_code = not in_code
                continue
            if in_code:
                continue
            if ln.strip().startswith(("#", "+++", "---")):
                continue
            if not ln.strip():
                if cleaned:
                    break
                continue
            if ln.strip().startswith(("-", "*")):
                # don't start with bullet; keep looking for prose
                continue
            cleaned.append(ln.strip())
        return " ".join(cleaned).strip()

    def sample_bullets(md: str, limit: int = 5) -> list[str]:
        bullets: list[str] = []
        in_code = False
        for ln in md.splitlines():
            if ln.strip().startswith("```"):
                in_code = not in_code
                continue
            if in_code:
                continue
            s = ln.strip()
            if s.startswith(("- ", "* ")):
                item = s[2:].strip()
                if item and len(item) <= 140:
                    bullets.append(item)
            if len(bullets) >= limit:
                break
        return bullets

    overview = description.strip()
    if readme_text:
        para = first_paragraph(readme_text)
        if para:
            overview = para
    feature_bullets = sample_bullets(readme_text or "", limit=5)

    ambition_text = ambition or "I’m building this to become a sharp, reusable tool that I can rely on in real workflows: fast, well-scoped, and easy to operate."
    novelty_items = novelty or [
        "Opinionated defaults with room for power-user control.",
        "Tight scope + strong ergonomics (the “small tool, big leverage” approach).",
    ]

    content = (
        "---\n"
        f'title: "{title}"\n'
        f'description: "{description}"\n'
        "---\n"
        f"{marker}\n\n"
        "## Overview\n\n"
        f"{overview}\n\n"
        "## Ambition\n\n"
        f"{ambition_text}\n\n"
        "## What’s novel\n\n"
    )
    for item in novelty_items:
        content += f"- {item}\n"
    content += "\n"

    if feature_bullets:
        content += "## Highlights\n\n"
        for b in feature_bullets:
            content += f"- {b}\n"
        content += "\n"

    content += (
        "## Stats\n\n"
        f"- Project page: {project_page}\n"
        f"- Primary language: {primary_language or '—'}\n"
        f"- Commits: {commit_count}\n"
        f"- Created: {created_at or '—'}\n"
        f"- Last updated: {updated_at or '—'}\n\n"
        "## Links\n\n"
        f"- Repo: {repo_url}\n"
        f"- README: {readme_page}\n"
        f"- DeepWiki: {deepwiki_url}\n"
    )
    out.write_text(content, encoding="utf-8")
    return out


def write_meta_toml(output_path: Path, generated_at: str, projects: list[dict[str, object]]) -> None:
    lines: list[str] = [f'generated_at = "{generated_at}"', ""]
    for p in projects:
        lines.append("[[projects]]")
        lines.append(f'repo_url = "{toml_escape(str(p["repo_url"]))}"')
        lines.append(f'owner = "{toml_escape(str(p["owner"]))}"')
        lines.append(f'repo = "{toml_escape(str(p["repo"]))}"')
        lines.append(f'slug = "{toml_escape(str(p["slug"]))}"')
        lines.append(f'title = "{toml_escape(str(p["title"]))}"')
        lines.append(f'description = "{toml_escape(str(p["description"]))}"')
        lines.append(f'highlight = {"true" if p.get("highlight") else "false"}')
        lines.append(f'primary_language = "{toml_escape(str(p["primary_language"]))}"')
        lines.append(f'commit_count = {int(p["commit_count"])}')
        lines.append(f'created_at = "{toml_escape(str(p["created_at"]))}"')
        lines.append(f'updated_at = "{toml_escape(str(p["updated_at"]))}"')
        lines.append(f'pushed_at = "{toml_escape(str(p["pushed_at"]))}"')
        lines.append(f'deepwiki_url = "{toml_escape(str(p["deepwiki_url"]))}"')
        lines.append(f'project_page = "{toml_escape(str(p.get("project_page", "")))}"')
        lines.append(f'readme_page = "{toml_escape(str(p["readme_page"]))}"')
        lines.append(f'readme_source = "{toml_escape(str(p["readme_source"]))}"')
        topics = p.get("topics", [])
        if isinstance(topics, list) and topics:
            topic_vals = ", ".join(f'"{toml_escape(str(t))}"' for t in topics)
            lines.append(f"topics = [{topic_vals}]")
        else:
            lines.append("topics = []")
        languages = p.get("languages", [])
        if isinstance(languages, list) and languages:
            lang_parts = []
            for l in languages:
                if not isinstance(l, dict):
                    continue
                lang_parts.append(
                    "{ "
                    f'name = "{toml_escape(str(l.get("name", "")))}", '
                    f'percent = {float(l.get("percent", 0.0)):.2f}, '
                    f'color = "{toml_escape(str(l.get("color", "#9ea7b3")))}" '
                    "}"
                )
            lines.append(f"languages = [{', '.join(lang_parts)}]")
        else:
            lines.append("languages = []")
        lines.append(f'pie_css = "{toml_escape(str(p["pie_css"]))}"')
        lines.append("")
    output_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Update project metadata + README pages")
    parser.add_argument(
        "--input",
        default="data/projects_spotlight.toml",
        help="Path to projects TOML data file",
    )
    parser.add_argument(
        "--output-meta",
        default="data/projects_repo_meta.toml",
        help="Path to output TOML metadata file",
    )
    parser.add_argument(
        "--readme-pages-dir",
        default="content/projects/readme",
        help="Directory where generated README pages are written",
    )
    parser.add_argument(
        "--project-pages-dir",
        default="content/projects",
        help="Directory where per-project pages are written (only if missing)",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    output_meta_path = Path(args.output_meta)
    readme_pages_dir = Path(args.readme_pages_dir)
    project_pages_dir = Path(args.project_pages_dir)

    if not input_path.exists():
        print(f"Input file not found: {input_path}", file=sys.stderr)
        return 2

    with input_path.open("rb") as f:
        data = tomllib.load(f)
    projects = data.get("projects", [])
    if not isinstance(projects, list):
        print("Invalid input format: expected [[projects]] array.", file=sys.stderr)
        return 2

    github_colors = fetch_github_colors()
    synced: list[dict[str, object]] = []

    for project in projects:
        if not isinstance(project, dict):
            continue
        repo_url = str(project.get("repo") or "").strip()
        if not repo_url:
            continue
        parsed = parse_github_repo(repo_url)
        if not parsed:
            print(f"[warn] skipping non-GitHub repo URL: {repo_url}", file=sys.stderr)
            continue
        owner, repo = parsed
        repo_info = fetch_repo_info(owner, repo)
        if not repo_info:
            print(f"[warn] repo metadata not found: {repo_url}", file=sys.stderr)
            continue

        default_branch = str(repo_info.get("default_branch") or "")
        name = str(project.get("title") or repo_info.get("name") or repo)
        slug = slugify(repo)
        description = str(repo_info.get("description") or "")
        topics_raw = repo_info.get("topics")
        topics = [str(t) for t in topics_raw] if isinstance(topics_raw, list) else []
        created_at = str(repo_info.get("created_at") or "")
        updated_at = str(repo_info.get("updated_at") or "")
        pushed_at = str(repo_info.get("pushed_at") or "")
        deepwiki_url = f"https://deepwiki.com/{owner}/{repo}/"

        languages = fetch_languages(owner, repo)
        lang_breakdown, primary_language, pie_css = normalize_language_breakdown(
            languages, github_colors
        )
        commit_count = fetch_commit_count(owner, repo, default_branch or None)
        readme, readme_source = fetch_readme(owner, repo, default_branch or None)
        
        highlight = project.get("highlight", False)
        ambition = project.get("ambition")
        novelty = project.get("novelty")
        if not isinstance(novelty, list):
            novelty = None
        else:
            novelty = [str(n) for n in novelty]
            
        readme_page = f"/projects/readme/{slug}/"
        project_page = f"/projects/{slug}/"
        if readme:
            write_readme_page(
                readme_pages_dir,
                slug=slug,
                title=name,
                repo_url=repo_url,
                deepwiki_url=deepwiki_url,
                readme_text=readme,
            )
            print(f"[ok] {repo_url} (README: {readme_source})")
        else:
            print(f"[warn] README missing for {repo_url}; metadata synced.", file=sys.stderr)

        created_project_page = write_project_stub(
            project_pages_dir,
            slug=slug,
            title=name,
            description=description,
            repo_url=repo_url,
            deepwiki_url=deepwiki_url,
            readme_page=readme_page,
            project_page=project_page,
            commit_count=commit_count,
            primary_language=primary_language,
            updated_at=updated_at,
            created_at=created_at,
            readme_text=readme,
            ambition=ambition,
            novelty=novelty,
        )
        if created_project_page:
            print(f"[ok] wrote stub {project_page}")

        synced.append(
            {
                "repo_url": repo_url,
                "owner": owner,
                "repo": repo,
                "slug": slug,
                "title": name,
                "description": description,
                "highlight": highlight,
                "primary_language": primary_language,
                "commit_count": commit_count,
                "created_at": created_at,
                "updated_at": updated_at,
                "pushed_at": pushed_at,
                "deepwiki_url": deepwiki_url,
                "project_page": project_page,
                "readme_page": readme_page,
                "readme_source": readme_source,
                "topics": topics,
                "languages": lang_breakdown,
                "pie_css": pie_css,
            }
        )

    generated_at = dt.datetime.now(dt.UTC).isoformat().replace("+00:00", "Z")
    output_meta_path.parent.mkdir(parents=True, exist_ok=True)
    write_meta_toml(output_meta_path, generated_at, synced)
    print(f"Wrote {output_meta_path} with {len(synced)} synced repos.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

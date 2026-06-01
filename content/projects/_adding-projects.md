---
title: "Adding Projects (Internal)"
draft: true
---

To add projects to the portfolio:

1) Add repo URLs in `data/projects_spotlight.toml`:

```toml
[[projects]]
title = "My Project Name" # optional display override
status = "Active"
repo = "https://github.com/<owner>/<repo>"
demo = ""
docs = ""
```

2) Regenerate metadata + pages:

```bash
python3 scripts/update_project_readmes.py
```

This updates:

- `data/projects_repo_meta.toml` (repo stats for cards/sorting)
- `content/projects/readme/<slug>.md` (README mirror)
- `content/projects/<slug>/_index.md` (project page stub; created only if missing)


+++
title = "vessel README"
description = "README mirror for vessel"
draft = false
+++

[Repository](https://github.com/sguzman/vessel) | [DeepWiki](https://deepwiki.com/sguzman/vessel/)

# Vessel

Rust-native YouTube metadata and download tooling, built as a replacement-oriented port of the `yt-dlp` workflow with a local SQLite dataset per project.

`vessel` is organized around project-scoped datasets under `.cache/vessel/<project>/`. Each project has:

- a SQLite database
- a project-local channel registry in TOML
- downloaded artifacts, subtitles, thumbnails, and plugins under the same root

## Current Scope

Implemented today:

- native YouTube video extraction
- native channel extraction and backlog crawling
- channel-scoped dataset sync
- current-state metadata plus metric/history tables in SQLite
- project-scoped storage layout
- project-local TOML channel categories
- metrics-only updates
- subtitles, comments, thumbnails, downloads, and postprocessing paths
- yt-dlp-style stderr logging with verbosity flags

Important current constraint:

- schema changes are handled by recreating the project DB, not by migrations

## Build

Requirements:

- Rust toolchain
- `ffmpeg` for postprocessing features

Build:

```bash
cargo build --release
```

Run:

```bash
target/release/vessel --help
```

## Project Layout

By default, project state lives here:

```text
.cache/vessel/<project>/
├── vessel.sqlite
├── vessel.toml
├── downloads/
├── thumbnails/
├── subtitles/
└── plugins/
```

Examples:

```bash
vessel --project shreddednerd dataset init --recreate
vessel --project shreddednerd doctor
vessel --project shreddednerd config show
```

List known projects:

```bash
vessel project list
```

## Channel Registry

Each project has its own channel registry at:

```text
.cache/vessel/<project>/vessel.toml
```

Initialize it:

```bash
vessel --project shreddednerd channel config init
```

Inspect it:

```bash
vessel --project shreddednerd channel config show
```

### TOML Format

Channels are grouped by category. A channel may belong to exactly one category.

```toml
[dataset]
project = "shreddednerd"

[channels.categories.gaming]
channels = [
  "https://www.youtube.com/@ShreddedNerd"
]

[channels.categories.news]
channels = [
  "https://www.youtube.com/@example"
]
```

Rules:

- category names come from the TOML table keys
- each `channels` array contains channel inputs accepted by the CLI
- duplicate channels across categories are rejected
- an empty registry means there is nothing to sync

Add a channel through the CLI:

```bash
vessel --project shreddednerd channel add https://www.youtube.com/@ShreddedNerd --category gaming
```

`channel add` updates both:

- the project `vessel.toml`
- the derived `tracked_channels` table in SQLite

## Sync Model

`channel sync` uses the project TOML registry as the source of truth.

Default behavior:

- sync all configured categories
- refresh channel metadata
- refresh video metadata
- append metric rows
- append metadata history rows only when metadata changed

Sync everything:

```bash
vessel --project shreddednerd channel sync
```

Sync only one category:

```bash
vessel --project shreddednerd channel sync --category gaming
```

Sync multiple categories:

```bash
vessel --project shreddednerd channel sync --category gaming --category news
```

Limit a run:

```bash
vessel --project shreddednerd channel sync --category gaming --max-videos 10
```

### Metrics-Only Updates

Use this when you want fresh time-series metrics without writing metadata history rows:

```bash
vessel --project shreddednerd channel sync --metrics-only
vessel --project shreddednerd video refresh --metrics-only <video-id>
```

In metrics-only mode:

- `video_metrics` and `channel_metrics` are appended
- latest metric columns in `videos` and `channels` are updated
- `video_history` and `channel_history` are not written
- comments, subtitles, and thumbnail sync are skipped

### Full Enrichment

Use `--full` for heavier sync work:

```bash
vessel --project shreddednerd channel sync --full
```

That enables:

- comments
- subtitles
- thumbnails

Fine-grained flags are also available:

```bash
vessel --project shreddednerd channel sync --comments
vessel --project shreddednerd channel sync --subtitles
vessel --project shreddednerd channel sync --download-thumbnails
```

## Video Commands

Refresh one video:

```bash
vessel --project shreddednerd video refresh <video-id-or-url>
```

Show current state, metrics, and history:

```bash
vessel --project shreddednerd video history <video-id>
```

Sync only subtitles for one video:

```bash
vessel --project shreddednerd video subtitles sync <video-id-or-url>
```

Sync only comments for one video:

```bash
vessel --project shreddednerd video comments sync <video-id-or-url>
```

## Extraction and Download Commands

Inspect extracted metadata:

```bash
vessel info <youtube-url>
```

List formats:

```bash
vessel formats <youtube-url>
```

Download:

```bash
vessel download <youtube-url>
vessel download -f 18 <youtube-url>
vessel download -f 'bestvideo+bestaudio/best' <youtube-url>
```

Postprocessing options include:

- `--remux-video`
- `--extract-audio`
- `--audio-format`
- `--embed-metadata`
- `--embed-thumbnail`
- `--subtitles`
- `--convert-subs`

## Logging and Verbosity

Runtime logs go to `stderr`. Final structured command output stays on `stdout`.

Verbosity controls:

- `-q`: warnings and errors only
- default: progress and high-signal info
- `-v`: debug
- `-vv` and `-vvv`: increasingly noisy internal detail
- `--no-progress`: suppress line-by-line progress messages

Examples:

```bash
vessel --project shreddednerd channel sync
vessel --project shreddednerd -v channel sync --category gaming
vessel --project shreddednerd -q channel sync --metrics-only
```

## SQLite Usage

Each project DB is plain SQLite and can be inspected directly.

Open it with `litecli`:

```bash
litecli .cache/vessel/shreddednerd/vessel.sqlite
```

### Core Tables

Current state:

- `channels`
- `videos`

Metric time-series:

- `channel_metrics`
- `video_metrics`

Metadata history:

- `channel_history`
- `video_history`

Optional enrichment/history:

- `comments`
- `comment_history`
- `subtitle_tracks`
- `subtitle_history`

Operational tables:

- `tracked_channels`
- `channel_tab_cursors`
- `channel_video_membership`
- `fetch_runs`
- `fetch_attempts`
- `artifacts`
- `download_archive`

### Example Queries

Latest video state:

```sql
SELECT video_id, title, primary_category, view_count, like_count, comment_count
FROM videos
ORDER BY last_seen_at DESC
LIMIT 20;
```

Video metrics over time:

```sql
SELECT video_id, fetched_at, view_count, like_count, comment_count
FROM video_metrics
WHERE video_id = 'zlVeWxtaKxE'
ORDER BY fetched_at;
```

Channel metrics over time:

```sql
SELECT channel_id, fetched_at, subscriber_count, video_count, view_count
FROM channel_metrics
WHERE channel_id = 'UCfwJBTwTgdCj5IHmBcOD8Vg'
ORDER BY fetched_at;
```

Category assignments:

```sql
SELECT channel_id, category, title, last_sync_at
FROM tracked_channels
ORDER BY category, title;
```

## Dataset Lifecycle

Create or recreate a DB:

```bash
vessel --project shreddednerd dataset init --recreate
```

Destroy a DB:

```bash
vessel --project shreddednerd dataset destroy --yes
```

Recommended rule for now:

- if the schema changes, recreate the DB

## Plugins

List plugins:

```bash
vessel plugin list
```

Install a local demo/fixture-style plugin:

```bash
vessel --project shreddednerd plugin install demo
```

Project plugin files live under:

```text
.cache/vessel/<project>/plugins/
```

## Status Notes

This project is native-first and does not shell out to `yt-dlp`.

That means:

- supported features run in Rust only
- unsupported behavior fails explicitly instead of falling back to Python

The current implementation is usable, but still evolving. The highest-value docs for internals and milestone status are:

- [docs/roadmap.md](docs/roadmap.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/parity-matrix.md](docs/parity-matrix.md)
- [docs/storage.md](docs/storage.md)

## Quick Start

```bash
vessel --project demo dataset init --recreate
vessel --project demo channel config init
vessel --project demo channel add https://www.youtube.com/@ShreddedNerd --category gaming
vessel --project demo channel sync --category gaming --metrics-only
litecli .cache/vessel/demo/vessel.sqlite
```

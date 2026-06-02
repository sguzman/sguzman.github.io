+++
title = "kalx README"
description = "README mirror for kalx"
draft = false
+++

[Repository](https://github.com/sguzman/kalx) | [DeepWiki](https://deepwiki.com/sguzman/kalx/)

# kalx

`kalx` is a Rust CLI for exploring and operating against Kalshi's Trade API from the terminal.

It is built for two modes at once:

- fast human inspection with `clap` subcommands, tables, and tracing
- stable scripting with JSON, NDJSON, and CSV output

`kalx` is demo-first. Read commands are straightforward. Write commands default to dry-run previews unless you explicitly opt into live execution.

## Features

- public market discovery: series, events, markets, trades, orderbooks, candles
- authenticated portfolio inspection: balance, positions, fills, settlements, orders
- order lifecycle commands: list, get, create, cancel, cancel-market, amend
- market monitoring:
  - poll-based `markets watch-open`
  - authenticated WebSocket watch flows for market, orderbook, fills, and positions
- raw API fallback with `api get`
- fish, bash, zsh, and powershell completions
- structured logging via `tracing`

## Safety Model

- Default profile is `demo`.
- Mutating commands preview only unless `--live` is provided.
- Mutating commands against `prod` require both `--live` and `--yes`.
- Secrets live only in local `.env` and your private key file, both outside git tracking.

## Setup

### 1. Create a Kalshi API key

Create a Kalshi API key in the Kalshi UI and download the private key PEM. Keep that key file outside git-tracked paths.

### 2. Create `.env`

`kalx` expects a local `.env` file in the repo root or `--env-file <path>`.

Example:

```dotenv
KALSHI_ENV=demo
KALSHI_API_KEY_ID=replace-me
KALSHI_PRIVATE_KEY_PATH=/absolute/path/to/your/private-key.pem
KALX_LOG=info
KALX_OUTPUT=table
```

Notes:

- `KALSHI_PRIVATE_KEY_PATH` must point to a PEM file.
- The private key PEM itself is not stored in `.env`.
- `.env` is gitignored. `.env.example` is the committed template.

### 3. Build

```bash
cargo build
```

### 4. Validate auth and config

```bash
cargo run -- doctor
cargo run -- doctor --auth-check
cargo run -- auth check
```

## Command Map

Top-level commands:

- `doctor`
- `config`
- `auth`
- `exchange`
- `series`
- `events`
- `markets`
- `portfolio`
- `orders`
- `watch`
- `export`
- `api`
- `completions`

Detailed endpoint mapping is in [docs/command-map.md](docs/command-map.md).

## Common Usage

### Market discovery

```bash
kalx markets list --status open --limit 25
kalx markets search inflation --status open --all
kalx markets get KXHIGHNY-24JAN01-T60 --output json
kalx markets trades --ticker KXHIGHNY-24JAN01-T60 --limit 50
kalx markets orderbook KXHIGHNY-24JAN01-T60
kalx events list --status open --limit 50
kalx series list --category Economics --include-volume
```

### Recently opened markets

```bash
kalx markets recent-open --minutes 60
kalx markets watch-open --interval-seconds 15
kalx markets watch-open --once
```

`recent-open` uses timestamp-filtered REST queries. `watch-open` keeps an in-memory seen set while polling open markets.

### Candles

```bash
kalx markets candles \
  KXBTCPRICE \
  KXBTCPRICE-26MAY18-B95000 \
  --start-ts 1716000000 \
  --end-ts 1716086400 \
  --period-interval 60
```

The first positional argument is the series ticker, because Kalshi's candle endpoint is series-scoped.

### Portfolio reads

```bash
kalx portfolio balance
kalx portfolio positions --all
kalx portfolio fills --limit 200
kalx portfolio settlements --output json
```

### Orders

Preview an order:

```bash
kalx orders create \
  --ticker KXHIGHNY-24JAN01-T60 \
  --side yes \
  --action buy \
  --count 1 \
  --yes-price 47
```

Send a live order in demo:

```bash
kalx orders create \
  --ticker KXHIGHNY-24JAN01-T60 \
  --side yes \
  --action buy \
  --count 1 \
  --yes-price 47 \
  --live
```

Cancel one order:

```bash
kalx orders cancel <order-id>
kalx orders cancel <order-id> --live
```

Cancel all resting orders in a market:

```bash
kalx orders cancel-market KXHIGHNY-24JAN01-T60
kalx orders cancel-market KXHIGHNY-24JAN01-T60 --live
```

Amend an order:

```bash
kalx orders amend <order-id> \
  --ticker KXHIGHNY-24JAN01-T60 \
  --side yes \
  --action buy \
  --count 2 \
  --yes-price 49
```

### WebSocket watch flows

```bash
kalx watch market KXHIGHNY-24JAN01-T60
kalx watch orderbook KXHIGHNY-24JAN01-T60
kalx watch fills
kalx watch positions
```

The watch commands currently emit JSON lines from the live stream.

### Export

```bash
kalx export markets --status open --output csv > markets.csv
kalx export trades --ticker KXHIGHNY-24JAN01-T60 --output ndjson
kalx export positions --output json
kalx export fills --output csv > fills.csv
```

### Raw API fallback

```bash
kalx api get /markets?limit=5
kalx api get /portfolio/orders?limit=5 --auth
```

Use this when Kalshi adds an endpoint before `kalx` has a typed command for it.

## Output Modes

Global `--output` supports:

- `table`
- `json`
- `ndjson`
- `csv`

Recommendations:

- `table` for interactive use
- `json` for structured one-shot inspection
- `ndjson` for streaming or large pipelines
- `csv` for exports and spreadsheet ingestion

## Completions

```bash
kalx completions fish > ~/.config/fish/completions/kalx.fish
kalx completions bash > ~/.local/share/bash-completion/completions/kalx
kalx completions zsh > ~/.zfunc/_kalx
kalx completions powershell > kalx.ps1
```

## Troubleshooting

### `authentication is required for this command`

- Check that `.env` exists.
- Check `KALSHI_API_KEY_ID`.
- Check `KALSHI_PRIVATE_KEY_PATH`.
- Run `kalx doctor`.

### Private key parse failures

`kalx` accepts PKCS#8 PEM and PKCS#1 PEM private keys. If the key parses in OpenSSL but not here, verify that the file path is correct and the PEM is complete.

### Signature or 401 failures

- Make sure you are targeting the right environment (`demo` vs `prod`).
- Make sure the API key ID matches the downloaded private key.
- Make sure the private key file has not been truncated or reformatted.

### Demo vs prod confusion

The active profile is controlled by:

1. `--profile`
2. `KALSHI_ENV`
3. config file
4. built-in default (`demo`)

## Security Notes

- `.env` is local only and gitignored.
- Keep private key files outside repo-tracked directories.
- Do not paste keys, signatures, or full auth headers into logs or issues.
- `kalx` does not store the PEM inline in config or `.env`.

## Development

Useful commands:

```bash
cargo check
cargo test
cargo run -- --help
```

Additional docs:

- [docs/architecture.md](docs/architecture.md)
- [docs/kalshi-auth.md](docs/kalshi-auth.md)
- [docs/command-map.md](docs/command-map.md)
- [docs/logging.md](docs/logging.md)
- [docs/safety.md](docs/safety.md)

## Notes on Coverage

- `auth whoami` is intentionally not implemented because Kalshi does not expose a clean dedicated identity endpoint in the current Trade API docs.
- `api get` remains the fallback for any newly documented endpoint not yet mapped to a typed subcommand.

+++
title = "manifoldr README"
description = "README mirror for manifoldr"
draft = false
+++

[Repository](https://github.com/sguzman/manifoldr) | [DeepWiki](https://deepwiki.com/sguzman/manifoldr/)

# manifoldr

A high-performance, asynchronous Rust CLI for [Manifold Markets](https://manifold.markets/).

## Overview

`manifoldr` provides a streamlined command-line interface for interacting with the Manifold Markets API. Designed for power users, it enables rapid market analysis, portfolio tracking, and betting without the overhead of a web browser.

## Features

- **User Analytics**: Retrieve detailed metrics for any user, including profit history and contract metrics.
- **Market Metrics**: Query real-time data on markets, including probability trends and liquidity.
- **Betting Interface**: Securely place bets directly from the console.
- **Tabular Visualization**: Uses rich console formatting to present complex API responses in a human-readable format.
- **Robust Error Handling**: Integrated logging for clear diagnostic output and resilient network operations.

## Tech Stack

- **Rust**: Core logic and performance.
- **Tokio**: Asynchronous runtime for non-blocking I/O.
- **Reqwest**: Type-safe HTTP client for API interactions.
- **Clap**: Powerful CLI argument parsing.
- **Serde**: High-performance JSON serialization/deserialization.

## Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable version)
- A Manifold Markets API Key

### Installation

```bash
git clone https://github.com/sguzman/manifoldr.git
cd manifoldr
cargo install --path .
```

### Configuration

Set your Manifold API key as an environment variable:

```bash
export MANIFOLD_API_KEY=your_key_here
```

### Usage

```bash
# Get your own user info
manifoldr user get

# List active markets
manifoldr market list --limit 10

# View detailed metrics for a specific user
manifoldr metrics --user <username>
```

## License

MIT

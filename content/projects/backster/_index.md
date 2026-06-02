---
title: "backster"
description: "A rust back testing framework for testing out ideas"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

Backster is a Rust command-line research bench for experimenting with trading ideas against time-series market data. It focuses on repeatable, config-driven runs rather than notebook-centric workflows: you point the binary at a TOML file, Backster loads a price series, runs a strategy or optimizer, and reports return statistics.

## Ambition

Provide the speed of Rust-based Polars for historical simulations while retaining the symbolic power of Wolfram for strategy modeling and research.

## What’s novel

- Integrated WSTP bindings for seamless data transfer with Mathematica.
- High-performance backtesting using the Polars query engine.
- Flexible configuration system for complex simulation parameters.

## Highlights

- backtesting long/short strategies over daily close data
- fitting rolling return distributions and turning them into trade signals
- running repeatable multi-run experiments for stochastic strategies
- fetching and caching market data through Wolfram / WSTP
- prototyping pipeline-style signal generation in TOML instead of hard-coding every idea in Rust

## Stats

- Project page: /projects/backster/
- Primary language: Rust
- Commits: 31
- Created: 2026-04-23T19:08:55Z
- Last updated: 2026-05-03T21:50:20Z

## Links

- Repo: https://github.com/sguzman/backster
- README: /projects/readme/backster/
- DeepWiki: https://deepwiki.com/sguzman/backster/

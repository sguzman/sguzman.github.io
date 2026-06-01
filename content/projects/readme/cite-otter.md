+++
title = "cite-otter README"
description = "README mirror for cite-otter"
draft = false
+++

[Repository](https://github.com/sguzman/cite-otter) | [DeepWiki](https://deepwiki.com/sguzman/cite-otter/)

# Cite-Otter

![Cite-Otter](branding/cite-otter-primary.png)

<div align="center">
  <a href="https://github.com/sguzman/cite-otter/issues">
    <img src="https://img.shields.io/github/issues/sguzman/cite-otter?color=EF4F10&labelColor=023A7C&style=for-the-badge" alt="issues">
  </a>
  <a href="https://github.com/sguzman/cite-otter/stargazers">
    <img src="https://img.shields.io/github/stars/sguzman/cite-otter?color=EF4F10&labelColor=023A7C&style=for-the-badge" alt="stars">
  </a>
  <a href="https://github.com/sguzman/cite-otter">
    <img src="https://img.shields.io/github/repo-size/sguzman/cite-otter?color=EF4F10&labelColor=023A7C&style=for-the-badge" alt="repo size">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/static/v1.svg?style=for-the-badge&label=License&message=MIT&logoColor=ffffff&colorA=023a7c&colorB=ef4f10" alt="license">
  </a>
</div>

Cite-Otter is a Rust re-implementation of the Ruby
[`AnyStyle`](https://github.com/inukshuk/anystyle) reference parser. The project
retraces AnyStyle’s parser/finder/training workflows while embracing Rust idioms
for parsing, modeling, and CLI tooling.

## What’s Here

- **Reference alignment**: `docs/migration/REFERENCE.md` records the Ruby repo
  structure, dependencies, build/training surfaces, and validation steps we aim
  to mirror.
- **Implementation strategy**: `docs/cite-otter/ROADMAP.md` breaks the work into
  SemVer milestones (`v0.1.0` → `v1.0.0`), prioritizing CLI/parser foundations &
  tests first, then training/finder logic, and finally documentation + parity
  polish.
- **Docs layout**: `docs/reference/` for shared rules, `docs/migration/` for
  migration notes, and `docs/<project-name>/` for project-specific docs (here:
  `docs/cite-otter/`).
- **Cargo scaffold**: `Cargo.toml`, `src/`, and Rust tooling files are ready for
  the first wave of parser and CLI work.

## Getting Started

1. Install Rust (2024 edition) per `rust-toolchain.toml`.
2. Build/test via `cargo build` / `cargo test`.
3. Use `docs/cite-otter/ROADMAP.md` to decide which phase you are tackling and
   refer to `docs/migration/REFERENCE.md` for Ruby behaviors to match.
4. The CLI `parse` command now accepts `--format json|bibtex|csl` so you can
   request multiple export styles from the same parsing pipeline.
5. Run `cite-otter sample --format json|bibtex|csl` to see the richer metadata
   map emitted by the parser/formatter (journal → container-title, collection →
   series, DOI/URL, etc.).
6. Normalize output fields with synced abbreviation assets:

```bash
cite-otter normalization-sync
           --repo https://github.com/inukshuk/anystyle
           --output-dir target/normalization
```

```bash
cite-otter parse
           --normalization-dir target/normalization
           --format json "Doe, J. Proc. Test. Proceedings of Testing.\
                          City: Univ. Press, 2020."
```

## Goals Beyond the Docs

- Preserve AnyStyle’s CLI surface (`parse`, `find`, `train`, `check`, `delta`)
  and repo layout so users can migrate workflows.
- Build a parser/finder module suite with pluggable adapters that can be reused
  both as a CLI and as a library.
- Keep documentation, tests, and release notes synchronized with the roadmap’s
  SemVer rhythm.

## Verification Profiles

- Fast local checks (default): `just verify-fast` or
  `./scripts/post-change.sh fast`
- Full checks (includes CI and Ruby format parity): `just verify-full` or
  `./scripts/post-change.sh full`
- Long benchmark suites (optional): `just verify-full-with-benchmarks` or
  `./scripts/post-change.sh full-benchmarks`

## Release Readiness (candidate V0.5.0)

- `train/check/delta` now capture both parser and finder datasets plus sample
  outputs, so `target/reports/{training,validation,delta}-report.json` mirrors
  the Ruby `rake` flow and can be used to verify parity before tagging.
- The CLI exposes deterministic metadata (structured authors, normalized years,
  container titles, etc.), and the docs/tests now describe how to feed the same
  sample references through `cite-otter sample --format json|bibtex|csl`.
- Before tagging v0.5.0, run `cargo test`,
  `cargo clippy --all-targets -- -D warnings`, and inspect `target/reports` plus
  `target/models` in CI or locally; update `release.toml` details and the
  `README`/ `ROADMAP` sections if any behavior changes occur afterward.

## Recent Progress

- **Parser precision & metadata coverage** – The parser now builds `FieldTokens`
  for each reference line so token tagging matches the same
  author/title/location/ publisher/date/pages data it extracts; additional
  helpers also populate `container-title`, `volume`, `issue`, `genre`, and
  `edition` fields and surface `scripts`/ `language` from the reference string.
  The new heuristics live in `src/parser.rs` and keep
  `tests/reference_parser.rs` green.
- **Training/finder parity** – The training workflow now records sequence
  signatures for parser and finder datasets (persisted under
  `target/models/*-sequences.json`), and `find` loads those signatures so
  detected segments are compared against the trained corpus before falling back
  to the raw content; `tests/reference_training.rs` continues to exercise the
  train/check/delta lifecycle.
- **Sequence learning backend** – Parser/finder training now builds lightweight
  sequence models (signature counts) so inference respects learned frequency
  patterns, laying the groundwork for a richer ML-style backend.
- **Sample outputs in reports** – Each `train` invocation now captures the
  JSON/BibTeX/CSL renderings of the curated sample references and writes them
  into `target/reports/training-report.json`. The new CLI helpers used in
  `run_training` keep those samples up-to-date so you can inspect exact
  formatter output for each supported format.

## Upcoming Work

- **Parser normalization coverage** – Extend `parser.rs`/ `normalizer.rs` so
  author/date heuristics can deterministically resolve multi-name strings and
  varied year formats, matching the Ruby suite’s behavior documented in
  `docs/migration/REFERENCE.md`. A normalized field map plus expanded
  `FieldTokens` help the parser emit the same metadata that AnyStyle isolates.
- **Training/finder parity** – Round out the CLI’s training/check/delta flows so
  they mirror `rake train`, `rake check`, and `rake delta`. The roadmap’s
  `v0.5.0` section lists the outstanding milestones (training datasets, finder
  detection, dictionary adapters) and the tests/training fixtures under
  `tests/reference_training.rs` should drive those flows before we mark parity
  complete.

## References

- `https://github.com/inukshuk/anystyle` – Ruby source and training data that inspired the Rust port.
- `docs/migration/structure.md` – Migration template that guided
  `docs/migration/REFERENCE.md` and overall planning.

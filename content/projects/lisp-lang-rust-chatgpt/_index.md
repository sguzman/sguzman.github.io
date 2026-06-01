---
title: "lisp-lang-rust-chatgpt"
description: "A working conversation using rust to build a simple compiler for lisp, using chatgpt as a guide"
---
<!-- GENERATED: scripts/update_project_readmes.py -->

## Overview

A functional Lisp interpreter implemented in Rust, developed as a case study in AI-augmented compiler design.

## Ambition

Explore the frontier of AI-augmented compiler design by building a functional Lisp interpreter in Rust using LLM guidance for architectural decisions.

## What’s novel

- LLM-Guided Design: A case study in leveraging ChatGPT to scaffold recursive descent parsers and AST evaluation logic.
- Pure AST Evaluation: Clean implementation of S-expression parsing and mathematical reduction in safe Rust.
- Rapid Prototyping: Demonstrates the speed of moving from high-level 'conversation' to a tested, functional language implementation.

## Highlights

- **S-Expression Parsing**: Robust handling of nested Lisp-like syntax.
- **Mathematical Reduction**: Built-in support for `add` and `mult` operations with arbitrary numbers of arguments.
- **Recursive AST Evaluation**: Efficient tree-walking evaluator implemented in safe Rust.
- **Test-Driven Design**: Comprehensive test suite covering edge cases, unbalanced parentheses, and invalid syntax.
- **Parser**: A custom-built recursive descent parser using Rust's `Peekable<Chars>` iterator for efficient token lookahead.

## Stats

- Project page: /projects/lisp-lang-rust-chatgpt/
- Primary language: Rust
- Commits: 8
- Created: 2023-11-08T19:02:54Z
- Last updated: 2023-11-08T19:24:40Z

## Links

- Repo: https://github.com/sguzman/lisp-lang-rust-chatgpt
- README: /projects/readme/lisp-lang-rust-chatgpt/
- DeepWiki: https://deepwiki.com/sguzman/lisp-lang-rust-chatgpt/

+++
title = "lisp-lang-rust-chatgpt README"
description = "README mirror for lisp-lang-rust-chatgpt"
draft = false
+++

[Repository](https://github.com/sguzman/lisp-lang-rust-chatgpt) | [DeepWiki](https://deepwiki.com/sguzman/lisp-lang-rust-chatgpt/)

# lisp-lang-rust-chatgpt

A functional Lisp interpreter implemented in Rust, developed as a case study in AI-augmented compiler design.

## Overview

This project documents a collaborative development process between a human developer and an LLM (ChatGPT) to build a functional programming language from scratch. It demonstrates how AI can be used to scaffold complex architectural components like recursive descent parsers and AST evaluation logic.

## Features

- **S-Expression Parsing**: Robust handling of nested Lisp-like syntax.
- **Mathematical Reduction**: Built-in support for `add` and `mult` operations with arbitrary numbers of arguments.
- **Recursive AST Evaluation**: Efficient tree-walking evaluator implemented in safe Rust.
- **Test-Driven Design**: Comprehensive test suite covering edge cases, unbalanced parentheses, and invalid syntax.

## Implementation Details

- **Parser**: A custom-built recursive descent parser using Rust's `Peekable<Chars>` iterator for efficient token lookahead.
- **AST**: Strongly typed `Expr` enum for representing the abstract syntax tree.
- **Evaluation**: Immutable evaluation pattern ensuring side-effect-free reductions.

## Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable version)

### Installation & Run

```bash
git clone https://github.com/sguzman/lisp-lang-rust-chatgpt.git
cd lisp-lang-rust-chatgpt
cargo run
```

### Example Usage

```lisp
(add 1 2 (mult 3 4)) 
; Result: 15
```

## Purpose

This is primarily an educational project aimed at exploring the synergy between Rust's safety guarantees and AI's rapid prototyping capabilities.

## License

MIT

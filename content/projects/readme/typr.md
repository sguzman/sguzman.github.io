+++
title = "typr README"
description = "README mirror for typr"
draft = false
+++

[Repository](https://github.com/sguzman/typr) | [DeepWiki](https://deepwiki.com/sguzman/typr/)

# typr

`typr` is an experimental Rust REPL for a signature-first type theory calculator.

It implements the core ideas from `tmp/type.md`:
- Functions as interface objects (`In(f)`, `Out(f)`) that compose before implementation.
- Reified arithmetic operator bodies (`add`, `mul`, `pow`, `comp`, `seq`).
- Container lifting via `map` over list expressions.
- Refinement constructors for list structure: `sort`, `unique`, `canon`.
- Structural query inference and ad hoc boolean answers (`any`, `all`, `is`).
- Multiple equivalence modes (`syntactic`, `semantic`, `permutation`, `set`, `canonical`).

## Features

- Signature-first function declarations (`:fn`) with optional bodies (`:body`).
- Property annotations and inference:
  - `ProducesEven`, `ProducesOdd`, `Monotone`, `Injective`
- Typed expression forms:
  - `(range a b)`
  - `(map f expr)`
  - `(sort expr)`
  - `(unique expr)`
  - `(canon expr)`
- Query forms:
  - `(any odd expr)`
  - `(all even expr)`
  - `(is sorted expr)`
  - `(is unique expr)`
  - `(is canonical expr)`
- Fallback evaluator for concrete answers when structural inference is insufficient.
- Tracing-based logging throughout parse/typecheck/facts/query/repl flows.
- Built-in rlwrap-style line editing and history via `rustyline` (saved at `~/.typr_history`).

## REPL Commands

- `:help`
- `:quit` / `:q`
- `:trace on|off`
- `:show`
- `:fn <name> <InTy> <OutTy>`
- `:body <name> <op-sexp>`
- `:prop <name> produces_even|produces_odd|monotone|injective`
- `:type <expr-sexp>`
- `:query <query-sexp>`
- `:eq <mode> <expr1> <expr2>`
- `:normalize <expr-sexp>`
- `:eval <expr-sexp>`

## Operator Language (`:body`)

- `(id)`
- `(add k)`
- `(mul k)`
- `(pow p)`
- `(comp op1 op2)`
- `(seq op1 op2 op3 ...)`

`comp`/`seq` are pipeline-ordered: the left operator runs first.

## Quick Start

```bash
cargo run
```

Example session:

```text
tt> :show
tt> :type (map double (range 1 10))
tt> :query (any odd (map double (range 1 10)))
tt> :fn mystery Nat Nat
tt> :query (any odd (map mystery (range 1 10)))
tt> :body mystery (mul 2)
tt> :query (all even (map mystery (range 1 10)))
tt> :eq canonical (unique (sort (range 1 10))) (sort (unique (range 1 10)))
```

## Logging

The project uses `tracing` + `tracing-subscriber`.

Run with verbose logs:

```bash
RUST_LOG=typr=trace cargo run
```

## Architecture

- `src/ast.rs`: syntax/types/operators/queries/equivalence modes
- `src/env.rs`: function environment and builtins
- `src/parser.rs`: S-expression tokenizer/parser + AST parsing
- `src/typecheck.rs`: typing rules
- `src/facts.rs`: property inference, structural facts, fallback evaluator
- `src/query.rs`: query solver, equivalence engine, normalization
- `src/repl.rs`: command loop
- `src/main.rs`: tracing setup + REPL startup

## Testing and Build Verification

```bash
cargo test
cargo build
```

The test suite includes:
- typing behavior for signature-only functions
- unknown-query behavior for undefined bodies
- inferred property propagation from operator bodies
- semantic/canonical equivalence checks
- normalization law checks (`sort`/`unique` interaction)

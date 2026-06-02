+++
title = "pokesay README"
description = "README mirror for pokesay"
draft = false
+++

[Repository](https://github.com/sguzman/pokesay) | [DeepWiki](https://deepwiki.com/sguzman/pokesay/)

# Pokesay

`pokesay` is a CLI tool that works like the classic `cowsay` or `iron-pony`, but it renders beautiful Pokemon pixel art sprites in your terminal! 
It combines the balloon-wrapping features of a cowsay clone with the awesome terminal pokemon sprites sourced from `krabby`.

## Features
- Prints your text inside a perfectly wrapped speech bubble or thought bubble.
- Displays high-quality ANSI Pokemon sprites below the text bubble.
- Search for a specific pokemon by name.
- Grab a random pokemon to deliver your message.
- Standalone binary with bundled assets (no need to keep an `assets` folder around!).

## Installation

To run `pokesay`, make sure you have [Rust](https://www.rust-lang.org/learn/get-started) installed.

Clone the repository and run:

```bash
cargo build --release
```

You can then run the executable located at `target/release/pokesay`.

Alternatively, install directly using `cargo install --path .` inside the repository directory.

## Usage

```bash
# Print a specific pokemon saying a message
pokesay name charizard -s -m "I'm a fire breathing dragon!"

# Run with no arguments to get a random pokemon thinking a default message!
pokesay

# Have a random pokemon think a piped message
echo "I am very small and I think a lot!" | pokesay

# List all available pokemon
pokesay list
```

## Global Options
- `-m`, `--message <MESSAGE>` : The message to display in the text bubble (Default: "Pika pika!"). Alternatively, pipe input via stdin.
- `-s`, `--say` : Use a speech bubble instead of the default thought bubble.
- `-w`, `--wrap <WRAP>` : Change the max width of the text bubble (Default: 40).

## Acknowledgements
- [krabby](https://github.com/yannjor/krabby) for the awesome ANSI pokemon color scripts and pokedex JSON data.
- [iron-pony](https://github.com/iron-pony/iron-pony) for inspiration on the text balloon wrapping structure.

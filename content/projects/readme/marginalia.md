+++
title = "marginalia README"
description = "README mirror for marginalia"
draft = false
+++

[Repository](https://github.com/sguzman/marginalia) | [DeepWiki](https://deepwiki.com/sguzman/marginalia/)

# marginalia

Hugo blog deployed to GitHub Pages via GitHub Actions.

## Deploy (GitHub Pages)

This repo uses `.github/workflows/pages.yml` to build with Hugo and push the generated site to the `gh-pages` branch.

1. In GitHub repo **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**
3. Select branch **`gh-pages`** and folder **`/ (root)`**

Your site URL will be:

- Project pages: `https://<owner>.github.io/marginalia/`

## Local dev

Run:

`hugo server -D`

# Foundry staging branch

**Status:** experimental branch. No public deployment authorized, no private data used, and no editorial/publication approval implied.

Foundry is a proposed redesign of `/projects/`. The changed section template is `layouts/projects/list.html`. It renders the Foundry exhibition **only** at `/projects/`, and wraps nested legacy project section pages with a readable Foundry document presentation while retaining their `.Content` verbatim. Main navigation, home page, detail URLs, README sync logic, and source content remain unchanged.

## Provenance and privacy

The staged presentation currently reads `data/foundry_public.toml`, a small manually authored fixture built **only from information visibly stated in public GitHub READMEs**. It is not a copy or projection of any private Projectarium cohort, Project dossiers, Program memberships, genealogy, internal counts, source paths, review packets, or private data.

This provisional file is **not** the final approved cohort; the 12 entries are public-source design specimens. They should not be confused with a private candidate list or release approval. Don't script a migration from Taria or another private source into this file.

A future import path must accept only *explicitly authorized public presentation records*, not raw private Projectarium YAML/JSON. Nothing in this branch changes Taria authority or publishes anything from Taria.

## Staged implementation

- `layouts/projects/list.html`: responsive editorial index only at `/projects/`, two featured public-source examples, a browseable project index, and a guarded legacy-page render branch that preserves all nested section `.Content`;
- `data/foundry_public.toml`: manually reviewed public-source demo copy only;
- `assets/css/foundry.css`: scoped charcoal/steel/orange Foundry system, Lexend display, Atkinson Hyperlegible Next text, local Monaspace Neon or system mono fallback, and accessible long-form project page typography;
- `static/js/foundry.js`: unobtrusive category/search controls using accessible buttons and a live result count;
- `scripts/check_foundry.mjs`: zero-dependency Node static privacy, data/link, route-guard, stylesheet, source-workflow, and JavaScript syntax checks;
- `hugo.toml`: registers the stylesheet through Hugo Coder's `assets/` custom CSS pipeline.

The design's featured geometry/art shapes are **CSS editorial studies explicitly labeled “NOT A PRODUCT CAPTURE”**. They are not generated or invented application screenshots.

## Build and release behavior

The existing `.github/workflows/pages.yml` only deploys when **`main`** receives a push. Changes on `foundry-stage` do not trigger that workflow. No new GitHub Actions workflow has been added or dispatched. This is intentional, since hosted Actions cannot be assumed available.

Until the source is tested using a real Hugo build, **do not fast-forward or merge this branch into `main`**.

Manual-free QA target for an implementation agent in a disposable checkout (not a task for the site owner):

```sh
node scripts/check_foundry.mjs
hugo --minify
```

Check that generated `public/projects/index.html` includes all publicly authored cards, correct source URLs, loaded `foundry.css` asset, working filtered/empty states, and zero private Projectarium files. **Critically, inspect multiple existing nested section routes** such as `/projects/flatfekt/` and `/projects/fathrs/`: their existing long-form content must still render and existing URLs must not redirect to the catalogue. Also test narrow mobile, browser zoom, keyboard navigation, screen reader headings, full UTF-8 labels and reduced motion.

## Current remote review

Source-level validation performed through GitHub on 2026-10-09:

- confirmed 12 unique public-source fixture records and exactly two featured studies;
- confirmed all link targets use public GitHub repositories and the template consumes only `foundry_public.toml`;
- confirmed the `/projects/` guard preserves nested `_index.md` project documents;
- confirmed existing content, site navigation, home, and production Actions workflow are unchanged;
- counted Hugo template opening/closing directives without mismatch;
- confirmed **main** still points at `29197cdbf499b495fc58f5081cf0d5cbf76e5f9a`.

**Not yet executed:** the new Node static checker as a process, a real Hugo build, screenshot/mobile browser QA, and automated functional accessibility tests. The current tool host has Chromium and Node, but no Hugo executable or network route to clone the repository, and a tool-based static review is not a substitute for those missing gates. A Codex implementation worker should run the normal checks inside a disposable checkout before the branch is considered mergeable.

## Expected follow-ups

1. Run build and browser QA through Codex or another implementation worker, not manual owner testing.
2. Replace CSS editorial-study art only with honest rights-cleared captures when ready.
3. Refine layout/typography after a real rendered browser review.
4. Add a versioned, fail-closed public catalogue release gate independently of the design.
5. Move from source-only sample records to specifically approved full gallery records, with privacy/redaction and license checks.
6. Obtain separate authorization to merge and deploy after both privacy and presentation acceptance.

No production website update, live deployment or secret/private-data approval has occurred in this branch.

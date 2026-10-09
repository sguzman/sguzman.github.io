# Foundry staging branch

**Status:** experimental branch. No public deployment authorized, no private data used, and no editorial/publication approval implied.

Foundry is a proposed redesign of `/projects/`. The only changed section template is `layouts/projects/list.html`. The main site navigation, home page, existing project detail URLs, README sync logic, and source content are intentionally preserved.

## Provenance and privacy

The staged presentation currently reads `data/foundry_public.toml`, a small manually authored fixture built **only from information visibly stated in public GitHub READMEs**. It is not a copy or projection of any private Projectarium cohort, Project dossiers, Program memberships, genealogy, internal counts, source paths, review packets, or private data.

This provisional file is **not** the final approved cohort; the 12 entries are public-source design specimens. They should not be confused with a private candidate list or release approval. Don't script a migration from Taria or another private source into this file.

A future import path must accept only *explicitly authorized public presentation records*, not raw private Projectarium YAML/JSON. Nothing in this branch changes Taria authority or publishes anything from Taria.

## Staged implementation

- `layouts/projects/list.html`: responsive editorial page, two featured public-source examples and a browseable project index;
- `data/foundry_public.toml`: manually reviewed public-source demo copy only;
- `assets/css/foundry.css`: scoped charcoal/steel/orange Foundry system, Lexend display, Atkinson Hyperlegible Next text, local Monaspace Neon or system mono fallback;
- `static/js/foundry.js`: unobtrusive category/search controls using accessible buttons and a live result count;
- `hugo.toml`: registers the stylesheet through Hugo Coder's `assets/` custom CSS pipeline.

The design's featured geometry/art shapes are **CSS editorial studies explicitly labeled “NOT A PRODUCT CAPTURE”**. They are not generated or invented application screenshots.

## Build and release behavior

The existing `.github/workflows/pages.yml` only deploys when **`main`** receives a push. Changes on `foundry-stage` do not trigger that workflow. No new GitHub Actions workflow has been added or dispatched. This is intentional, since hosted Actions cannot be assumed available.

Until the source is tested using a real Hugo build, **do not fast-forward or merge this branch into `main`**.

Manual-free QA target for an implementation agent in a disposable checkout (not a task for the site owner):

```sh
hugo --minify
node --check static/js/foundry.js
```

Check that the generated `public/projects/index.html` includes all publicly authored cards, correct source URLs, loaded `foundry.css` asset, working filtered/empty states, and zero private Projectarium files. Also test narrow mobile, browser zoom, keyboard navigation, screen reader headings, full UTF-8 labels, reduced motion, and existing `/projects/<slug>/` route continuity.

## Expected follow-ups

1. Run build and browser QA through Codex or another implementation worker, not manual owner testing.
2. Replace CSS editorial-study art only with honest rights-cleared captures when ready.
3. Refine layout/typography after a real rendered browser review.
4. Add a versioned, fail-closed public catalogue release gate independently of the design.
5. Move from source-only sample records to specifically approved full gallery records, with privacy/redaction and license checks.
6. Obtain separate authorization to merge and deploy after both privacy and presentation acceptance.

No production website update, live deployment or secret/private-data approval has occurred in this branch.

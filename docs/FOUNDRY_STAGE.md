# Foundry staging branch

**Status:** experimental branch. No public deployment authorized, no private data used, and no editorial/publication approval implied.

Foundry is a proposed redesign of `/projects/`. The changed section template is `layouts/projects/list.html`. It renders the Foundry exhibition **only** at `/projects/`, and wraps nested legacy project section pages with a readable Foundry document presentation while retaining their `.Content` verbatim. Main navigation, home page, detail URLs, README sync logic, and source content remain unchanged.

## Provenance and privacy

The staged presentation currently reads `data/foundry_public.toml`, a manually authored public-source catalogue built **only from information visibly stated in public GitHub READMEs**. It is not a copy or projection of any private Projectarium cohort, Project dossiers, Program memberships, genealogy, internal counts, source paths, review packets, or private data.

This provisional file is **not** the final approved cohort; the 30 entries are public-source staging specimens. They should not be confused with a private candidate list or release approval. Don't script a migration from Taria or another private source into this file.

A future import path must accept only *explicitly authorized public presentation records*, not raw private Projectarium YAML/JSON. Nothing in this branch changes Taria authority or publishes anything from Taria.

## Staged implementation

- `layouts/projects/list.html`: responsive editorial index only at `/projects/`, two large lead studies (from seven public-source flagships), a browseable project index, and a guarded legacy-page render branch that preserves all nested section `.Content`;
- `data/foundry_public.toml`: manually reviewed public-source demo copy only;
- `assets/css/foundry.css`: scoped charcoal/steel/orange Foundry system, Lexend display, Atkinson Hyperlegible Next text, local Monaspace Neon or system mono fallback, and accessible long-form project page typography;
- `static/js/foundry.js`: unobtrusive category/search controls using accessible buttons and a live result count;
- `scripts/foundry_contract.mjs`: narrow, fail-closed parser and whitelist for staging's public-only TOML fields; every record pins the public README's Git blob and review date;
- `scripts/check_foundry.mjs`: zero-dependency Node static privacy, evidence/link, route-guard, stylesheet, source-workflow, and JavaScript syntax checks;
- `scripts/test_foundry_contract.mjs`: offline rejection fixtures for private keys/paths, malformed TOML, missing source evidence, bad URLs, duplicate IDs and injected markup;
- `scripts/test_foundry_ui.mjs`: zero-dependency mocked-DOM behavioral test that evaluates the actual Foundry browser script against the real public sample, including search, empty state, filtering and reset;
- `layouts/_partials/foundry/validate.html`: **mandatory Hugo-build privacy and structural gate**, invoked inside the project-section template; it fails the build on unauthorized public-data keys, invalid identities, bad repository URLs, unpinned README evidence, duplicate IDs, invalid categories and malformed records;
- `scripts/verify_foundry.sh`: runs three Node checks, builds real Hugo output into a temporary directory, verifies the built stylesheet and all existing nested project section routes, scans the gallery index for private markers, then runs real Chromium browser QA;
- `scripts/test_foundry_browser.mjs`: local-only Playwright/Chromium verification of rendered Foundry styling, actual search/filter behavior, route preservation, desktop/tablet/mobile overflow, keyboard focus, no-JavaScript fallback and console errors. It blocks all nonlocal network requests. Evidence screenshots are automatically saved to a new temporary folder unless `FOUNDRY_QA_DIR` is supplied.
- `hugo.toml`: registers the stylesheet through Hugo Coder's `assets/` custom CSS pipeline.

The public index remains fully browseable without JavaScript. Search/category controls stay hidden until the browser script has attached functioning listeners; keyboard users can skip the long intro via a focus-visible link to the index. The offline UI harness verifies progressive filter initialization, initial results, filtering, empty state and reset.

The two featured design illustrations are **source-grounded CSS architecture studies**: LanternLeaf's document / sentence-synced speech flow and Morphos's TOML / evaluated geometry flow. Both remain labeled **NOT A PRODUCT CAPTURE**. Neither is represented as an actual running-app screenshot.

## Build and release behavior

The existing `.github/workflows/pages.yml` only deploys when **`main`** receives a push. Changes on `foundry-stage` do not trigger that workflow. No new GitHub Actions workflow has been added or dispatched. This is intentional, since hosted Actions cannot be assumed available.

Until the source is tested using a real Hugo build, **do not fast-forward or merge this branch into `main`**.

Manual-free QA target for an implementation agent in a disposable checkout (not a task for the site owner). The agent is responsible for installing/providing **Hugo**, **Node 22+**, **Playwright/Playwright Core** and **Chromium** locally, without relying on Actions or requesting routine manual owner QA:

```sh
bash scripts/verify_foundry.sh
```

Check that generated `public/projects/index.html` includes all publicly authored cards, correct source URLs, loaded `foundry.css` asset, working filtered/empty states, and zero private Projectarium files. **Critically, inspect multiple existing nested section routes** such as `/projects/flatfekt/` and `/projects/fathrs/`: their existing long-form content must still render and existing URLs must not redirect to the catalogue. Also test narrow mobile, browser zoom, keyboard navigation, screen reader headings, full UTF-8 labels and reduced motion.

## Current remote review

Source-level validation performed through GitHub on 2026-10-09 (later stages add pinned README blobs and nine more offline negative cases):

- confirmed 30 unique public-source catalogue records and seven flagships;
- pinned all 30 entries to observed public README blob SHAs, with review date;
- added an independent offline public manifest parser with field whitelist and executable negative regression tests;
- confirmed all link targets use public GitHub repositories and the template consumes only `foundry_public.toml`;
- confirmed the `/projects/` guard preserves nested `_index.md` project documents;
- confirmed existing content, site navigation, home, and production Actions workflow are unchanged;
- counted Hugo template opening/closing directives without mismatch;
- confirmed **main** still points at `29197cdbf499b495fc58f5081cf0d5cbf76e5f9a`.

**Executed in the assistant's isolated JavaScript environment on 2026-10-09:** the **exact committed** strict manifest validator accepted all 12 original staged records and rejected nine injected invalid variants; the **exact committed** browser filter code passed five behavior checks with a simulated document. A malformed HTML-tag regex was discovered in the first execution and corrected before passing.

**After the follow-up changes**, direct evaluation of the exact committed browser script and fixture validator in the tool's isolated JavaScript runtime confirmed all 12 records plus the progressive-toolbar, empty-query, Tools-category and reset behaviors. The execution is still not a full Hugo page or browser render.

**Still not executed as Node shell commands in a real checkout:** `node scripts/check_foundry.mjs`, `node scripts/test_foundry_contract.mjs`, `node scripts/test_foundry_ui.mjs`, the real Hugo build, screenshot/mobile browser QA, and accessibility tests. The independent execution above is valuable verification but does not replace the full `bash scripts/verify_foundry.sh` gate. The current assistant tool container has Chromium and Node, but no Hugo executable or network route to clone the repository, and a tool-based static review is not a substitute for those missing gates. A Codex implementation worker should run the normal checks inside a disposable checkout before the branch is considered mergeable. The complete gate now includes **`node scripts/test_foundry_browser.mjs`**, run against a freshly generated Hugo site, and creates desktop/tablet/mobile screenshots under a new `/tmp/foundry-qa-*` folder unless `FOUNDRY_QA_DIR` is set. Those screenshots include **public sample descriptions only**, not any private test data. The browser test intentionally blocks external resources, so its screenshots do not prove that Google-hosted fonts loaded; separately verify typography under permitted, real public-network conditions before accepting final visual design. This assistant container's managed Chromium additionally blocks navigation to local HTTP test pages with `ERR_BLOCKED_BY_ADMINISTRATOR`, so direct live-browser QA cannot be claimed in this runtime. No attempt should be made to evade that environment policy.

## 2026-10-09 public-source catalogue expansion

The Foundry staging catalogue now contains **30 manually written public-README-based records**, including **seven flagships** (two displayed as large lead studies). Each record pins the exact public repository README blob observed through GitHub and states its source review date. This was a public-source editorial drafting pass, **not** an export from private Projectarium or a grant of release authority for private records. In particular: Starbyte is explicitly experimental; Chatarium's broader native account integration is prospective; Vessel coordinates third-party acquisition/ASR tools; the YouTube Channel Statistics specimen is presented as a historical topology proposal, not an independently demonstrated completed product.

The browser QA harness now derives record and feature counts from the same validated public fixture, rather than hard-coding the original 12-entry/two-feature design scaffold.

The public catalogue is now explicitly curated into **seven flagships, 16 gallery works and seven historical exhibits**. This is public-facing presentation metadata authored from public repository evidence, not a private ontology export. Both the offline data validator and the normal Hugo build-time validator reject unknown tiers and featured/tier disagreements. The seven historical works carry a clearly visible `HISTORICAL EXHIBIT` marker; flagships carry a `FLAGSHIP STUDY` marker, while only LanternLeaf and Morphos occupy the larger lead-study panels. Planned capabilities are not treated as executed implementations.

**Keep the branch staged:** these additions are drafts for presentation and source reconciliation. They do not supersede the mandatory real Hugo build, rendered browser tests, rights-cleared artwork, and user acceptance of the final public gallery.

## 2026-10-09 hardening continuation

- Corrected an important architecture defect: `scripts/check_foundry.mjs` alone could not protect the standard GitHub Pages deployment. The **normal Hugo template now invokes its own strict validator**, and even unrecognized top-level TOML keys trigger `errorf` in Hugo. Offline Node checks confirm the Hugo guard file and invocation exist.
- Preserved functioning filtering as progressive enhancement: the toolbar is hidden until JavaScript initializes; a first focus-only skip link bypasses the introductory artwork.
- Extended `verify_foundry.sh` from four sample legacy routes to **all current nested project sections**; it also requires real compiled Foundry CSS.
- Added a real, local-only Playwright browser test to the release gate. It uses a temporary loopback HTTP server, intercepts external requests, produces responsive screenshots to a temporary path, and tests no-JavaScript behavior.
- Extended the release privacy scan to **all generated textual files**, not only the exhibition index. The mandatory Hugo partial also rejects obvious private-source markers in public display copy and technology labels.
- The browser harness now tests semantic page-heading count, labeled architecture studies and reduced-motion behavior as well as core interactions.
- README provenance hashes in the staging manifest are public Git blobs, not private Projectarium provenance records.
- The paired CSS reader/geometry concept illustrations now convey mechanisms grounded in the already public README evidence, instead of purely decorative wireframe shapes.
- **Build/browser evidence still pending:** this assistant runtime cannot clone GitHub and has no installed Hugo. Static and isolated-JavaScript checks do not equal a real Hugo/Chromium pass. The staging branch must not be merged on this evidence alone.

## 2026-10-09 thirty-exhibit source audit

The full public-only catalogue passed the strict committed validator with **30 distinct reviewed records** partitioned exactly **7 flagship / 16 gallery / 7 historical**. Unknown tiers, conflicting flagship flags, duplicate IDs and unapproved fields were deliberately injected and rejected.

The gallery's **actual committed filtering JavaScript** was executed against a simulated DOM containing all 30 records: toolbar initialization, initial complete results, empty search, research category filtering and reset passed. Separately, the staged Playwright test module structurally parsed after replacing module-only `import`/`import.meta` syntax solely for the isolated JavaScript parser; this was **not** a Playwright execution.

Public presentation uses only **two large lead studies**, with badges distinguishing all seven flagships and all seven historical exhibits in the index. Browser QA reads the expected 30-record and two-lead-study counts dynamically.

**Unresolved release gates:** Hugo site compilation in a real checkout, actual Chromium rendered-page QA, visual screenshot review, third-party artwork/license review, final editorial/design approval, and a separate authorized production promotion. No private source or GitHub-hosted private runner was used.

## Expected follow-ups

1. Run the single offline build and browser QA command through Codex or another implementation worker, not manual owner testing, then inspect all produced screenshots and any failures.
2. Replace CSS editorial-study art only with honest rights-cleared captures when ready.
3. Refine layout/typography after a real rendered browser review.
4. Add a versioned, fail-closed public catalogue release gate independently of the design.
5. Move from source-only sample records to specifically approved full gallery records, with privacy/redaction and license checks.
6. Obtain separate authorization to merge and deploy after both privacy and presentation acceptance.

No production website update, live deployment or secret/private-data approval has occurred in this branch.

#!/usr/bin/env node
/**
 * Foundry branch static checks. No network, no third-party dependencies,
 * no GitHub Actions, and no reads from private Taria or Projectarium.
 *
 * Run: node scripts/check_foundry.mjs
 * Then have an implementation agent run Hugo and browser QA separately.
 */
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { validateFoundryManifest } from "./foundry_contract.mjs";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

const manifest = read("data/foundry_public.toml");
const template = read("layouts/projects/list.html");
const mandatoryHugoGuard = read("layouts/_partials/foundry/validate.html");
const styles = read("assets/css/foundry.css");
const script = read("static/js/foundry.js");
const config = read("hugo.toml");
const deployWorkflow = read(".github/workflows/pages.yml");

const verdict = validateFoundryManifest(manifest);
errors.push(...verdict.problems);
const items = verdict.entries;

for (const item of items) {
  if (item.details) {
    assert(existsSync(new URL(`../content${item.details}_index.md`, import.meta.url)),
      `Missing existing detail page for ${item.id}`);
  }
}

assert(template.includes('{{ if eq .RelPermalink "/projects/" }}'),
  "The template must guard the root index from nested project sections.");
assert(template.includes("{{ .Content }}") && template.includes("{{ else }}"),
  "Existing nested project documents must render without replacement.");
assert(template.includes(".Site.Data.foundry_public"),
  "The template must use the public staging catalogue.");
assert(template.includes('partial "foundry/validate.html" $works'),
  "Hugo must enforce the strict public catalogue validator during every build.");
assert(template.includes('Foundry catalogue has forbidden top-level key'),
  "Hugo must reject extra top-level data sections.");
assert(mandatoryHugoGuard.includes('errorf "Foundry') &&
  mandatoryHugoGuard.includes("forbidden field") &&
  mandatoryHugoGuard.includes("pinned public README blob") &&
  mandatoryHugoGuard.includes("duplicate public Project ID"),
  "The mandatory Hugo validator is missing fundamental fail-closed checks.");
assert(!/(?:\.Site\.Data\.projectarium|\.Site\.Data\.cohorts)/.test(template),
  "The public template must not consume private source data.");
assert(template.includes("NOT A PRODUCT CAPTURE"),
  "CSS concept art must be visibly identified as such.");
assert(template.includes('data-foundry-group="{{ $tier }}"') &&
  template.includes('slice "flagship" "gallery" "historical"') &&
  template.includes('class="foundry-index-items"'),
  "The public index must present all three distinct editorial groups.");
assert(script.includes('index.querySelectorAll("[data-foundry-group]")') &&
  script.includes("group.hidden = !groupCards.some"),
  "Search/category filtering must hide empty editorial group headings.");


const blockTokens = [...template.matchAll(/\{\{-?\s*(define|range|with|if|end)\b/g)];
const opens = blockTokens.filter(([, name]) => name !== "end").length;
const closes = blockTokens.filter(([, name]) => name === "end").length;
assert(opens === closes, `Hugo block delimiters are unbalanced: ${opens}/${closes}`);

assert(config.includes('"css/foundry.css"'), "Hugo must load the new stylesheet.");
assert(styles.includes('--f-display:') && styles.includes('--f-reading:') &&
  styles.includes('--f-mono:'), "Design typography tokens are missing.");
assert(styles.includes("@media (max-width: 670px)") &&
  styles.includes("prefers-reduced-motion"), "Mobile/reduced-motion hooks are missing.");
assert(styles.includes(".foundry-index-group-head") &&
  styles.includes(".foundry-index-items"),
  "Grouping layout styles are missing.");
assert(styles.includes(".content .foundry header") &&
  styles.includes(".content .foundry article p") &&
  styles.includes(".content .foundry .foundry-detail-header h1"),
  "Foundry must explicitly override inherited Coder header and paragraph presentation.");


assert(script.includes('setAttribute("aria-pressed"') &&
  script.includes("card.hidden = !show"),
  "Accessible progressive filtering not found.");
assert(template.includes('id="foundry-index-toolbar" hidden') &&
  script.includes("toolbar.hidden = false"),
  "Uninitialized filter controls must not appear without working JavaScript.");
assert(/branches:\s*\n\s*- main/m.test(deployWorkflow),
  "Deployment trigger was altered; staging must not auto-deploy.");

try {
  execFileSync(process.execPath, ["--check", new URL("../static/js/foundry.js", import.meta.url).pathname], {
    stdio: "pipe",
  });
} catch {
  errors.push("Foundry browser JS syntax check failed.");
}

if (errors.length) {
  for (const e of errors) console.error(`FAIL: ${e}`);
  process.exitCode = 1;
} else {
  console.log(`Foundry staging static checks passed: ${items.length} public-source projects, unique IDs, valid links, route guards, privacy boundaries and JS syntax.`);
  console.log("Hugo generation, screenshot review, live browser accessibility and deployment remain unverified.");
}

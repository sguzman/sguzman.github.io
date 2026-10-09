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

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

const manifest = read("data/foundry_public.toml");
const template = read("layouts/projects/list.html");
const styles = read("assets/css/foundry.css");
const script = read("static/js/foundry.js");
const config = read("hugo.toml");
const deployWorkflow = read(".github/workflows/pages.yml");

const items = manifest.split(/^\[\[projects\]\]\s*$/m).slice(1);
const field = (block, key) => block.match(new RegExp(`^${key} = "([^"\\n]+)"$`, "m"))?.[1];
const ids = new Set();
const allowedCategories = new Set(["Desktop", "Systems", "Tools", "Research", "Web"]);

assert(items.length > 0, "Public-source fixture must not be empty.");
for (const [i, item] of items.entries()) {
  const id = field(item, "id");
  assert(!!id && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id), `Invalid project ID #${i + 1}`);
  assert(!ids.has(id), `Duplicate project ID: ${id}`);
  ids.add(id);
  for (const name of ["name", "tagline", "description", "kicker", "repo", "category"]) {
    assert(!!field(item, name), `Missing or malformed ${name} in ${id}`);
  }
  assert(allowedCategories.has(field(item, "category")), `Unsupported category in ${id}`);
  const repository = field(item, "repo") || "";
  assert(/^https:\/\/github\.com\/sguzman\/[A-Za-z0-9_.-]+$/.test(repository),
    `Only explicitly authored public GitHub source URLs are allowed: ${id}`);
  const details = field(item, "details");
  if (details) {
    assert(/^\/projects\/[a-z0-9-]+\/$/.test(details), `Unsafe detail URL in ${id}`);
    assert(existsSync(new URL(`../content${details}_index.md`, import.meta.url)),
      `Missing existing detail page for ${id}`);
  }
  assert(/^stack = \[[^\n]+\]$/m.test(item), `Missing display technology labels: ${id}`);
  assert(/^feature = (?:true|false)$/m.test(item), `Missing Boolean feature marker: ${id}`);
}
assert(!/(?:taria\/projectarium\/|source_projectarium_revision|publication_authority|cohort_id|\/mnt\/data\/)/i.test(manifest),
  "The staged public fixture must contain no private ontology, provenance, or filesystem paths.");

assert(template.includes('{{ if eq .RelPermalink "/projects/" }}'),
  "The template must guard the root index from nested project sections.");
assert(template.includes("{{ .Content }}") && template.includes("{{ else }}"),
  "Existing nested project documents must render without replacement.");
assert(template.includes(".Site.Data.foundry_public.projects"),
  "The template may read only the public staging data.");
assert(!/(?:\.Site\.Data\.projectarium|\.Site\.Data\.cohorts)/.test(template),
  "The public template must not consume private source data.");
assert(template.includes("NOT A PRODUCT CAPTURE"),
  "CSS concept art must be visibly identified as such.");

const blockTokens = [...template.matchAll(/\{\{-?\s*(define|range|with|if|end)\b/g)];
const opens = blockTokens.filter(([, name]) => name !== "end").length;
const closes = blockTokens.filter(([, name]) => name === "end").length;
assert(opens === closes, `Hugo block delimiters are unbalanced: ${opens}/${closes}`);

assert(config.includes('"css/foundry.css"'), "Hugo must load the new stylesheet.");
assert(styles.includes('--f-display:') && styles.includes('--f-reading:') &&
  styles.includes('--f-mono:'), "Design typography tokens are missing.");
assert(styles.includes("@media (max-width: 670px)") &&
  styles.includes("prefers-reduced-motion"), "Mobile/reduced-motion hooks are missing.");
assert(script.includes('setAttribute("aria-pressed"') &&
  script.includes("card.hidden = !show"),
  "Accessible progressive filtering not found.");
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

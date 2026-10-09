#!/usr/bin/env node
/**
 * Offline, dependency-free negative tests for the Foundry public fixture.
 * Execute with: node scripts/test_foundry_contract.mjs
 *
 * Each mutation represents a bug that must fail closed, not content to ship.
 */
import { readFileSync } from "node:fs";
import { validateFoundryManifest } from "./foundry_contract.mjs";

const source = readFileSync(new URL("../data/foundry_public.toml", import.meta.url), "utf8");
const testCases = [
  {
    name: "unauthorized private field",
    mutate: (s) => s.replace('id = "lantern-leaf"',
      'id = "lantern-leaf"\npublication_authority = "SECRET"'),
  },
  {
    name: "unrecognized nested TOML section",
    mutate: (s) => s + '\n[private]\nvalue = "NO"\n',
  },
  {
    name: "private ontology path",
    mutate: (s) => s.replace('tagline = "A document reader that keeps speech and text in step."',
      'tagline = "taria/projectarium/projects/lantern-leaf.md"'),
  },
  {
    name: "missing public source revision",
    mutate: (s) => s.replace(/source_readme_blob = "[0-9a-f]{40}"/,
      'source_readme_blob = "not-a-real-blob"'),
  },
  {
    name: "duplicated Project identity",
    mutate: (s) => s.replace('id = "morphos"', 'id = "lantern-leaf"'),
  },
  {
    name: "unreviewed source repository",
    mutate: (s) => s.replace('repo = "https://github.com/sguzman/morphos"',
      'repo = "https://github.com/other-account/secret"'),
  },
  {
    name: "private filesystem detail path",
    mutate: (s) => s.replace('details = "/projects/lantern-leaf/"',
      'details = "/private/taria/lantern-leaf/"'),
  },
  {
    name: "ambiguous duplicate field",
    mutate: (s) => s.replace('id = "lantern-leaf"',
      'id = "lantern-leaf"\nid = "another-project"'),
  },
  {
    name: "unsupported embedded HTML fragment",
    mutate: (s) => s.replace('name = "LanternLeaf"',
      'name = "<script>alert(1)</script>"'),
  },
  {
    name: "invalid multiline TOML syntax",
    mutate: (s) => s.replace('name = "LanternLeaf"',
      'name = """LanternLeaf"""'),
  },
];

const results = [];
const positive = validateFoundryManifest(source);
if (positive.problems.length) {
  console.error("FAIL: current public fixture invalid", positive.problems);
  process.exit(1);
}

for (const item of testCases) {
  const bad = item.mutate(source);
  if (bad === source) {
    results.push(`Mutation did not apply: ${item.name}`);
  } else if (!validateFoundryManifest(bad).problems.length) {
    results.push(`Unsafe mutation accepted: ${item.name}`);
  }
}

if (results.length) {
  for (const error of results) console.error("FAIL:", error);
  process.exitCode = 1;
} else {
  console.log(`PASS: valid fixture plus ${testCases.length} unsafe mutations all rejected.`);
}

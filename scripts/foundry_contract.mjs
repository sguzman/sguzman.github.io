/**
 * Minimal, deliberately narrow parser for the public-only Foundry fixture.
 * This is not a general TOML parser and must not be fed private registry YAML.
 * Invalid, unknown, ambiguous, or unsupported records fail closed.
 */
export function validateFoundryManifest(source) {
  const problems = [];
  const entries = [];
  const allowed = new Set([
    "id", "source_readme_blob", "source_verified_on",
    "name", "category", "feature", "exhibit", "kicker", "tagline",
    "description", "stack", "repo", "details",
  ]);
  const required = [
    "id", "source_readme_blob", "source_verified_on",
    "name", "category", "feature", "exhibit", "kicker",
    "tagline", "description", "stack", "repo",
  ];
  const categories = new Set(["Desktop", "Systems", "Tools", "Research", "Web"]);
  const exhibits = new Set(["flagship", "gallery", "historical"]);
  const forbidden = /taria\/projectarium\/|source_projectarium_revision|publication_authority|cohort_id|\/mnt\/data\//i;

  if (forbidden.test(source)) problems.push("Private-source identifiers or paths in public fixture.");

  let current = null;
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  for (const [offset, raw] of lines.entries()) {
    const lineNo = offset + 1;
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    if (line === "[[projects]]") {
      current = Object.create(null);
      entries.push(current);
      continue;
    }
    if (line.startsWith("[") || line.startsWith("]")) {
      problems.push(`Unexpected TOML section at line ${lineNo}.`);
      continue;
    }
    if (!current) {
      problems.push(`Value before first project at line ${lineNo}.`);
      continue;
    }

    const match = line.match(/^([a-z][a-z0-9_]*)\s*=\s*(.+)$/);
    if (!match) {
      problems.push(`Unsupported TOML syntax at line ${lineNo}.`);
      continue;
    }
    const [, key, value] = match;
    if (!allowed.has(key)) {
      problems.push(`Unapproved public field ${key} at line ${lineNo}.`);
      continue;
    }
    if (Object.hasOwn(current, key)) {
      problems.push(`Duplicate ${key} at line ${lineNo}.`);
      continue;
    }

    if (key === "feature") {
      if (value !== "true" && value !== "false") {
        problems.push(`Invalid Boolean ${key} at line ${lineNo}.`);
      } else {
        current[key] = value === "true";
      }
      continue;
    }
    if (key === "stack") {
      const array = value.match(/^\[(.*)\]$/);
      const values = array ? array[1].split(/,\s*/) : [];
      if (!array || !values.length ||
          values.some((text) => !/^"[^"\\\r\n]+"$/.test(text))) {
        problems.push(`Unsupported technology list at line ${lineNo}.`);
      } else {
        current[key] = values.map((text) => text.slice(1, -1));
      }
      continue;
    }

    if (!/^"[^"\\\r\n]+"$/.test(value)) {
      problems.push(`Unsupported string for ${key} at line ${lineNo}.`);
    } else {
      current[key] = value.slice(1, -1);
    }
  }

  if (entries.length < 1 || entries.length > 40) {
    problems.push("Public fixture must contain between 1 and 40 explicitly chosen items.");
  }

  const ids = new Set();
  for (const [index, item] of entries.entries()) {
    for (const key of required) {
      if (!Object.hasOwn(item, key)) {
        problems.push(`Missing ${key} on project #${index + 1}.`);
      }
    }
    for (const key of ["name", "kicker", "tagline", "description"]) {
      const display = item[key] || "";
      if (/<\/?[a-z][^>]*>/i.test(display)) {
        problems.push(`HTML markup not permitted in public ${key} on #${index + 1}.`);
      }
    }
    const id = item.id || "";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      problems.push(`Invalid Project ID #${index + 1}.`);
    }
    if (ids.has(id)) problems.push(`Duplicate Project ID: ${id}.`);
    ids.add(id);
    if (!categories.has(item.category)) problems.push(`Unsupported category on ${id}.`);
    if (!exhibits.has(item.exhibit)) problems.push(`Unknown exhibit tier on ${id}.`);
    if ((item.exhibit === "flagship") !== (item.feature === true)) {
      problems.push(`Featured flag does not match exhibit tier on ${id}.`);
    }
    if (!/^[0-9a-f]{40}$/.test(item.source_readme_blob || "")) {
      problems.push(`Missing pinned public README blob on ${id}.`);
    }
    if (!/^20\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(item.source_verified_on || "")) {
      problems.push(`Invalid source review date on ${id}.`);
    }
    const githubPath = (item.repo || "").match(/^https:\/\/github\.com\/sguzman\/([A-Za-z0-9_.-]+)$/);
    if (!githubPath) problems.push(`Invalid public GitHub repository URL on ${id}.`);
    if (githubPath && githubPath[1] !== id) {
      problems.push(`Repository identity differs from reviewed public specimen: ${id}.`);
    }
    if (item.details !== undefined &&
        !/^\/projects\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(item.details)) {
      problems.push(`Unsafe details path on ${id}.`);
    }
  }

  const tierCounts = Object.fromEntries(["flagship", "gallery", "historical"].map(
    (tier) => [tier, entries.filter((entry) => entry.exhibit === tier).length],
  ));
  if (entries.length === 30 &&
      (tierCounts.flagship !== 7 || tierCounts.gallery !== 16 || tierCounts.historical !== 7)) {
    problems.push("Full Foundry exhibition must contain 7 flagship, 16 gallery, and 7 historical records.");
  }

  return { entries, problems };
}

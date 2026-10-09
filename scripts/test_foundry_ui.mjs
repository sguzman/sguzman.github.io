#!/usr/bin/env node
/**
 * Zero-dependency behavioral test for the ACTUAL Foundry browser script.
 * Uses a tiny fake DOM and Node's isolated VM. No browser, network, or Actions.
 */
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { validateFoundryManifest } from "./foundry_contract.mjs";

const file = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const { entries, problems } = validateFoundryManifest(file("data/foundry_public.toml"));
if (problems.length) throw Error("Invalid public fixture: " + problems.join(" | "));

function fakeClassList() {
  const values = new Set();
  return {
    toggle(name, on) { if (on) values.add(name); else values.delete(name); },
    contains(name) { return values.has(name); },
  };
}
function fakeNode(dataset = {}) {
  const events = new Map();
  const attrs = new Map();
  return {
    dataset, events, attrs,
    hidden: false,
    value: "",
    textContent: "",
    classList: fakeClassList(),
    setAttribute(key, value) { attrs.set(key, value); },
    addEventListener(type, fn) { events.set(type, fn); },
    fire(type) {
      const fn = events.get(type);
      if (!fn) throw Error("No " + type + " event listener");
      fn();
    },
  };
}

const cards = entries.map((project) => fakeNode({
  foundryCategory: project.category.toLowerCase(),
  foundrySearch: [
    project.name, project.tagline, project.description, ...project.stack,
  ].join(" ").toLowerCase(),
}));
const index = fakeNode();
index.querySelectorAll = (selector) => {
  if (selector !== ".foundry-index-item[data-foundry-card]") {
    throw Error("Unexpected card selector: " + selector);
  }
  return cards;
};
const toolbar = fakeNode();
toolbar.hidden = true;
const search = fakeNode();
const count = fakeNode();
const empty = fakeNode();
const categories = ["all", "desktop", "systems", "tools", "research", "web"];
const filters = categories.map((category) => fakeNode({ foundryFilter: category }));
const byId = new Map([
  ["foundry-index-toolbar", toolbar],
  ["foundry-search", search],
  ["foundry-index-grid", index],
  ["foundry-results", count],
  ["foundry-empty", empty],
]);
const document = {
  getElementById(id) { return byId.get(id) ?? null; },
  querySelectorAll(selector) {
    if (selector !== "[data-foundry-filter]") throw Error("Unexpected filter selector");
    return filters;
  },
};

runInNewContext(file("static/js/foundry.js"), { document }, { timeout: 2000 });
const fail = [];
const expect = (value, explanation) => { if (!value) fail.push(explanation); };
const shown = () => cards.filter((card) => !card.hidden).length;
const toolCount = entries.filter((e) => e.category === "Tools").length;

expect(toolbar.hidden === false, "JS must reveal working search controls.");
expect(shown() === entries.length, "Initial render should show all cards.");
expect(empty.hidden, "Empty state should be initially hidden.");
expect(count.textContent.includes(`Showing ${entries.length} of ${entries.length}`),
  "Initial results count is incorrect.");

search.value = "a query that no project matches";
search.fire("input");
expect(shown() === 0, "Unmatched query did not hide every card.");
expect(!empty.hidden, "Empty-state message was not shown.");
expect(index.classList.contains("is-filtered"), "Filtered results lost single-column layout.");

search.value = "";
search.fire("input");
expect(shown() === entries.length, "Clearing search did not restore all cards.");

const toolsButton = filters[categories.indexOf("tools")];
toolsButton.fire("click");
expect(shown() === toolCount, "Tools category count incorrect.");
expect(toolsButton.attrs.get("aria-pressed") === "true", "Active filter is not accessible.");
expect(index.classList.contains("is-filtered"), "Category filtering should reflow the layout.");

filters[0].fire("click");
expect(shown() === entries.length, "All filter did not reset category.");
expect(!index.classList.contains("is-filtered"), "Default index should return to two columns.");
expect(filters[0].attrs.get("aria-pressed") === "true", "All category was not pressed.");

if (fail.length) {
  for (const error of fail) console.error("FAIL:", error);
  process.exitCode = 1;
} else {
  console.log(`PASS: live JS filter behavior on ${entries.length} staged projects, including empty results and keyboard-compatible category state.`);
}

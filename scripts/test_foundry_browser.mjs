#!/usr/bin/env node
/**
 * Local-only Foundry browser verification.
 *
 * Requires a local Hugo output directory and a locally installed Playwright
 * package (playwright or playwright-core), with Chromium available to it.
 * No online service, GitHub Actions, real user data, or private Taria inputs.
 *
 *   node scripts/test_foundry_browser.mjs /path/to/generated/hugo/site
 *
 * Optional: FOUNDRY_QA_DIR=/path/to/qa-output saves synthetic-site screenshots.
 * Optional: FOUNDRY_CHROMIUM_BIN=/usr/bin/chromium uses a local browser binary.
 */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile, stat } from "node:fs/promises";
import { extname, resolve, sep, join } from "node:path";

const root = resolve(process.argv[2] || "public");
const screenshotDir = process.env.FOUNDRY_QA_DIR || "";
const mediaTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
  [".woff2", "font/woff2"],
  [".woff", "font/woff"],
  [".ico", "image/x-icon"],
]);
const checked = [];
const check = (name, condition) => {
  assert.ok(condition, name);
  checked.push(name);
};

function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url || "/", "http://127.0.0.1").pathname);
      const candidate = resolve(root, "." + pathname);
      if (candidate !== root && !candidate.startsWith(root + sep)) {
        response.writeHead(403);
        response.end("forbidden");
        return;
      }
      let file = candidate;
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const contents = await readFile(file);
      response.setHeader("Content-Type", mediaTypes.get(extname(file)) || "application/octet-stream");
      response.setHeader("Cache-Control", "no-store");
      response.writeHead(200);
      response.end(contents);
    } catch {
      response.writeHead(404);
      response.end("not found");
    }
  });
  return new Promise((accept, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => accept({ server, address: server.address() }));
  });
}

async function main() {
  // Source data must already have survived both Node validation and Hugo
  // validation in verify_foundry.sh; this script tests rendered behavior.
  let playwright;
  try {
    playwright = await import("playwright");
  } catch {
    try {
      playwright = await import("playwright-core");
    } catch {
      throw new Error("Foundry browser QA requires locally installed playwright or playwright-core. No network install is attempted.");
    }
  }

  const { server, address } = await startStaticServer();
  let browser;
  try {
    const settings = { headless: true };
    if (process.env.FOUNDRY_CHROMIUM_BIN) {
      settings.executablePath = process.env.FOUNDRY_CHROMIUM_BIN;
    }
    browser = await playwright.chromium.launch(settings);
    const origin = "http://127.0.0.1:" + address.port;
    const onlyLocal = async (route) => {
      const requested = new URL(route.request().url());
      if (requested.origin === origin) {
        await route.continue();
      } else {
        // No CDNs, trackers, or network access during deterministic browser QA.
        await route.abort();
      }
    };
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.route("**/*", onlyLocal);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    const rootResponse = await page.goto(origin + "/projects/", { waitUntil: "load" });
    check("root returns HTTP 200", rootResponse?.status() === 200);
    check("Hugo renders one Foundry main exhibition", await page.locator(".foundry:not(.foundry-detail)").count() === 1);
    check("two featured studies appear", await page.locator(".foundry-feature").count() === 2);
    const count = await page.locator(".foundry-index-item").count();
    check("curated gallery contains twelve records", count === 12);
    check("real CSS applies Foundry surface", await page.locator(".foundry").evaluate((element) => getComputedStyle(element).backgroundColor) === "rgb(21, 24, 25)");
    check("JavaScript enables the search toolbar", await page.locator("#foundry-index-toolbar").isVisible());
    check("source link remains available", await page.locator('a[href="https://github.com/sguzman/lantern-leaf"]').count() > 0);

    await page.locator("#foundry-search").fill("no-project-will-match-9278");
    check("impossible query hides all results", await page.locator(".foundry-index-item:visible").count() === 0);
    check("empty-result notice becomes visible", await page.locator("#foundry-empty").isVisible());
    await page.locator("#foundry-search").fill("");
    await page.locator('[data-foundry-filter="tools"]').click();
    const toolsTotal = await page.locator('.foundry-index-item[data-foundry-category="tools"]').count();
    check("tools category filters precisely", await page.locator(".foundry-index-item:visible").count() === toolsTotal);
    check("filter announces pressed state", await page.locator('[data-foundry-filter="tools"]').getAttribute("aria-pressed") === "true");
    await page.locator('[data-foundry-filter="all"]').click();
    check("All filter restores all records", await page.locator(".foundry-index-item:visible").count() === count);

    await page.locator(".foundry-skip").focus();
    check("skip link is keyboard-focusable", await page.evaluate(() => document.activeElement?.classList.contains("foundry-skip")));

    if (screenshotDir) await mkdir(screenshotDir, { recursive: true });
    for (const [label, width, height] of [
      ["desktop", 1440, 900],
      ["tablet", 768, 1024],
      ["mobile", 390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      const horizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - document.documentElement.clientWidth;
      });
      check(label + " has no horizontal overflow", horizontalOverflow <= 2);
      if (screenshotDir) {
        await page.screenshot({ path: join(screenshotDir, "foundry-" + label + ".png"), fullPage: true });
      }
    }
    check("browser JS reports no exceptions", errors.length === 0);

    for (const name of ["flatfekt", "fathrs", "cinegraph", "simurom"]) {
      const response = await page.goto(origin + "/projects/" + name + "/", { waitUntil: "load" });
      check(name + " nested project route loads", response?.status() === 200);
      check(name + " content survives gallery redesign", await page.locator(".foundry-detail-article").count() === 1);
      check(name + " is not replaced with gallery", await page.locator(".foundry-index").count() === 0);
    }

    const noJs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    await noJs.route("**/*", onlyLocal);
    try {
      const fallback = await noJs.newPage();
      await fallback.goto(origin + "/projects/", { waitUntil: "load" });
      check("no-JS mode retains all twelve entries", await fallback.locator(".foundry-index-item").count() === 12);
      check("no-JS mode hides nonfunctional filters", await fallback.locator("#foundry-index-toolbar").isHidden());
      check("no-JS mode retains repository links", await fallback.locator('a[href="https://github.com/sguzman/morphos"]').count() > 0);
    } finally {
      await noJs.close();
    }

    await context.close();
    console.log("PASS: " + checked.length + " Foundry browser checks: responsive presentation, search, filters, nested routes, and no-JS fallback.");
    if (screenshotDir) console.log("Screenshots saved under: " + resolve(screenshotDir));
  } finally {
    if (browser) await browser.close();
    await new Promise((done) => server.close(done));
  }
}

main().catch((error) => {
  console.error("FAIL: Foundry browser QA: " + error.stack);
  process.exitCode = 1;
});

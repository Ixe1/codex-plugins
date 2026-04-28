#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);

function usage() {
  console.error([
    "Usage: node capture-browser.mjs <page.html or URL> <output.png> [options]",
    "",
    "Options:",
    "  --width <px>                 Viewport width, default 1440",
    "  --height <px>                Viewport height, default 2200",
    "  --mode <full-page|viewport>  Capture mode, default full-page",
    "  --json <path>                Write capture metadata JSON",
    "  --fallback-max-height <px>   Max clipped fallback height, default 16000",
  ].join("\n"));
}

let targetArg;
let outputArg;
let width = 1440;
let height = 2200;
let mode = "full-page";
let jsonPath;
let fallbackMaxHeight = 16000;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else if (!targetArg && !arg.startsWith("--")) {
    targetArg = arg;
  } else if (!outputArg && !arg.startsWith("--")) {
    outputArg = arg;
  } else if (arg === "--width") {
    width = Number.parseInt(args[++index], 10);
  } else if (arg === "--height") {
    height = Number.parseInt(args[++index], 10);
  } else if (arg === "--mode") {
    mode = args[++index];
  } else if (arg === "--json") {
    jsonPath = args[++index];
  } else if (arg === "--fallback-max-height") {
    fallbackMaxHeight = Number.parseInt(args[++index], 10);
  } else {
    console.error(`Unknown option: ${arg}`);
    usage();
    process.exit(1);
  }
}

if (!targetArg || !outputArg || !Number.isFinite(width) || !Number.isFinite(height) || !["full-page", "viewport"].includes(mode)) {
  usage();
  process.exit(1);
}

const outputPath = path.resolve(outputArg);
const metadataJsonPath = jsonPath ? path.resolve(jsonPath) : null;

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (error) {
  try {
    const requireFromProject = createRequire(path.join(process.cwd(), "package.json"));
    ({ chromium } = requireFromProject("playwright"));
  } catch (fallbackError) {
    console.error("Playwright is not installed. Run `npm i -D playwright` and `npx playwright install chromium`, or run a manual visual review.");
    process.exit(2);
  }
}

const targetUrl = /^https?:\/\//.test(targetArg)
  ? targetArg
  : pathToFileURL(path.resolve(targetArg)).href;

let browser;
const metadata = {
  target: targetArg,
  targetUrl,
  outputPath,
  viewport: { width, height },
  requestedMode: mode,
  captureMode: null,
  clippedFallback: false,
  cleanup: "not-started",
  error: null,
};

try {
  browser = await chromium.launch({ headless: true });
  metadata.cleanup = "pending";
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(targetUrl, { waitUntil: "load", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {});
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  if (mode === "viewport") {
    await page.screenshot({ path: outputPath, fullPage: false });
    metadata.captureMode = "viewport";
  } else {
    try {
      await page.screenshot({ path: outputPath, fullPage: true });
      metadata.captureMode = "full-page";
    } catch (error) {
      const dimensions = await page.evaluate(() => ({
        width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, window.innerWidth),
        height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight),
      }));
      const clip = {
        x: 0,
        y: 0,
        width: Math.max(1, Math.min(dimensions.width, width)),
        height: Math.max(1, Math.min(dimensions.height, fallbackMaxHeight)),
      };
      await page.screenshot({ path: outputPath, clip });
      metadata.captureMode = "clipped-full-document-fallback";
      metadata.clippedFallback = true;
      metadata.fullPageError = String(error?.message || error);
      metadata.documentSize = dimensions;
      metadata.clip = clip;
    }
  }
} catch (error) {
  metadata.error = String(error?.message || error);
  throw error;
} finally {
  if (browser) {
    await browser.close();
    metadata.cleanup = "closed";
  }
  if (metadataJsonPath) {
    fs.mkdirSync(path.dirname(metadataJsonPath), { recursive: true });
    fs.writeFileSync(metadataJsonPath, `${JSON.stringify(metadata, null, 2)}\n`);
  }
}

console.log(`Captured ${outputPath} (${metadata.captureMode})`);
if (metadata.clippedFallback) {
  console.log("Capture used clipped fallback; record this in review notes.");
}

#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";

const targetArg = process.argv[2] ?? ".maquette/components/gallery.html";
const outputArg = process.argv[3] ?? ".maquette/components/gallery.png";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (error) {
  console.error("Playwright is not installed. Run `npm i -D playwright` and `npx playwright install chromium`, or run a manual visual review.");
  process.exit(2);
}

const targetUrl = /^https?:\/\//.test(targetArg)
  ? targetArg
  : `file://${path.resolve(targetArg)}`;

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });
  await page.goto(targetUrl);
  fs.mkdirSync(path.dirname(outputArg), { recursive: true });
  await page.screenshot({ path: outputArg, fullPage: true });
} finally {
  if (browser) {
    await browser.close();
  }
}

console.log(`Captured ${outputArg}`);

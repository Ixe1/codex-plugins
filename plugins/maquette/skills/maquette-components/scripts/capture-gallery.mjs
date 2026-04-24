#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";

const targetArg = process.argv[2] ?? "ui/components/gallery.html";
const outputArg = process.argv[3] ?? "ui/components/gallery.png";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (error) {
  console.error("Playwright is not installed. Install it with `npm i -D playwright` or run a manual visual review.");
  process.exit(2);
}

const targetUrl = /^https?:\/\//.test(targetArg)
  ? targetArg
  : `file://${path.resolve(targetArg)}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });
await page.goto(targetUrl);
await page.screenshot({ path: outputArg, fullPage: true });
await browser.close();

fs.mkdirSync(path.dirname(outputArg), { recursive: true });
console.log(`Captured ${outputArg}`);

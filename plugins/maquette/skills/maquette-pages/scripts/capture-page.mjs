#!/usr/bin/env node
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const sharedScript = path.resolve(currentDir, "../../../shared/scripts/capture-browser.mjs");
const targetArg = process.argv[2];
const outputArg = process.argv[3];

if (!targetArg || !outputArg) {
  console.error("Usage: node capture-page.mjs <page.html or URL> <output.png> [capture options]");
  process.exit(1);
}

const result = spawnSync(process.execPath, [sharedScript, targetArg, outputArg, ...process.argv.slice(4)], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);

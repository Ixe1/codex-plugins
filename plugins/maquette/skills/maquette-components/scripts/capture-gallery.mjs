#!/usr/bin/env node
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const sharedScript = path.resolve(currentDir, "../../../shared/scripts/capture-browser.mjs");
const targetArg = process.argv[2] ?? ".maquette/components/replica-gallery.html";
const outputArg = process.argv[3] ?? ".maquette/components/replica-gallery.png";
const extraArgs = process.argv.slice(4);

const result = spawnSync(process.execPath, [sharedScript, targetArg, outputArg, ...extraArgs], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);

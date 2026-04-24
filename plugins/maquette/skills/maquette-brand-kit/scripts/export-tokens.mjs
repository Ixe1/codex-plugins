#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "ui/brand/design-system.json";
const outputPath = process.argv[3] ?? "ui/brand/tokens.css";

function kebabCase(input) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function flatten(obj, prefix = []) {
  const out = [];
  for (const [key, value] of Object.entries(obj ?? {})) {
    const next = [...prefix, kebabCase(key)];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out.push(...flatten(value, next));
    } else {
      out.push([next.join("-"), value]);
    }
  }
  return out;
}

const designSystem = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const tokenEntries = flatten(designSystem.tokens);
const lines = [
  "/* Generated from design-system.json. Do not edit by hand unless you know what you are doing. */",
  ":root {",
  ...tokenEntries.map(([name, value]) => `  --${name}: ${value};`),
  "}"
];

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join("\n") + "\n", "utf8");
console.log(`Wrote ${outputPath}`);

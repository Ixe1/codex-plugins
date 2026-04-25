#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);

function usage() {
  console.error([
    "Usage: node validate-linked-assets.mjs <html-or-css> [more files...] [options]",
    "",
    "Options:",
    "  --project <path>   Project root, default current directory",
    "  --json <path>      Write JSON output",
  ].join("\n"));
}

let projectRoot = process.cwd();
let jsonPath;
const targetPaths = [];

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else if (arg === "--project") {
    projectRoot = path.resolve(args[++index]);
  } else if (arg === "--json") {
    jsonPath = args[++index];
  } else if (arg.startsWith("--")) {
    console.error(`Unknown option: ${arg}`);
    usage();
    process.exit(1);
  } else {
    targetPaths.push(arg);
  }
}

if (targetPaths.length === 0) {
  targetPaths.push(".maquette/components/replica-gallery.html");
}

function isExternalReference(value) {
  return !value
    || value.startsWith("#")
    || value.startsWith("data:")
    || value.startsWith("mailto:")
    || value.startsWith("tel:")
    || /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}

function resolveLocalReference(fromFile, value) {
  const cleanValue = value.split("#")[0].split("?")[0];
  if (isExternalReference(cleanValue)) return null;
  return path.resolve(path.dirname(fromFile), cleanValue);
}

function collectHtmlReferences(filePath, content) {
  const references = [];
  const patterns = [
    { type: "stylesheet", regex: /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi },
    { type: "script", regex: /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi },
    { type: "image", regex: /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi },
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.regex.exec(content))) {
      references.push({ type: pattern.type, value: match[1], from: filePath });
    }
  }

  return references;
}

function collectCssReferences(filePath, content) {
  const references = [];
  const patterns = [
    { type: "css-import", regex: /@import\s+(?:url\()?["']?([^"')\s]+)["']?\)?/gi },
    { type: "css-url", regex: /url\(["']?([^"')]+)["']?\)/gi },
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.regex.exec(content))) {
      references.push({ type: pattern.type, value: match[1], from: filePath });
    }
  }

  return references;
}

const visited = new Set();
const queue = targetPaths.map((targetPath) => path.resolve(projectRoot, targetPath));
const checkedFiles = [];
const missingFiles = [];

while (queue.length > 0) {
  const filePath = queue.shift();
  if (visited.has(filePath)) continue;
  visited.add(filePath);

  if (!fs.existsSync(filePath)) {
    missingFiles.push({ type: "target", value: filePath, resolvedPath: filePath });
    continue;
  }

  checkedFiles.push(filePath);
  const content = fs.readFileSync(filePath, "utf8");
  const extension = path.extname(filePath).toLowerCase();
  const references = extension === ".css"
    ? collectCssReferences(filePath, content)
    : collectHtmlReferences(filePath, content);

  for (const reference of references) {
    const resolvedPath = resolveLocalReference(filePath, reference.value);
    if (!resolvedPath) continue;
    if (!fs.existsSync(resolvedPath)) {
      missingFiles.push({ ...reference, resolvedPath });
      continue;
    }
    if (path.extname(resolvedPath).toLowerCase() === ".css") {
      queue.push(resolvedPath);
    }
  }
}

const output = {
  projectRoot,
  targets: targetPaths,
  checkedFiles,
  missingFiles,
  pass: missingFiles.length === 0,
};

if (jsonPath) {
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(output, null, 2)}\n`);
}

console.log(JSON.stringify(output, null, 2));

if (!output.pass) {
  process.exit(1);
}

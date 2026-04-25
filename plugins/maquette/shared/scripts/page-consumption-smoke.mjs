#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);

function usage() {
  console.error([
    "Usage: node page-consumption-smoke.mjs [options]",
    "",
    "Options:",
    "  --project <path>   Project root, default current directory",
    "  --catalog <path>   Component catalog path",
    "  --output <path>    Smoke page path",
    "  --json <path>      Write JSON output",
  ].join("\n"));
}

let projectRoot = process.cwd();
let catalogPath;
let outputPath;
let jsonPath;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else if (arg === "--project") {
    projectRoot = path.resolve(args[++index]);
  } else if (arg === "--catalog") {
    catalogPath = path.resolve(args[++index]);
  } else if (arg === "--output") {
    outputPath = path.resolve(args[++index]);
  } else if (arg === "--json") {
    jsonPath = args[++index];
  } else {
    console.error(`Unknown option: ${arg}`);
    usage();
    process.exit(1);
  }
}

catalogPath ??= path.join(projectRoot, ".maquette/components/component-catalog.json");
outputPath ??= path.join(projectRoot, ".maquette/components/page-consumption-smoke.html");

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (error) {
  try {
    const requireFromProject = createRequire(path.join(projectRoot, "package.json"));
    ({ chromium } = requireFromProject("playwright"));
  } catch (fallbackError) {
    console.error("Playwright is not installed. Run manual page-consumption review or install Playwright.");
    process.exit(2);
  }
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const componentsDir = path.dirname(catalogPath);
const cssPath = fs.existsSync(path.join(componentsDir, "css/components.css"))
  ? path.join(componentsDir, "css/components.css")
  : path.join(componentsDir, "components.css");
const jsPath = fs.existsSync(path.join(componentsDir, "js/components.js"))
  ? path.join(componentsDir, "js/components.js")
  : path.join(componentsDir, "components.js");
const cssHref = path.relative(path.dirname(outputPath), cssPath).replaceAll(path.sep, "/");
const jsSrc = path.relative(path.dirname(outputPath), jsPath).replaceAll(path.sep, "/");

function fallbackMarkup(component) {
  const classSelector = (component.selectors || []).find((selector) => /^\.[A-Za-z0-9_-]+$/.test(selector));
  if (!classSelector) {
    return `<div>${component.name}</div>`;
  }
  return `<div class="${classSelector.slice(1)}">${component.name}</div>`;
}

const sections = (catalog.components || []).map((component) => {
  const examples = component.api?.usage_examples?.length
    ? component.api.usage_examples.slice(0, 2)
    : [fallbackMarkup(component)];
  return `<section data-component="${component.name}">
  <h2>${component.name}</h2>
  ${examples.join("\n  ")}
</section>`;
}).join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Maquette Page Consumption Smoke</title>
  <link rel="stylesheet" href="${cssHref.startsWith(".") ? cssHref : `./${cssHref}`}">
  <style>
    body { margin: 0; padding: 24px; font-family: system-ui, sans-serif; }
    main { display: grid; gap: 24px; max-width: 1120px; margin: 0 auto; }
    section { display: grid; gap: 12px; }
  </style>
</head>
<body>
  <main>
    ${sections}
  </main>
  <script src="${jsSrc.startsWith(".") ? jsSrc : `./${jsSrc}`}"></script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html);

let browser;
const consoleMessages = [];
let result;

try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text() });
    }
  });
  await page.goto(pathToFileURL(outputPath).href, { waitUntil: "load", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {});

  result = await page.evaluate(() => ({
    cssLinked: Boolean(document.querySelector('link[href="./css/components.css"], link[href="./components.css"]')),
    jsLinked: Boolean(document.querySelector('script[src="./js/components.js"], script[src="./components.js"]')),
    replicaReferences: Array.from(document.querySelectorAll("[class], [id]"))
      .filter((element) => `${element.className} ${element.id}`.toLowerCase().includes("replica"))
      .length,
    renderedSectionCount: document.querySelectorAll("[data-component]").length,
    bodyTextLength: document.body.innerText.trim().length,
    documentOverflowPx: Math.max(
      document.documentElement.scrollWidth - window.innerWidth,
      document.body.scrollWidth - window.innerWidth,
      0,
    ),
  }));
} finally {
  if (browser) {
    await browser.close();
  }
}

const output = {
  projectRoot,
  catalogPath,
  outputPath,
  cssPath,
  jsPath,
  cssHref,
  jsSrc,
  readyForPages: catalog.assets?.reusable_component_review?.ready_for_pages !== false,
  cssExists: fs.existsSync(cssPath),
  jsExists: fs.existsSync(jsPath),
  consoleMessages,
  ...result,
};

output.pass = output.readyForPages
  && output.cssExists
  && output.jsExists
  && output.cssLinked
  && output.jsLinked
  && output.replicaReferences === 0
  && output.renderedSectionCount > 0
  && output.bodyTextLength > 0
  && output.documentOverflowPx <= 1
  && output.consoleMessages.length === 0;

if (jsonPath) {
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(output, null, 2)}\n`);
}

console.log(JSON.stringify(output, null, 2));

if (!output.pass) {
  process.exit(1);
}

#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const args = process.argv.slice(2);

function usage() {
  console.error([
    "Usage: node ensure-qa-tooling.mjs [options]",
    "",
    "Options:",
    "  --project <path>       Project root, default current directory",
    "  --json <path>          Write JSON output",
    "  --check-browser        Launch Chromium headlessly to verify browser install",
    "  --check-image-prep     Check optional sharp dependency for reference image preprocessing",
  ].join("\n"));
}

let projectRoot = process.cwd();
let jsonPath;
let checkBrowser = false;
let checkImagePrep = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else if (arg === "--project") {
    projectRoot = path.resolve(args[++index]);
  } else if (arg === "--json") {
    jsonPath = args[++index];
  } else if (arg === "--check-browser") {
    checkBrowser = true;
  } else if (arg === "--check-image-prep") {
    checkImagePrep = true;
  } else {
    console.error(`Unknown option: ${arg}`);
    usage();
    process.exit(1);
  }
}

const requireFromProject = createRequire(path.join(projectRoot, "package.json"));
const installCommand = "npm i -D playwright ajv ajv-formats";
const imagePrepInstallCommand = "npm i -D sharp";
const browserInstallCommand = "npx playwright install chromium";

function checkPackage(name, importPath = name) {
  try {
    const resolvedPath = requireFromProject.resolve(importPath);
    return {
      name,
      importPath,
      available: true,
      resolvedPath,
    };
  } catch (error) {
    return {
      name,
      importPath,
      available: false,
      error: error.code || String(error?.message || error),
    };
  }
}

const packageChecks = [
  checkPackage("playwright"),
  checkPackage("ajv", "ajv/dist/2020.js"),
  checkPackage("ajv-formats"),
];

const imagePrepPackageChecks = checkImagePrep
  ? [
      checkPackage("sharp"),
    ]
  : [];

let browserCheck = {
  requested: checkBrowser,
  available: null,
  error: null,
};

if (checkBrowser) {
  let browser;
  try {
    const { chromium } = requireFromProject("playwright");
    browser = await chromium.launch({ headless: true });
    browserCheck = {
      requested: true,
      available: true,
      error: null,
    };
  } catch (error) {
    browserCheck = {
      requested: true,
      available: false,
      error: String(error?.message || error),
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

const missingPackages = packageChecks
  .filter((item) => !item.available)
  .map((item) => item.name);
const missingImagePrepPackages = imagePrepPackageChecks
  .filter((item) => !item.available)
  .map((item) => item.name);

const missingBrowserQaPackages = missingPackages.filter((name) => name === "playwright");
const missingSchemaQaPackages = missingPackages.filter((name) => name === "ajv" || name === "ajv-formats");
const blockedQaCapabilities = [
  missingBrowserQaPackages.length > 0 || browserCheck.available === false ? "browser-screenshot-and-responsive-qa" : null,
  missingSchemaQaPackages.length > 0 ? "json-schema-validation" : null,
  missingImagePrepPackages.length > 0 ? "reference-image-preprocessing" : null,
].filter(Boolean);

const output = {
  projectRoot,
  packageChecks,
  imagePrepPackageChecks,
  browserCheck,
  missingPackages,
  missingImagePrepPackages,
  missingBrowserQaPackages,
  missingSchemaQaPackages,
  blockedQaCapabilities,
  installDecisionRequired: blockedQaCapabilities.length > 0,
  installCommand,
  imagePrepInstallCommand,
  browserInstallCommand,
  globalInstallRecommended: false,
  notes: [
    "Maquette does not bundle Node dependencies or create node_modules.",
    "Install optional QA dependencies in the project where Maquette generates UI files.",
    "Install optional image preprocessing dependencies only when the run will upscale or sharpen raster references.",
    "Global npm installs are not recommended because Node usually will not resolve them from plugin scripts without extra environment configuration.",
  ],
  pass: missingPackages.length === 0 && missingImagePrepPackages.length === 0 && (browserCheck.available !== false),
};

if (jsonPath) {
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(output, null, 2)}\n`);
}

if (output.pass) {
  console.log("Maquette optional QA tooling is available.");
} else {
  if (missingPackages.length > 0) {
    console.log(`Missing project-local QA packages: ${missingPackages.join(", ")}`);
    console.log(`Install with: ${installCommand}`);
  }
  if (missingImagePrepPackages.length > 0) {
    console.log(`Missing project-local image preprocessing packages: ${missingImagePrepPackages.join(", ")}`);
    console.log(`Install with: ${imagePrepInstallCommand}`);
  }
  if (blockedQaCapabilities.length > 0) {
    console.log(`Blocked Maquette QA capabilities: ${blockedQaCapabilities.join(", ")}`);
    console.log("Ask the user for an install decision before skipping these automated QA checks.");
  }
  if (browserCheck.available === false) {
    console.log("Playwright is installed, but Chromium could not be launched.");
    console.log(`Install browser with: ${browserInstallCommand}`);
  }
}

console.log(JSON.stringify(output, null, 2));

if (!output.pass) {
  process.exit(1);
}

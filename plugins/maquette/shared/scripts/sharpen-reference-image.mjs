#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const args = process.argv.slice(2);

function usage() {
  console.error([
    "Usage: node sharpen-reference-image.mjs <input> <output> [options]",
    "",
    "Options:",
    "  --project <path>       Project root for resolving sharp, default current directory",
    "  --no-sharpen           Copy through PNG conversion without the mild unsharp mask",
    "  --json <path>          Write JSON output",
    "  --raw-source <path>    Original image_gen source path for metadata",
    "  --project-raw <path>   Project-local raw vN.png path for metadata",
    "  --role <role>          approval, transcription, implementation, or supplemental",
    "  --inspected-by-main    Mark the derivative as inspected by the main workflow",
  ].join("\n"));
}

let inputPath;
let outputPath;
let projectRoot = process.cwd();
let sharpen = true;
let jsonPath;
let rawSourcePath;
let projectRawPath;
let role = "supplemental";
let inspectedByMain = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else if (arg === "--project") {
    projectRoot = path.resolve(args[++index]);
  } else if (arg === "--no-sharpen") {
    sharpen = false;
  } else if (arg === "--json") {
    jsonPath = args[++index];
  } else if (arg === "--raw-source") {
    rawSourcePath = path.resolve(args[++index]);
  } else if (arg === "--project-raw") {
    projectRawPath = path.resolve(args[++index]);
  } else if (arg === "--role") {
    role = args[++index];
  } else if (arg === "--inspected-by-main") {
    inspectedByMain = true;
  } else if (!inputPath) {
    inputPath = path.resolve(arg);
  } else if (!outputPath) {
    outputPath = path.resolve(arg);
  } else {
    console.error(`Unknown option: ${arg}`);
    usage();
    process.exit(1);
  }
}

if (!inputPath || !outputPath) {
  usage();
  process.exit(1);
}

if (inputPath === outputPath) {
  console.error("Refusing to overwrite the raw reference image. Write a separate sharpened derivative.");
  process.exit(1);
}

const requireFromProject = createRequire(path.join(projectRoot, "package.json"));
let sharp;

function isInsideProjectRoot(resolvedPath) {
  const relativePath = path.relative(projectRoot, resolvedPath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

try {
  const sharpPath = requireFromProject.resolve("sharp");
  if (!isInsideProjectRoot(sharpPath)) {
    throw new Error(`sharp resolved outside the project root: ${sharpPath}`);
  }
  sharp = requireFromProject("sharp");
} catch (error) {
  console.error("sharp is not installed in the current project.");
  console.error(`Install with: npm --prefix ${JSON.stringify(projectRoot)} i -D sharp`);
  console.error(String(error?.message || error));
  process.exit(1);
}

const input = sharp(inputPath, {
  failOn: "warning",
  limitInputPixels: false,
});
const metadata = await input.metadata();

if (!metadata.width || !metadata.height) {
  throw new Error(`Could not read dimensions from ${inputPath}`);
}

let pipeline = input;
if (sharpen) {
  pipeline = pipeline.sharpen({
    sigma: 0.65,
    m1: 0.45,
    m2: 1.0,
    x1: 2,
    y2: 10,
    y3: 20,
  });
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const info = await pipeline.png().toFile(outputPath);

const output = {
  inputPath,
  outputPath,
  projectRoot,
  rawSourcePath: rawSourcePath ?? inputPath,
  projectRawPath: projectRawPath ?? inputPath,
  derivativePaths: {
    sharpened: outputPath,
  },
  method: "reference-sharpen",
  created_at: new Date().toISOString(),
  inspected_by_main: inspectedByMain,
  role,
  dimensions_preserved: metadata.width === info.width && metadata.height === info.height,
  sharpen,
  input: {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
  },
  output: {
    width: info.width,
    height: info.height,
    format: info.format,
    size: info.size,
  },
};

if (jsonPath) {
  fs.mkdirSync(path.dirname(path.resolve(jsonPath)), { recursive: true });
  fs.writeFileSync(path.resolve(jsonPath), `${JSON.stringify(output, null, 2)}\n`);
}

console.log(JSON.stringify(output, null, 2));

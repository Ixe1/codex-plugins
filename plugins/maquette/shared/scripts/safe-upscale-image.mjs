#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const args = process.argv.slice(2);

function usage() {
  console.error([
    "Usage: node safe-upscale-image.mjs <input> <output> [options]",
    "",
    "Options:",
    "  --project <path>       Project root for resolving sharp, default current directory",
    "  --scale <number>       Upscale factor, default 2",
    "  --no-sharpen           Disable mild unsharp mask after resizing",
    "  --json <path>          Write JSON output",
  ].join("\n"));
}

let inputPath;
let outputPath;
let projectRoot = process.cwd();
let scale = 2;
let sharpen = true;
let jsonPath;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else if (arg === "--project") {
    projectRoot = path.resolve(args[++index]);
  } else if (arg === "--scale") {
    scale = Number(args[++index]);
  } else if (arg === "--no-sharpen") {
    sharpen = false;
  } else if (arg === "--json") {
    jsonPath = args[++index];
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

if (!inputPath || !outputPath || !Number.isFinite(scale) || scale <= 1) {
  usage();
  process.exit(1);
}

const requireFromProject = createRequire(path.join(projectRoot, "package.json"));
let sharp;

try {
  sharp = requireFromProject("sharp");
} catch (error) {
  console.error("sharp is not installed in the current project.");
  console.error("Install with: npm i -D sharp");
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

const width = Math.round(metadata.width * scale);
const height = Math.round(metadata.height * scale);

let pipeline = input.resize({
  width,
  height,
  fit: "fill",
  kernel: "lanczos3",
});

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
  scale,
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

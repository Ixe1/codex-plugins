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
    "  --size <pixels>        Exact square output size; overrides --scale",
    "  --width <pixels>       Exact output width; requires --height and overrides --scale",
    "  --height <pixels>      Exact output height; requires --width and overrides --scale",
    "  --no-sharpen           Disable mild unsharp mask after resizing",
    "  --json <path>          Write JSON output",
    "  --raw-source <path>    Original image_gen source path for reference sidecar metadata",
    "  --project-raw <path>   Project-local raw vN.png path for reference sidecar metadata",
    "  --role <role>          approval, transcription, implementation, or supplemental",
    "  --inspected-by-main    Mark the derivative as inspected by the main workflow",
  ].join("\n"));
}

let inputPath;
let outputPath;
let projectRoot = process.cwd();
let scale = 2;
let targetWidth;
let targetHeight;
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
  } else if (arg === "--scale") {
    scale = Number(args[++index]);
  } else if (arg === "--size") {
    const size = Number(args[++index]);
    targetWidth = size;
    targetHeight = size;
  } else if (arg === "--width") {
    targetWidth = Number(args[++index]);
  } else if (arg === "--height") {
    targetHeight = Number(args[++index]);
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

const hasExplicitSize = targetWidth !== undefined || targetHeight !== undefined;
const hasValidExplicitSize = Number.isInteger(targetWidth) && targetWidth > 0
  && Number.isInteger(targetHeight) && targetHeight > 0;

if (!inputPath || !outputPath || (!hasExplicitSize && (!Number.isFinite(scale) || scale <= 1)) || (hasExplicitSize && !hasValidExplicitSize)) {
  usage();
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

const width = hasExplicitSize ? targetWidth : Math.round(metadata.width * scale);
const height = hasExplicitSize ? targetHeight : Math.round(metadata.height * scale);

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
  rawSourcePath: rawSourcePath ?? inputPath,
  projectRawPath: projectRawPath ?? inputPath,
  derivativePaths: {
    safeUpscale: outputPath,
  },
  method: "safe-upscale",
  created_at: new Date().toISOString(),
  inspected_by_main: inspectedByMain,
  role,
  scale: hasExplicitSize ? null : scale,
  targetWidth: width,
  targetHeight: height,
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
  dimensions: {
    raw: {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    },
    derivatives: {
      safeUpscale: {
        width: info.width,
        height: info.height,
        format: info.format,
        size: info.size,
      },
    },
  },
};

if (jsonPath) {
  fs.mkdirSync(path.dirname(path.resolve(jsonPath)), { recursive: true });
  fs.writeFileSync(path.resolve(jsonPath), `${JSON.stringify(output, null, 2)}\n`);
}

console.log(JSON.stringify(output, null, 2));

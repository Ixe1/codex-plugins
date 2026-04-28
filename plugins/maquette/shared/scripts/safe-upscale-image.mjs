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
    "  --scale <number>       Aspect-preserving upscale factor, default 2",
    "  --size <pixels>        Exact square output size for square artifacts only; overrides --scale",
    "  --long-edge <pixels>   Aspect-preserving output with longest edge set to pixels",
    "  --width <pixels>       Aspect-preserving output width; auto-calculates height unless --height is also set",
    "  --height <pixels>      Exact output height when used with --width",
    "  --allow-distort        Permit non-square --size or exact --width/--height distortion",
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
let size;
let longEdge;
let targetWidth;
let targetHeight;
let allowDistort = false;
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
    size = Number(args[++index]);
  } else if (arg === "--long-edge") {
    longEdge = Number(args[++index]);
  } else if (arg === "--width") {
    targetWidth = Number(args[++index]);
  } else if (arg === "--height") {
    targetHeight = Number(args[++index]);
  } else if (arg === "--allow-distort") {
    allowDistort = true;
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

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

const requestedSizeModes = [
  size !== undefined,
  longEdge !== undefined,
  targetWidth !== undefined,
].filter(Boolean).length;
const resizeMode = size !== undefined
  ? "exact-square"
  : longEdge !== undefined
    ? "long-edge"
    : targetWidth !== undefined
      ? "width"
      : "scale";

const invalidArguments = !inputPath
  || !outputPath
  || requestedSizeModes > 1
  || (resizeMode === "scale" && (!Number.isFinite(scale) || scale <= 1))
  || (size !== undefined && !isPositiveInteger(size))
  || (longEdge !== undefined && !isPositiveInteger(longEdge))
  || (targetWidth !== undefined && !isPositiveInteger(targetWidth))
  || (targetHeight !== undefined && !isPositiveInteger(targetHeight))
  || (targetHeight !== undefined && targetWidth === undefined);

if (invalidArguments) {
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

function roundedAspectRatio(width, height) {
  return Number((width / height).toFixed(6));
}

function aspectDifference(inputWidth, inputHeight, outputWidth, outputHeight) {
  return Math.abs((inputWidth / inputHeight) - (outputWidth / outputHeight));
}

if (resizeMode === "exact-square" && metadata.width !== metadata.height && !allowDistort) {
  console.error(
    `Refusing to distort non-square input ${metadata.width}x${metadata.height} with --size. `
      + "Use --long-edge, --scale, or --width for aspect-preserving page concepts, "
      + "or pass --allow-distort to force exact square output.",
  );
  process.exit(1);
}

let width;
let height;

if (resizeMode === "exact-square") {
  width = size;
  height = size;
} else if (resizeMode === "long-edge") {
  const factor = longEdge / Math.max(metadata.width, metadata.height);
  width = Math.round(metadata.width * factor);
  height = Math.round(metadata.height * factor);
} else if (resizeMode === "width") {
  width = targetWidth;
  height = targetHeight ?? Math.round(metadata.height * (targetWidth / metadata.width));
} else {
  width = Math.round(metadata.width * scale);
  height = Math.round(metadata.height * scale);
}

const aspectRatioTolerance = 0.001;
const aspectPreserved = aspectDifference(metadata.width, metadata.height, width, height) <= aspectRatioTolerance;

if (resizeMode === "width" && targetHeight !== undefined && !aspectPreserved && !allowDistort) {
  console.error(
    `Refusing to distort input ${metadata.width}x${metadata.height} with exact --width/--height `
      + `target ${width}x${height}. Omit --height for proportional output or pass --allow-distort.`,
  );
  process.exit(1);
}

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
  aspect_preserved: aspectPreserved,
  resize_mode: resizeMode,
  aspectRatio: {
    original: roundedAspectRatio(metadata.width, metadata.height),
    output: roundedAspectRatio(info.width, info.height),
  },
  allowDistort,
  scale: resizeMode === "scale" ? scale : null,
  targetWidth: width,
  targetHeight: height,
  sharpen,
  input: {
    width: metadata.width,
    height: metadata.height,
    aspectRatio: roundedAspectRatio(metadata.width, metadata.height),
    format: metadata.format,
  },
  output: {
    width: info.width,
    height: info.height,
    aspectRatio: roundedAspectRatio(info.width, info.height),
    format: info.format,
    size: info.size,
  },
  dimensions: {
    raw: {
      width: metadata.width,
      height: metadata.height,
      aspectRatio: roundedAspectRatio(metadata.width, metadata.height),
      format: metadata.format,
    },
    derivatives: {
      safeUpscale: {
        width: info.width,
        height: info.height,
        aspectRatio: roundedAspectRatio(info.width, info.height),
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

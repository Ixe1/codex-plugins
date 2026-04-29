import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const ensureQaToolingPath = path.resolve(scriptDir, "ensure-qa-tooling.mjs");
const sharpenReferencePath = path.resolve(scriptDir, "sharpen-reference-image.mjs");

function writePackage(root, name, files = { "index.js": "module.exports = {};\n" }) {
  const packageRoot = path.join(root, "node_modules", name);
  fs.mkdirSync(packageRoot, { recursive: true });
  fs.writeFileSync(path.join(packageRoot, "package.json"), JSON.stringify({ name, version: "1.0.0" }));
  for (const [filePath, contents] of Object.entries(files)) {
    const targetPath = path.join(packageRoot, filePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, contents);
  }
}

function writeFakeSharp(root) {
  writePackage(root, "sharp", {
    "index.js": `
const fs = require("node:fs");

module.exports = function sharp(inputPath) {
  const inputMetadata = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  let sharpenCalled = false;

  return {
    async metadata() {
      return inputMetadata;
    },
    sharpen() {
      sharpenCalled = true;
      return this;
    },
    png() {
      return this;
    },
    async toFile(outputPath) {
      const info = {
        width: inputMetadata.width,
        height: inputMetadata.height,
        format: "png",
        size: inputMetadata.width * inputMetadata.height,
        sharpenCalled,
      };
      fs.writeFileSync(outputPath, JSON.stringify(info));
      return info;
    },
  };
};
`,
  });
}

function writeFakeQaPackages(root) {
  writePackage(root, "playwright");
  writePackage(root, "ajv", {
    "dist/2020.js": "module.exports = function Ajv() {};\n",
  });
  writePackage(root, "ajv-formats");
}

function parseJsonOutput(result) {
  const jsonStart = result.stdout.indexOf("{\n");
  assert.ok(jsonStart >= 0, result.stdout);
  return JSON.parse(result.stdout.slice(jsonStart));
}

test("ensure-qa-tooling reports sharp only when image prep is requested", () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "maquette-no-image-prep-"));
  fs.writeFileSync(path.join(projectRoot, "package.json"), "{}\n");
  writeFakeQaPackages(projectRoot);

  const result = spawnSync(process.execPath, [
    ensureQaToolingPath,
    "--project",
    projectRoot,
  ], {
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stdout + result.stderr);
  const output = parseJsonOutput(result);
  assert.deepEqual(output.missingImagePrepPackages, []);
  assert.equal(output.blockedQaCapabilities.includes("reference-image-preprocessing"), false);
});

test("ensure-qa-tooling recommends project-local sharp when reference sharpening is requested", () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "maquette-missing-sharp-"));
  const result = spawnSync(process.execPath, [
    ensureQaToolingPath,
    "--project",
    projectRoot,
    "--check-image-prep",
  ], {
    encoding: "utf8",
  });

  assert.notEqual(result.status, 0);
  const output = parseJsonOutput(result);
  assert.deepEqual(output.missingImagePrepPackages, ["sharp"]);
  assert.equal(output.blockedQaCapabilities.includes("reference-image-preprocessing"), true);
  assert.match(output.combinedInstallCommand, /^npm --prefix /);
  assert.match(output.combinedInstallCommand, / playwright ajv ajv-formats sharp$/);
});

test("ensure-qa-tooling rejects sharp resolved from a parent node_modules", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "maquette-parent-sharp-"));
  const childRoot = path.join(tempRoot, "child-project");
  fs.mkdirSync(childRoot);
  fs.writeFileSync(path.join(tempRoot, "package.json"), "{}\n");
  writeFakeSharp(tempRoot);

  const result = spawnSync(process.execPath, [
    ensureQaToolingPath,
    "--project",
    childRoot,
    "--check-image-prep",
  ], {
    encoding: "utf8",
  });

  assert.notEqual(result.status, 0);
  const output = parseJsonOutput(result);
  assert.equal(output.imagePrepPackageChecks[0].error, "resolved_outside_project_root");
  assert.deepEqual(output.missingImagePrepPackages, ["sharp"]);
});

test("sharpen-reference-image preserves dimensions and records metadata", () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "maquette-sharpen-"));
  fs.writeFileSync(path.join(projectRoot, "package.json"), "{}\n");
  writeFakeSharp(projectRoot);
  const inputPath = path.join(projectRoot, "component-sheet-v1.png");
  const outputPath = path.join(projectRoot, "component-sheet-v1-sharpened.png");
  const jsonPath = path.join(projectRoot, "component-sheet-v1-sharpened.json");
  fs.writeFileSync(inputPath, JSON.stringify({ width: 1024, height: 768, format: "png" }));

  const result = spawnSync(process.execPath, [
    sharpenReferencePath,
    inputPath,
    outputPath,
    "--project",
    projectRoot,
    "--json",
    jsonPath,
    "--role",
    "component-sheet-transcription",
    "--inspected-by-main",
  ], {
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  const output = parseJsonOutput(result);
  assert.equal(output.method, "reference-sharpen");
  assert.equal(output.sharpen, true);
  assert.equal(output.dimensions_preserved, true);
  assert.equal(output.output.width, 1024);
  assert.equal(output.output.height, 768);
  assert.equal(output.derivativePaths.sharpened.endsWith("-sharpened.png"), true);
  const writtenInfo = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  assert.equal(writtenInfo.sharpenCalled, true);
});

test("sharpen-reference-image refuses to overwrite the raw reference", () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "maquette-sharpen-refuse-"));
  fs.writeFileSync(path.join(projectRoot, "package.json"), "{}\n");
  writeFakeSharp(projectRoot);
  const inputPath = path.join(projectRoot, "brand-board-v1.png");
  fs.writeFileSync(inputPath, JSON.stringify({ width: 1024, height: 1024, format: "png" }));

  const result = spawnSync(process.execPath, [
    sharpenReferencePath,
    inputPath,
    inputPath,
    "--project",
    projectRoot,
  ], {
    encoding: "utf8",
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Refusing to overwrite the raw reference image/);
});

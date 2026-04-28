import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildReferenceArtifactPaths,
  createReferenceArtifactSidecar,
} from "./reference-artifact-contract.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const ensureQaToolingPath = path.resolve(scriptDir, "ensure-qa-tooling.mjs");

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

test("ensure-qa-tooling rejects packages resolved from a parent node_modules", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "maquette-parent-modules-"));
  const childRoot = path.join(tempRoot, "child-project");
  fs.mkdirSync(childRoot);
  fs.writeFileSync(path.join(tempRoot, "package.json"), "{}\n");
  writePackage(tempRoot, "playwright");
  writePackage(tempRoot, "ajv", { "dist/2020.js": "module.exports = function Ajv() {};\n" });
  writePackage(tempRoot, "ajv-formats");
  writePackage(tempRoot, "sharp");

  const result = spawnSync(process.execPath, [
    ensureQaToolingPath,
    "--project",
    childRoot,
    "--check-browser",
    "--check-image-prep",
  ], {
    encoding: "utf8",
  });

  assert.notEqual(result.status, 0);
  const jsonStart = result.stdout.indexOf("{\n");
  assert.ok(jsonStart >= 0, result.stdout);
  const output = JSON.parse(result.stdout.slice(jsonStart));

  assert.equal(output.projectLocalOnly, true);
  assert.deepEqual(output.missingPackages, ["playwright", "ajv", "ajv-formats"]);
  assert.deepEqual(output.missingImagePrepPackages, ["sharp"]);
  assert.ok(output.packageChecks.every((item) => item.error === "resolved_outside_project_root"));
  assert.equal(output.imagePrepPackageChecks[0].error, "resolved_outside_project_root");
  assert.equal(output.browserCheck.available, false);
  assert.match(output.browserCheck.error, /resolved_outside_project_root/);
});

test("ensure-qa-tooling recommends project-local npm prefix installs", () => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "maquette-no-manifest-"));
  const result = spawnSync(process.execPath, [
    ensureQaToolingPath,
    "--project",
    projectRoot,
    "--check-image-prep",
  ], {
    encoding: "utf8",
  });

  assert.notEqual(result.status, 0);
  const output = JSON.parse(result.stdout.slice(result.stdout.indexOf("{\n")));
  assert.match(output.combinedInstallCommand, /^npm --prefix /);
  assert.match(output.combinedInstallCommand, / playwright ajv ajv-formats sharp$/);
  assert.equal(output.combinedInstallCommand.includes(JSON.stringify(projectRoot)), true);
});

test("reference artifact paths keep raw, 2k, and rendered derivatives distinct", () => {
  const paths = buildReferenceArtifactPaths({
    directory: ".maquette/components",
    slug: "component-sheet-core",
    version: 2,
  });

  assert.equal(paths.raw, path.join(".maquette/components", "component-sheet-core-v2.png"));
  assert.equal(paths.safeUpscale, path.join(".maquette/components", "component-sheet-core-v2-2k.png"));
  assert.equal(paths.deterministicRender, path.join(".maquette/components", "component-sheet-core-v2-rendered.png"));
  assert.notEqual(paths.raw, paths.safeUpscale);
  assert.notEqual(paths.raw, paths.deterministicRender);
});

test("reference sidecars record source, derivatives, dimensions, method, inspection, and role", () => {
  const sidecar = createReferenceArtifactSidecar({
    rawSourcePath: "C:/Users/Paul/AppData/Local/Codex/generated/raw.png",
    projectRawPath: "F:/project/.maquette/brand/brand-board-v1.png",
    derivativePaths: {
      safeUpscale: "F:/project/.maquette/brand/brand-board-v1-2k.png",
    },
    dimensions: {
      raw: { width: 1024, height: 1024 },
      derivatives: { safeUpscale: { width: 2048, height: 2048 } },
    },
    method: "safe-upscale",
    role: "brand-board-approval",
    inspectedByMain: true,
    createdAt: "2026-04-28T12:00:00.000Z",
  });

  assert.equal(sidecar.method, "safe-upscale");
  assert.equal(sidecar.inspected_by_main, true);
  assert.equal(sidecar.role, "brand-board-approval");
  assert.equal(sidecar.derivativePaths.safeUpscale.endsWith("-2k.png"), true);
  assert.equal(sidecar.dimensions.derivatives.safeUpscale.width, 2048);
});

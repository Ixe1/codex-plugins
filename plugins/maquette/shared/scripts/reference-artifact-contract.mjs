#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

export const referenceArtifactRoles = new Set([
  "brand-board-approval",
  "component-sheet-transcription",
  "css-contract-poster-supplemental",
  "page-concept-approval",
]);

export function buildReferenceArtifactPaths({ directory, slug, version, extension = "png" }) {
  if (!directory || !slug || !Number.isInteger(version) || version < 1) {
    throw new Error("directory, slug, and positive integer version are required");
  }

  const base = `${slug}-v${version}`;
  return {
    raw: path.join(directory, `${base}.${extension}`),
    sidecar: path.join(directory, `${base}.json`),
    safeUpscale: path.join(directory, `${base}-2k.${extension}`),
    safeUpscaleSidecar: path.join(directory, `${base}-2k.json`),
    deterministicRender: path.join(directory, `${base}-rendered.${extension}`),
    deterministicRenderSidecar: path.join(directory, `${base}-rendered.json`),
  };
}

export function createReferenceArtifactSidecar({
  rawSourcePath,
  projectRawPath,
  derivativePaths = {},
  dimensions = {},
  method,
  role,
  inspectedByMain = false,
  createdAt = new Date().toISOString(),
}) {
  if (!rawSourcePath || !projectRawPath || !method || !role) {
    throw new Error("rawSourcePath, projectRawPath, method, and role are required");
  }

  return {
    rawSourcePath,
    projectRawPath,
    derivativePaths,
    dimensions,
    method,
    created_at: createdAt,
    inspected_by_main: Boolean(inspectedByMain),
    role,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...args] = process.argv.slice(2);

  if (command === "paths") {
    const [directory, slug, versionText] = args;
    const version = Number(versionText);
    console.log(JSON.stringify(buildReferenceArtifactPaths({ directory, slug, version }), null, 2));
  } else {
    console.error("Usage: node reference-artifact-contract.mjs paths <directory> <slug> <version>");
    process.exit(1);
  }
}

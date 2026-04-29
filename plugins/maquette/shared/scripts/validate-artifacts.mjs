#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

function usage() {
  console.error([
    "Usage: node validate-artifacts.mjs [options]",
    "",
    "Options:",
    "  --project <path>       Project root, default current directory",
    "  --schema-root <path>   Maquette shared schema directory",
    "  --json <path>          Write JSON validation output",
  ].join("\n"));
}

let projectRoot = process.cwd();
let schemaRoot = path.resolve(currentDir, "..");
let jsonPath;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else if (arg === "--project") {
    projectRoot = path.resolve(args[++index]);
  } else if (arg === "--schema-root") {
    schemaRoot = path.resolve(args[++index]);
  } else if (arg === "--json") {
    jsonPath = args[++index];
  } else {
    console.error(`Unknown option: ${arg}`);
    usage();
    process.exit(1);
  }
}

let Ajv2020;
let addFormats;
try {
  const requireFromProject = createRequire(path.join(projectRoot, "package.json"));
  const ajvModule = requireFromProject("ajv/dist/2020.js");
  const formatsModule = requireFromProject("ajv-formats");
  Ajv2020 = ajvModule.default ?? ajvModule;
  addFormats = formatsModule.default ?? formatsModule;
} catch (error) {
  console.error("ajv and ajv-formats are not available from the target project. Install them or run manual JSON validation.");
  process.exit(2);
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const checks = [
  {
    name: "design-system",
    schemaPath: path.join(schemaRoot, "design-system.schema.json"),
    dataPath: path.join(projectRoot, ".maquette/brand/design-system.json"),
  },
  {
    name: "component-catalog",
    schemaPath: path.join(schemaRoot, "component-catalog.schema.json"),
    dataPath: path.join(projectRoot, ".maquette/components/component-catalog.json"),
  },
];

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function resolveArtifactPath(projectRootPath, artifactPath) {
  if (!artifactPath || typeof artifactPath !== "string") return null;
  if (path.isAbsolute(artifactPath)) return artifactPath;
  const maquetteRelative = path.join(projectRootPath, ".maquette", artifactPath);
  if (fs.existsSync(maquetteRelative)) return maquetteRelative;
  return path.join(projectRootPath, artifactPath);
}

function collectComponentArtifactPaths(componentCatalog) {
  const assets = componentCatalog.assets ?? {};
  const paths = [
    assets.tokens_css_path,
    assets.sheet_inventory_path,
    assets.sheet_implementation_log_path,
    assets.replica_gallery_html_path,
    assets.component_reference_html_path,
    assets.gallery_html_path,
    assets.component_sheet_path,
    assets.review_notes_path,
    ...asArray(assets.component_sheet_paths),
    ...asArray(assets.component_contract_paths),
    ...asArray(assets.gallery_screenshot_paths),
    ...asArray(assets.nav_open_screenshot_paths),
    ...asArray(assets.gallery_review_artifact_paths),
  ];

  for (const batch of asArray(assets.sheet_implementation_batches)) {
    paths.push(
      batch.sheet_path,
      batch.contract_path,
      batch.catalog_snapshot_path,
      batch.review_path,
      ...asArray(batch.replica_artifact_paths),
      ...asArray(batch.component_artifact_paths),
      ...asArray(batch.reusable_artifact_paths),
      ...asArray(batch.review_artifact_paths),
      ...asArray(batch.screenshot_paths),
      ...asArray(batch.visible_region_coverage).flatMap((region) => asArray(region.evidence_paths)),
    );
  }

  return paths.filter(Boolean);
}

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function hasPathWithExtension(paths, extension) {
  return asArray(paths).some((artifactPath) => typeof artifactPath === "string" && artifactPath.endsWith(extension));
}

function componentCatalogCustomErrors(componentCatalog) {
  const assets = componentCatalog.assets ?? {};
  const errors = [];

  for (const [batchIndex, batch] of asArray(assets.sheet_implementation_batches).entries()) {
    const batchPath = `/assets/sheet_implementation_batches/${batchIndex}`;
    const completed = batch.completed_before_next_sheet === true;

    if (!completed) continue;

    if (!assets.sheet_inventory_path) {
      errors.push({
        instancePath: "/assets/sheet_inventory_path",
        message: "completed_before_next_sheet requires a sheet inventory covering every visible sheet region",
      });
    }

    if (!batch.sheet_path) {
      errors.push({
        instancePath: `${batchPath}/sheet_path`,
        message: "completed_before_next_sheet requires the visual sheet path",
      });
    }

    if (!batch.contract_path) {
      errors.push({
        instancePath: `${batchPath}/contract_path`,
        message: "completed_before_next_sheet requires a deterministic contract path",
      });
    }

    if (!isNonEmptyArray(batch.replica_artifact_paths)) {
      errors.push({
        instancePath: `${batchPath}/replica_artifact_paths`,
        message: "completed_before_next_sheet requires batch replica artifact paths",
      });
    }

    const implementationPaths = [
      ...asArray(batch.component_artifact_paths),
      ...asArray(batch.reusable_artifact_paths),
    ];
    if (!hasPathWithExtension(implementationPaths, ".css")) {
      errors.push({
        instancePath: `${batchPath}/component_artifact_paths`,
        message: "completed_before_next_sheet requires a batch CSS artifact",
      });
    }
    if (!hasPathWithExtension(implementationPaths, ".js")) {
      errors.push({
        instancePath: `${batchPath}/component_artifact_paths`,
        message: "completed_before_next_sheet requires a batch JS artifact, even if minimal",
      });
    }
    if (!batch.catalog_snapshot_path) {
      errors.push({
        instancePath: `${batchPath}/catalog_snapshot_path`,
        message: "completed_before_next_sheet requires a batch catalog snapshot",
      });
    }
    if (!batch.review_path) {
      errors.push({
        instancePath: `${batchPath}/review_path`,
        message: "completed_before_next_sheet requires a batch review file",
      });
    }

    const hasScreenshotEvidence = batch.review_mode === "screenshot" && isNonEmptyArray(batch.screenshot_paths);
    const hasManualEvidence = batch.review_mode === "manual"
      && isNonEmptyArray(batch.review_artifact_paths)
      && Boolean(batch.blocked_screenshot_reason);
    if (!hasScreenshotEvidence && !hasManualEvidence) {
      errors.push({
        instancePath: `${batchPath}/review_artifact_paths`,
        message: "completed_before_next_sheet requires screenshot evidence or documented manual visual evidence",
      });
    }

    const visibleRegions = asArray(batch.visible_region_coverage);
    const contractRegions = asArray(batch.contract_region_coverage);
    if (!isNonEmptyArray(visibleRegions)) {
      errors.push({
        instancePath: `${batchPath}/visible_region_coverage`,
        message: "completed_before_next_sheet requires visible regions listed",
      });
    }
    if (!isNonEmptyArray(contractRegions)) {
      errors.push({
        instancePath: `${batchPath}/contract_region_coverage`,
        message: "completed_before_next_sheet requires contract coverage for visible regions",
      });
    }

    const contractRegionIds = new Set(contractRegions.map((region) => region.region_id).filter(Boolean));
    for (const [regionIndex, region] of visibleRegions.entries()) {
      const regionPath = `${batchPath}/visible_region_coverage/${regionIndex}`;
      if (!contractRegionIds.has(region.region_id)) {
        errors.push({
          instancePath: `${regionPath}/region_id`,
          message: `Visible region is not covered by contract_region_coverage: ${region.region_id}`,
        });
      }
      if (!isNonEmptyArray(region.contract_selectors)) {
        errors.push({
          instancePath: `${regionPath}/contract_selectors`,
          message: "Visible region requires selectors in the deterministic contract",
        });
      }
      if (!isNonEmptyArray(region.evidence_paths)) {
        errors.push({
          instancePath: `${regionPath}/evidence_paths`,
          message: "Visible region requires replica/review evidence paths",
        });
      }
      if (region.implementation_status === "approved-omission") {
        if (!region.omission_reason || !region.approval_reference) {
          errors.push({
            instancePath: `${regionPath}/implementation_status`,
            message: "Approved omissions require omission_reason and approval_reference",
          });
        }
      } else if (region.implementation_status !== "implemented") {
        errors.push({
          instancePath: `${regionPath}/implementation_status`,
          message: `completed_before_next_sheet cannot include unapproved missing, partial, simplified, blocked, or regenerated regions: ${region.region_id}`,
        });
      }
    }

    for (const [regionIndex, region] of contractRegions.entries()) {
      const regionPath = `${batchPath}/contract_region_coverage/${regionIndex}`;
      if (region.status !== "covered" && region.status !== "approved-omission") {
        errors.push({
          instancePath: `${regionPath}/status`,
          message: `completed_before_next_sheet requires contract coverage for every visible region: ${region.region_id}`,
        });
      }
      if (!isNonEmptyArray(region.selectors)) {
        errors.push({
          instancePath: `${regionPath}/selectors`,
          message: "Contract region requires selectors",
        });
      }
    }
  }

  const fidelity = assets.replica_fidelity_review;
  if (fidelity?.status === "matches") {
    const review = fidelity.visible_region_review;
    const requiredFlags = [
      "visible_regions_listed",
      "visible_regions_implemented",
      "state_variants_represented",
      "responsive_variants_represented_when_shown",
      "no_unapproved_simplification",
    ];
    for (const flag of requiredFlags) {
      if (review?.[flag] !== true) {
        errors.push({
          instancePath: `/assets/replica_fidelity_review/visible_region_review/${flag}`,
          message: `Replica fidelity cannot be matches unless ${flag} is true`,
        });
      }
    }
  }

  return errors;
}

const results = checks.map((check) => {
  if (!fs.existsSync(check.dataPath)) {
    return {
      name: check.name,
      schemaPath: check.schemaPath,
      dataPath: check.dataPath,
      pass: false,
      errors: [{ message: "Data file does not exist" }],
    };
  }

  const schema = JSON.parse(fs.readFileSync(check.schemaPath, "utf8"));
  const data = JSON.parse(fs.readFileSync(check.dataPath, "utf8"));
  const validate = ajv.compile(schema);
  const schemaPass = validate(data);
  const artifactErrors = check.name === "component-catalog"
    ? collectComponentArtifactPaths(data)
      .map((artifactPath) => ({
        artifactPath,
        resolvedPath: resolveArtifactPath(projectRoot, artifactPath),
      }))
      .filter((item) => !item.resolvedPath || !fs.existsSync(item.resolvedPath))
      .map((item) => ({
        instancePath: "/assets",
        message: `Referenced artifact does not exist: ${item.artifactPath}`,
        params: { artifactPath: item.artifactPath },
      }))
    : [];
  const customErrors = check.name === "component-catalog"
    ? componentCatalogCustomErrors(data)
    : [];
  const pass = schemaPass && artifactErrors.length === 0 && customErrors.length === 0;
  return {
    name: check.name,
    schemaPath: check.schemaPath,
    dataPath: check.dataPath,
    pass,
    errors: [
      ...(validate.errors ?? []),
      ...artifactErrors,
      ...customErrors,
    ],
  };
});

const output = {
  projectRoot,
  schemaRoot,
  results,
  pass: results.every((result) => result.pass),
};

if (jsonPath) {
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(output, null, 2)}\n`);
}

for (const result of results) {
  console.log(`${result.pass ? "PASS" : "FAIL"} ${result.name}: ${result.dataPath}`);
  if (!result.pass) {
    console.log(JSON.stringify(result.errors, null, 2));
  }
}

if (!output.pass) {
  process.exit(1);
}

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
const componentContractSchemaPath = path.join(schemaRoot, "component-contract.schema.json");
const validateComponentContract = fs.existsSync(componentContractSchemaPath)
  ? ajv.compile(JSON.parse(fs.readFileSync(componentContractSchemaPath, "utf8")))
  : null;

const checks = [
  {
    name: "direction-inventory",
    schemaPath: path.join(schemaRoot, "direction-inventory.schema.json"),
    dataPath: path.join(projectRoot, ".maquette/direction/direction-inventory.json"),
    optional: true,
  },
  {
    name: "design-system",
    schemaPath: path.join(schemaRoot, "design-system.schema.json"),
    dataPath: path.join(projectRoot, ".maquette/brand/design-system.json"),
  },
  {
    name: "component-catalog",
    schemaPath: path.join(schemaRoot, "component-catalog.schema.json"),
    dataPath: path.join(projectRoot, ".maquette/components/component-catalog.json"),
    optional: true,
  },
];

const pageAssetManifestSchemaPath = path.join(schemaRoot, "page-asset-manifest.schema.json");
const pageBlueprintSchemaPath = path.join(schemaRoot, "page-blueprint.schema.json");
const pagesRoot = path.join(projectRoot, ".maquette/pages");
if (fs.existsSync(pageAssetManifestSchemaPath) && fs.existsSync(pagesRoot)) {
  for (const pageDirent of fs.readdirSync(pagesRoot, { withFileTypes: true })) {
    if (!pageDirent.isDirectory()) continue;
    const blueprintPath = path.join(pagesRoot, pageDirent.name, "page-blueprint.json");
    if (fs.existsSync(pageBlueprintSchemaPath) && fs.existsSync(blueprintPath)) {
      checks.push({
        name: `page-blueprint:${pageDirent.name}`,
        schemaPath: pageBlueprintSchemaPath,
        dataPath: blueprintPath,
        optional: true,
      });
    }
    const manifestPath = path.join(pagesRoot, pageDirent.name, "asset-manifest.json");
    if (!fs.existsSync(manifestPath)) continue;
    checks.push({
      name: `page-asset-manifest:${pageDirent.name}`,
      schemaPath: pageAssetManifestSchemaPath,
      dataPath: manifestPath,
      optional: true,
    });
  }
}

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
    assets.brand_primitives_css_path,
    assets.brand_proof_html_path,
    assets.brand_proof_review_path,
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
    );
  }

  return paths.filter(Boolean);
}

function collectDesignSystemArtifactPaths(designSystem) {
  const proof = designSystem.brand_proof ?? {};
  const paths = [
    proof.html_path,
    proof.css_path,
    proof.screenshot_path,
    proof.review_path,
  ];
  return paths.filter(Boolean);
}

function collectComponentContractPaths(componentCatalog) {
  const assets = componentCatalog.assets ?? {};
  const paths = [...asArray(assets.component_contract_paths)];
  for (const batch of asArray(assets.sheet_implementation_batches)) {
    paths.push(batch.contract_path);
  }
  return [...new Set(paths.filter((item) => typeof item === "string" && item.endsWith(".json")))];
}

function collectPageAssetManifestArtifactPaths(manifest) {
  const review = manifest.review ?? {};
  const paths = [
    review.asset_consistency_path,
    ...asArray(manifest.assets).map((asset) => asset.path),
    ...asArray(manifest.assets).map((asset) => asset.concept_reference_path),
  ];
  return paths.filter(Boolean);
}

function collectPageBlueprintArtifactPaths(blueprint) {
  const assets = blueprint.assets ?? {};
  const paths = [
    ...asArray(blueprint.references).map((reference) => reference.path),
    assets.concept_path,
    assets.html_path,
    assets.css_path,
    assets.js_path,
    assets.concept_region_inventory_path,
    assets.visual_implementation_contract_path,
    assets.page_layout_contract_path,
    assets.asset_consistency_path,
    assets.asset_manifest_path,
    assets.review_notes_path,
    ...asArray(assets.screenshot_paths),
    ...asArray(assets.nav_open_screenshot_paths),
  ];
  return paths.filter(Boolean);
}

const results = checks.map((check) => {
  if (!fs.existsSync(check.dataPath)) {
    if (check.optional) {
      return {
        name: check.name,
        schemaPath: check.schemaPath,
        dataPath: check.dataPath,
        optional: true,
        skipped: true,
        pass: true,
        errors: [],
      };
    }
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
  const artifactPaths = check.name === "component-catalog"
    ? collectComponentArtifactPaths(data)
    : check.name === "design-system"
      ? collectDesignSystemArtifactPaths(data)
      : check.name.startsWith("page-asset-manifest:")
        ? collectPageAssetManifestArtifactPaths(data)
        : check.name.startsWith("page-blueprint:")
          ? collectPageBlueprintArtifactPaths(data)
        : [];
  const artifactErrors = artifactPaths
    .map((artifactPath) => ({
      artifactPath,
      resolvedPath: resolveArtifactPath(projectRoot, artifactPath),
    }))
    .filter((item) => !item.resolvedPath || !fs.existsSync(item.resolvedPath))
    .map((item) => ({
      instancePath: check.name === "design-system" ? "/brand_proof" : "/assets",
      message: `Referenced artifact does not exist: ${item.artifactPath}`,
      params: { artifactPath: item.artifactPath },
    }));
  const contractErrors = check.name === "component-catalog"
    ? collectComponentContractPaths(data).flatMap((contractPath) => {
      if (!validateComponentContract) return [];
      const resolvedPath = resolveArtifactPath(projectRoot, contractPath);
      if (!resolvedPath || !fs.existsSync(resolvedPath)) return [];
      const contractData = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
      if (validateComponentContract(contractData)) return [];
      return (validateComponentContract.errors ?? []).map((error) => ({
        ...error,
        instancePath: `/assets/component_contract_paths${error.instancePath}`,
        message: `${contractPath}: ${error.message}`,
      }));
    })
    : [];
  const pass = schemaPass && artifactErrors.length === 0 && contractErrors.length === 0;
  return {
    name: check.name,
    schemaPath: check.schemaPath,
    dataPath: check.dataPath,
    pass,
    errors: [
      ...(validate.errors ?? []),
      ...artifactErrors,
      ...contractErrors,
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

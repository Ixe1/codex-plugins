# Changelog

All notable changes to the Maquette plugin should be documented here.

This file tracks user-visible plugin behavior, workflow rules, prompts, skills, schemas, bundled scripts, and documentation that affects how Maquette runs or what it generates.

Entries before this changelog was introduced were backfilled from git history and may summarize groups of related commits rather than every small maintenance change.

## Unreleased

No notable changes yet.

## 0.6.0 - 2026-05-03

### Added

- Added a main-workflow orchestration model: subagents may produce bounded candidates, but the main workflow owns approved references, visual inspection, approval gates, and final accept/reject decisions.
- Added page visual implementation contracts, concept-region fidelity targets, asset consistency notes, and templates for concept-to-code review.
- Added page blueprint and asset-manifest schema support for visual implementation contracts, asset consistency artifacts, generated-asset dependencies, visible text, and consistency status.

### Changed

- Changed the default page-first flow so approved page concepts become binding visual implementation targets before just-in-time component contracts are created.
- Changed page asset generation to stage identity/product references before dependent hero, promo, story, and footer images when visible brand/product text is involved.
- Updated page, component, workflow, README, plugin metadata, and agent prompts to reject generic pre-concept component galleries that reshape an approved page concept.

### Fixed

- Tightened final page review so major concept deviations, missing regions, silent simplifications, and inconsistent generated raster assets must be fixed or explicitly blocked before a page is marked approved.
- Added explicit guidance to reject generated assets that introduce alternate brand names, product labels, signage, or packaging systems inconsistent with the approved concept.

## 0.5.0 - 2026-05-03

### Added

- Added an executable brand-canon step after brand-board approval, including `brand-primitives.css`, `brand-proof.html`, brand-proof review guidance, schema support, and validation hooks.
- Added brand fingerprint and brand proof metadata to the design-system schema/example.
- Added page asset-manifest fields and schema rules for generated identity assets, inspection status, worker mode, dimensions, and format.

### Changed

- Changed Maquette's default flow to page-first after the brand canon, with just-in-time component contracts/proofs instead of a broad component library before the first page.
- Changed image-worker guidance so Maquette automatically uses image-worker subagents when available and parallelizes independent image generations by worker wave.
- Changed visual component sheets to explicit-request presentation artifacts only; structured contracts and browser proofs are the default fidelity gate.
- Updated page, component, direction, brand-kit, README, plugin metadata, and agent prompts for the simplified brand-proof-first workflow.

### Fixed

- Added hard guidance and schema checks to prevent Maquette-authored logos, wordmarks, monograms, mascots, emblems, lockups, or brand marks from being created as code-generated SVGs.
- Added brand-drift gates requiring components and pages to preserve the executable brand canon and inspect every image-worker output before use.

## 0.4.0 - 2026-05-03

### Added

- Added Greenfield Website Mode with a new `maquette-direction` phase, direction concept prompt, direction inventory schema/example, and direction-aware workflow guidance.
- Added structured component contract schema/example and a deterministic SVG poster renderer for component-contract review aids.
- Added design-system token decision metadata for global, component, and page-local scope/maturity/source tracking.

### Changed

- Changed the default greenfield flow from brand-first to page-direction-first, then constrained brand kit, critical-path components, page implementation, and final system backfill.
- Clarified Existing Brand Mode so existing websites and supplied brand assets use a preservation-first reference inventory before brand-board normalization.
- Changed component guidance from image-generated CSS-contract posters as implementation source to structured component contracts as source of truth, with visual sheets used only for explicit requests or creative clarification.
- Updated Maquette README, root marketplace README, plugin metadata, prompts, schemas, and validation guidance for direction-first and contract-first workflows.

## 0.3.6 - 2026-04-29

### Added

- Added optional `sharp`-based same-size reference-image sharpening for Maquette workflows, including QA tooling checks and a bundled helper that preserves raw generated references.

### Changed

- Updated Maquette QA guidance so missing `sharp` requires an install-or-skip decision only when reference sharpening is planned.

## 0.3.5 - 2026-04-26

### Added

- Added this changelog, a README pointer, and repository maintenance guidance so future Maquette changes are recorded alongside the code or documentation edits that introduce them.

### Changed

- Simplified plugin example prompts so they read like normal user requests instead of restating internal Maquette workflow mechanics.
- Changed brand-board and page-concept approval questions to offer only `Yes, use this` and `No, make a new one`; free-form revision notes can still be handled when provided.
- Tightened image-worker subagent guidance so missing prior authorization triggers a preflight question instead of silently falling back to main-thread image generation.
- Clarified unattended-run handling so one-pass, full-workflow, final-homepage, fresh-test, and similar requests still use image-worker and image-approval questions unless the user explicitly asks for no questions or no pauses.

### Fixed

- Fixed Maquette guidance that could let agents skip image-worker subagents because subagent use had not already been explicitly authorized.
- Fixed QA dependency guidance so partial installs, such as missing `ajv-formats`, require an install-or-skip decision before replacing schema validation with manual checks.

## 0.3.4 - 2026-04-25

### Added

- Added the current CSS-contract component workflow, where focused generated text posters can drive component implementation before browser screenshot review.

### Changed

- Refined component sheet guidance around 1:1 square artifacts, focused component families, and splitting crowded sheets instead of generating broad mega-sheets.

## 0.3.3 - 2026-04-24

### Added

- Added focused brand-board, component, and page workflow refinements for the staged Maquette process.
- Added schema and workflow documentation improvements for generated artifacts.

### Changed

- Refined Maquette prompts and plugin metadata.
- Tightened workflow docs around generated image inspection, component coverage, and QA expectations.

## 0.3.0 - 2026-04-24

### Added

- Released Maquette as an image-guided Codex plugin for brand kits, component libraries, and implemented pages.
- Added generated example screenshots and plugin logo assets.
- Added workflow documentation for invoking Maquette and its staged design-system process.

### Changed

- Renamed the plugin to Maquette.
- Added Playwright-oriented screenshot and cleanup guidance for browser QA.

## 0.2.0 - 2026-04-24

### Added

- Added early marketplace branding and repository documentation around the Maquette plugin.

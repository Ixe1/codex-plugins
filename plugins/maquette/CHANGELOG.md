# Changelog

All notable changes to the Maquette plugin should be documented here.

This file tracks user-visible plugin behavior, workflow rules, prompts, skills, schemas, bundled scripts, and documentation that affects how Maquette runs or what it generates.

Entries before this changelog was introduced were backfilled from git history and may summarize groups of related commits rather than every small maintenance change.

## Unreleased

## 0.3.7 - 2026-04-28

### Added

- Added optional `sharp`-based safe reference-image preprocessing for Maquette workflows, including tooling checks and a bundled 2K Lanczos + mild-unsharp helper that preserves original references.
- Bumped the Maquette plugin to `0.3.7` for development installs so Codex refreshes the installed plugin cache.
- Added a brand-kit workflow rule to create and inspect a 2048x2048 safe-upscaled brand-board derivative when optional `sharp` image-prep tooling is available or approved for install.
- Added strict Maquette reference-artifact naming and sidecar metadata guidance, plus a helper for raw, 2K, and deterministic-render artifact paths.
- Added tests covering project-local dependency resolution, project-local install command generation, reference artifact naming, and reference sidecar metadata.

### Changed

- Restored visual component sheets as the primary component imagegen artifact, with deterministic CSS contracts derived after visual inspection and CSS-contract poster images treated as optional supplemental references.
- Tightened image-worker guidance so each worker handles exactly one image artifact and returns structured artifact metadata for the main workflow to inspect the correct downstream artifact.
- Scoped 2K derivatives to Maquette reference artifacts only, avoiding automatic upscaling for final website/media assets.

### Fixed

- Clarified Maquette image display guidance so generated images are inspected and shown with absolute filesystem paths rather than repo-relative paths.
- Fixed optional QA tooling checks so packages resolved from parent or global `node_modules` do not count as project-local by default.
- Fixed optional install guidance so npm commands use `npm --prefix <projectRoot>` and install into the active project even when no `package.json` exists yet.

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

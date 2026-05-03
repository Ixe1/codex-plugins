# Image-gen-first workflow

This plugin is designed around a strict separation of roles:

- `image_gen` = creative visual designer
- coding model = specification writer, implementer, reviewer, and refiner

## Mandatory default behavior

Maquette has multiple workflow modes:

- Greenfield Website Mode: direction concept -> direction inventory -> constrained brand kit -> executable brand canon -> page concept -> parallel assets -> page thin slice -> just-in-time components -> page implementation -> system backfill
- Existing Brand Mode: reference inventory -> brand kit -> executable brand canon -> just-in-time components/pages
- One-Shot Fast Mode: direction concept -> compact brand canon -> page concept -> parallel assets -> thin slice -> page -> system summary
- Design System Mode: brand/page direction -> full brand canon -> scoped component contracts -> browser component proofs -> component catalog -> pages

When `image_gen` is available, use it for creative visual artifacts:

1. Direction phase
   - for greenfield websites, generate or edit concrete page direction concepts before brand tokenization
2. Brand kit
   - generate or edit a focused 1:1 brand board
3. Brand canon
   - after brand-board approval, create browser-rendered brand primitives and a brand proof before components or pages reinterpret the board
4. Components
   - do not generate visual component sheets by default
   - create structured component contracts and browser component proofs for page-critical components
   - visual component sheets are explicit-request presentation artifacts only; they are never implementation truth
5. Pages
   - generate or edit a page concept

Only after the required visual artifact and structured contract artifacts exist should the workflow proceed to code implementation.

For brand kits, token creation is not script-led extraction. The inspected brand-board image is the visual authority; `design-system.json` and `tokens.css` are machine-readable artifacts derived from that viewed image. In Greenfield Website Mode, the approved direction concept and direction inventory constrain the brand board, but the brand board normalizes those choices into durable system rules. Helper scripts may serialize approved JSON into CSS, but they must not infer, normalize, or override palette, typography, spacing, radius, surface, shadow, or state decisions from a predetermined design file unless the user explicitly provides that file as an approved constraint.

In Existing Brand Mode, create `.maquette/brand/reference-inventory.md` before the brand board when existing websites, screenshots, code, or supplied brand assets are present. The board should preserve and normalize the existing identity, not invent a new one. Do not regenerate logos, wordmarks, marks, supplied icons, photography, product screenshots, or other brand assets; record them as supplied assets and consume them later only when explicitly needed for page implementation.

Brand identity assets must not be hand-authored or code-generated SVG. Logos, wordmarks, monograms, mascots, emblems, lockups, and brand marks may only be supplied assets, including supplied SVGs, or generated raster assets from `image_gen`. Generic UI icons, interface glyphs, arrows, separators, and non-identity ornaments may be inline SVG. If a logo or wordmark is needed and no supplied asset exists, generate it as a raster image asset and record it in the asset manifest. If generation fails, record it as missing or failed; do not create a code-generated SVG fallback.

## Project output isolation

Maquette-owned artifacts must be written under `.maquette/` in the current project. This includes direction concepts, direction inventories, brand reference inventories, brand boards, design-system JSON, CSS tokens, brand primitive CSS, brand-proof HTML/screenshots/reviews, structured component contracts, deterministic contract posters, explicit component sheets, component inventories, componentized references, component CSS/JS, component catalogs, page concepts, page HTML/CSS/JS, generated raster assets, manifests, review notes, Playwright screenshots, and responsive audit JSON.

Do not create, overwrite, or rely on `index.html` in the project root for Maquette output. If the user later wants to integrate a Maquette page into the real app or root site entrypoint, treat that as a separate explicit integration task.

## Mandatory image inspection

After every `image_gen` create or edit step:
- inspect the generated image with `view_image` before treating it as the design source
- do not derive tokens, component specifications, page blueprints, or implementation details from the prompt alone
- if the generated file cannot be inspected, state that limitation and treat the image as unverified
- when revising a prior artifact, inspect both the prior reference and the new generated result when possible

After inspection, continue the same turn unless the user explicitly asked for image-only output. Briefly identify the generated artifact, provide its saved path or asset reference when available, assess whether it matches the request, and continue to the next requested workflow step.

## Image Generation Delegation

When image-worker subagent tooling is available, Maquette must use it automatically. Do not ask the user whether to use image workers.

For multiple independent generated images, spawn one dedicated image-worker subagent per image asset, or per tightly related independent batch. Run independent workers in parallel. Use staged waves only when assets depend on earlier generated assets, such as product scenes that need an accepted logo or packaging image first.

Use this handoff pattern for each worker:
- assign a unique target path before spawning the worker
- give the worker the artifact type, product brief, approved brand fingerprint, forbidden drift list, approved references, prompt asset, output naming convention, and target project path
- instruct the worker to run `image_gen`, locate the saved image on disk, copy or preserve it under the assigned `.maquette/` artifact path, and return the exact source path and project-local path
- capture the worker start time and worker/subagent id when available; if the worker cannot directly report a saved path, use those details to locate the matching file in the Codex generated-images directory by timestamp and filename metadata

The main workflow must wait for every worker in the current wave, close workers that are no longer needed, inspect every returned project-local image with `view_image`, and then accept, reject, retry, or record fallback for each asset. Worker outputs are candidates, not final assets, until the main workflow has inspected them and updated the relevant manifest or review note.

If an image worker fails, record the failure in the relevant manifest or review file and retry when appropriate. If subagent tooling is unavailable, generate the image in the main workflow and record `fallback_source: main_workflow` or equivalent notes. If image generation fails completely, use an explicit placeholder only when the workflow allows placeholders; mark the asset unresolved and do not present it as final. For logo, wordmark, or brand-mark failures, do not create a code-generated SVG fallback.

Do not delegate approval decisions to image workers. Workers create or edit visual artifacts and report paths; the main workflow inspects, asks any required approval question, and decides the next phase.

## User Approval Gates

Direction concepts, brand boards, and page concepts require explicit user approval after generation and inspection.

After a generated or edited direction-concept image passes internal rejection checks and has been inspected with `view_image`, ask the user which direction to use before writing `direction-inventory.json` or generating the brand board. In unattended mode, select the strongest direction yourself and mark it provisional.

After a generated or edited brand-board image passes internal rejection checks and has been inspected with `view_image`, ask the user whether to use it before writing `design-system.json` or `tokens.css`.

After a generated or edited page-concept image passes internal rejection checks and has been inspected with `view_image`, ask the user whether to use it before writing `page-blueprint.json`, `concept-region-inventory.md`, `page-layout-contract.md`, `asset-manifest.json`, or page code.

Use the Codex user-input/question tool when available. Provide choices equivalent to:
- `Yes, use this` as the recommended choice
- `No, make a new one`

If the user approves, continue the workflow from the inspected image. If the user asks for a new image, regenerate before deriving downstream artifacts. If the user gives free-form revision notes, use those notes as the edit brief, inspect the revised image, and ask again with the same two approval choices. In a one-shot Maquette workflow, do not treat direction concepts, brand boards, or page concepts as approved merely because the run is provisional; the approval question is still required unless the user explicitly asked for an unattended run.

An unattended run requires explicit language such as `unattended`, `do not ask questions`, `no pauses`, `skip approval questions`, or `make all decisions yourself`. Do not infer unattended mode from phrases such as `one pass`, `full workflow`, `final homepage`, `fresh disposable test`, `run a Maquette test`, or `complete it end to end`; those still use automatic image workers when available and still require the brand-board/page-concept approval gates unless the user explicitly skipped approval questions.

## Inspectability gates

Generated direction concepts, boards, and sheets are approval artifacts only when they are readable at normal preview size. Deterministic component contract posters are review aids; the structured JSON contract is authoritative.

- Direction concepts are greenfield visual-direction artifacts. They should show page hierarchy, tone, density, component needs, asset needs, and responsive implications, but they are not final page implementation contracts.
- Brand boards are the visual-system contract. They must use a 1:1 square composition by default and focus on visual-system fundamentals, not exhaustive component inventories.
- Brand boards must specify font direction and fallback strategy, but must not show detailed component inventories or button/input/card variant specs.
- Brand boards must not contain logo-like marks, brand-name mastheads, large product-name treatments, monograms, seals, badges, app icons, emblems, or trademark-like elements.
- Structured component contracts are the default implementation contracts for selectors, states, slots, dimensions, accessibility hooks, and token intent. Deterministic posters rendered from those contracts should be readable, but they must not replace the JSON contract as source of truth.
- Visual component sheets are optional explicit-request presentation artifacts. They must use 1:1 square composition and be split into focused 1:1 sheets when a single sheet would become cluttered or uninspectable.
- Component sheets should be categorized when needed: core primitives, navigation/layout, data/display, and cards/composites. The core primitives sheet comes first; focused follow-up sheets are preferred over crowded mega-sheets.
- Multi-contract or multi-sheet component work must be sequential: author/review the structured contract, optionally inspect a visual sheet, build a componentized reference, review, and document reusable component APIs from the current artifact before creating the next artifact. The current artifact must produce concrete category-prefixed batch artifacts under `.maquette/components/` before the next artifact is created, with structured contracts under `.maquette/components/contracts/`, CSS under `.maquette/components/css/`, and JS under `.maquette/components/js/`; retrospective logs after all artifacts are generated are not sufficient.
- Each component contract or visual-sheet batch must complete screenshot review or documented manual visual review against the contract and any visual sheet before the next artifact is created.
- Repeated-card sheets must show shared media/header/body/footer/action anatomy, consistent badge or eyebrow placement, equal-height cards, and bottom-pinned action rows when card grids are relevant.
- Sites or pages with global navigation need inspectable responsive navigation coverage before implementation: desktop inline nav, tablet/mobile collapsed state, menu toggle, expanded panel or drawer, active/focus states, and visible icons.
- Page concepts with headers or primary navigation must define desktop, tablet, and mobile behavior. A desktop-only navigation concept is incomplete.
- Page concepts must make visible regions identifiable for pre-code inventory: header, nav, hero, sidebars, annotations, product grids, promo cards, newsletter, footer, bottom bars, mobile/tablet callouts, app/device modules, social links, and imagery.
- Page concepts with product, pricing, service, offer, or promo cards must make repeated-card anatomy and action-row alignment clear enough to implement.
- Page and component concepts that need raster images must make required asset types identifiable, such as hero images, product-card images, promo images, lifestyle/story images, footer/app/device images, and background textures.
- Reject, regenerate, edit, or split an artifact before using it if labels are too small, unrelated families are crammed together, elements overlap, implementation notes dominate, or the image cannot guide implementation without heavy zooming.

## Fidelity gates

In Greenfield Website Mode, create `.maquette/direction/direction-inventory.json` after direction approval and before the brand kit. Treat it as the bridge from exploratory image to reusable system: record visual direction, hierarchy, component needs, asset needs, responsive implications, accessibility risks, ambiguities, and page-local candidates.

After brand-board approval, create an executable brand canon before components or pages are accepted: `.maquette/brand/design-system.json`, `.maquette/brand/tokens.css`, `.maquette/brand/brand-primitives.css`, `.maquette/brand/brand-proof.html`, and `.maquette/brand/brand-proof-review.md`. Capture a brand-proof screenshot when browser tooling is available. Components and pages must import the canonical token and primitive CSS, then preserve the approved brand fingerprint instead of reinterpreting the brand board from scratch.

Before page implementation, create a concept-region inventory, page layout contract, and generated asset manifest. Visible concept regions default to implementation, not omission. Any region or asset that is simplified, omitted, implemented differently, blocked on assets, or blocked on component coverage must be documented with a concrete reason before coding proceeds.

The page layout contract should translate the inspected page concept into implementable layout rules before code is written: section order, relative section heights, density/compactness, background bands, grid behavior, image aspect ratios, image crop and fit behavior, footer structure, legal/bottom rows, and mobile stacking. Terminal sections such as impact strips, newsletter blocks, rich footers, app/download areas, social areas, and legal rows must be included. Blank image-container bands or letterboxing are deviations unless the contract explicitly accepts them.

Before component coding, write a sheet inventory that lists structured contract batches, visual sheets when used, component families, variants, states, larger patterns, unclear areas, missing coverage, and the decision to implement, revise the contract, create a visual sheet, or create another focused contract.

Before accepting component implementation, compare the coded componentized reference screenshots against the structured component contracts and any visual component sheets with the component fidelity rubric:
- coverage: contracted component families, variants, and states are implemented
- visual match: match the structured contract and approved brand closely enough after screenshot review, or match the visual sheet when one was explicitly used
- anatomy match: cards, navigation, forms, tables, and composites preserve visible structure
- responsive match: mobile, tablet, and navigation behavior shown or implied by the sheet is represented
- implementation quality: semantic HTML, token usage, working icons, readable active/selected/inverse states, no unintended overflow, and no unreadable or overlapping text

After the componentized reference passes review, ensure the component CSS/JS and component catalog expose the reusable APIs, slots, states, JS behavior, and usage examples proven by that reference. Page implementations should consume the reusable catalog, CSS, and JS, not copy the reference page layout.

Use Maquette's bundled scripts for optional QA tooling checks, reference-image sharpening, deterministic contract-poster rendering, screenshot capture, linked asset validation, responsive audits, contrast/API checks, JSON validation, and page-consumption smoke checks when available. Optional Node dependencies should be resolved from the current project; do not rely on global npm installs. For component workflows, check optional QA tooling immediately after the brand kit exists and before component contracts, visual sheets, deterministic posters, or component code are created. Treat partial QA availability as missing QA tooling: if browser QA can run but `ajv` or `ajv-formats` is missing, schema validation is still blocked and requires an install decision. When a generated raster reference is too soft or compressed for confident inspection, run `ensure-qa-tooling.mjs --check-image-prep`; if project-local `sharp` is available, use `sharpen-reference-image.mjs` to create a separate same-size `*-sharpened.png` reference while preserving the raw image as ground truth. Do not use image prep to upscale or resize Maquette references. If `ensure-qa-tooling.mjs` reports missing packages, blocked QA capabilities, or `installDecisionRequired: true`, ask the user through the Codex user-input/question tool before installing project-local dependencies or skipping those checks, unless the user already declined for this run or installation is impossible. If the user agrees, run the project-local install commands reported by the tooling check, including `sharp` when reference sharpening will be used and browser/schema dependencies as needed; install Chromium only when browser QA requires it. If the user declines, continue with manual review and record the missing tooling. Generated run-local scripts are fallback-only and must be documented in the relevant approval notes with the reason the bundled helper did not cover the scenario.

No silent simplification is allowed across brand, component, or page phases. If implementation cannot match a generated artifact, record the deviation, reason, and recommended follow-up in the relevant `approved.md` or `review.md`.

## Responsive QA

When browser tooling is available, page and component QA must include responsive navigation and overflow checks at 390, 768, 1024, 1280, and 1440px.

- Primary navigation must not create document-level horizontal overflow.
- Tablet/mobile primary navigation should use an accessible menu toggle plus stacked panel or drawer, not horizontal-scrolling nav as the default.
- For tablet/mobile, inspect closed and open navigation states and record open-state screenshot paths.
- If a menu toggle exists, click it and verify `aria-expanded` changes.
- Opened mobile/tablet drawers must remain scrollable when content exceeds viewport height, even when body scroll lock is active. Prefer `overflow-y: auto` and `overscroll-behavior: contain`; close controls and links must remain reachable.
- Repeated product-card and comparable card grids must be checked for shared anatomy, equal-height cards, stable badge/eyebrow placement, and aligned CTA, quantity, price, or action rows across varied copy lengths.
- Rich footers must be compared against the concept for logo placement, link columns, social icons, app/download modules, device imagery, legal links, locale/shipping rows, cookie/bottom strips, and brand blurbs. Generic footer simplification fails unless documented.
- Page compactness and vertical rhythm must be compared against the concept for the top, middle, and bottom of the page. A matching hero does not compensate for terminal sections that become materially taller, looser, or more generic than the concept.
- Major media containers must be checked for intended image fit and crop behavior. Unintended blank bands, letterboxing, or exposed parent backgrounds around fitted images should be fixed before page approval.
- Footer social links shown as icons in the concept must render as recognizable social icons with accessible names, not unrelated generic icons or text abbreviations unless the concept explicitly uses text badges.
- Typography QA must compare coded font family, weight, width, scale, and line-height against the approved visual references. Record font fallback rationale, and avoid `Impact` unless explicitly approved by the brand system.
- Navigation and state contrast QA must check active, selected, current, focus, disabled, inverse, and dark-surface states so text and icons never disappear into their background.

## Final review requirements

Final component and page review files must summarize the generated asset manifest and missing assets, concept-region inventory, page layout contract status, structured contract or visual sheet vs replica fidelity, reusable component readiness, card anatomy alignment, terminal-section compactness, media-container fit/crop results, footer fidelity, mobile drawer scrollability, responsive overflow measurements, open nav screenshots, visual deviations, and fixes. "Screenshots captured" alone is not a sufficient review.

## Transparent image requests

Most Maquette artifacts are opaque boards, sheets, and page concepts. If a task explicitly requests a transparent PNG output, verify that the saved PNG has a real alpha channel before treating it as complete. If the image has a rendered checkerboard or solid background instead of true transparency, leave the original untouched, create a repaired transparent derivative, and verify the repaired PNG before reporting success.

## Editing visible images

When revising a previously generated or local image:
- make the image visible in the conversation first, typically via `view_image`
- ask `image_gen` to edit the visible image
- preserve approved style unless the user requested change

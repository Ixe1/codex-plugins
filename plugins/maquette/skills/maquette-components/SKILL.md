---
name: maquette-components
description: "Build a reusable website component library from an approved brand token set. This skill is image_gen-guided: create focused visual component sheets by default, then derive deterministic CSS contracts and implement componentized replicas that are reusable HTML/CSS/JS from the start."
---

You are responsible for the **website component-library phase**.

Write all Maquette-owned component artifacts under `.maquette/components/` in the current project. Do not create or overwrite root-level website files such as `index.html`.

## Preconditions

Do not start this phase until a brand system exists at:

- `.maquette/brand/design-system.json`
- `.maquette/brand/tokens.css`

Also require a generated and inspected brand board image, such as `.maquette/brand/brand-board-vN.png`, unless the user explicitly asks to skip image generation or the environment does not provide `image_gen`.

If these artifacts are missing, do not invent a component library from raw notes, copied CSS, screenshots, or an existing website alone. Run the brand-kit phase first using `maquette-brand-kit`.

Require user approval of the generated and inspected brand board before expanding the library. In a one-shot unattended `maquette` workflow where the user explicitly asked not to pause, proceed with the brand kit as provisional and record that status.

## Non-negotiable image_gen policy

If the `image_gen` tool is available, you **must use it** in this phase.
Follow `shared/image-gen-workflow.md` for required visual inspection, same-turn continuation, and conditional transparent PNG verification.
Do not go straight from tokens to coded components with no image pass.
Visual component sheets are the default and primary implementation image artifacts. They must show real component anatomy, density, states, layout, repeated-card alignment, responsive navigation states, tables/cards/forms, and footer/social modules as needed. Do not rely on image-generated CSS text as the only component-sheet source of truth.

Use image generation to:
- create a focused 1:1 visual component sheet for the current component family from the approved brand board, design-system tokens, product brief, and required coverage
- create additional focused 1:1 visual component sheets one at a time when the product needs more component, data-pattern, responsive-navigation, repeated-card, footer/social, or composite coverage
- create optional CSS-contract poster images only as supplemental/non-authoritative references when explicitly requested or when a text poster would materially help clarify a narrow selector contract after the visual sheet exists

Default visual-sheet workflow:
- generate one focused 1:1 visual component sheet from the approved brand board, design-system tokens, product brief, and current component family
- use `assets/component-sheet-prompt.md` by default
- inspect the generated sheet with `view_image` using its absolute filesystem path before writing code, preferring a `...-vN-2k.png` derivative when available
- derive `.maquette/components/contracts/<batch-slug>.contract.css` deterministically from the inspected visual sheet, approved tokens, and implementation decisions before writing final CSS
- translate any visual raw colors, sizes, or font impressions back to approved token variables before writing final CSS
- record in the batch review that the source artifact is a visual component sheet and that the contract CSS is deterministic, not image-generated CSS text

When a page or site has global navigation, responsive navigation primitives are required component coverage, not a page-only afterthought.

The visual component sheet is the default source of truth for component anatomy, variants, states, density, spacing, radius, shadows, polish, responsive behavior, and layout relationships. If it conflicts with the brand board, preserve the brand foundation where possible, but the current component artifact wins for component anatomy, variants, state styling, density, spacing, radius, shadows, and polish; record the inconsistency and resolution in `.maquette/components/approved.md`.

Component sheets are fidelity targets, not loose inspiration or a menu of reusable ideas. Every visible region in the sheet must be accounted for region-by-region before the batch can be accepted: component cells, state strips, annotations, responsive mockups, composite examples, repeated-card rows, table sections, footer/social modules, and any visible pattern or variant. Reusable component API extraction happens after the faithful sheet replica proves that visible sheet composition; it must not replace the full replica.

CSS-contract poster images are brittle because image generation often renders exact CSS text poorly. Use deterministic code/text contracts derived after visual inspection as the implementation bridge. Supplemental CSS-contract posters may exist only as non-authoritative references unless the user explicitly requests them; they do not replace visual sheet inspection.

The component-library phase has one implementation target:
- **Componentized replica/reference**: `.maquette/components/replica-gallery.html`, `.maquette/components/css/components.css`, `.maquette/components/js/components.js`, and `.maquette/components/component-catalog.json` match the approved visual component sheets while exposing reusable components, variants, states, slots, and usage examples for the pages phase.

Do not build a throwaway visual replica and then a separate simplified gallery. The coded replica/reference must use reusable classes, tokens, component slots, state hooks, and JS behaviors from the start so pages can consume the component API without copying the sheet layout.

If a local board or sheet image must be edited, first make it visible in the conversation with `view_image` using its absolute filesystem path, then ask `image_gen` to edit the visible image.

After every `image_gen` create or edit step, inspect the generated image with `view_image` using its absolute filesystem path before treating it as the design source. Do not derive component specifications or implementation details from the prompt alone. If the generated file cannot be inspected, state that limitation and treat the image as unverified.
Reject, regenerate, or split a sheet before implementation if it is not readable and useful at normal preview size.

When image-worker subagents are explicitly authorized for the current run, run visual component-sheet generation, optional CSS-contract poster supplemental generation, and image editing in a dedicated image worker subagent. If the image-worker decision is unresolved, follow the preflight authorization question in `shared/image-gen-workflow.md`; do not silently skip the image-worker path. Each image worker may create or edit exactly one image artifact. The worker must return structured metadata: raw source path, project raw path, derivative paths if any, dimensions when known, derivative method, JSON sidecar path, and which artifact the main workflow should inspect downstream. The main workflow must create any accepted/available reference derivative, inspect the exact downstream artifact with `view_image`, inventory it, derive deterministic contracts, and perform implementation and QA. Generate in the main workflow only when image workers are explicitly declined, unavailable after asking, or explicitly bypassed by unattended/no-question language; record the exact reason.

Only skip image generation if:
- the user explicitly tells you not to use it, or
- the environment genuinely does not provide the tool

## Required outputs

Always create or update:

- `.maquette/components/component-catalog.json`
- `.maquette/components/sheet-inventory.md`
- `.maquette/components/sheet-implementation-log.md` when more than one sheet is needed
- `.maquette/components/css/components.css`
- `.maquette/components/js/components.js`
- `.maquette/components/replica-gallery.html`
- `.maquette/components/approved.md`

For each sheet batch in a multi-artifact run, also create immutable category-prefixed batch evidence directly under `.maquette/components/` before generating the next sheet:

- `contracts/<batch-slug>.contract.css` derived deterministically from the inspected visual sheet
- `<batch-slug>.replica.html`
- `css/<batch-slug>.components.css`
- `js/<batch-slug>.components.js` when the batch needs behavior
- `<batch-slug>.component-catalog.json`
- `<batch-slug>.review.md`

Keep deterministic contracts under `.maquette/components/contracts/`, implementation CSS under `.maquette/components/css/`, and JS under `.maquette/components/js/`. Do not put batch artifacts in nested per-batch folders by default; nested folders are legacy-compatible only.

When possible, also create:

- `.maquette/components/replica-gallery.png`
- `.maquette/components/component-sheet-vN.png`
- `.maquette/components/component-sheet-vN.json`
- `.maquette/components/component-sheet-vN-2k.png` and `.maquette/components/component-sheet-vN-2k.json` when optional reference image-prep tooling is available or approved
- additional focused sheet images such as `.maquette/components/component-sheet-data-vN.png`, `.maquette/components/component-sheet-forms-vN.png`, or `.maquette/components/component-sheet-composites-vN.png` when needed
- optional supplemental CSS-contract poster images such as `.maquette/components/component-sheet-forms-css-contract-vN.png`, with sidecars and `-2k` derivatives when used as Maquette reference artifacts

The catalog JSON must validate against `shared/component-catalog.schema.json`.

## Workflow

1. Read `.maquette/brand/design-system.json` and `.maquette/brand/tokens.css`.
2. Run the optional QA tooling check before generating component sheets, supplemental CSS-contract posters, or component code.
   - Use `shared/scripts/ensure-qa-tooling.mjs --project . --check-browser --check-image-prep` when the script is available and generated raster references are likely to be inspected or transcribed at low resolution.
   - If `sharp` is available, Maquette may preprocess Maquette reference images with `shared/scripts/safe-upscale-image.mjs` to create a separate `...-vN-2k.png` before visual transcription or screenshot comparison. Use `--size 2048` for 1:1 visual component sheets. Keep the raw `...-vN.png` reference as ground truth and do not overwrite it.
   - If `sharp` is missing but image preprocessing would materially improve fidelity, ask before installing `sharp` in the project or continuing with the original reference.
   - Treat partial QA availability as missing QA tooling. For example, if `playwright` and `ajv` are available but `ajv-formats` is missing, browser QA can run but schema validation is still blocked.
   - If `ensure-qa-tooling.mjs` reports any missing packages, blocked QA capabilities, or `installDecisionRequired: true`, ask the user through the Codex user-input/question tool whether to install the missing project-local packages before generating component sheets or supplemental CSS-contract posters. Use explicit yes/no choices.
   - Do not silently continue with manual JSON syntax validation in place of schema validation when only `ajv-formats` or `ajv` is missing. Ask first, unless the user already declined installation for this run or the environment cannot install packages.
   - If the user agrees, run the project-local install command reported by `ensure-qa-tooling.mjs`, such as `npm --prefix <projectRoot> i -D playwright ajv ajv-formats sharp`, and `npm --prefix <projectRoot> exec playwright install chromium` when Chromium is required, then continue with automated QA. Include `sharp` when image-prep will be used. Do not run plain `npm i -D ...` from a workspace without `package.json`.
   - If the user declines or the install is not possible, continue with manual review and record the missing tooling in `.maquette/components/approved.md`.
   - Do not postpone this decision until after component implementation.
3. Determine the ordered sheet batches needed for the product before generating images.
   - Use this order: core primitives, navigation/layout, data/display, cards/composites, then any focused follow-up sheets.
   - Core primitives is always first.
   - Add navigation/layout when global navigation exists or is likely.
   - Add data/display for dense data, dashboards, server lists, tables, maps, calendars, editors, timelines, complex workflows, or filter builders.
   - Add cards/composites for reusable composites, repeated cards, product cards, pricing/service cards, newsletter modules, rich footers, or footer/social modules.
   - In the default workflow, every visual component sheet must be 1:1, visually focused by component family or pattern, and detailed enough to inspect component anatomy and states.
   - For every sheet, define required coverage before image generation. Keep one complex family per sheet. Combine at most two tightly related simple families when the sheet will remain readable, such as buttons plus icon buttons or checkbox plus radio. Do not combine forms, actions, navigation, data tables, and cards into one sheet.
   - If the user explicitly asks for a CSS-contract poster, generate it only after the visual sheet exists and treat it as supplemental/non-authoritative.
4. Process each sheet batch sequentially. Do not generate all planned component artifacts before implementation.
   - Generate or revise exactly one focused artifact for the current batch using the approved brand board.
   - Default workflow: generate a focused 1:1 visual component sheet using `assets/component-sheet-prompt.md` and the batch coverage brief.
   - Optional supplemental workflow: generate a focused 1:1 CSS-contract poster using `assets/component-css-contract-prompt.md` only when explicitly requested or justified after the visual sheet exists.
   - It is a workflow violation to generate the navigation/layout, data/display, cards/composites, or follow-up artifact before the current sheet has completed batch evidence.
   - Inspect the generated sheet with `view_image` using its absolute filesystem path before implementing any code from it, preferring `...-vN-2k.png` when a safe-upscale derivative exists.
   - Update `.maquette/components/sheet-inventory.md` for that artifact with every visible region/component/state/pattern in the sheet, including component cells, state strips, annotations, responsive mockups, composite examples, repeated-card rows, table sections, footer/social modules, unclear or cramped areas, missing coverage, required raster asset types, and the implementation status for each region: implemented, partial, simplified, omitted, approved omission, needs regeneration, or blocked with reason.
   - Derive `.maquette/components/contracts/<batch-slug>.contract.css` from the inspected visual sheet before writing implementation CSS. This file is the human-readable bridge from visual inspection to code: preserve every visible region's component anatomy, selector intent, slots, states, sizing guidance, responsive behavior, and intentionally normalized implementation decisions. The contract must include selectors, slots, and state hooks for every visible sheet region, not only the components needed by the first page.
   - Reject, regenerate, or split a visual sheet if labels are too small, unrelated families are crammed into tiny cells, components overlap, full tables or dashboards crowd out primitives, implementation notes dominate, decorative details obscure component anatomy, or the image cannot guide implementation without heavy zooming.
   - Reject, regenerate, or omit a supplemental CSS-contract poster if text is too small, non-component selectors appear, `body`/`html`/gallery/panel/reset/page-layout rules dominate, selectors outside the allowlist appear, unrelated families are crowded together, or the poster is too generic to clarify the deterministic contract.
   - If the current artifact passes inspection, build that batch's artifacts and complete screenshot/manual review before generating the next sheet.
5. Build the coded componentized replica/reference as a batch-by-batch fidelity target.
   - Maintain `.maquette/components/replica-gallery.html` as the combined component reference.
   - For multi-artifact runs, first create `.maquette/components/<batch-slug>.replica.html` for the current sheet, with CSS in `.maquette/components/css/<batch-slug>.components.css` and JS in `.maquette/components/js/<batch-slug>.components.js` when behavior is needed. The combined `replica-gallery.html` can be assembled or updated after the batch replica exists.
   - In the default workflow, the replica should make the visual sheet and derived contract reviewable in the browser while using reusable component classes, slots, state attributes, and minimal JS hooks from the start.
   - The batch replica must recreate the full visible sheet composition for the current artifact before reusable API extraction is considered complete. Implement selected page-needed families only after the full sheet has been faithfully represented, not instead of representing the whole sheet.
   - The replica should implement the derived contract's selector contract, states, slots, dimensions, token intent, and visual anatomy, then use the rendered browser screenshot as the visual correction target. Do not copy raw visual colors or font impressions when matching approved tokens exist.
   - Page implementations should consume the component catalog, CSS, JS, and usage examples extracted from this componentized reference. They should not copy the reference page layout.
   - Batch replica HTML should link brand tokens directly from `../brand/tokens.css`, batch CSS from `css/<batch-slug>.components.css`, and batch JS from `js/<batch-slug>.components.js`. Prefer HTML stylesheet links over CSS `@import` so local file paths stay shallow and inspectable.
6. If screenshot tooling is available, capture the current componentized replica/reference evidence. Use Maquette's bundled scripts when possible, especially `shared/scripts/ensure-qa-tooling.mjs`, `shared/scripts/capture-browser.mjs`, `skills/maquette-components/scripts/capture-gallery.mjs`, and `shared/scripts/audit-responsive-layout.mjs`; document manual review mode when unavailable.
   - Keep Playwright/Chromium screenshot capture headless.
   - Ensure every browser/session opened for screenshot capture is closed before finishing.
   - If cleanup fails, record the failed cleanup command or operation in the final response.
   - Capture desktop, tablet, and mobile reference screenshots when possible; at minimum use representative widths 390, 768, and 1440 when browser tooling is available.
   - For every sheet batch, capture or manually review the batch replica before generating the next sheet. Record the screenshot paths, manual artifacts, or blocked screenshot reason in `<batch-slug>.review.md`.
   - Do not mark `completed_before_next_sheet: true` unless the batch HTML, CSS, JS, catalog snapshot, review file, and screenshot/manual review evidence exist before the next sheet is generated.
   - Do not mark `completed_before_next_sheet: true` unless the visual sheet exists, the sheet inventory covers every visible region, the deterministic contract covers every visible region, the batch replica visually recreates the full sheet composition, CSS/JS/catalog/review artifacts exist, screenshot or manual visual evidence exists, and omissions are zero or explicitly approved and documented.
7. Compare the current coded replica against the current approved visual sheet and make focused corrections.
   - Use the component fidelity rubric: coverage, visual match, anatomy match, responsive match, and implementation quality.
   - Coverage means every visible sheet region, component family, important variant, major state, pattern, and responsive mockup from the sheet is implemented in the batch replica or explicitly approved and documented as an omission. Partial, simplified, missing, or deferred regions fail coverage unless the review names the exact region and reason.
   - Visual match means color, typography, spacing, radius, shadow, density, polish, and layout relationships visibly follow the inspected sheet and approved brand.
   - Anatomy match means cards, navigation, forms, tables, and composites preserve the visible structure and slot placement.
   - Responsive match means mobile, tablet, and navigation behavior shown or implied by the sheets is represented in the componentized reference.
   - Implementation quality means semantic HTML, token usage, working icons, readable active/selected/inverse states, no unintended overflow, and no unreadable or overlapping text.
   - A score of 5 is a strong match, 4 is acceptable, 3 requires a fix or explicit documented block, and below 3 requires regeneration or rework before approval.
   - Make at least one focused correction pass when any rubric category fails before recording final status.
   - Do not generate the next component sheet until this review is complete and the current replica visibly matches the current artifact well enough to pass the rubric or has documented, intentional simplifications.
   - Do not generate the next component sheet when any visible sheet region is missing, simplified, or only partially represented without an explicit documented approval reason.
8. Merge the approved current-batch componentized replica/reference into reusable website primitives and patterns before moving to the next sheet:
   - buttons
   - links
   - icon buttons
   - text inputs
   - textarea
   - select
   - checkbox
   - radio
   - switch
   - slider
   - tabs
   - responsive navigation primitives when the site has global navigation
   - badges
   - alerts
   - cards
   - product cards when the product has merchandise, pricing tiles, service cards with purchase actions, or other repeated sellable items
   - newsletter modules when the page needs newsletter capture
   - footer and social modules when the page or concept includes social links
   - tables
   - modals/tooltips if required by the design system
   - Write the current batch's component proof files under `.maquette/components/`: `contracts/<batch-slug>.contract.css`, `<batch-slug>.replica.html`, `css/<batch-slug>.components.css`, `js/<batch-slug>.components.js` when needed, `<batch-slug>.component-catalog.json`, and `<batch-slug>.review.md`.
   - The batch `<batch-slug>.replica.html` should be both the visual/contract fidelity proof and the reusable API proof for the current sheet. The batch `<batch-slug>.component-catalog.json` should snapshot only the components covered so far or clearly mark the current batch slice.
   - Update `.maquette/components/sheet-implementation-log.md` after each batch with the sheet path, deterministic contract path, replica artifact paths, component artifact paths, catalog snapshot path, screenshot/manual review artifacts, rubric scores, corrections made, simplifications, deferred items, and status.
   - Update `.maquette/components/sheet-implementation-log.md` after each batch with the sheet path, deterministic contract path, replica artifact paths, component artifact paths, catalog snapshot path, screenshot/manual review artifacts, rubric scores, visible region inventory status, visible region implementation status, state-variant representation, desktop/tablet/mobile representation when shown, corrections made, simplifications, deferred items, and status.
   - Mark the batch as `completed_before_next_sheet: true` in the final catalog only if these batch artifacts and screenshot/manual review evidence existed before the next component sheet was generated and every visible region is implemented or explicitly approved and documented as an omission.
   - Only then continue to the next planned sheet batch.
9. Keep component primitives and larger patterns conceptually separate:
   - component sheet: reusable primitives and core states
   - additional focused sheets: dense data patterns and reusable larger composites
   - page concept: page-level composition
10. Use semantic HTML and CSS custom properties.
11. Keep JS minimal and only add it where interactivity requires it.
12. Build the final merged componentized reference page at `.maquette/components/replica-gallery.html` after all required sheet batches are complete.
   - The reference should demonstrate component APIs, slots, states, and realistic usage while preserving enough source-artifact grouping to compare sheet batch by batch.
   - Include the same component families, variants, states, card anatomy, responsive navigation examples, product cards, newsletter modules, footer/social modules, density, spacing, and polish proven in the batch replicas.
   - For repeated cards, use shared media/header/body/footer/action slots, consistent badge or eyebrow placement, equal heights, and bottom-pinned action rows.
   - Link final CSS as `css/components.css` and final JS as `js/components.js`; keep the brand token stylesheet link as `../brand/tokens.css`.
13. If screenshot tooling is available, capture the final componentized reference. Use Maquette's bundled capture scripts instead of generating run-local capture code.
   - Keep Playwright/Chromium screenshot capture headless.
   - Ensure every browser/session opened for screenshot capture is closed before finishing.
   - If cleanup fails, record the failed cleanup command or operation in the final response.
   - Capture desktop, tablet, and mobile reference screenshots when possible; at minimum use representative widths 390, 768, and 1440 when browser tooling is available.
14. Run the required component QA pass:
   - Fail and fix if the implementation omits derived contract selectors, states, slots, dimensions, token intent, or visible sheet anatomy, or if the screenshot is visually too generic for the approved brand. Also fail and fix when the reference is significantly simpler, sparser, less polished, or less sophisticated than that sheet.
   - Fail and fix if the sheet inventory does not list every visible region, if the deterministic contract omits selectors/slots/states for any visible region, if state variants shown on the sheet are not represented, if desktop/tablet/mobile variants shown on the sheet are not represented, or if any simplification is not explicitly approved and documented.
   - Fail and fix the componentized reference if it lacks reusable component APIs, slots, states, accessibility hooks, or realistic usage examples.
   - Check visual component sheet coverage: every visible component family, important variant, major state, repeated-card anatomy pattern, responsive navigation state, product-card pattern, newsletter module, and footer/social module shown in the artifact should appear in the componentized reference or be documented as intentionally deferred with a reason.
   - Check icon and icon-button contrast in every visible state, especially active, selected, disabled, inverse, and dark-background states.
   - Check that icon-only buttons and compact controls visibly render supported icons and are not blank.
   - Check responsive navigation primitives when present: desktop inline nav, tablet/mobile collapsed nav, menu toggle icon, expanded menu or drawer, active link, focus state, and tap-target sizing.
   - Check variant anatomy parity: variants of the same component should preserve shared media/header/body/footer/action structure unless the difference is intentional and documented.
   - Check repeated card anatomy and alignment: product-card and comparable repeated-card grids must use shared media/header/body/footer/action slots, consistent badge or eyebrow placement, equal-height cards, flex or grid body layout, and bottom-pinned action rows so CTA, quantity, price, and action controls align across cards even when copy length varies.
   - Compare screenshots of repeated-card examples and fail QA if one card's heading, badge, label, content, or action row shifts inconsistently relative to siblings due to optional badges, labels, or differing copy length.
   - Check reference layout fit: wide components such as tables, data grids, charts, timelines, calendars, code blocks, and comparison matrices should default to full-width reference rows; horizontal scrolling should only be expected at genuinely narrow viewports.
   - Check that text, badges, icons, buttons, and table cells do not overlap or become unreadable in the captured screenshot.
   - Run measurable responsive overflow QA when browser tooling is available. Prefer `shared/scripts/audit-responsive-layout.mjs` if present.
   - Run `shared/scripts/validate-linked-assets.mjs` against each batch replica and the final `replica-gallery.html` to verify local stylesheet, script, CSS import, and asset references resolve before moving on.
   - Test at least viewport widths 390, 768, 1024, 1280, and 1440.
   - Prefer capturing full-page reference screenshots for all audited widths when practical.
   - If screenshot capture falls back to a clipped full-document image, record the capture metadata and clipped fallback status in `.maquette/components/approved.md`.
   - For each tested viewport, record `window.innerWidth`, `document.documentElement.scrollWidth`, `document.body.scrollWidth`, and clientWidth/scrollWidth for wide components such as tables, grids, timelines, charts, calendars, code blocks, and comparison matrices.
   - Record top overflow offenders when any are present.
   - Fail and fix the componentized reference if document scroll width exceeds viewport width by more than 1px, unless there is an explicit documented exception.
   - Internal horizontal scrolling for wide components is allowed only when intentional and documented. It should generally not appear on normal desktop or tablet layouts unless the component is truly a data grid that requires it.
   - Horizontal scrolling is not an acceptable default solution for primary navigation on tablet or mobile.
   - Run `shared/scripts/check-component-gallery.mjs` against `.maquette/components/replica-gallery.html` when browser tooling is available to verify active/selected/inverse contrast, required selectors, CSS/JS linkage, nav ARIA hooks, and reusable API readiness.
   - Run `shared/scripts/page-consumption-smoke.mjs` when browser tooling is available to verify a tiny page can consume `css/components.css`, `js/components.js`, and catalog usage examples without copying the replica layout.
   - Run `shared/scripts/validate-artifacts.mjs` when `ajv` and `ajv-formats` are available to validate design-system and component-catalog JSON against Maquette schemas.
   - Use `shared/scripts/ensure-qa-tooling.mjs --project .` to check optional project-local QA dependencies before reporting automated QA as unavailable. Do not assume global npm installs are available.
   - If any optional QA dependency is missing and browser/schema QA would materially improve confidence, ask the user through the Codex user-input/question tool whether to install the missing project-local packages in the current project. This includes partial installs where only `ajv-formats` or `ajv` is missing. Use explicit yes/no choices. If the user agrees, run the project-local commands reported by `ensure-qa-tooling.mjs`, then continue automated QA. If the user declines, continue with manual review and record the missing tooling.
   - Do not generate project-local `.mjs` scripts for capture, responsive audit, contrast/API checks, JSON validation, or page-consumption smoke unless the bundled helper cannot cover the scenario. If a fallback script is generated, list it in `.maquette/components/approved.md` with the reason.
15. Update `.maquette/components/component-catalog.json` with implemented coverage.
   - Record all generated component sheet paths and any supplemental CSS-contract poster paths in a stable place, using `assets.component_sheet_paths` when multiple artifacts exist while preserving `assets.component_sheet_path` for compatibility.
   - Record `.maquette/components/replica-gallery.html` in `assets.replica_gallery_html_path` and `assets.component_reference_html_path`.
   - Record the implementation log with `assets.sheet_implementation_log_path`.
   - Record each sheet batch in `assets.sheet_implementation_batches`, including category, sheet path in the schema's `sheet_path` field, deterministic contract path, replica artifact paths, component artifact paths, catalog snapshot path, review path, review artifact paths, screenshot paths when available, reusable components added, rubric scores, corrections made, simplifications, deferred items, `completed_before_next_sheet`, and status.
   - For each batch, record `visible_region_coverage` and `contract_region_coverage` entries that list every visible region/component/state/pattern, its selectors, slots, represented states, responsive variants when shown, implementation status, evidence paths, and any approved omission reason.
   - Record component sheet vs replica fidelity in `assets.replica_fidelity_review`, including reference sheet paths, review mode, screenshots or manual artifacts, rubric scores, failed categories, corrections made, coverage summary, simplifications, and status.
   - Record reusable component readiness in `assets.reusable_component_review`, including whether component APIs, slots, states, JS behavior, accessibility hooks, and usage examples are ready for page implementation.
   - Each component's `visual_review.reference_image_paths` should include the sheet or sheets that guided that component.
   - Each component should record reusable API details such as slots, required attributes, JS behavior, and usage examples when relevant.
   - Responsive navigation components should record variants such as `desktop-inline`, `tablet-collapsed`, `mobile-collapsed`, `mobile-expanded`, `active`, and `focus-visible` in `implemented_variants` or `implemented_states`.
   - Product-card or repeated-card components should record equal-height behavior, body layout strategy, bottom-pinned action rows, and screenshot evidence for action-row alignment.
16. Summarize gaps, mismatches, approval status, component sheet vs replica fidelity using the rubric, per-batch artifact status, reusable component readiness, brand-board/component-artifact inconsistencies and which artifact won, measured responsive overflow results, screenshot paths or manual review artifacts, repeated-card anatomy and action-row alignment results, open nav screenshot paths when present, accepted scroll exceptions, responsive navigation notes, and icon-rendering notes in `.maquette/components/approved.md`.

## Visual consistency rules

- Follow the approved brand system exactly.
- Do not invent a new visual language.
- Treat 1:1 visual component sheets as componentized reference targets, not loose inspiration.
- Treat deterministic CSS contracts as the implementation bridge derived from visual inspection, not as replacements for visual sheets.
- Reusable component API extraction happens after the coded replica faithfully recreates the sheet composition. Do not skip visible sheet regions because the first page does not need them.
- Keep the reference page layout and reusable component API conceptually separate; page implementations should consume the catalog, CSS, JS, and usage examples, not copy the reference layout.
- Reuse shared tokens everywhere instead of hard-coded one-off values.
- Focus treatments and disabled states must remain consistent across controls.
- The coded componentized reference should be visually pulled toward the approved sheet and brand while honoring the deterministic contract.
- The componentized reference must not silently simplify generated component details. Any missing family, variant, state, density detail, selector, slot, or composite shown in the component sheet must be implemented or explicitly documented with a concrete reason and follow-up.
- Every visible region in the sheet must appear in the inventory, deterministic contract, batch replica, batch review, and catalog coverage data. Missing, partial, or simplified regions block acceptance unless they are explicitly approved/documented with a reason.
- Every icon-only control must have sufficient foreground/background contrast in default, hover, active, selected, disabled, and inverse states.
- Active, selected, and current navigation links must remain readable against their active background, especially on dark or inverse navigation surfaces.
- Component variants should share the same anatomy, spacing rhythm, and action placement unless the catalog explicitly records why a variant differs.
- Repeated cards must share media/header/body/footer/action anatomy, badge and eyebrow placement, and equal-height grid behavior. Card bodies should use flex or grid layout, and primary action rows must be pinned to the bottom so product CTAs, quantity selectors, and comparable actions align across cards with different copy lengths.
- Wide data-dense components should not be squeezed into narrow reference cards on desktop.
- A single mega-sheet is not a goal. Split component guidance into focused sheets whenever the sheet would become cluttered or uninspectable.
- Supplemental CSS-contract posters are optional. Split or skip them whenever generated text would become cluttered, generic, or hard to read.
- Primary navigation must have a responsive component pattern. Prefer desktop inline nav plus tablet/mobile menu toggle with a stacked panel or drawer. Do not rely on document-level horizontal scrolling for primary nav.
- In multi-sheet runs, finish the current sheet's componentized batch replica, deterministic contract, batch CSS/JS, batch catalog snapshot, batch screenshot/manual review, fidelity review, reusable API documentation, and implementation log entry before generating the next component sheet. Retrospective log entries after all artifacts are generated do not satisfy this requirement.
- Prefer Maquette's bundled shared scripts over generated run-local `.mjs` scripts for screenshots, responsive layout auditing, contrast/API smoke checks, page-consumption smoke checks, and JSON validation.

## Review rules

If a reference board, component sheet, or supplemental CSS-contract poster exists:
- compare the coded componentized reference against it
- inspect the rendered screenshot directly
- make one focused correction at a time
- prefer small targeted fixes over wide stylistic rewrites

Before finishing:
- Verify that the implementation matches the deterministic contract's selector contract, states, slots, token intent, and the sheet's component families, variants, states, density, and polish. Use screenshots to correct visual quality. A basic selector page is not sufficient.
- Verify the sheet inventory and batch review explicitly list visible regions, visible regions implemented, state variants represented, desktop/tablet/mobile variants represented when shown, and no unapproved simplification.
- Verify the same componentized reference exposes reusable component APIs, slots, states, JS behavior, accessibility hooks, and usage examples for page implementation.
- Record the component fidelity rubric result for coverage, visual match, anatomy match, responsive match, and implementation quality.
- Verify no icon disappears into its background.
- Verify active, selected, current, and inverse navigation text stays readable against its background.
- Verify same-component variants keep comparable text hierarchy, media/header/body/action placement, and button sizing.
- Verify product-card and repeated-card screenshot examples have shared anatomy, consistent badge/eyebrow placement, and aligned action rows across at least three cards with varied copy length.
- Verify tables and other wide components receive enough horizontal space in the reference.
- If a screenshot shows horizontal scrolling, explain whether it is expected for the viewport or fix the reference layout.
- Verify responsive navigation examples at desktop, tablet, and mobile widths when navigation exists, including closed and open tablet/mobile menu states.
- Verify whole-reference screenshots at mobile, tablet, and desktop widths when browser tooling is available.
- Verify the reusable component API through a page-consumption smoke check when browser tooling is available.
- Verify each multi-sheet batch has concrete category-prefixed files under `.maquette/components/`, with deterministic contracts under `.maquette/components/contracts/`, CSS under `.maquette/components/css/`, and JS under `.maquette/components/js/`, before accepting the final merged library.
- `.maquette/components/approved.md` must summarize component sheet vs replica fidelity, per-sheet implementation log status, per-batch artifact paths, reusable component readiness, measured responsive overflow results, screenshot paths or manual review artifacts, clipped screenshot fallbacks, generated fallback scripts and reasons when any exist, repeated-card anatomy and action-row alignment results, open nav screenshot paths when present, accepted scroll exceptions, responsive navigation notes, brand/component inconsistency notes, and icon-rendering notes. "Screenshots captured" alone is not a sufficient review.

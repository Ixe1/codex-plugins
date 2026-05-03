---
name: maquette-components
description: "Build reusable website components from an approved brand canon and, in page-first workflows, from approved page concept regions. This skill is contract-first: create structured component contracts and browser proofs by default, with visual sheets only when explicitly requested."
---

You are responsible for the **website component-library phase**.

Write all Maquette-owned component artifacts under `.maquette/components/` in the current project. Do not create or overwrite root-level website files such as `index.html`.

## Preconditions

Do not start this phase until a brand system exists at:

- `.maquette/brand/design-system.json`
- `.maquette/brand/tokens.css`
- `.maquette/brand/brand-primitives.css`
- `.maquette/brand/brand-proof.html`

Also require a generated and inspected brand board image, such as `.maquette/brand/brand-board-vN.png`, unless the user explicitly asks to skip image generation or the environment does not provide `image_gen`.

If these artifacts are missing, do not invent a component library from raw notes, copied CSS, screenshots, or an existing website alone. Run the brand-kit phase first using `maquette-brand-kit`.

Require user approval of the generated and inspected brand board before expanding the library. In a one-shot unattended `maquette` workflow where the user explicitly asked not to pause, proceed with the brand kit as provisional and record that status.

## Component contract policy

The default component workflow is structured-contract first. The coding model owns token names, CSS values, selectors, states, breakpoints, accessibility hooks, and component APIs. Do not rely on image-generated text as the source of CSS truth.

Default contract workflow:
- create one focused `.maquette/components/contracts/<batch-slug>.contract.json` from the approved brand board, design-system tokens, product brief, direction inventory when present, approved page concept region when present, visual implementation contract when present, current component family, and strict selector allowlist
- validate the structured contract against `shared/component-contract.schema.json` when schema validation is available
- optionally render a deterministic poster such as `.maquette/components/contracts/<batch-slug>.contract.svg` from that JSON using `shared/scripts/render-component-contract-poster.mjs`
- inspect the deterministic poster only as a readability/review aid; the JSON contract remains authoritative
- build the componentized replica/reference from the structured contract and approved tokens
- treat browser screenshots as the primary visual validation artifact

Use `image_gen` in this phase only when the user explicitly asks for visual component sheets as a presentation artifact:
- create or edit a focused 1:1 visual component sheet only when explicitly requested
- inspect every generated visual sheet with `view_image` before deriving any component decisions from it

If a visual component sheet and structured contract conflict, the approved brand canon and structured contract win for implementation details. The visual sheet can inform presentation notes; it does not override design-system JSON, token CSS, brand primitive CSS, accessibility requirements, or component APIs.

When a page or site has global navigation, responsive navigation primitives are required component coverage, not a page-only afterthought.

The structured component contract is the default source of truth for selectors, states, sizing, spacing, token intent, accessibility hooks, and component anatomy. If it conflicts with the brand canon, the brand canon wins for primitive color, typography, spacing, radius, shadow, surface, and state language unless the design-system JSON and brand proof are intentionally updated first. Record any inconsistency and resolution in `.maquette/components/approved.md`.

The deterministic poster is not a creative visual design target. Use it to review contract readability and selector coverage, then rely on rendered browser screenshots and the component fidelity rubric to correct visual quality. If the structured contract is generic or too broad, tighten the selector allowlist or split the family before implementation. Do not generate a visual component sheet unless the user explicitly asks for one.

The component-library phase has one implementation target:
- **Componentized replica/reference**: `.maquette/components/replica-gallery.html`, `.maquette/components/css/components.css`, `.maquette/components/js/components.js`, and `.maquette/components/component-catalog.json` match the approved structured component contracts and any visual component sheets while exposing reusable components, variants, states, slots, and usage examples for the pages phase.

Do not build a throwaway visual replica and then a separate simplified gallery. The coded replica/reference must use reusable classes, tokens, component slots, state hooks, and JS behaviors from the start so pages can consume the component API without copying the sheet layout.

If a local board or sheet image must be edited, first make it visible in the conversation with `view_image`, then ask `image_gen` to edit the visible image.

After every `image_gen` create or edit step, inspect the generated image with `view_image` before treating it as the design source. Do not derive component specifications or implementation details from the prompt alone. If the generated file cannot be inspected, state that limitation and treat the image as unverified.
Reject, regenerate, or split a sheet before implementation if it is not readable and useful at normal preview size.

When image-worker subagents are available and the user explicitly requested a visual component sheet, run visual-sheet generation and image editing in a dedicated image worker subagent automatically. Do not ask whether to use image workers. The worker should return the exact saved image path and the project-local `.maquette/components/component-sheet-*-vN.png` path. The main workflow must inspect the returned image with `view_image`, inventory it, reconcile it with the structured contract, and perform implementation and QA.

## Required outputs

Always create or update:

- `.maquette/components/component-catalog.json`
- `.maquette/components/sheet-inventory.md`
- `.maquette/components/sheet-implementation-log.md` when more than one sheet is needed
- `.maquette/components/css/components.css`
- `.maquette/components/js/components.js`
- `.maquette/components/replica-gallery.html`
- `.maquette/components/approved.md`

For each contract or visual-sheet batch in a multi-artifact run, also create immutable category-prefixed batch evidence directly under `.maquette/components/` before creating the next batch:

- `contracts/<batch-slug>.contract.json`
- `contracts/<batch-slug>.contract.svg` when a deterministic poster is rendered
- `component-sheet-<batch-slug>-vN.png` when a visual component sheet is generated
- `<batch-slug>.replica.html`
- `css/<batch-slug>.components.css`
- `js/<batch-slug>.components.js` when the batch needs behavior
- `<batch-slug>.component-catalog.json`
- `<batch-slug>.review.md`

Keep structured contracts and deterministic posters under `.maquette/components/contracts/`, implementation CSS under `.maquette/components/css/`, and JS under `.maquette/components/js/`. Do not put batch artifacts in nested per-batch folders by default; nested folders are legacy-compatible only.

When possible, also create:

- `.maquette/components/replica-gallery.png`
- `.maquette/components/component-sheet-vN.png` only when the user explicitly requested visual component sheets
- additional focused sheet images such as `.maquette/components/component-sheet-data-vN.png`, `.maquette/components/component-sheet-forms-vN.png`, or `.maquette/components/component-sheet-composites-vN.png` only when explicitly requested
- deterministic contract posters such as `.maquette/components/contracts/forms.contract.svg`

The catalog JSON must validate against `shared/component-catalog.schema.json`.

## Workflow

1. Read `.maquette/brand/design-system.json` and `.maquette/brand/tokens.css`.
   - Read `.maquette/brand/brand-primitives.css`, `.maquette/brand/brand-proof.html`, and `.maquette/brand/brand-proof-review.md` before creating contracts.
   - Treat the brand proof as the browser-rendered authority for primitive styling. Contracts and component CSS must preserve its palette, typography hierarchy, button geometry, spacing, radius, shadow, surface, and state language.
   - When `.maquette/pages/<page-name>/concept.png`, `concept-region-inventory.md`, or `visual-implementation-contract.md` exists for the current page, read those before contract planning and derive the focused contract from the specific page region it will serve.
2. Run the optional QA tooling check before creating component contracts, visual component sheets, deterministic posters, or component code.
   - Use `shared/scripts/ensure-qa-tooling.mjs --project . --check-browser --check-image-prep` when the script is available and generated raster references are likely to benefit from same-size sharpening before transcription or QA.
   - If `sharp` is available, Maquette may preprocess Maquette reference images with `shared/scripts/sharpen-reference-image.mjs` to create a separate `*-sharpened.png` derivative before visual transcription or screenshot comparison. Keep the raw reference as ground truth and do not overwrite, upscale, or resize it.
   - If `sharp` is missing but image preprocessing would materially improve fidelity, ask before installing `sharp` in the project or continuing with the original reference.
   - Treat partial QA availability as missing QA tooling. For example, if `playwright` and `ajv` are available but `ajv-formats` is missing, browser QA can run but schema validation is still blocked.
   - If `ensure-qa-tooling.mjs` reports any missing packages, blocked QA capabilities, or `installDecisionRequired: true`, ask the user through the Codex user-input/question tool whether to install the missing project-local packages before creating component contracts, visual sheets, deterministic posters, or code. Use explicit yes/no choices.
   - Do not silently continue with manual JSON syntax validation in place of schema validation when only `ajv-formats` or `ajv` is missing. Ask first, unless the user already declined installation for this run or the environment cannot install packages.
   - If the user agrees, run the project-local install command reported by `ensure-qa-tooling.mjs`, such as `npm --prefix <projectRoot> i -D playwright ajv ajv-formats sharp`, and `npm --prefix <projectRoot> exec playwright install chromium` when Chromium is required, then continue with automated QA. Include `sharp` only when image prep will be used.
   - If the user declines or the install is not possible, continue with manual review and record the missing tooling in `.maquette/components/approved.md`.
   - Do not postpone this decision until after component implementation.
3. Determine the ordered contract batches needed for the product before creating contracts or visual sheets.
   - Use this order: core primitives, navigation/layout, data/display, cards/composites, then any focused follow-up sheets.
   - Core primitives is always first.
   - Add navigation/layout when global navigation exists or is likely.
   - Add data/display for dense data, dashboards, server lists, tables, maps, calendars, editors, timelines, complex workflows, or filter builders.
   - Add cards/composites for reusable composites, repeated cards, product cards, pricing/service cards, newsletter modules, rich footers, or footer/social modules.
   - In the default workflow, every structured contract must be focused by component family or pattern.
   - In page-first workflows, every structured contract must cite the approved page concept region it supports and preserve that region's fidelity target. Do not create a generic component gallery first and then let it change the page layout.
   - For every contract, define a strict selector allowlist before authoring it. Keep one complex family per contract. Combine at most two tightly related simple families when the contract will remain readable, such as buttons plus icon buttons or checkbox plus radio. Do not combine forms, actions, navigation, data tables, and cards into one contract.
   - If the user explicitly asks for visual component sheets, every visual sheet must be 1:1 and focused by component family or pattern. Otherwise, do not generate component sheets.
4. Process each contract or visual-sheet batch sequentially. Do not create all planned component artifacts before implementation.
   - Create exactly one focused structured contract for the current batch using the approved brand board, design-system tokens, direction inventory when present, page concept region when present, visual implementation contract when present, and selector allowlist.
   - Default workflow: write `.maquette/components/contracts/<batch-slug>.contract.json` and optionally render `.maquette/components/contracts/<batch-slug>.contract.svg` with `shared/scripts/render-component-contract-poster.mjs`.
   - Explicit visual-sheet workflow only: generate a focused 1:1 visual component sheet using `assets/component-sheet-prompt.md`.
   - It is a workflow violation to create the navigation/layout, data/display, cards/composites, or follow-up artifact before the current contract or sheet has completed batch evidence.
   - Inspect generated visual sheets with `view_image` before deriving any decisions from them. Deterministic posters may be inspected as rendered SVGs or browser artifacts, but the JSON contract is authoritative.
   - Update `.maquette/components/sheet-inventory.md` for that batch with component families, variants, states, larger patterns, unclear areas, missing coverage, required raster asset types, visual sheet usage if any, and the decision to implement, revise the contract, create a visual sheet, or create another focused contract.
   - Reject, regenerate, or split a visual sheet if labels are too small, unrelated families are crammed into tiny cells, components overlap, full tables or dashboards crowd out primitives, implementation notes dominate, decorative details obscure component anatomy, or the image cannot guide implementation without heavy zooming.
   - Reject, revise, or split a structured contract if non-component selectors appear, `body`/`html`/gallery/panel/reset/page-layout rules dominate, selectors outside the allowlist appear, unrelated families are crowded together, or the contract is too generic to guide implementation beyond common defaults.
   - If the current contract and any visual sheet pass inspection/review, build that batch's artifacts and complete screenshot/manual review before creating the next contract or sheet.
5. Build the coded componentized replica/reference as a batch-by-batch fidelity target.
   - Maintain `.maquette/components/replica-gallery.html` as the combined component reference.
   - For multi-artifact runs, first create `.maquette/components/<batch-slug>.replica.html` for the current contract or sheet, with CSS in `.maquette/components/css/<batch-slug>.components.css` and JS in `.maquette/components/js/<batch-slug>.components.js` when behavior is needed. The combined `replica-gallery.html` can be assembled or updated after the batch replica exists.
   - In the default workflow, the replica should make the structured contract visually reviewable in the browser while using reusable component classes, slots, state attributes, and minimal JS hooks from the start.
   - The replica should implement the structured contract's selector contract, states, slots, dimensions, and token intent, then use the rendered browser screenshot as the visual correction target. Import `../brand/tokens.css` and `../brand/brand-primitives.css` in combined proofs and the correct relative equivalents in batch proofs. Do not recreate primitive button, card, input, chip, badge, panel, inverse-surface, or focus styling page-locally when the brand canon defines it.
   - If the batch uses an explicit visual component sheet, the replica should match the current sheet's visual arrangement closely enough to evaluate fidelity while using reusable component classes, slots, state attributes, and minimal JS hooks from the start.
   - Page implementations should consume the component catalog, CSS, JS, and usage examples extracted from this componentized reference. They should not copy the reference page layout.
   - Batch replica HTML should link brand tokens directly from `../brand/tokens.css`, brand primitives from `../brand/brand-primitives.css`, batch CSS from `css/<batch-slug>.components.css`, and batch JS from `js/<batch-slug>.components.js`. Prefer HTML stylesheet links over CSS `@import` so local file paths stay shallow and inspectable.
6. If screenshot tooling is available, capture the current componentized replica/reference evidence. Use Maquette's bundled scripts when possible, especially `shared/scripts/ensure-qa-tooling.mjs`, `shared/scripts/capture-browser.mjs`, `skills/maquette-components/scripts/capture-gallery.mjs`, and `shared/scripts/audit-responsive-layout.mjs`; document manual review mode when unavailable.
   - Keep Playwright/Chromium screenshot capture headless.
   - Ensure every browser/session opened for screenshot capture is closed before finishing.
   - If cleanup fails, record the failed cleanup command or operation in the final response.
   - Capture desktop, tablet, and mobile reference screenshots when possible; at minimum use representative widths 390, 768, and 1440 when browser tooling is available.
   - For every contract or visual-sheet batch, capture or manually review the batch replica before creating the next contract or sheet. Record the screenshot paths, manual artifacts, or blocked screenshot reason in `<batch-slug>.review.md`.
   - Do not mark `completed_before_next_sheet: true` unless the batch HTML, CSS, JS, catalog snapshot, review file, and screenshot/manual review evidence exist before the next contract or sheet is created.
7. Compare the current coded replica against the current structured contract and any approved visual sheet, then make focused corrections.
   - Use the component fidelity rubric: coverage, visual match, anatomy match, responsive match, and implementation quality.
   - Coverage means every contracted component family, important variant, and major state is implemented or explicitly deferred.
   - Visual match means the rendered browser result follows the structured contract and the approved brand. If the batch uses an explicit visual sheet, color, typography, spacing, radius, shadow, density, and polish should visibly follow the sheet where that does not conflict with tokens or contract rules.
   - Anatomy match means cards, navigation, forms, tables, and composites preserve the visible structure and slot placement.
   - Responsive match means mobile, tablet, and navigation behavior shown or implied by the sheets is represented in the componentized reference.
   - Implementation quality means semantic HTML, token usage, working icons, readable active/selected/inverse states, no unintended overflow, and no unreadable or overlapping text.
   - A score of 5 is a strong match, 4 is acceptable, 3 requires a fix or explicit documented block, and below 3 requires regeneration or rework before approval.
   - Make at least one focused correction pass when any rubric category fails before recording final status.
   - Do not create the next component contract or visual sheet until this review is complete and the current replica visibly matches the current contract well enough to pass the rubric or has documented, intentional simplifications.
8. Merge the approved current-batch componentized replica/reference into reusable website primitives and patterns before moving to the next contract or sheet:
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
   - Write the current batch's component proof files under `.maquette/components/`: `contracts/<batch-slug>.contract.json`, `contracts/<batch-slug>.contract.svg` when rendered, visual sheet path when used, `<batch-slug>.replica.html`, `css/<batch-slug>.components.css`, `js/<batch-slug>.components.js` when needed, `<batch-slug>.component-catalog.json`, and `<batch-slug>.review.md`.
   - The batch `<batch-slug>.replica.html` should be both the visual/contract fidelity proof and the reusable API proof for the current contract or sheet. The batch `<batch-slug>.component-catalog.json` should snapshot only the components covered so far or clearly mark the current batch slice.
   - Update `.maquette/components/sheet-implementation-log.md` after each batch with the structured contract path, deterministic poster path when present, visual sheet path when used, replica artifact paths, component artifact paths, catalog snapshot path, screenshot/manual review artifacts, rubric scores, corrections made, simplifications, deferred items, and status.
   - Mark the batch as `completed_before_next_sheet: true` in the final catalog only if these batch artifacts and screenshot/manual review evidence existed before the next component contract or sheet was created.
   - Only then continue to the next planned contract or sheet batch.
9. Keep component primitives and larger patterns conceptually separate:
   - brand proof: reusable primitives and core states
   - additional focused contracts: dense data patterns and reusable larger composites
   - page concept: page-level composition
10. Use semantic HTML and CSS custom properties.
11. Keep JS minimal and only add it where interactivity requires it.
12. Build the final merged componentized reference page at `.maquette/components/replica-gallery.html` after all required contract or sheet batches are complete.
   - The reference should demonstrate component APIs, slots, states, and realistic usage while preserving enough source-artifact grouping to compare contract/sheet batch by batch.
   - Include the same component families, variants, states, card anatomy, responsive navigation examples, product cards, newsletter modules, footer/social modules, density, spacing, and polish proven in the batch replicas.
   - For repeated cards, use shared media/header/body/footer/action slots, consistent badge or eyebrow placement, equal heights, and bottom-pinned action rows.
   - Link final CSS as `css/components.css` and final JS as `js/components.js`; keep the brand token stylesheet link as `../brand/tokens.css`.
13. If screenshot tooling is available, capture the final componentized reference. Use Maquette's bundled capture scripts instead of generating run-local capture code.
   - Keep Playwright/Chromium screenshot capture headless.
   - Ensure every browser/session opened for screenshot capture is closed before finishing.
   - If cleanup fails, record the failed cleanup command or operation in the final response.
   - Capture desktop, tablet, and mobile reference screenshots when possible; at minimum use representative widths 390, 768, and 1440 when browser tooling is available.
14. Run the required component QA pass:
   - Fail and fix if the implementation omits contract selectors, states, slots, dimensions, accessibility hooks, or token intent, if it does not import the brand token and primitive CSS, or if the screenshot is visually too generic for the approved brand proof. If the batch uses an explicit visual component sheet, also fail and fix when the reference is significantly simpler, sparser, less polished, or less sophisticated than that sheet.
   - Fail and fix the componentized reference if it lacks reusable component APIs, slots, states, accessibility hooks, or realistic usage examples.
   - Check structured contract and visual sheet coverage: every contracted component family, important variant, major state, repeated-card anatomy pattern, responsive navigation state, product-card pattern, newsletter module, and footer/social module should appear in the componentized reference or be documented as intentionally deferred with a reason.
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
   - Run `shared/scripts/validate-artifacts.mjs` when `ajv` and `ajv-formats` are available to validate direction-inventory, design-system, and component-catalog JSON against Maquette schemas.
   - Use `shared/scripts/ensure-qa-tooling.mjs --project .` to check optional project-local QA dependencies before reporting automated QA as unavailable. Add `--check-image-prep` when same-size reference sharpening would materially improve inspection. Do not assume global npm installs are available.
   - If any optional QA dependency is missing and browser/schema/image-prep QA would materially improve confidence, ask the user through the Codex user-input/question tool whether to install the missing project-local packages. This includes partial installs where only `ajv-formats`, `ajv`, or `sharp` is missing. Use explicit yes/no choices. If the user agrees, run the project-local commands reported by `ensure-qa-tooling.mjs`, then continue automated QA. If the user declines, continue with manual review and record the missing tooling.
   - Do not generate project-local `.mjs` scripts for capture, responsive audit, contrast/API checks, JSON validation, or page-consumption smoke unless the bundled helper cannot cover the scenario. If a fallback script is generated, list it in `.maquette/components/approved.md` with the reason.
15. Update `.maquette/components/component-catalog.json` with implemented coverage.
   - Record all structured component contract paths, deterministic poster paths, and generated component sheet paths in a stable place, using `assets.component_contract_paths` and `assets.component_sheet_paths` when multiple artifacts exist while preserving `assets.component_sheet_path` for compatibility.
   - Record `.maquette/components/replica-gallery.html` in `assets.replica_gallery_html_path` and `assets.component_reference_html_path`.
   - Record the implementation log with `assets.sheet_implementation_log_path`.
   - Record each contract or sheet batch in `assets.sheet_implementation_batches`, including category, primary contract path in `contract_path`, deterministic poster or visual sheet path in `sheet_path` when present, replica artifact paths, component artifact paths, catalog snapshot path, review path, review artifact paths, screenshot paths when available, reusable components added, rubric scores, corrections made, simplifications, deferred items, `completed_before_next_sheet`, and status.
   - Record structured contract or visual sheet vs replica fidelity in `assets.replica_fidelity_review`, including reference sheet paths when sheets exist, contract paths, review mode, screenshots or manual artifacts, rubric scores, failed categories, corrections made, coverage summary, simplifications, and status.
   - Record reusable component readiness in `assets.reusable_component_review`, including whether component APIs, slots, states, JS behavior, accessibility hooks, and usage examples are ready for page implementation.
   - Each component's `visual_review.reference_image_paths` should include the sheet or sheets that guided that component.
   - Each component should record reusable API details such as slots, required attributes, JS behavior, and usage examples when relevant.
   - Responsive navigation components should record variants such as `desktop-inline`, `tablet-collapsed`, `mobile-collapsed`, `mobile-expanded`, `active`, and `focus-visible` in `implemented_variants` or `implemented_states`.
   - Product-card or repeated-card components should record equal-height behavior, body layout strategy, bottom-pinned action rows, and screenshot evidence for action-row alignment.
16. Summarize gaps, mismatches, approval status, structured contract or visual sheet vs replica fidelity using the rubric, per-batch artifact status, reusable component readiness, brand-board/component-artifact inconsistencies and which artifact won, measured responsive overflow results, screenshot paths or manual review artifacts, repeated-card anatomy and action-row alignment results, open nav screenshot paths when present, accepted scroll exceptions, responsive navigation notes, and icon-rendering notes in `.maquette/components/approved.md`.

## Visual consistency rules

- Follow the approved brand system exactly.
- Do not invent a new visual language.
- Treat `.maquette/brand/brand-primitives.css` and `.maquette/brand/brand-proof.html` as the implementation bridge from brand board to components.
- Treat structured component contracts as the default implementation contracts.
- In page-first workflows, treat the approved page concept region and visual implementation contract as the source for larger component anatomy, density, and composition. Component proofs should support the page concept, not normalize it into a generic gallery pattern.
- Treat deterministic contract posters as review aids rendered from structured contracts, not creative visual design targets.
- Treat explicit 1:1 visual component sheets as componentized reference targets, not loose inspiration.
- Keep the reference page layout and reusable component API conceptually separate; page implementations should consume the catalog, CSS, JS, and usage examples, not copy the reference layout.
- Reuse shared tokens everywhere instead of hard-coded one-off values.
- Focus treatments and disabled states must remain consistent across controls.
- The coded componentized reference should be pulled toward the approved brand plus structured contract. If a visual component sheet is explicitly used, it should be visually pulled toward that approved sheet where doing so does not conflict with the contract.
- The componentized reference must not silently simplify generated or contracted component details. Any missing family, variant, state, density detail, selector, slot, or composite in the structured contract or visual sheet must be implemented or explicitly documented with a concrete reason and follow-up.
- Every icon-only control must have sufficient foreground/background contrast in default, hover, active, selected, disabled, and inverse states.
- Active, selected, and current navigation links must remain readable against their active background, especially on dark or inverse navigation surfaces.
- Component variants should share the same anatomy, spacing rhythm, and action placement unless the catalog explicitly records why a variant differs.
- Repeated cards must share media/header/body/footer/action anatomy, badge and eyebrow placement, and equal-height grid behavior. Card bodies should use flex or grid layout, and primary action rows must be pinned to the bottom so product CTAs, quantity selectors, and comparable actions align across cards with different copy lengths.
- Wide data-dense components should not be squeezed into narrow reference cards on desktop.
- A single mega-sheet is not a goal. Split component guidance into focused sheets whenever the sheet would become cluttered or uninspectable.
- A single mega-contract is not a goal. Split structured contract guidance into focused selector allowlists whenever the contract would become cluttered, generic, or hard to read.
- Primary navigation must have a responsive component pattern. Prefer desktop inline nav plus tablet/mobile menu toggle with a stacked panel or drawer. Do not rely on document-level horizontal scrolling for primary nav.
- In multi-contract or multi-sheet runs, finish the current contract or sheet's componentized batch replica, batch CSS/JS, batch catalog snapshot, batch screenshot/manual review, fidelity review, reusable API documentation, and implementation log entry before creating the next component contract or sheet. Retrospective log entries after all artifacts are generated do not satisfy this requirement.
- Prefer Maquette's bundled shared scripts over generated run-local `.mjs` scripts for screenshots, responsive layout auditing, contrast/API smoke checks, page-consumption smoke checks, and JSON validation.

## Review rules

If a reference board, structured component contract, deterministic poster, or component sheet exists:
- compare the coded componentized reference against it
- inspect the rendered screenshot directly
- make one focused correction at a time
- prefer small targeted fixes over wide stylistic rewrites

Before finishing:
- Verify that the implementation matches the structured contract's selectors, states, slots, accessibility hooks, and token intent, then use screenshots to correct visual quality. If a visual component sheet is explicitly used, also verify the componentized reference matches the sheet's component families, variants, states, density, and polish. A basic selector page is not sufficient.
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
- Verify each multi-contract or multi-sheet batch has concrete category-prefixed files under `.maquette/components/`, with structured contracts under `.maquette/components/contracts/`, CSS under `.maquette/components/css/`, and JS under `.maquette/components/js/`, before accepting the final merged library.
- `.maquette/components/approved.md` must summarize structured contract or visual sheet vs replica fidelity, per-batch implementation log status, per-batch artifact paths, reusable component readiness, measured responsive overflow results, screenshot paths or manual review artifacts, clipped screenshot fallbacks, generated fallback scripts and reasons when any exist, repeated-card anatomy and action-row alignment results, open nav screenshot paths when present, accepted scroll exceptions, responsive navigation notes, brand/component inconsistency notes, and icon-rendering notes. "Screenshots captured" alone is not a sufficient review.

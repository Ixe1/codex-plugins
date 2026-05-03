---
name: maquette-pages
description: Create website page concepts from approved brand references using image_gen first, then implement the approved concept with strict visual-fidelity review and just-in-time components.
---

You are responsible for the **website page and screen phase**.

Write all Maquette-owned page artifacts under `.maquette/pages/<page-name>/` in the current project, including generated assets, review notes, Playwright screenshots, and responsive audit JSON. Do not create or overwrite root-level website files such as `index.html`; integrating a page into the real app entrypoint is a separate explicit task.

## Preconditions

Use this skill after the executable brand canon exists. A broad component library is optional unless the user explicitly requested Design System Mode.

Preferred inputs:
- `.maquette/direction/direction-inventory.json` when the project started in Greenfield Website Mode
- `.maquette/brand/design-system.json`
- `.maquette/brand/tokens.css`
- `.maquette/brand/brand-primitives.css`
- `.maquette/brand/brand-proof.html`
- approved brand-board image
- `.maquette/components/component-catalog.json` when a reusable catalog already exists
- structured component contract paths and deterministic posters when rendered
- approved visual component-sheet images only when explicitly requested

Hard gate:
- If `.maquette/brand/design-system.json`, `.maquette/brand/tokens.css`, `.maquette/brand/brand-primitives.css`, `.maquette/brand/brand-proof.html`, or a generated and inspected brand board image is missing, do not create a page concept. Run the brand-kit phase first using `maquette-brand-kit`.
- If `.maquette/components/component-catalog.json`, `.maquette/components/css/components.css`, `.maquette/components/replica-gallery.html`, or structured component contract evidence exists, consume it after the page concept has been approved and inventoried. Do not let existing generic component proofs reshape the approved page concept.
- If an existing component catalog lacks reusable component API coverage or marks `assets.reusable_component_review.ready_for_pages` as false, do not copy the componentized reference layout into the page. Create or request focused just-in-time component proof work for the missing page-critical pieces.
- If the component catalog records multiple `assets.sheet_implementation_batches`, each implemented batch should have concrete batch artifact paths for the batch replica/reference, component CSS/JS, catalog snapshot, screenshot/manual review evidence, and review. If these are missing, run or request `maquette-components` to complete the component phase before page work.
- If the approved page concept needs components, dense data patterns, or reusable composites that are not covered by the existing component catalog or inspected component references, create or request the missing focused structured contract and browser proof before implementing that region. The contract must be derived from the approved concept region, not from a generic component-gallery idea. Do not generate visual component sheets unless the user explicitly asks for them.
- Do not treat an existing website, screenshot, copied CSS, or style notes as a substitute for the brand kit and component library.
- In a one-shot unattended `maquette` workflow where the user explicitly asked not to pause, earlier phases may be marked provisional, but they still must exist before this phase starts. Otherwise, generated brand-board and page-concept approval gates still require explicit user decisions.

## Non-negotiable image_gen policy

If the `image_gen` tool is available, you **must use it** before implementation.
Follow `shared/image-gen-workflow.md` for required visual inspection, same-turn continuation, and conditional transparent PNG verification.
Do not skip directly to code-only page design unless the user explicitly asks you to.
The page concept image is the creative design artifact and visual implementation target for the page. It is not a pixel ruler, but it is binding for major composition, section order, hierarchy, density, crop intent, repeated-card anatomy, newsletter/footer structure, and terminal-region visual weight.

Use image generation to:
- create a new page concept from the approved brand board, component catalog, structured component contracts, and visual sheets when present, or
- edit an existing concept image to refine the page while preserving the approved visual language

If editing a local reference image, first make it visible in the conversation with `view_image`, then ask `image_gen` to edit the visible image.

After every `image_gen` create or edit step, inspect the generated image with `view_image` before treating it as the design source. Do not derive page blueprints, layout decisions, or implementation details from the prompt alone. If the generated file cannot be inspected, state that limitation and treat the image as unverified.

When image-worker subagents are available, run page-concept image generation or editing in a dedicated image worker subagent automatically. Do not ask whether to use image workers. The worker should return the exact saved image path and the project-local `.maquette/pages/<page-name>/concept.png` path. The main workflow must inspect the returned image with `view_image`, ask the approval question, and only then derive page artifacts or code.

After inspecting a generated or edited page concept that passes rejection checks, ask the user whether to use it before writing the page blueprint, concept-region inventory, page layout contract, asset manifest, or page code. Use the Codex user-input/question tool when available with choices equivalent to:
- `Yes, use this` as the recommended choice
- `No, make a new one`

If the user approves, continue. If the user asks for a new one, regenerate before deriving page artifacts. If the user gives free-form revision notes, edit the concept using those notes, inspect the revision, and ask again with the same two approval choices. Do not treat a page concept as approved merely because the run is one-shot or provisional unless the user explicitly requested an unattended run. `One pass`, `full workflow`, `final homepage`, `fresh disposable test`, and similar phrasing are not unattended requests by themselves.

Only skip image generation if:
- the user explicitly tells you not to use it, or
- the environment genuinely does not provide the tool

## Required outputs

For each page, create or update a folder like:

- `.maquette/pages/<page-name>/page-blueprint.json`
- `.maquette/pages/<page-name>/concept-region-inventory.md`
- `.maquette/pages/<page-name>/visual-implementation-contract.md`
- `.maquette/pages/<page-name>/page-layout-contract.md`
- `.maquette/pages/<page-name>/asset-manifest.json`
- `.maquette/pages/<page-name>/page.html`
- `.maquette/pages/<page-name>/page.css`
- `.maquette/pages/<page-name>/page.js`
- `.maquette/pages/<page-name>/review.md`

When applicable, also create:

- `.maquette/pages/<page-name>/concept.png`
- `.maquette/pages/<page-name>/page.png`
- `.maquette/pages/<page-name>/asset-consistency.md` when generated assets include identity, packaging, product labels, signage, or other visible brand text

The blueprint JSON must validate against `shared/page-blueprint.schema.json`.
The asset manifest JSON must validate against `shared/page-asset-manifest.schema.json` when that schema is present.

## Workflow

1. Read the approved design system and approved references.
   - If `.maquette/direction/direction-inventory.json` exists, read it as directional context only. The executable brand canon remains the primitive styling source of truth.
   - Read any existing component catalog as reusable API context, not as a layout source that can override the page concept.
2. If `image_gen` is available, create or edit a page concept using the approved references and `assets/page-concept-prompt.md`.
   - Inspect the generated page concept with `view_image` before writing the page blueprint or implementation.
   - A concept with header or primary navigation is incomplete if it only shows desktop navigation. It must define desktop, tablet, and mobile nav behavior, including the collapsed and expanded tablet/mobile state.
3. Ask the user whether to use the inspected page concept.
   - Use the approval choices from the non-negotiable image policy.
   - Record the user's decision in `review.md` once the review file exists.
   - Do not create the page blueprint, concept-region inventory, visual implementation contract, page layout contract, asset manifest, or page code until the user approves the concept, unless the user explicitly requested an unattended run.
4. Before coding, create `.maquette/pages/<page-name>/concept-region-inventory.md`.
   - Use `shared/concept-region-inventory.template.md` if present.
   - Inventory every visible concept region, including header, nav, hero, sidebars, annotations, product grids, promo cards, newsletter, footer, bottom bars, mobile/tablet callouts, app/device modules, social links, and imagery.
   - For each visible region, record one status: `implemented`, `implemented differently with reason`, `intentionally omitted with reason`, `requires more assets`, or `requires component expansion`.
   - Visible concept regions default to implementation. Missing, simplified, or merged regions must have a concrete reason before coding proceeds.
   - If any visible region requires component expansion, run or request `maquette-components` before implementing that region.
5. Before coding, create `.maquette/pages/<page-name>/visual-implementation-contract.md`.
   - Record the approved concept's section order, major composition model, hero structure, product/card density, newsletter/footer anatomy, brand-signature details, allowed adaptive changes, and forbidden drift.
   - Assign each major region a fidelity target: `strict`, `adaptive`, or `intentional-deviation`.
   - `Strict` regions must preserve structure and relative visual weight. `Adaptive` regions may change layout for responsiveness while preserving hierarchy and anatomy. `Intentional-deviation` requires a concrete reason before coding.
   - Record any visible brand/product text expected in generated assets, and explicitly forbid alternate brand names, product line names, packaging systems, signage, or labels that were not approved.
6. Before coding, create `.maquette/pages/<page-name>/page-layout-contract.md`.
   - Use `shared/page-layout-contract.template.md` if present.
   - Translate the inspected page concept into implementable layout rules for each major region: section order, relative section heights, section density/compactness, background bands, grid behavior, image container aspect ratios, image crop behavior, footer structure, legal/bottom row structure, and mobile stacking.
   - Record top, middle, and terminal-region expectations. Terminal regions include final CTA/impact strips, newsletter blocks, footers, legal rows, bottom bars, app/download modules, and social areas.
   - For every major raster media region, record whether the image must fill its container, which `object-fit` behavior is expected, and whether blank bands or letterboxing are acceptable. Blank parent backgrounds around fitted media are deviations unless the contract explicitly accepts them.
   - Record which component catalog APIs are expected in each region and where page-specific layout CSS is allowed.
   - Any visible concept region that will be taller, looser, more compact, cropped differently, or structurally simplified must be recorded here before implementation with a concrete reason.
7. Create `.maquette/pages/<page-name>/asset-manifest.json` before coding.
   - Use `shared/page-asset-manifest.example.json` and `shared/page-asset-manifest.schema.json` if present.
   - List every required identity asset and raster image: logo/wordmark/brand mark when supplied or explicitly needed, hero images, product-card images, promo images, lifestyle/story images, footer/app/device images, background textures, decorative rasters, and generated concept/page screenshots.
   - Classify brand identity assets separately from generic UI icons and decorative SVG. Maquette-authored logos, wordmarks, monograms, mascots, emblems, lockups, and brand marks must be generated raster image assets from `image_gen`; supplied SVG identity assets may be reused and recorded as supplied or existing-project assets.
   - Never create a Maquette-authored logo, wordmark, monogram, mascot, emblem, lockup, or brand mark as code-generated SVG. If identity generation fails, record the asset as missing or failed and use plain text brand copy only as non-logo navigation text when the page must continue.
   - If generated image assets are needed, generate all required project-local assets or document why each missing asset was not generated.
   - Generate identity and product-system assets first when the page needs them. Inspect and accept the logo/wordmark, package label style, product lineup, flavor names, and visible brand text before generating dependent hero, promo, story, or footer scenes.
   - When generated assets include identity, packaging, product labels, signage, or visible brand text, create `.maquette/pages/<page-name>/asset-consistency.md` before dependent image waves. Record allowed brand text, allowed product/flavor names, approved reference asset ids, forbidden alternate brand names, forbidden packaging systems, and retry criteria.
   - Generate independent image assets through parallel image-worker subagents by default. Use one worker per independent asset or tightly related independent batch, assign unique target paths before spawning, wait for the wave, inspect every returned project-local path with `view_image`, and update the manifest before using assets in HTML, CSS, JS, or review notes.
   - Use staged waves when an asset depends on an earlier generated asset. For example, inspect and accept a logo, package label, or product-system reference before spawning workers for product scenes that must include it.
   - Reject or retry assets that introduce unapproved brand names, mismatched product labels, alternate fictional company names, unrelated signage, inconsistent package systems, or concept-breaking art direction.
   - If Maquette policy forbids an asset, such as generating a new logo during the brand-kit phase, record the reason and use a permissible fallback only when it still matches the concept.
   - Every asset referenced by HTML, CSS, JS, or review notes must exist locally before final review.
8. Check and create just-in-time component coverage from the approved concept.
   - Reuse existing components first.
   - Import the executable brand canon first: `tokens.css` and `brand-primitives.css`.
   - Use component catalog APIs, slots, variants, states, and usage examples from the componentized reference when they exist. Do not copy the `replica-gallery.html` page layout into the page.
   - Identify missing primitives, dense data patterns, or larger reusable composites from the concept-region inventory and visual implementation contract.
   - If the page has a header or primary navigation, verify or create responsive navigation variants before implementing that region.
   - If missing coverage is significant for this page, run or request `maquette-components` to create the focused component contract and browser proof before implementing that region. The contract must cite the page concept region it serves.
9. Translate the page concept, visual implementation contract, and page layout contract into code using the brand canon and existing/just-in-time components before adding any new composite patterns.
   - Import `../../brand/tokens.css` and `../../brand/brand-primitives.css` or the correct relative equivalents. Page-specific CSS should primarily handle composition, layout, and page-only exceptions, not recreate buttons, cards, type roles, or state primitives.
   - Use the font families, weights, widths, sizes, and line-heights recorded in the design system and component catalog. If the concept implies condensed or editorial display type, choose a closer available CSS stack or project-approved open-source import instead of defaulting to crude substitutes such as `Impact`.
   - Do not silently simplify visible concept regions, generated component details, or requested image assets. Any simplification must be documented with a concrete reason and recommended follow-up when appropriate.
   - Preserve section density from the layout contract. Do not let terminal sections such as impact strips, newsletter areas, or footers become materially taller, looser, or more generic than the concept unless the contract records why.
   - Implement major media containers so their images fill or crop according to the layout contract. Fix visible blank bands, unintended letterboxing, or exposed parent backgrounds before accepting screenshots.
10. Only create a new composite when the page clearly needs a pattern that the library does not already cover and the visual/reference component coverage exists.
   - When a page has primary navigation, implement accessible responsive navigation: desktop inline nav, tablet/mobile menu toggle, stacked panel or drawer, and no document-level horizontal scrolling.
   - The menu toggle must have `aria-controls`, `aria-expanded`, and an accessible label.
   - The collapsed menu must be keyboard reachable when opened, and hidden menu content must not trap or block focus when closed.
   - Nav links and menu controls need visible tap targets on tablet and mobile.
   - Primary mobile navigation must not require horizontal page scrolling. Horizontal scrolling may only be accepted for explicit dense data components, not primary nav.
   - Opened mobile/tablet drawers must remain scrollable when content exceeds viewport height; prefer `overflow-y: auto` and `overscroll-behavior: contain` on the drawer or drawer body while any body scroll lock is active.
   - Close controls and links must remain reachable in the opened drawer at mobile and tablet heights.
11. Before implementing the full page, build and screenshot-review a thin slice when browser tooling is available: header plus hero plus one representative card, form, data, or content section. Fix major token, typography, spacing, component, or responsive mismatches before continuing to the rest of the page. If this step is skipped, record why in `review.md`.
   - The thin slice fails if it uses final empty placeholders, generic ecommerce/SaaS styling, a code-generated identity SVG, uninspected generated assets, or buttons/type/surfaces that do not match the brand proof.
12. Update the page blueprint to document composition, concept-region inventory path, visual implementation contract path, page layout contract path, asset manifest path, asset consistency path when present, thin-slice status, and any new composites.
13. Capture screenshots when possible and compare them to the concept and approved references.
   - Use Maquette's bundled scripts where possible, especially `shared/scripts/ensure-qa-tooling.mjs`, `shared/scripts/sharpen-reference-image.mjs`, `shared/scripts/capture-browser.mjs`, or `skills/maquette-pages/scripts/capture-page.mjs`.
   - Check optional project-local QA dependencies before reporting automated screenshot QA as unavailable. Do not assume global npm installs are available.
   - When raster page concepts or component references are soft or compressed enough that detailed visual transcription would benefit from sharpening, check `ensure-qa-tooling.mjs --project . --check-image-prep`. If `sharp` is available, create a separate same-size `*-sharpened.png` reference with `sharpen-reference-image.mjs`; keep the original image as ground truth and do not overwrite, upscale, or resize it.
   - If `sharp` is missing but image preprocessing would materially improve fidelity, ask before installing `sharp` in the project or continuing with the original reference.
   - Treat partial QA availability as missing QA tooling. For example, if browser QA can run but `ajv-formats` is missing, schema validation for page blueprints or asset manifests is still blocked.
   - If optional QA dependencies are missing and automated screenshot, responsive, schema, or reference-image-preprocessing QA would materially improve confidence, ask the user through the Codex user-input/question tool whether to install the missing project-local packages in the current project. Use explicit yes/no choices. If the user agrees, run the install command reported by `ensure-qa-tooling.mjs`, such as `npm --prefix <projectRoot> i -D playwright ajv ajv-formats sharp`, and `npm --prefix <projectRoot> exec playwright install chromium` when Chromium is required, then continue automated QA. Include `sharp` only when image prep will be used. If the user declines, continue with manual review and record the missing tooling.
   - Do not silently replace schema validation with JSON syntax validation when only `ajv` or `ajv-formats` is missing. Ask first, unless the user already declined installation for this run or the environment cannot install packages.
   - Keep Playwright/Chromium screenshot capture headless.
   - Ensure every browser/session opened for screenshot capture is closed before finishing.
   - If cleanup fails, record the failed cleanup command or operation in the final response.
   - Capture desktop, tablet, and mobile page screenshots when possible; at minimum use representative widths 390, 768, and 1440 when browser tooling is available.
   - If screenshot capture falls back to a clipped full-document image, record the capture metadata and clipped fallback status in `review.md`.
14. Run the required page QA pass:
   - Verify the page concept region inventory against the rendered page. Missing concept regions fail QA unless the inventory records an intentional omission with a concrete reason.
   - Verify the visual implementation contract against the rendered page. Fail and fix when the implementation changes the approved concept's major composition, hero model, product-grid anatomy, repeated-card density, newsletter/footer structure, terminal-region visual weight, or approved adaptive behavior without a documented reason.
   - Verify the page layout contract against the rendered page. Fail and fix when the implementation violates recorded section order, section density, image crop behavior, footer structure, or terminal-section compactness without a documented reason.
   - Verify the generated asset manifest. Every referenced local raster asset must exist, every generated asset requested by the user must be present or explicitly documented as not generated, and unused generated assets should be noted.
   - Verify asset consistency notes when present. Fail and retry assets that include unapproved alternate brand names, product names, package labels, company names, or signage that conflicts with the approved page concept or asset consistency contract.
   - Fail QA if any Maquette-authored logo, wordmark, monogram, mascot, emblem, lockup, or brand mark is `source: code-generated`, is hand-authored SVG, or was not inspected by the main workflow. Supplied SVG identity assets are allowed only when recorded as supplied or existing-project assets.
   - Fail QA if any image-worker output is referenced before the main workflow has viewed it and recorded manifest status.
   - Compare the top and bottom of the coded page against the concept, especially headers, navigation, newsletter bands, footers, bottom ribbons, and final calls to action.
   - Compare first, middle, and last full-page screenshot regions against the concept and layout contract. Do not accept a page because the hero matches if the bottom third drifts in spacing, footer anatomy, or media treatment.
   - Score page compactness and vertical rhythm in `review.md`: `matches`, `slightly looser`, `too loose`, `too compact`, or `intentionally different`. A `too loose` or `too compact` result requires a fix or a documented block.
   - Check major image containers for unintended blank bands, letterboxing, exposed parent backgrounds, or mismatched crop behavior. Fix these unless the layout contract explicitly accepts them.
   - Check that repeated/global regions preserve the concept's structure, not just its colors: logo placement, link-column count, approved secondary marks/seals, social links, legal links, and bottom strips should be implemented when shown in the concept.
   - If the concept shows a rich footer, compare and implement logo placement, link columns, social icons, app/download module, device or phone image, legal links, locale or shipping row, cookie or bottom strips, and brand blurb when shown. Simplifying a rich footer into generic columns fails QA unless explicitly documented.
   - In product grids and comparable repeated-card sections, compare the vertical position of repeated card action rows. Fail and fix QA if one card's CTA, quantity selector, price row, or primary action row floats higher than its siblings due to differing text length.
   - Repeated card grids must use shared media/header/body/footer/action slots, consistent badge or eyebrow placement, equal-height cards, flex or grid card bodies, and bottom-pinned action rows whenever cards share a row.
   - Check that headings, badges, labels, and content do not shift inconsistently across cards due to optional badges or labels.
   - Check that social links and compact action controls render as recognizable icons with accessible names. Do not substitute visible text abbreviations such as `YT`, `IG`, or `FB` unless the concept explicitly uses text badges.
   - If the concept shows social links, use recognizable social icons rather than arbitrary generic icons. Do not substitute unrelated icons such as location, camera, music, or generic circles unless the concept explicitly asks for those symbols.
   - Prefer an existing icon library when available. If no brand-icon library is available, use simple inline SVGs or a locally defined icon set with accessible names.
   - Check that icon-only buttons and compact controls visibly render supported icons and are not blank.
   - Compare coded typography weight, width, scale, and line-height against the concept, brand board, and component references. Avoid `Impact` as the fallback for condensed headings unless the board explicitly approves it.
   - Compare buttons, inputs, chips, cards, panels, inverse surfaces, and focus states against `.maquette/brand/brand-proof.html` or its screenshot. Fail and fix if the page drifts into generic controls or page-local replacements for brand primitives.
   - Record the chosen font family, fallback stack, and rationale in the design system or `review.md`, especially when importing or substituting an open-source font.
   - Capture and inspect navigation at desktop, tablet, and mobile widths. For tablet and mobile, inspect both closed and open menu states.
   - If browser tooling is available, click the menu toggle and verify `aria-expanded` changes.
   - For opened mobile/tablet drawers, verify drawer content can scroll independently when taller than the viewport, body scroll lock does not block drawer scrolling, close controls remain reachable, and links can be reached by pointer and keyboard.
   - Record screenshot paths for open mobile or tablet nav states in `review.md`.
   - Fail and fix QA if nav links overflow, are clipped, require document-level horizontal scrolling, or are unreachable by keyboard or pointer.
   - Check whole-page screenshots, not only above-the-fold. Inspect top, middle or data-heavy sections, and footer or terminal sections.
   - Check first, middle, and last viewport screenshots; do not only review the hero or above-the-fold content.
   - Run measurable responsive overflow QA when browser tooling is available. Prefer `shared/scripts/audit-responsive-layout.mjs` if present.
   - Test at least viewport widths 390, 768, 1024, 1280, and 1440.
   - Prefer capturing full-page screenshots for all audited widths when practical.
   - For each tested viewport, record `window.innerWidth`, `document.documentElement.scrollWidth`, `document.body.scrollWidth`, and clientWidth/scrollWidth for wide components such as tables, grids, timelines, charts, calendars, code blocks, and comparison matrices.
   - Record top overflow offenders when any are present.
   - Fail and fix the page if document scroll width exceeds viewport width by more than 1px, unless there is an explicit documented exception.
   - Internal horizontal scrolling for wide components is allowed only when intentional and documented. It should generally not appear on normal desktop or tablet layouts unless the component is truly a data grid that requires it.
   - Horizontal scrolling is never an accepted exception for primary navigation.
   - Prefer bundled Maquette scripts over generated run-local `.mjs` scripts for capture and responsive auditing. If a fallback script is generated, list it in `review.md` with the reason.
   - For each major section, write concept-to-code comparison notes in `review.md`: `matches`, `minor deviation`, `major deviation`, `missing`, `simplified`, `blocked`, `intentional deviation`, or `fixed`.
   - If a footer, header, terminal section, image asset, or any other visible concept region is simplified from the concept, either fix it or record the intentional reason and recommended follow-up in `review.md`.
   - Do not mark the page approved while any region remains `major deviation`, `missing`, `simplified` without an approved reason, or `blocked`.
15. Record generated asset manifest status and missing assets, page concept approval decision, page concept region inventory, visual implementation contract status, page layout contract status, asset consistency status, thin-slice review status, structured contract or visual sheet vs replica fidelity notes, reusable component usage notes, card anatomy alignment, footer fidelity, terminal-section compactness, media container fit/crop results, mobile drawer scrollability, measured responsive overflow results, screenshot paths, open nav screenshot paths, visual deviations and fixes, accepted scroll exceptions, navigation accessibility notes, icon-rendering notes, and chosen font family/fallback rationale in `review.md`.

## Low-resolution reference rule

Concept images are **composition and hierarchy contracts**, not pixel rulers.
When the concept image is small or compressed:
- infer spacing from the approved token rhythm
- infer typography from the approved type scale
- infer responsive behavior from the existing layout system
- avoid measuring every visible pixel
- preserve major layout structure, density, region order, media crop intent, and terminal-region anatomy unless an intentional deviation is recorded before coding

## Consistency rules

- Do not silently introduce a new brand direction.
- Prefer already-approved primitives and states.
- Treat the executable brand canon as the implementation source for primitive styling. Components and pages must preserve it, not reinterpret the brand board independently.
- Do not silently introduce significant new component language that is absent from the approved or provisional component references.
- Keep page code composable so later pages can reuse sections and composites.
- Headers and primary navigation must be responsive by design. Do not ship desktop-only inline nav that breaks on tablet or mobile.
- The concept image should drive the creative direction; the code should faithfully implement that direction using approved components first.
- The approved concept, visual implementation contract, and asset consistency notes are stronger than generic component proofs. If a reusable component would materially change concept structure or density, adapt the component or create a focused concept-derived variant instead of changing the page.
- Page implementation fidelity applies to the whole page, including terminal sections such as newsletter and footer areas. Do not let the footer degrade into a generic link list when the concept shows a branded footer composition.
- Page layout fidelity includes section compactness and vertical rhythm. Do not let coded sections become materially taller or looser than the concept by default, especially in the bottom third of the page.
- Major image containers must have explicit fit and crop behavior. Unintended blank media bands, letterboxing, or exposed parent backgrounds are implementation defects unless documented in the layout contract.
- No silent simplification: visible concept regions, generated component details, and requested image assets must be implemented by default. Any simplification must be documented with a concrete reason and follow-up recommendation.
- Icon-like controls in the concept must stay icon-like in code. Social actions, utility actions, and circular/footer controls need visible recognizable icon glyphs plus accessible labels, not short visible text placeholders or unrelated generic icons.
- Page typography must implement the approved font personality. Condensed bold headings should use a close available font strategy, not an unrelated heavy default such as `Impact` unless explicitly approved.
- Product-card, pricing-card, and other repeated-card sections must keep action rows aligned across cards with varied copy length.
- Generated raster assets used together on a page must read as one brand/product system. Reject or retry assets that introduce alternate company names, unrelated product-line names, inconsistent package label systems, or signage that conflicts with the approved concept.

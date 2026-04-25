---
name: maquette-pages
description: Create website page concepts from approved brand and component references using image_gen first, then implement them with existing reusable components before adding any new composites.
---

You are responsible for the **website page and screen phase**.

Write all Maquette-owned page artifacts under `.maquette/pages/<page-name>/` in the current project, including generated assets, review notes, Playwright screenshots, and responsive audit JSON. Do not create or overwrite root-level website files such as `index.html`; integrating a page into the real app entrypoint is a separate explicit task.

## Preconditions

Use this skill after the component library exists.

Preferred inputs:
- `.maquette/brand/design-system.json`
- `.maquette/components/component-catalog.json`
- approved brand-board image
- approved CSS-contract poster image or images, or approved visual component-sheet images when that fallback path was used

Hard gate:
- If `.maquette/brand/design-system.json`, `.maquette/brand/tokens.css`, or a generated and inspected brand board image is missing, do not create a page concept. Run the brand-kit phase first using `maquette-brand-kit`.
- If `.maquette/components/component-catalog.json`, `.maquette/components/css/components.css`, `.maquette/components/replica-gallery.html`, or a generated and inspected component sheet/CSS-contract poster image is missing, do not create a page concept. Run the component-library phase first using `maquette-components`.
- If the component catalog lacks reusable component API coverage or marks `assets.reusable_component_review.ready_for_pages` as false, do not copy the componentized reference layout into the page. Run or request `maquette-components` to complete reusable component coverage first.
- If the component catalog records multiple `assets.sheet_implementation_batches`, each implemented batch should have concrete batch artifact paths for the batch replica/reference, component CSS/JS, catalog snapshot, screenshot/manual review evidence, and review. If these are missing, run or request `maquette-components` to complete the component phase before page work.
- If the requested page needs components, dense data patterns, or reusable composites that are not covered by the existing component catalog or inspected component references, run or request the component-library phase first to create the missing focused sheet or CSS-contract poster. Do not silently invent significant new component language inside the page phase.
- Do not treat an existing website, screenshot, copied CSS, or style notes as a substitute for the brand kit and component library.
- In a one-shot `maquette` workflow, earlier phases may be marked provisional, but they still must exist before this phase starts.

## Non-negotiable image_gen policy

If the `image_gen` tool is available, you **must use it** before implementation.
Follow `shared/image-gen-workflow.md` for required visual inspection, same-turn continuation, and conditional transparent PNG verification.
Do not skip directly to code-only page design unless the user explicitly asks you to.
The page concept image is the creative design artifact for the page and should guide layout, hierarchy, density, and style.

Use image generation to:
- create a new page concept from the approved brand board and component sheet, sheets, or CSS-contract-backed component references, or
- edit an existing concept image to refine the page while preserving the approved visual language

If editing a local reference image, first make it visible in the conversation with `view_image`, then ask `image_gen` to edit the visible image.

After every `image_gen` create or edit step, inspect the generated image with `view_image` before treating it as the design source. Do not derive page blueprints, layout decisions, or implementation details from the prompt alone. If the generated file cannot be inspected, state that limitation and treat the image as unverified.

Only skip image generation if:
- the user explicitly tells you not to use it, or
- the environment genuinely does not provide the tool

## Required outputs

For each page, create or update a folder like:

- `.maquette/pages/<page-name>/page-blueprint.json`
- `.maquette/pages/<page-name>/concept-region-inventory.md`
- `.maquette/pages/<page-name>/asset-manifest.json`
- `.maquette/pages/<page-name>/page.html`
- `.maquette/pages/<page-name>/page.css`
- `.maquette/pages/<page-name>/page.js`
- `.maquette/pages/<page-name>/review.md`

When applicable, also create:

- `.maquette/pages/<page-name>/concept.png`
- `.maquette/pages/<page-name>/page.png`

The blueprint JSON must validate against `shared/page-blueprint.schema.json`.
The asset manifest JSON must validate against `shared/page-asset-manifest.schema.json` when that schema is present.

## Workflow

1. Read the approved design system and component catalog.
2. Check component coverage before page concept work.
   - Reuse existing components first.
   - Use component catalog APIs, slots, variants, states, and usage examples from the componentized reference. Do not copy the `replica-gallery.html` page layout into the page.
   - Identify any missing primitives, dense data patterns, or larger reusable composites needed by the page.
   - If the page has a header or primary navigation, verify that the component catalog covers responsive navigation variants before concept or implementation work.
   - If missing coverage is significant, run or request `maquette-components` to create the focused component/composite sheet before continuing.
3. If `image_gen` is available, create or edit a page concept using the approved references and `assets/page-concept-prompt.md`.
   - Inspect the generated page concept with `view_image` before writing the page blueprint or implementation.
   - A concept with header or primary navigation is incomplete if it only shows desktop navigation. It must define desktop, tablet, and mobile nav behavior, including the collapsed and expanded tablet/mobile state.
4. Before coding, create `.maquette/pages/<page-name>/concept-region-inventory.md`.
   - Use `shared/concept-region-inventory.template.md` if present.
   - Inventory every visible concept region, including header, nav, hero, sidebars, annotations, product grids, promo cards, newsletter, footer, bottom bars, mobile/tablet callouts, app/device modules, social links, and imagery.
   - For each visible region, record one status: `implemented`, `implemented differently with reason`, `intentionally omitted with reason`, `requires more assets`, or `requires component expansion`.
   - Visible concept regions default to implementation. Missing, simplified, or merged regions must have a concrete reason before coding proceeds.
   - If any visible region requires component expansion, run or request `maquette-components` before implementing that region.
5. Create `.maquette/pages/<page-name>/asset-manifest.json` before coding.
   - Use `shared/page-asset-manifest.example.json` and `shared/page-asset-manifest.schema.json` if present.
   - List every required raster image: logo if supplied or explicitly requested, hero images, product-card images, promo images, lifestyle/story images, footer/app/device images, background textures, decorative rasters, and generated concept/page screenshots.
   - If the user asked for generated image assets, generate all required project-local assets or document why each missing asset was not generated.
   - If Maquette policy forbids an asset, such as generating a new logo during the brand-kit phase, record the reason and use a permissible fallback only when it still matches the concept.
   - Every asset referenced by HTML, CSS, JS, or review notes must exist locally before final review.
6. Reuse existing components first.
7. Translate the page concept into code using the component library before adding any new composite patterns.
   - Use the font families, weights, widths, sizes, and line-heights recorded in the design system and component catalog. If the concept implies condensed or editorial display type, choose a closer available CSS stack or project-approved open-source import instead of defaulting to crude substitutes such as `Impact`.
   - Do not silently simplify visible concept regions, generated component details, or requested image assets. Any simplification must be documented with a concrete reason and recommended follow-up when appropriate.
8. Only create a new composite when the page clearly needs a pattern that the library does not already cover and the visual/reference component coverage exists.
   - When a page has primary navigation, implement accessible responsive navigation: desktop inline nav, tablet/mobile menu toggle, stacked panel or drawer, and no document-level horizontal scrolling.
   - The menu toggle must have `aria-controls`, `aria-expanded`, and an accessible label.
   - The collapsed menu must be keyboard reachable when opened, and hidden menu content must not trap or block focus when closed.
   - Nav links and menu controls need visible tap targets on tablet and mobile.
   - Primary mobile navigation must not require horizontal page scrolling. Horizontal scrolling may only be accepted for explicit dense data components, not primary nav.
   - Opened mobile/tablet drawers must remain scrollable when content exceeds viewport height; prefer `overflow-y: auto` and `overscroll-behavior: contain` on the drawer or drawer body while any body scroll lock is active.
   - Close controls and links must remain reachable in the opened drawer at mobile and tablet heights.
9. Update the page blueprint to document composition, concept-region inventory path, asset manifest path, and any new composites.
10. Capture screenshots when possible and compare them to the concept and approved references.
   - Use Maquette's bundled scripts where possible, especially `shared/scripts/ensure-qa-tooling.mjs`, `shared/scripts/capture-browser.mjs`, or `skills/maquette-pages/scripts/capture-page.mjs`.
   - Check optional project-local QA dependencies before reporting automated screenshot QA as unavailable. Do not assume global npm installs are available.
   - If optional QA dependencies are missing and automated screenshot or responsive QA would materially improve confidence, ask the user through the Codex user-input/question tool whether to install `playwright`, `ajv`, and `ajv-formats` in the current project. Use explicit yes/no choices. If the user agrees, run `npm i -D playwright ajv ajv-formats` and `npx playwright install chromium`, then continue automated QA. If the user declines, continue with manual review and record the missing tooling.
   - Keep Playwright/Chromium screenshot capture headless.
   - Ensure every browser/session opened for screenshot capture is closed before finishing.
   - If cleanup fails, record the failed cleanup command or operation in the final response.
   - Capture desktop, tablet, and mobile page screenshots when possible; at minimum use representative widths 390, 768, and 1440 when browser tooling is available.
   - If screenshot capture falls back to a clipped full-document image, record the capture metadata and clipped fallback status in `review.md`.
11. Run the required page QA pass:
   - Verify the page concept region inventory against the rendered page. Missing concept regions fail QA unless the inventory records an intentional omission with a concrete reason.
   - Verify the generated asset manifest. Every referenced local raster asset must exist, every generated asset requested by the user must be present or explicitly documented as not generated, and unused generated assets should be noted.
   - Compare the top and bottom of the coded page against the concept, especially headers, navigation, newsletter bands, footers, bottom ribbons, and final calls to action.
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
   - For each major section, write concept-to-code comparison notes in `review.md`: `matches`, `deviates`, `missing`, `simplified`, or `fixed`.
   - If a footer, header, terminal section, image asset, or any other visible concept region is simplified from the concept, either fix it or record the intentional reason and recommended follow-up in `review.md`.
12. Record generated asset manifest status and missing assets, page concept region inventory, component sheet/CSS-contract poster vs replica fidelity notes, reusable component usage notes, card anatomy alignment, footer fidelity, mobile drawer scrollability, measured responsive overflow results, screenshot paths, open nav screenshot paths, visual deviations and fixes, accepted scroll exceptions, navigation accessibility notes, icon-rendering notes, and chosen font family/fallback rationale in `review.md`.

## Low-resolution reference rule

Concept images are **composition and hierarchy guides**, not pixel rulers.
When the concept image is small or compressed:
- infer spacing from the approved token rhythm
- infer typography from the approved type scale
- infer responsive behavior from the existing layout system
- avoid measuring every visible pixel

## Consistency rules

- Do not silently introduce a new brand direction.
- Prefer already-approved primitives and states.
- Do not silently introduce significant new component language that is absent from the approved or provisional component references.
- Keep page code composable so later pages can reuse sections and composites.
- Headers and primary navigation must be responsive by design. Do not ship desktop-only inline nav that breaks on tablet or mobile.
- The concept image should drive the creative direction; the code should faithfully implement that direction using approved components first.
- Page implementation fidelity applies to the whole page, including terminal sections such as newsletter and footer areas. Do not let the footer degrade into a generic link list when the concept shows a branded footer composition.
- No silent simplification: visible concept regions, generated component details, and requested image assets must be implemented by default. Any simplification must be documented with a concrete reason and follow-up recommendation.
- Icon-like controls in the concept must stay icon-like in code. Social actions, utility actions, and circular/footer controls need visible recognizable icon glyphs plus accessible labels, not short visible text placeholders or unrelated generic icons.
- Page typography must implement the approved font personality. Condensed bold headings should use a close available font strategy, not an unrelated heavy default such as `Impact` unless explicitly approved.
- Product-card, pricing-card, and other repeated-card sections must keep action rows aligned across cards with varied copy length.

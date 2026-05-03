---
name: maquette
description: Orchestrate Maquette's full staged website workflow for broad plugin-level requests, choosing greenfield direction-first, existing-brand, one-shot-fast, or design-system mode as appropriate.
---

You are responsible for the **full Maquette workflow**.

Use this skill when the user invokes Maquette generally, especially with a broad request such as creating a website, landing page, homepage, page concept, or UI from a brief or existing site.

## Core rule

All Maquette-owned outputs must live under `.maquette/` in the current project. Do not create or overwrite a root-level `index.html` as part of the Maquette workflow.

Choose the workflow mode before generating artifacts:

- **Greenfield Website Mode**: use when the user asks for a new website, landing page, homepage, campaign page, product site, or new brand and no approved Maquette brand kit exists. Run: direction concept -> direction inventory -> constrained brand kit -> critical-path components -> page implementation -> system backfill.
- **Existing Brand Mode**: use when an approved brand kit, supplied brand system, existing site identity, or supplied brand assets should be preserved. Run: reference inventory -> brand kit/tokens -> components -> page.
- **One-Shot Fast Mode**: use only when the user explicitly asks for fast/unattended/minimal output. Run: direction concept -> compact brand tokens -> critical-path components only -> page -> final system summary.
- **Design System Mode**: use when the user explicitly asks for a broader reusable design system before pages. Run: brand/page direction -> full brand kit -> full component coverage -> pages.

For greenfield websites, do not start with an abstract brand board. First run the direction phase using `maquette-direction`, then use the selected direction as a seed for the brand kit. The first direction concept is not a final page design or implementation contract; it is a concrete context for hierarchy, visual tone, content density, component needs, and asset needs.

Only proceed to implementation after the required artifacts for the selected workflow mode exist. Do not skip phase gates; change the phase order only through an explicit workflow mode.

The component-library phase uses structured component contracts by default. Preserve explicit user requests for visual component sheets when the user asks for visual sheets or when the component skill documents that creative clarification is needed. Any CSS-contract poster should be rendered deterministically from a structured contract and treated as a review aid, not as image-generated source text.

Before component or page implementation, the optional QA tooling decision must be explicit when any planned automated QA path is blocked. Partial availability is not enough: if Playwright is available but `ajv` or `ajv-formats` is missing, ask for an install decision before replacing schema validation with manual JSON checks, unless the user already declined installation for the current run or installation is impossible. When Maquette reference artifacts are soft or compressed enough to benefit from same-size sharpening, check for project-local `sharp` with `shared/scripts/ensure-qa-tooling.mjs --check-image-prep`; if available, use `shared/scripts/sharpen-reference-image.mjs` to create separate `*-sharpened.png` references while preserving the raw images as ground truth. Do not use image prep to upscale or resize Maquette artifacts.

When subagent tooling is available, follow `shared/image-gen-workflow.md` to resolve the image-worker decision before the first Maquette `image_gen` create or edit call. If the user has not already explicitly authorized subagents and has not explicitly declined or requested unattended/no-question mode, ask once whether to use Maquette image-worker subagents. Do not treat "not explicitly authorized" as permission to skip image workers. If authorized, run Maquette image creation and image editing in a dedicated image worker subagent, then have the main workflow inspect the returned project-local image path. This applies to direction concepts, brand boards, visual component sheets, page concepts, and generated page raster assets. Deterministic component contract posters do not require image workers. Continue in the main workflow only when image workers are explicitly declined, unavailable after the required question, or explicitly bypassed by unattended/no-question language, and record the reason.

Direction concepts, brand boards, and page concepts are user approval gates. After the main workflow inspects the generated image, ask whether to use it or make a new one before deriving downstream artifacts. Do not include a separate revise choice in the approval buttons. Do not treat one-shot provisional runs as implicit approval unless the user explicitly requested an unattended run.

Unattended mode requires explicit user language such as `unattended`, `do not ask questions`, `no pauses`, `skip approval questions`, or `make all decisions yourself`. Do not infer unattended mode from `one pass`, `full workflow`, `final homepage`, `fresh disposable test`, `run a Maquette test`, or similar phrasing.

## Phase gates

In Greenfield Website Mode, before creating a brand board or design-system tokens, verify that these direction artifacts exist:

- `.maquette/direction/brief.md`
- `.maquette/direction/direction-inventory.json`
- `.maquette/direction/approved.md`
- a generated and inspected selected direction concept image such as `.maquette/direction/direction-concept-vN.png`

If any are missing, run the direction phase first using `maquette-direction`. The brand-kit phase must use the selected direction and inventory as constraints.

Before creating a page concept or page implementation, verify that these brand artifacts exist:

- `.maquette/brand/brief.md`
- `.maquette/brand/design-system.json`
- `.maquette/brand/tokens.css`
- `.maquette/brand/approved.md`
- a generated and inspected brand board image such as `.maquette/brand/brand-board-vN.png`

If any are missing, run the brand-kit phase first using `maquette-brand-kit`.

Before creating a page concept or page implementation, verify that these component artifacts exist:

- `.maquette/components/component-catalog.json`
- `.maquette/components/sheet-inventory.md`
- `.maquette/components/sheet-implementation-log.md` when multiple sheets were needed
- `.maquette/components/css/components.css`
- `.maquette/components/js/components.js`
- `.maquette/components/replica-gallery.html`
- `.maquette/components/approved.md`
- one or more structured component contracts, such as `.maquette/components/contracts/<batch-slug>.contract.json`
- deterministic contract review posters when created, such as `.maquette/components/contracts/<batch-slug>.contract.svg`
- generated and inspected visual component artifacts only when creative clarification was needed, such as `.maquette/components/component-sheet-vN.png`

If any are missing, run the component-library phase next using `maquette-components`.
If the component catalog does not mark the reusable component library as ready for pages, run `maquette-components` again before the page phase. The page phase should consume reusable components and cataloged APIs, not copy a componentized reference layout.
If the requested page needs dense data patterns, dashboards, tables, maps, calendars, editors, timelines, complex workflows, filter builders, or reusable composites that are not covered by the existing component references, run `maquette-components` again to create focused missing coverage before running the page phase. Multi-artifact component work should proceed sequentially: create one focused structured component contract by default, optionally render a deterministic poster, optionally generate one focused 1:1 visual component sheet when creative clarification is needed, build and review its componentized replica/reference, document reusable component APIs, then move to the next artifact.
If a multi-batch component catalog records `assets.sheet_implementation_batches`, verify each batch has concrete artifact paths for the structured contract, deterministic poster if created, visual sheet if used, batch replica/reference, batch component CSS/JS, catalog snapshot, screenshot/manual review evidence, and review before proceeding to the page phase. Retrospective batch logs without concrete batch artifacts are not enough.
If the requested page has a header or primary navigation, verify responsive navigation component coverage before running the page phase: desktop inline nav, tablet/mobile collapsed state, menu toggle, expanded panel or drawer, active/focus states, and icon rendering.
If the requested page has product, pricing, service, offer, or promo card grids, verify repeated-card component coverage before running the page phase: shared media/header/body/footer/action anatomy, stable badge or eyebrow placement, equal-height cards, flex or grid card bodies, and bottom-pinned CTA, quantity, price, or action rows.
If the requested page has a rich footer, footer social links, app/download modules, legal/locale rows, or device imagery, verify footer/social module coverage before running the page phase: recognizable social icons, accessible names, link column anatomy, app/device module coverage, bottom strip coverage, and no unrelated generic icon substitutions.
Verify that the page phase will create a concept-region inventory, page layout contract, and asset manifest before coding. This applies even when the page has few raster assets, because the layout contract is the guardrail for section compactness, terminal-region fidelity, and media fit/crop behavior.

Only after both gates pass should you run the page phase using `maquette-pages`.

## Existing website and brand references

An existing website, screenshot, codebase, or supplied brand asset may inform the brand kit and component library, but it is not a replacement for them.

Do not run the greenfield direction phase for an existing brand unless the user explicitly asks for a redesign, new direction, or exploratory alternatives. Existing Brand Mode is preservation-first: extract and normalize what is already there before adding new creative direction.

Before generating a brand board in Existing Brand Mode, create or refresh `.maquette/brand/reference-inventory.md` with:

- source references used, such as URLs, screenshots, current code, supplied brand files, and user notes
- brand elements to preserve, such as palette, type personality, imagery style, tone, spacing, radius, motion, layout density, and content hierarchy
- supplied assets that must not be regenerated, such as logos, wordmarks, marks, icons, photography, illustrations, and product screenshots
- allowed evolution, such as modernization, accessibility fixes, responsive cleanup, density adjustment, or component normalization
- do-not-change constraints and uncertainty that needs user approval

Use existing references to extract:

- product context
- content priorities
- audience expectations
- useful interaction patterns
- visual cues worth preserving
- explicit non-goals, such as logo redesign, unrelated palette changes, or new brand personality

Do not treat copied CSS values, notes, or screenshots as the final design system. In Existing Brand Mode, first convert the reference into a generated brand board, inspect it with `view_image`, then derive the design-system JSON and CSS tokens from that inspected artifact. In Greenfield Website Mode, first create or select a direction concept, write the direction inventory, then generate a brand board constrained by that selected direction.

## One-shot requests

If the user asks for a page and the project has no Maquette artifacts yet, complete a full pass in Greenfield Website Mode, pausing at the image-worker authorization question and required image approval gates unless the user explicitly asked for an unattended run:

1. Create or select a concrete direction concept and inventory.
2. Create the brand kit constrained by that direction.
3. Create critical-path component contracts and reusable components.
4. Create the requested page.
5. Backfill final system notes with confirmed tokens, confirmed components, provisional components, page-local patterns, future component candidates, and known concept deviations.

Mark the outputs as proposed or provisional only for phases that do not require an image approval gate, or when the user explicitly requested an unattended run.
Infer focused extra component/composite sheets when the page brief needs them; the user should not have to ask for fewer components, split sheets, or wide-data coverage.
Infer responsive navigation coverage for page/site requests with global navigation; the user should not have to ask for mobile nav or overflow checks.
Infer repeated-card and footer/social coverage for commerce, product-grid, pricing, service-list, newsletter, app/download, and footer-heavy pages; the user should not have to ask for card anatomy, action alignment, footer fidelity, or recognizable social icons.
Infer page asset-manifest needs for pages with logos supplied by the user, hero images, product images, promo imagery, lifestyle/story imagery, footer/app/device images, background textures, or requested imagegen assets.
Infer page layout-contract needs for section compactness, terminal regions, image fit/crop behavior, footer structure, and responsive stacking; the user should not have to ask for bottom-of-page fidelity checks.

Do not ask the user to manually rerun separate commands unless you are blocked.

## Image workflow

Follow `shared/image-gen-workflow.md` for every generated artifact.

After each `image_gen` create or edit step, inspect the generated image with `view_image` before using it as the source for later artifacts.

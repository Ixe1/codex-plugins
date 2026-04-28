---
name: maquette
description: Orchestrate Maquette's full staged website workflow for broad plugin-level requests, bootstrapping any missing brand kit, component library, and page artifacts in order.
---

You are responsible for the **full Maquette workflow**.

Use this skill when the user invokes Maquette generally, especially with a broad request such as creating a website, landing page, homepage, page concept, or UI from a brief or existing site.

## Core rule

Do not skip phases.

All Maquette-owned outputs must live under `.maquette/` in the current project. Do not create or overwrite a root-level `index.html` as part of the Maquette workflow.

For broad page or site requests, run the workflow in this order:

1. Brand kit
2. Component library
3. Page or screen

Only proceed to a later phase after the required artifacts for earlier phases exist.

The component-library phase uses focused 1:1 visual component sheets by default. These sheets are the primary component image artifacts and should show real component anatomy, density, states, layout, repeated-card alignment, responsive navigation states, tables/cards/forms, and footer/social modules as needed. CSS contracts are deterministic code/text artifacts derived after inspecting those sheets. Optional CSS-contract poster images are supplemental and non-authoritative unless explicitly requested.

Before component or page implementation, the optional QA tooling decision must be explicit when any planned automated QA path is blocked. Partial availability is not enough: if Playwright is available but `ajv` or `ajv-formats` is missing, ask for an install decision before replacing schema validation with manual JSON checks, unless the user already declined installation for the current run or installation is impossible. When Maquette reference artifacts would benefit from safe 2K preprocessing, check for project-local `sharp` with `shared/scripts/ensure-qa-tooling.mjs --check-image-prep`; if available, use `shared/scripts/safe-upscale-image.mjs` to create separate `...-vN-2k.png` references while preserving the raw `...-vN.png` originals as ground truth. Do not automatically upscale final website assets such as logos, icons, product images, hero banners, illustrations, textures, or transparent media.

When subagent tooling is available, follow `shared/image-gen-workflow.md` to resolve the image-worker decision before the first Maquette `image_gen` create or edit call. If the user has not already explicitly authorized subagents and has not explicitly declined or requested unattended/no-question mode, ask once whether to use Maquette image-worker subagents. Do not treat "not explicitly authorized" as permission to skip image workers. If authorized, run exactly one image artifact per dedicated image worker subagent. The worker must return structured metadata with raw source path, project raw path, derivative paths, dimensions, derivative method, sidecar path, and the downstream artifact to inspect. This applies to brand boards, visual component sheets, optional CSS-contract poster supplements, page concepts, and generated page raster assets. Continue in the main workflow only when image workers are explicitly declined, unavailable after the required question, or explicitly bypassed by unattended/no-question language, and record the reason.

Brand boards and page concepts are user approval gates. The main workflow must save the raw project artifact, check optional image-prep, create the 2K derivative when available or accepted, and `view_image` the exact final approval artifact before asking whether to use it or make a new one. Prefer `...-vN-2k.png` at approval/transcription gates when it exists. Do not include a separate revise choice in the approval buttons. Do not treat one-shot provisional runs as implicit approval unless the user explicitly requested an unattended run.

Unattended mode requires explicit user language such as `unattended`, `do not ask questions`, `no pauses`, `skip approval questions`, or `make all decisions yourself`. Do not infer unattended mode from `one pass`, `full workflow`, `final homepage`, `fresh disposable test`, `run a Maquette test`, or similar phrasing.

## Phase gates

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
- one or more generated and inspected visual component sheet artifacts, such as `.maquette/components/component-sheet-vN.png`
- `.maquette/components/contracts/<batch-slug>.contract.css` for each visual sheet batch, derived deterministically after inspection

If any are missing, run the component-library phase next using `maquette-components`.
If the component catalog does not mark the reusable component library as ready for pages, run `maquette-components` again before the page phase. The page phase should consume reusable components and cataloged APIs, not copy a componentized reference layout.
If the requested page needs dense data patterns, dashboards, tables, maps, calendars, editors, timelines, complex workflows, filter builders, or reusable composites that are not covered by the existing component references, run `maquette-components` again to create focused missing coverage before running the page phase. Multi-artifact component work should proceed sequentially: generate one focused 1:1 visual component sheet by default, derive its deterministic contract, build and review its componentized replica/reference, document reusable component APIs, then move to the next artifact.
If a multi-sheet component catalog records `assets.sheet_implementation_batches`, verify each batch has concrete artifact paths for the derived contract, batch replica/reference, batch component CSS/JS, catalog snapshot, screenshot/manual review evidence, and review before proceeding to the page phase. Retrospective batch logs without concrete batch artifacts are not enough.
If the requested page has a header or primary navigation, verify responsive navigation component coverage before running the page phase: desktop inline nav, tablet/mobile collapsed state, menu toggle, expanded panel or drawer, active/focus states, and icon rendering.
If the requested page has product, pricing, service, offer, or promo card grids, verify repeated-card component coverage before running the page phase: shared media/header/body/footer/action anatomy, stable badge or eyebrow placement, equal-height cards, flex or grid card bodies, and bottom-pinned CTA, quantity, price, or action rows.
If the requested page has a rich footer, footer social links, app/download modules, legal/locale rows, or device imagery, verify footer/social module coverage before running the page phase: recognizable social icons, accessible names, link column anatomy, app/device module coverage, bottom strip coverage, and no unrelated generic icon substitutions.
Verify that the page phase will create a concept-region inventory, page layout contract, and asset manifest before coding. This applies even when the page has few raster assets, because the layout contract is the guardrail for section compactness, terminal-region fidelity, and media fit/crop behavior.

Only after both gates pass should you run the page phase using `maquette-pages`.

## Existing website references

An existing website, screenshot, or codebase may inform the brand kit and component library, but it is not a replacement for them.

Use existing website references to extract:

- product context
- content priorities
- audience expectations
- useful interaction patterns
- visual cues worth preserving

Do not treat copied CSS values, notes, or screenshots as the final design system. First convert the reference into a generated brand board, inspect it with `view_image` using its absolute filesystem path, then derive the design-system JSON and CSS tokens from that inspected artifact.

## One-shot requests

If the user asks for a page and the project has no Maquette artifacts yet, complete a full pass in sequence, pausing at the image-worker authorization question and required image approval gates unless the user explicitly asked for an unattended run:

1. Create the brand kit.
2. Create the component library.
3. Create the requested page.

Mark the outputs as proposed or provisional only for phases that do not require an image approval gate, or when the user explicitly requested an unattended run.
Infer focused extra component/composite sheets when the page brief needs them; the user should not have to ask for fewer components, split sheets, or wide-data coverage.
Infer responsive navigation coverage for page/site requests with global navigation; the user should not have to ask for mobile nav or overflow checks.
Infer repeated-card and footer/social coverage for commerce, product-grid, pricing, service-list, newsletter, app/download, and footer-heavy pages; the user should not have to ask for card anatomy, action alignment, footer fidelity, or recognizable social icons.
Infer page asset-manifest needs for pages with logos supplied by the user, hero images, product images, promo imagery, lifestyle/story imagery, footer/app/device images, background textures, or requested imagegen assets.
Infer page layout-contract needs for section compactness, terminal regions, image fit/crop behavior, footer structure, and responsive stacking; the user should not have to ask for bottom-of-page fidelity checks.

Do not ask the user to manually rerun separate commands unless you are blocked.

## Image workflow

Follow `shared/image-gen-workflow.md` for every generated artifact.

After each `image_gen` create or edit step, inspect the generated image with `view_image` using its absolute filesystem path before using it as the source for later artifacts.

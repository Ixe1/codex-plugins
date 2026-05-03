---
name: maquette
description: Orchestrate Maquette's full staged website workflow for broad plugin-level requests, choosing greenfield direction-first, existing-brand, one-shot-fast, or design-system mode as appropriate.
---

You are responsible for the **full Maquette workflow**.

Use this skill when the user invokes Maquette generally, especially with a broad request such as creating a website, landing page, homepage, page concept, or UI from a brief or existing site.

## Core rule

All Maquette-owned outputs must live under `.maquette/` in the current project. Do not create or overwrite a root-level `index.html` as part of the Maquette workflow.

Choose the workflow mode before generating artifacts:

- **Greenfield Website Mode**: use when the user asks for a new website, landing page, homepage, campaign page, product site, or new brand and no approved Maquette brand kit exists. Run: direction concept -> direction inventory -> constrained brand kit -> executable brand canon -> page concept -> visual implementation contract -> staged identity/product assets -> page thin slice -> just-in-time components derived from the page concept -> page implementation -> independent fidelity review -> system backfill.
- **Existing Brand Mode**: use when an approved brand kit, supplied brand system, existing site identity, or supplied brand assets should be preserved. Run: reference inventory -> brand kit -> executable brand canon -> page concept or requested page -> visual implementation contract -> just-in-time components/pages.
- **One-Shot Fast Mode**: use only when the user explicitly asks for fast/unattended/minimal output. Run: direction concept -> compact brand canon -> page concept -> visual implementation contract -> staged assets -> thin slice -> page -> final system summary.
- **Design System Mode**: use when the user explicitly asks for a broader reusable design system before pages. Run: brand/page direction -> full brand canon -> scoped component contracts -> browser component proofs -> component catalog -> pages.

For greenfield websites, do not start with an abstract brand board. First run the direction phase using `maquette-direction`, then use the selected direction as a seed for the brand kit. The first direction concept is not a final page design or implementation contract; it is a concrete context for hierarchy, visual tone, content density, component needs, and asset needs.

Only proceed to implementation after the required artifacts for the selected workflow mode exist. Do not skip phase gates; change the phase order only through an explicit workflow mode.

The default workflow is page-first after the executable brand canon. Do not build a broad component library before the first page unless the user explicitly asks for Design System Mode. Create the approved page concept and visual implementation contract first, then derive only the critical-path or just-in-time component contracts and browser proofs needed by that page. Backfill the component catalog after page proof.

## Orchestration model

The main workflow is the design owner. It may use subagents for bounded production tasks, but it must keep the approved references and acceptance decisions in the main context.

Use subagents for:

- direction concept generation
- brand board generation
- independent identity or raster asset generation
- focused component contract/proof implementation
- page thin-slice implementation when the write scope is narrow
- independent QA or concept-vs-screenshot review

Do not let subagents approve visual artifacts, reinterpret the brand, loosen the page concept, invent alternate asset names, or mark final fidelity as passing. Subagent outputs are candidates until the main workflow inspects the files, compares them with the approved references, and records accept/reject status.

Before component or page implementation, the optional QA tooling decision must be explicit when any planned automated QA path is blocked. Partial availability is not enough: if Playwright is available but `ajv` or `ajv-formats` is missing, ask for an install decision before replacing schema validation with manual JSON checks, unless the user already declined installation for the current run or installation is impossible. When Maquette reference artifacts are soft or compressed enough to benefit from same-size sharpening, check for project-local `sharp` with `shared/scripts/ensure-qa-tooling.mjs --check-image-prep`; if available, use `shared/scripts/sharpen-reference-image.mjs` to create separate `*-sharpened.png` references while preserving the raw images as ground truth. Do not use image prep to upscale or resize Maquette artifacts.

When subagent tooling is available, follow `shared/image-gen-workflow.md` and use Maquette image-worker subagents automatically. Do not ask whether to use image workers. For multiple independent images, spawn one worker per image asset or tightly related independent batch, run workers in parallel waves, and have the main workflow inspect every returned project-local image path before use. Deterministic component contract posters do not require image workers.

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
- `.maquette/brand/brand-primitives.css`
- `.maquette/brand/brand-proof.html`
- `.maquette/brand/brand-proof-review.md`
- `.maquette/brand/approved.md`
- a generated and inspected brand board image such as `.maquette/brand/brand-board-vN.png`

If any are missing, run the brand-kit phase first using `maquette-brand-kit`.

Before broad design-system page work, verify that these component artifacts exist:

- `.maquette/components/component-catalog.json`
- `.maquette/components/sheet-inventory.md`
- `.maquette/components/sheet-implementation-log.md` when multiple sheets were needed
- `.maquette/components/css/components.css`
- `.maquette/components/js/components.js`
- `.maquette/components/replica-gallery.html`
- `.maquette/components/approved.md`
- one or more structured component contracts, such as `.maquette/components/contracts/<batch-slug>.contract.json`
- deterministic contract review posters when created, such as `.maquette/components/contracts/<batch-slug>.contract.svg`
- generated and inspected visual component artifacts only when explicitly requested, such as `.maquette/components/component-sheet-vN.png`

In the default page-first workflow, missing component coverage is not a reason to build a broad library first. Instead, run only the focused `maquette-components` batches needed for the current page, or let the page phase request just-in-time component contracts/proofs before implementing those regions. Multi-artifact component work should proceed sequentially: create one focused structured component contract, optionally render a deterministic poster, build and review its browser proof/reference, document reusable APIs, then move to the next needed artifact.
If a multi-batch component catalog records `assets.sheet_implementation_batches`, verify each batch has concrete artifact paths for the structured contract, deterministic poster if created, visual sheet if used, batch replica/reference, batch component CSS/JS, catalog snapshot, screenshot/manual review evidence, and review before proceeding to the page phase. Retrospective batch logs without concrete batch artifacts are not enough.
If the requested page has a header, product grid, rich footer, newsletter, app/download module, or other reusable region, derive the needed component contracts from the approved page concept and visual implementation contract. Verify responsive navigation, repeated-card anatomy, footer/social details, and other reusable behavior before coding those regions, but do not create generic pre-concept component proofs that can reshape the page.
Verify that the page phase will create a concept-region inventory, page layout contract, and asset manifest before coding. This applies even when the page has few raster assets, because the layout contract is the guardrail for section compactness, terminal-region fidelity, and media fit/crop behavior.

Only after the brand canon exists should you run the page phase using `maquette-pages`. In Design System Mode, complete the broader component gate before page work. In default page-first mode, the page phase creates the page concept and visual implementation contract before requesting or producing focused component proofs.

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

## Brand drift gate

Before accepting any component proof or final page, verify:

- it imports `.maquette/brand/tokens.css` and `.maquette/brand/brand-primitives.css`, or equivalent relative paths from the page/component artifact
- it preserves the approved color roles, typography hierarchy, button geometry, spacing rhythm, radius, shadow, and surface language
- it avoids generic UI-kit, SaaS, or ecommerce defaults that are absent from the brand canon
- it preserves the approved page concept's major composition, section order, density, product/card anatomy, hero model, newsletter/footer anatomy, and terminal-region visual weight unless an intentional deviation was approved before coding
- it does not introduce unauthorized logo, wordmark, monogram, mascot, emblem, lockup, or brand-mark assets
- it does not introduce unapproved alternate brand names, product line names, labels, signage, or packaging systems in generated raster assets
- it does not contain uninspected generated images or final empty placeholders

If any check fails, revise before proceeding or record a concrete blocker and follow-up in the relevant review file.

## One-shot requests

If the user asks for a page and the project has no Maquette artifacts yet, complete a full pass in Greenfield Website Mode, using automatic image workers when available and pausing at required image approval gates unless the user explicitly asked for an unattended run:

1. Create or select a concrete direction concept and inventory.
2. Create the brand kit constrained by that direction.
3. Create the executable brand canon: design-system JSON, tokens CSS, brand primitive CSS, browser brand proof, and brand-proof review.
4. Create the requested page concept.
5. Create the concept-region inventory, visual implementation contract, page layout contract, and asset manifest.
6. Generate identity/product assets first when needed, write asset consistency notes, then generate dependent images in staged parallel waves.
7. Build and screenshot-review a thin slice using the brand canon and approved assets.
8. Create just-in-time component contracts and browser proofs only for components the approved page concept actually needs.
9. Complete the requested page.
10. Run an independent concept-vs-screenshot fidelity review and fix major deviations before finalizing.
11. Backfill final system notes with confirmed tokens, confirmed components, provisional components, page-local patterns, future component candidates, and known concept deviations.

Mark the outputs as proposed or provisional only for phases that do not require an image approval gate, or when the user explicitly requested an unattended run.
Infer focused extra component/composite contracts when the page brief needs them; do not generate component sheets unless the user explicitly asks for visual sheets.
Infer responsive navigation coverage for page/site requests with global navigation; the user should not have to ask for mobile nav or overflow checks.
Infer repeated-card and footer/social coverage for commerce, product-grid, pricing, service-list, newsletter, app/download, and footer-heavy pages; the user should not have to ask for card anatomy, action alignment, footer fidelity, or recognizable social icons.
Infer page asset-manifest needs for pages with logos supplied by the user, hero images, product images, promo imagery, lifestyle/story imagery, footer/app/device images, background textures, or requested imagegen assets.
Never create Maquette-authored logo, wordmark, monogram, mascot, emblem, lockup, or brand-mark SVGs by code. Identity assets are supplied assets or generated raster image assets only. Generic UI icons and non-identity ornaments may be SVG.
Infer page layout-contract needs for section compactness, terminal regions, image fit/crop behavior, footer structure, and responsive stacking; the user should not have to ask for bottom-of-page fidelity checks.

Do not ask the user to manually rerun separate commands unless you are blocked.

## Image workflow

Follow `shared/image-gen-workflow.md` for every generated artifact.

After each `image_gen` create or edit step, inspect the generated image with `view_image` before using it as the source for later artifacts.

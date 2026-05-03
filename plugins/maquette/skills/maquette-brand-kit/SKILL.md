---
name: maquette-brand-kit
description: "Create or revise a website brand kit from a brief, approved greenfield direction, screenshots, or an existing site. This skill is image_gen-first: always create or revise a structured board image before finalizing the design-system contract, unless the user explicitly tells you not to use image generation or the tool is unavailable."
---

You are responsible for the **website brand-kit phase**.

## Scope

Use this skill only for website visual-system work. Do not use it for native desktop UI.
Do not design or modify a logo in the brand-kit phase. If a later page needs a logo or wordmark and no supplied asset exists, it must be generated as a raster image asset in the page asset phase, not hand-authored as SVG.
Write all Maquette-owned outputs under `.maquette/` in the current project. Do not create or overwrite root-level website files such as `index.html`.

## Non-negotiable image_gen policy

If the `image_gen` tool is available, you **must use it** for the core design pass.
Follow `shared/image-gen-workflow.md` for required visual inspection, same-turn continuation, and conditional transparent PNG verification.
Do not skip straight to HTML/CSS/JS-only output.
Do not treat image generation as optional inspiration.
For this skill, the image is the primary creative artifact.

Use image generation in one of these modes:
- **Generate** a new brand board from the brief
- **Edit** an existing or previously approved brand board to evolve the direction

If you need to edit a local image file, ensure it is first made visible in the conversation with `view_image`, then instruct `image_gen` to edit the visible image.

After every `image_gen` create or edit step, inspect the generated image with `view_image` before treating it as the design source. Do not derive tokens or design-system details from the prompt alone. If the generated file cannot be inspected, state that limitation and treat the image as unverified.

When image-worker subagents are available, run brand-board image generation or editing in a dedicated image worker subagent automatically. Do not ask whether to use image workers. The worker should return the exact saved image path and the project-local `.maquette/brand/brand-board-vN.png` path. The main workflow must inspect the returned image with `view_image`, ask the approval question, and only then derive tokens.

After inspecting a generated or edited brand board that passes rejection checks, ask the user whether to use it before writing `design-system.json` or `tokens.css`. Use the Codex user-input/question tool when available with choices equivalent to:
- `Yes, use this` as the recommended choice
- `No, make a new one`

If the user approves, continue. If the user asks for a new one, regenerate before deriving tokens. If the user gives free-form revision notes, edit the image using those notes, inspect the revision, and ask again with the same two approval choices. Do not treat a brand board as approved merely because the run is one-shot or provisional unless the user explicitly requested an unattended run. `One pass`, `full workflow`, `final homepage`, `fresh disposable test`, and similar phrasing are not unattended requests by themselves.

Only skip image generation if:
- the user explicitly says not to use it, or
- the environment genuinely does not provide the tool

## Inputs

You may receive:
- a short product brief
- an approved greenfield direction concept and `.maquette/direction/direction-inventory.json`
- a repo with existing website code
- existing screenshots
- a previously approved brand board
- requests to refresh or evolve the current system

Existing websites, screenshots, and code are references for creating the brand board. They are not a substitute for a generated and inspected brand board, design-system JSON, or CSS tokens.

In Greenfield Website Mode, an approved direction concept is the creative seed for the brand board. Use `.maquette/direction/direction-inventory.json` when present to preserve the selected page direction's hierarchy, visual tone, content density, component needs, asset needs, and page-local cautions. The brand board must normalize the selected direction into reusable brand rules without drifting into a new unrelated style.

In Existing Brand Mode, preserve first and modernize second. When existing websites, screenshots, code, or supplied brand assets are present, write `.maquette/brand/reference-inventory.md` before generating the brand board. Record source references, brand elements to preserve, supplied assets that must not be regenerated, allowed evolution, do-not-change constraints, accessibility issues, and uncertainties that need user approval.

## Required outputs

Always create or update these files when you finish a pass:

- `.maquette/brand/brief.md`
- `.maquette/brand/design-system.json`
- `.maquette/brand/tokens.css`
- `.maquette/brand/brand-primitives.css`
- `.maquette/brand/brand-proof.html`
- `.maquette/brand/brand-proof-review.md`
- `.maquette/brand/approved.md`

When existing brand or site references are used, also create or update:

- `.maquette/brand/reference-inventory.md`

When `image_gen` is available, also create or update:

- `.maquette/brand/brand-board-vN.png`

When browser tooling is available, also create or update:

- `.maquette/brand/brand-proof.png`

The JSON file must validate against `shared/design-system.schema.json`.

## Workflow

1. Read the request, repo, and visible references.
   - If `.maquette/direction/direction-inventory.json` exists, read it before writing the brand brief.
   - If the direction inventory references a selected concept image, inspect that image with `view_image` when possible before generating or editing the brand board.
   - If existing website, code, screenshots, or supplied brand assets are present, create or update `.maquette/brand/reference-inventory.md` before generating the brand board.
2. Write or refresh `.maquette/brand/brief.md` with:
   - product summary
   - audience
   - tone adjectives
   - constraints
   - accessibility requirements
3. If `image_gen` is available, create or edit a **focused structured brand board** using `assets/brand-board-prompt.md`.
   - Use the board as the creative exploration and approval artifact.
   - In Existing Brand Mode, use the board as a preservation and normalization artifact, not a reinvention artifact. Preserve recognizable brand language and record any modernization or accessibility adjustment.
   - Inspect the generated board with `view_image` before writing the design-system JSON or CSS tokens.
   - If the generated board is soft or compressed enough that approval/transcription would benefit from sharpening, run `shared/scripts/ensure-qa-tooling.mjs --project . --check-image-prep`. If project-local `sharp` is available, create a separate same-size sharpened derivative with `shared/scripts/sharpen-reference-image.mjs` and inspect that derivative. Preserve the raw board as the ground-truth creative artifact and do not overwrite, upscale, or resize it.
   - If `sharp` is missing but sharpening would materially improve fidelity, ask whether to install `sharp` before creating the sharpened derivative unless the user already declined optional installs for this run.
   - If revising an existing board, preserve continuity unless the user asked for a new direction.
   - Inspect the generated board before using it. If it contains any logo-like mark, wordmark, brand-name masthead, large product-name treatment, monogram, mascot mark, seal, badge, app icon, emblem, or trademark-like element, reject that image for brand-kit approval and regenerate or edit it out before continuing.
   - If the board is visually cluttered or unreadable at normal preview size, reject it as an approval artifact and regenerate with narrower scope before continuing.
4. Ask the user whether to use the inspected brand board.
   - Use the approval choices from the non-negotiable image policy.
   - Record the user's decision in `.maquette/brand/approved.md`.
   - Do not create the design-system JSON or tokens until the user approves the board, unless the user explicitly requested an unattended run.
5. Create or update `.maquette/brand/design-system.json` so it matches the approved board.
   - The inspected brand board is the visual source of truth for palette, typography direction, spacing, radius, surfaces, shadows, and state principles.
   - In Greenfield Website Mode, set `meta.source_mode` to `greenfield-page-seeded`, record `meta.source_direction_inventory_path`, and add `references` entries for the selected direction concept and direction inventory.
   - In Existing Brand Mode, set `meta.source_mode` to `existing-brand`, add `references` entries for the reference inventory and inspected site or asset references, and document any intentional modernization or accessibility adjustments in `meta.notes`.
   - Add `brand_fingerprint.must_preserve` and `brand_fingerprint.forbidden` entries that make the approved board's durable visual language testable by components and pages.
   - Add `brand_proof` metadata after the executable proof exists.
   - Record token decisions with scope, maturity, and source when a value is global, component-specific, or page-local. Do not promote hero-only or campaign-only visual effects into global tokens unless they clearly belong to the durable brand system.
   - Do not use a script, existing CSS file, Figma/design export, or predetermined token file to infer or override brand tokens unless the user explicitly provides it as an approved constraint.
6. Export `.maquette/brand/tokens.css` from the board-derived design system JSON. Use `scripts/export-tokens.mjs` if present.
   - The export script is only a deterministic JSON-to-CSS serializer. It must not be treated as token extraction, visual analysis, or design decision-making.
7. Create the executable brand canon:
   - `.maquette/brand/brand-primitives.css` contains reusable primitive classes for typography roles, buttons, links, inputs, chips, badges, cards, panels, inverse surfaces, focus states, disabled states, spacing/radius/shadow helpers, and at least one relevant commerce/content module when the site domain implies one.
   - `.maquette/brand/brand-proof.html` imports `tokens.css` and `brand-primitives.css`, then renders the primitives in realistic browser context.
   - `.maquette/brand/brand-proof-review.md` records visual comparison against the approved brand board, brand fingerprint checks, corrections made, screenshot paths when available, and any accepted deviations.
   - Capture `.maquette/brand/brand-proof.png` when browser tooling is available. If browser capture is unavailable, manually inspect the proof and record why automated capture did not run.
   - Revise the proof before proceeding if it looks like a generic UI kit, loses the approved palette, uses the wrong type personality, changes button geometry, changes spacing/radius/surface/shadow language, or introduces unauthorized identity assets.
8. Summarize what changed and record the approved board, token status, brand-proof status, and any user revision notes in `.maquette/brand/approved.md`.

## Board rules

The board is a foundational 1:1 visual-system artifact, not a component specification or exhaustive UI inventory. It should focus on:
- palette and semantic color roles
- typography direction, recommended font families or categories, fallbacks, weights, sizes, and line-height
- spacing rhythm
- radius scale
- border, elevation, and shadow language
- surface treatments
- motion, focus, interaction, disabled, selected, and error principles

Do not include full component inventories or detailed button, input, card, product-card, navigation, or form variants on the brand board. Tiny abstract UI fragments are allowed only when they demonstrate color, focus, surface, density, or state principles; label or treat them as visual-system fragments, not component specs.

The board must clearly specify recommended font families or font categories. If exact licensed fonts are unavailable, it must name practical web-safe or open-source substitutes.

Move exhaustive primitive and component coverage to the component-library phase.

The board must not include a logo, wordmark, emblem, mascot, brand seal, app icon, placeholder mark, monogram, badge, or trademark-like element. It also must not show the brand or product name as a masthead, header, large title, display text, logo-like text, app mark, badge, seal, or primary text treatment. Brand kits define visual-system language only; logo creation belongs to a separate logo/asset task.
If product text is needed on the board, use neutral labels such as "Design System", "Server Discovery UI", "Telemetry Surface", "Operations Dashboard", or similar generic descriptors. The actual brand name may appear only, if at all, as small body-size sample copy and never as the largest, most prominent, or primary text on the image.
It may include a compact text spec panel that mirrors the real token files, but implementation notes must not dominate the board.
Keep the board readable even when exported at modest resolution.
Do not cram dense code into tiny unreadable blocks.

## Stability rules

If a board has already been approved:
- preserve palette, typography personality, spacing rhythm, radius style, and control language
- change only the parts the user asked to change
- do not silently invent a new brand direction

If a greenfield direction has already been approved:
- preserve its selected visual tone, hierarchy, density, and component priorities unless the user asks for a new direction
- normalize approximate image details to a durable token scale rather than copying false precision
- keep one-off page flourishes page-local unless they recur as durable brand language

If existing brand references are present:
- preserve recognizable palette, type personality, imagery style, layout density, control language, and content hierarchy unless the user asks for a redesign
- do not generate, redraw, simplify, or reinterpret supplied logos, wordmarks, brand marks, icons, photography, or product screenshots
- improve accessibility, token consistency, responsive behavior, and component normalization without changing brand personality
- record any unresolved mismatch between references before approving the board

## Implementation rules

- Website only: use CSS token naming that can be consumed directly by HTML/CSS/JS.
- Use semantic tokens rather than hard-coded component colors when possible.
- Prefer explicit, machine-readable outputs over prose-only descriptions.
- The image board is the creative artifact and visual authority; the JSON and CSS files are the machine-readable contract derived from that inspected board.
- The executable brand canon is the browser implementation bridge from the approved board to every component and page. Components and pages must import `tokens.css` and `brand-primitives.css`; they must not reinterpret the approved board from scratch.
- Token export scripts may serialize the approved JSON into CSS, but they must not extract, guess, normalize, or replace visual decisions from the board.
- The design-system JSON must record the intended font personality and acceptable CSS fallback stacks. Do not blindly use crude defaults such as `Impact` only because a board shows condensed or bold headings; use `Impact` only when the board explicitly approves it.

## Brand proof acceptance

The brand proof must include enough browser-rendered examples to catch brand drift before component and page work:

- display, heading, body, caption, and mono typography examples
- primary, secondary, inverse, disabled, hover/focus-visible, and text-link controls
- inputs, chips, badges, status/alert fragments, cards, panels, and inverse surfaces
- spacing, radius, border, shadow, motion, and focus examples
- at least one domain-relevant primitive module, such as product card, pricing tile, dashboard stat, media card, or newsletter strip

Fail and revise the brand proof if it introduces generic UI-kit styling, default ecommerce surfaces, unauthorized hard-coded colors, unauthorized identity marks, a different button shape, a different type hierarchy, or page-level decoration that is not supported by the approved board.

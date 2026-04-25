---
name: maquette-brand-kit
description: "Create or revise a website brand kit from a brief, screenshots, or an existing site. This skill is image_gen-first: always create or revise a structured board image before finalizing the design-system contract, unless the user explicitly tells you not to use image generation or the tool is unavailable."
---

You are responsible for the **website brand-kit phase**.

## Scope

Use this skill only for website visual-system work. Do not use it for native desktop UI.
Do not design or modify a logo.
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

Only skip image generation if:
- the user explicitly says not to use it, or
- the environment genuinely does not provide the tool

## Inputs

You may receive:
- a short product brief
- a repo with existing website code
- existing screenshots
- a previously approved brand board
- requests to refresh or evolve the current system

Existing websites, screenshots, and code are references for creating the brand board. They are not a substitute for a generated and inspected brand board, design-system JSON, or CSS tokens.

## Required outputs

Always create or update these files when you finish a pass:

- `.maquette/brand/brief.md`
- `.maquette/brand/design-system.json`
- `.maquette/brand/tokens.css`
- `.maquette/brand/approved.md`

When `image_gen` is available, also create or update:

- `.maquette/brand/brand-board-vN.png`

The JSON file must validate against `shared/design-system.schema.json`.

## Workflow

1. Read the request, repo, and visible references.
2. Write or refresh `.maquette/brand/brief.md` with:
   - product summary
   - audience
   - tone adjectives
   - constraints
   - accessibility requirements
3. If `image_gen` is available, create or edit a **focused structured brand board** using `assets/brand-board-prompt.md`.
   - Use the board as the creative exploration and approval artifact.
   - Inspect the generated board with `view_image` before writing the design-system JSON or CSS tokens.
   - If revising an existing board, preserve continuity unless the user asked for a new direction.
   - Inspect the generated board before using it. If it contains any logo-like mark, wordmark, brand-name masthead, large product-name treatment, monogram, mascot mark, seal, badge, app icon, emblem, or trademark-like element, reject that image for brand-kit approval and regenerate or edit it out before continuing.
   - If the board is visually cluttered or unreadable at normal preview size, reject it as an approval artifact and regenerate with narrower scope before continuing.
4. Create or update `.maquette/brand/design-system.json` so it matches the approved or proposed board.
   - The inspected brand board is the visual source of truth for palette, typography direction, spacing, radius, surfaces, shadows, and state principles.
   - Do not use a script, existing CSS file, Figma/design export, or predetermined token file to infer or override brand tokens unless the user explicitly provides it as an approved constraint.
5. Export `.maquette/brand/tokens.css` from the board-derived design system JSON. Use `scripts/export-tokens.mjs` if present.
   - The export script is only a deterministic JSON-to-CSS serializer. It must not be treated as token extraction, visual analysis, or design decision-making.
6. Summarize what changed and ask for approval or revision.
7. Record the current decision in `.maquette/brand/approved.md`.

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

## Implementation rules

- Website only: use CSS token naming that can be consumed directly by HTML/CSS/JS.
- Use semantic tokens rather than hard-coded component colors when possible.
- Prefer explicit, machine-readable outputs over prose-only descriptions.
- The image board is the creative artifact and visual authority; the JSON and CSS files are the machine-readable contract derived from that inspected board.
- Token export scripts may serialize the approved JSON into CSS, but they must not extract, guess, normalize, or replace visual decisions from the board.
- The design-system JSON must record the intended font personality and acceptable CSS fallback stacks. Do not blindly use crude defaults such as `Impact` only because a board shows condensed or bold headings; use `Impact` only when the board explicitly approves it.

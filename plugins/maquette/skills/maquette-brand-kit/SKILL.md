---
name: maquette-brand-kit
description: "Create or revise a website brand kit from a brief, screenshots, or an existing site. This skill is image_gen-first: always create or revise a structured board image before finalizing the design-system contract, unless the user explicitly tells you not to use image generation or the tool is unavailable."
---

You are responsible for the **website brand-kit phase**.

## Scope

Use this skill only for website visual-system work. Do not use it for native desktop UI.
Do not design or modify a logo.

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

## Required outputs

Always create or update these files when you finish a pass:

- `ui/brand/brief.md`
- `ui/brand/design-system.json`
- `ui/brand/tokens.css`
- `ui/brand/approved.md`

When `image_gen` is available, also create or update:

- `ui/brand/brand-board-vN.png`

The JSON file must validate against `shared/design-system.schema.json`.

## Workflow

1. Read the request, repo, and visible references.
2. Write or refresh `ui/brand/brief.md` with:
   - product summary
   - audience
   - tone adjectives
   - constraints
   - accessibility requirements
3. If `image_gen` is available, create or edit a **structured brand board** using `assets/brand-board-prompt.md`.
   - Use the board as the creative exploration and approval artifact.
   - Inspect the generated board with `view_image` before writing the design-system JSON or CSS tokens.
   - If revising an existing board, preserve continuity unless the user asked for a new direction.
   - Inspect the generated board before using it. If it contains any logo, wordmark, monogram, mascot mark, app icon, seal, badge, or trademark-like brand mark, reject that image for brand-kit approval and regenerate or edit it out before continuing.
4. Create or update `ui/brand/design-system.json` so it matches the approved or proposed board.
5. Generate `ui/brand/tokens.css` from the design system JSON. Use `scripts/export-tokens.mjs` if present.
6. Summarize what changed and ask for approval or revision.
7. Record the current decision in `ui/brand/approved.md`.

## Board rules

The board should show, at minimum:
- palette
- type scale
- spacing and radius
- buttons
- inputs
- textarea
- select
- checkbox
- radio
- switch
- slider
- tabs
- cards
- alerts
- table styling
- relevant states

The board must not include a logo, wordmark, emblem, mascot, brand seal, app icon, or placeholder mark. Brand kits define visual-system language only; logo creation belongs to a separate logo/asset task.
It must include a compact text spec panel that mirrors the real token files.
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
- The image board is the creative artifact; the JSON and CSS files are the machine-readable contract.

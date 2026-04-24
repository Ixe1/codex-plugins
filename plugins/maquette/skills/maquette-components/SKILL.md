---
name: maquette-components
description: "Build a reusable website component library and preview gallery from an approved brand token set. This skill is image_gen-guided: create or revise a component-sheet image first, then implement the coded library to match it."
---

You are responsible for the **website component-library phase**.

## Preconditions

Do not start this phase until a brand system exists at:

- `ui/brand/design-system.json`
- `ui/brand/tokens.css`

Prefer to wait for user approval of the brand kit before expanding the library.

## Non-negotiable image_gen policy

If the `image_gen` tool is available, you **must use it** in this phase.
Follow `shared/image-gen-workflow.md` for required visual inspection, same-turn continuation, and conditional transparent PNG verification.
Do not go straight from tokens to coded components with no image pass.
The component sheet is the creative design artifact that helps the coding model implement a richer and more polished result.

Use image generation to:
- create a component sheet from the approved brand board, or
- edit an existing approved component sheet to add or revise components while preserving the design language

If a local board or sheet image must be edited, first make it visible in the conversation with `view_image`, then ask `image_gen` to edit the visible image.

After every `image_gen` create or edit step, inspect the generated image with `view_image` before treating it as the design source. Do not derive component specifications or implementation details from the prompt alone. If the generated file cannot be inspected, state that limitation and treat the image as unverified.

Only skip image generation if:
- the user explicitly tells you not to use it, or
- the environment genuinely does not provide the tool

## Required outputs

Always create or update:

- `ui/components/component-catalog.json`
- `ui/components/components.css`
- `ui/components/components.js`
- `ui/components/gallery.html`
- `ui/components/approved.md`

When possible, also create:

- `ui/components/gallery.png`
- `ui/components/component-sheet-vN.png`

The catalog JSON must validate against `shared/component-catalog.schema.json`.

## Workflow

1. Read `ui/brand/design-system.json` and `ui/brand/tokens.css`.
2. If `image_gen` is available, create or edit a component-sheet image using the approved brand board and `assets/component-sheet-prompt.md`.
   - Inspect the generated component sheet with `view_image` before implementing components, gallery code, or catalog details.
3. Build reusable website primitives first:
   - buttons
   - text inputs
   - textarea
   - select
   - checkbox
   - radio
   - switch
   - slider
   - tabs
   - badges
   - alerts
   - cards
   - tables
   - modals/tooltips if required by the design system
4. Use semantic HTML and CSS custom properties.
5. Keep JS minimal and only add it where interactivity requires it.
6. Build a gallery page that renders every component, variant, size, and major state.
7. If screenshot tooling is available, capture the gallery. Use `scripts/capture-gallery.mjs` if present.
   - Keep Playwright/Chromium screenshot capture headless.
   - Ensure every browser/session opened for screenshot capture is closed before finishing.
   - If cleanup fails, record the failed cleanup command or operation in the final response.
8. Compare the coded gallery against the approved design references and make focused corrections.
9. Run the required component QA pass:
   - Check icon and icon-button contrast in every visible state, especially active, selected, disabled, inverse, and dark-background states.
   - Check variant anatomy parity: variants of the same component should preserve shared media/header/body/footer/action structure unless the difference is intentional and documented.
   - Check gallery layout fit: wide components such as tables, data grids, charts, timelines, calendars, code blocks, and comparison matrices should default to full-width gallery rows; horizontal scrolling should only be expected at genuinely narrow viewports.
   - Check that text, badges, icons, buttons, and table cells do not overlap or become unreadable in the captured screenshot.
10. Update `ui/components/component-catalog.json` with implemented coverage.
11. Summarize gaps, mismatches, and approval status in `ui/components/approved.md`.

## Visual consistency rules

- Follow the approved brand system exactly.
- Do not invent a new visual language.
- Reuse shared tokens everywhere instead of hard-coded one-off values.
- Focus treatments and disabled states must remain consistent across controls.
- The coded gallery should be visually pulled toward the approved component sheet, not away from it.
- Every icon-only control must have sufficient foreground/background contrast in default, hover, active, selected, disabled, and inverse states.
- Component variants should share the same anatomy, spacing rhythm, and action placement unless the catalog explicitly records why a variant differs.
- Wide data-dense components should not be squeezed into narrow gallery cards on desktop.

## Review rules

If a reference board or component sheet exists:
- compare the coded gallery against it
- inspect the rendered screenshot directly
- make one focused correction at a time
- prefer small targeted fixes over wide stylistic rewrites

Before finishing:
- Verify no icon disappears into its background.
- Verify same-component variants keep comparable text hierarchy, media/header/body/action placement, and button sizing.
- Verify tables and other wide components receive enough horizontal space in the gallery.
- If a screenshot shows horizontal scrolling, explain whether it is expected for the viewport or fix the gallery layout.

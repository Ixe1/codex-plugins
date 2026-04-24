---
name: maquette-components
description: "Build a reusable website component library and preview gallery from an approved brand token set. This skill is image_gen-guided: create or revise focused component-sheet images first, then implement the coded library to match them."
---

You are responsible for the **website component-library phase**.

Write all Maquette-owned component artifacts under `.maquette/components/` in the current project. Do not create or overwrite root-level website files such as `index.html`.

## Preconditions

Do not start this phase until a brand system exists at:

- `.maquette/brand/design-system.json`
- `.maquette/brand/tokens.css`

Also require a generated and inspected brand board image, such as `.maquette/brand/brand-board-vN.png`, unless the user explicitly asks to skip image generation or the environment does not provide `image_gen`.

If these artifacts are missing, do not invent a component library from raw notes, copied CSS, screenshots, or an existing website alone. Run the brand-kit phase first using `maquette-brand-kit`.

Prefer to wait for user approval of the brand kit before expanding the library. In a one-shot `maquette` workflow, proceed with the brand kit as provisional and record that status.

## Non-negotiable image_gen policy

If the `image_gen` tool is available, you **must use it** in this phase.
Follow `shared/image-gen-workflow.md` for required visual inspection, same-turn continuation, and conditional transparent PNG verification.
Do not go straight from tokens to coded components with no image pass.
The component sheets are the creative design artifacts that help the coding model implement a richer and more polished result.

Use image generation to:
- create a focused core-primitives component sheet from the approved brand board,
- create additional focused component, data-pattern, or composite sheets when the product needs them, or
- edit existing approved sheets to add or revise components while preserving the design language

When a page or site has global navigation, responsive navigation primitives are required component coverage, not a page-only afterthought.

The component sheet is the source of truth for component styling. If it conflicts with the brand board, preserve the brand foundation where possible, but the component sheet wins for component anatomy, variants, state styling, and spacing; record the inconsistency and resolution in `.maquette/components/approved.md`.

If a local board or sheet image must be edited, first make it visible in the conversation with `view_image`, then ask `image_gen` to edit the visible image.

After every `image_gen` create or edit step, inspect the generated image with `view_image` before treating it as the design source. Do not derive component specifications or implementation details from the prompt alone. If the generated file cannot be inspected, state that limitation and treat the image as unverified.
Reject, regenerate, or split a sheet before implementation if it is not readable and useful at normal preview size.

Only skip image generation if:
- the user explicitly tells you not to use it, or
- the environment genuinely does not provide the tool

## Required outputs

Always create or update:

- `.maquette/components/component-catalog.json`
- `.maquette/components/components.css`
- `.maquette/components/components.js`
- `.maquette/components/gallery.html`
- `.maquette/components/approved.md`

When possible, also create:

- `.maquette/components/gallery.png`
- `.maquette/components/component-sheet-vN.png`
- additional focused sheet images such as `.maquette/components/component-sheet-data-vN.png`, `.maquette/components/component-sheet-forms-vN.png`, or `.maquette/components/component-sheet-composites-vN.png` when needed

The catalog JSON must validate against `shared/component-catalog.schema.json`.

## Workflow

1. Read `.maquette/brand/design-system.json` and `.maquette/brand/tokens.css`.
2. If `image_gen` is available, create or edit component-sheet images using the approved brand board and `assets/component-sheet-prompt.md`.
   - The first required sheet is a focused core-primitives sheet.
   - Infer whether additional focused sheets are needed. Create them automatically when the product involves dense data, dashboards, server lists, tables, maps, calendars, editors, timelines, complex workflows, filter builders, or large reusable composites.
   - Do not hardcode an exact component count. Use inspectability as the gate: each sheet must be readable and useful at normal preview size.
   - Inspect every generated component sheet with `view_image` before implementing components, gallery code, or catalog details.
   - Reject, regenerate, or split a sheet if labels are too small, unrelated families are crammed into tiny cells, components overlap, full tables or dashboards crowd out primitives, implementation notes dominate, or the image cannot guide implementation without heavy zooming.
   - If global navigation exists or is likely for the requested site, include desktop inline nav, compact/tablet nav, mobile menu toggle, expanded mobile menu or drawer, active state, focus state, and visible icon rendering.
3. Build reusable website primitives first:
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
4. Keep component primitives and larger patterns conceptually separate:
   - component sheet: reusable primitives and core states
   - additional focused sheets: dense data patterns and reusable larger composites
   - page concept: page-level composition
5. Use semantic HTML and CSS custom properties.
6. Keep JS minimal and only add it where interactivity requires it.
7. Build a gallery page that renders every component, variant, size, and major state.
   - The gallery must be a faithful coded counterpart to the generated component sheet, not a minimal selector demo.
   - Include the same component families, variants, states, card anatomy, responsive navigation examples, product cards, newsletter modules, footer/social modules, density, spacing, and polish shown in the sheet.
   - For repeated cards, use shared media/header/body/footer/action slots, consistent badge or eyebrow placement, equal heights, and bottom-pinned action rows.
8. If screenshot tooling is available, capture the gallery. Use `scripts/capture-gallery.mjs` if present.
   - Keep Playwright/Chromium screenshot capture headless.
   - Ensure every browser/session opened for screenshot capture is closed before finishing.
   - If cleanup fails, record the failed cleanup command or operation in the final response.
   - Capture desktop, tablet, and mobile gallery screenshots when possible; at minimum use representative widths 390, 768, and 1440 when browser tooling is available.
9. Compare the coded gallery against the approved design references and make focused corrections.
10. Run the required component QA pass:
   - Fail and fix the gallery if it is significantly simpler, sparser, less polished, or less sophisticated than the generated component sheet.
   - Check component sheet coverage: every visible component family, important variant, major state, repeated-card anatomy pattern, responsive navigation state, product-card pattern, newsletter module, and footer/social module shown in the sheet should appear in the gallery or be documented as intentionally deferred with a reason.
   - Check icon and icon-button contrast in every visible state, especially active, selected, disabled, inverse, and dark-background states.
   - Check that icon-only buttons and compact controls visibly render supported icons and are not blank.
   - Check responsive navigation primitives when present: desktop inline nav, tablet/mobile collapsed nav, menu toggle icon, expanded menu or drawer, active link, focus state, and tap-target sizing.
   - Check variant anatomy parity: variants of the same component should preserve shared media/header/body/footer/action structure unless the difference is intentional and documented.
   - Check repeated card anatomy and alignment: product-card and comparable repeated-card grids must use shared media/header/body/footer/action slots, consistent badge or eyebrow placement, equal-height cards, flex or grid body layout, and bottom-pinned action rows so CTA, quantity, price, and action controls align across cards even when copy length varies.
   - Compare screenshots of repeated-card examples and fail QA if one card's heading, badge, label, content, or action row shifts inconsistently relative to siblings due to optional badges, labels, or differing copy length.
   - Check gallery layout fit: wide components such as tables, data grids, charts, timelines, calendars, code blocks, and comparison matrices should default to full-width gallery rows; horizontal scrolling should only be expected at genuinely narrow viewports.
   - Check that text, badges, icons, buttons, and table cells do not overlap or become unreadable in the captured screenshot.
   - Run measurable responsive overflow QA when browser tooling is available. Prefer `shared/scripts/audit-responsive-layout.mjs` if present.
   - Test at least viewport widths 390, 768, 1024, 1280, and 1440.
   - Prefer capturing full-page gallery screenshots for all audited widths when practical.
   - For each tested viewport, record `window.innerWidth`, `document.documentElement.scrollWidth`, `document.body.scrollWidth`, and clientWidth/scrollWidth for wide components such as tables, grids, timelines, charts, calendars, code blocks, and comparison matrices.
   - Record top overflow offenders when any are present.
   - Fail and fix the gallery if document scroll width exceeds viewport width by more than 1px, unless there is an explicit documented exception.
   - Internal horizontal scrolling for wide components is allowed only when intentional and documented. It should generally not appear on normal desktop or tablet layouts unless the component is truly a data grid that requires it.
   - Horizontal scrolling is not an acceptable default solution for primary navigation on tablet or mobile.
11. Update `.maquette/components/component-catalog.json` with implemented coverage.
   - Record all generated component sheet paths in a stable place, using `assets.component_sheet_paths` when multiple sheets exist while preserving `assets.component_sheet_path` for compatibility.
   - Record component sheet vs gallery fidelity in `assets.sheet_fidelity_review`, including reference sheet paths, coverage summary, simplifications, and status.
   - Each component's `visual_review.reference_image_paths` should include the sheet or sheets that guided that component.
   - Responsive navigation components should record variants such as `desktop-inline`, `tablet-collapsed`, `mobile-collapsed`, `mobile-expanded`, `active`, and `focus-visible` in `implemented_variants` or `implemented_states`.
   - Product-card or repeated-card components should record equal-height behavior, body layout strategy, bottom-pinned action rows, and screenshot evidence for action-row alignment.
12. Summarize gaps, mismatches, approval status, component sheet vs gallery fidelity, brand-board/component-sheet inconsistencies and which artifact won, measured responsive overflow results, screenshot paths, repeated-card anatomy and action-row alignment results, open nav screenshot paths when present, accepted scroll exceptions, responsive navigation notes, and icon-rendering notes in `.maquette/components/approved.md`.

## Visual consistency rules

- Follow the approved brand system exactly.
- Do not invent a new visual language.
- Reuse shared tokens everywhere instead of hard-coded one-off values.
- Focus treatments and disabled states must remain consistent across controls.
- The coded gallery should be visually pulled toward the approved component sheets, not away from them.
- The gallery must not silently simplify generated component details. Any missing family, variant, state, density detail, or composite shown in the component sheet must be implemented or explicitly documented with a concrete reason and follow-up.
- Every icon-only control must have sufficient foreground/background contrast in default, hover, active, selected, disabled, and inverse states.
- Component variants should share the same anatomy, spacing rhythm, and action placement unless the catalog explicitly records why a variant differs.
- Repeated cards must share media/header/body/footer/action anatomy, badge and eyebrow placement, and equal-height grid behavior. Card bodies should use flex or grid layout, and primary action rows must be pinned to the bottom so product CTAs, quantity selectors, and comparable actions align across cards with different copy lengths.
- Wide data-dense components should not be squeezed into narrow gallery cards on desktop.
- A single mega-sheet is not a goal. Split component guidance into focused sheets whenever the sheet would become cluttered or uninspectable.
- Primary navigation must have a responsive component pattern. Prefer desktop inline nav plus tablet/mobile menu toggle with a stacked panel or drawer. Do not rely on document-level horizontal scrolling for primary nav.

## Review rules

If a reference board or component sheet exists:
- compare the coded gallery against it
- inspect the rendered screenshot directly
- make one focused correction at a time
- prefer small targeted fixes over wide stylistic rewrites

Before finishing:
- Verify the coded gallery matches the component sheet's component families, variants, states, density, and polish. A basic selector gallery is not sufficient.
- Verify no icon disappears into its background.
- Verify same-component variants keep comparable text hierarchy, media/header/body/action placement, and button sizing.
- Verify product-card and repeated-card screenshot examples have shared anatomy, consistent badge/eyebrow placement, and aligned action rows across at least three cards with varied copy length.
- Verify tables and other wide components receive enough horizontal space in the gallery.
- If a screenshot shows horizontal scrolling, explain whether it is expected for the viewport or fix the gallery layout.
- Verify responsive navigation examples at desktop, tablet, and mobile widths when navigation exists, including closed and open tablet/mobile menu states.
- Verify whole-gallery screenshots at mobile, tablet, and desktop widths when browser tooling is available.
- `.maquette/components/approved.md` must summarize component sheet vs gallery fidelity, measured responsive overflow results, screenshot paths, repeated-card anatomy and action-row alignment results, open nav screenshot paths when present, accepted scroll exceptions, responsive navigation notes, brand/component inconsistency notes, and icon-rendering notes. "Screenshots captured" alone is not a sufficient review.

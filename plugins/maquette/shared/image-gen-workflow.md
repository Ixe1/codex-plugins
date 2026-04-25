# Image-gen-first workflow

This plugin is designed around a strict separation of roles:

- `image_gen` = creative visual designer
- coding model = specification writer, implementer, reviewer, and refiner

## Mandatory default behavior

When `image_gen` is available, each phase must use it:

1. Brand kit
   - generate or edit a focused 1:1 brand board
2. Components
   - generate or edit one focused 16:9 component sheet at a time, starting with core primitives, plus additional focused 16:9 sheets when the product needs them
3. Pages
   - generate or edit a page concept

Only after the visual artifact exists should the workflow proceed to code implementation.

For brand kits, token creation is not script-led extraction. The inspected brand-board image is the visual authority; `design-system.json` and `tokens.css` are machine-readable artifacts derived from that viewed image. Helper scripts may serialize approved JSON into CSS, but they must not infer, normalize, or override palette, typography, spacing, radius, surface, shadow, or state decisions from a predetermined design file unless the user explicitly provides that file as an approved constraint.

## Project output isolation

Maquette-owned artifacts must be written under `.maquette/` in the current project. This includes brand boards, design-system JSON, CSS tokens, component sheets, sheet inventories, componentized references, component CSS/JS, component catalogs, page concepts, page HTML/CSS/JS, generated raster assets, manifests, review notes, Playwright screenshots, and responsive audit JSON.

Do not create, overwrite, or rely on `index.html` in the project root for Maquette output. If the user later wants to integrate a Maquette page into the real app or root site entrypoint, treat that as a separate explicit integration task.

## Mandatory image inspection

After every `image_gen` create or edit step:
- inspect the generated image with `view_image` before treating it as the design source
- do not derive tokens, component specifications, page blueprints, or implementation details from the prompt alone
- if the generated file cannot be inspected, state that limitation and treat the image as unverified
- when revising a prior artifact, inspect both the prior reference and the new generated result when possible

After inspection, continue the same turn unless the user explicitly asked for image-only output. Briefly identify the generated artifact, provide its saved path or asset reference when available, assess whether it matches the request, and continue to the next requested workflow step.

## Inspectability gates

Generated boards and sheets are approval artifacts only when they are readable at normal preview size.

- Brand boards are the visual-system contract. They must use a 1:1 square composition by default and focus on visual-system fundamentals, not exhaustive component inventories.
- Brand boards must specify font direction and fallback strategy, but must not show detailed component inventories or button/input/card variant specs.
- Brand boards must not contain logo-like marks, brand-name mastheads, large product-name treatments, monograms, seals, badges, app icons, emblems, or trademark-like elements.
- Component sheets are the componentized reference target. They must use 16:9 landscape composition and be split into focused 16:9 sheets when a single sheet would become cluttered or uninspectable.
- Component sheets should be categorized when needed: core primitives, navigation/layout, data/display, and cards/composites. The core primitives sheet comes first; focused follow-up sheets are preferred over crowded mega-sheets.
- Multi-sheet component work must be sequential: inspect, inventory, build a componentized reference, review, and document reusable component APIs from the current sheet before generating the next sheet. The current sheet must produce concrete category-prefixed batch artifacts under `.maquette/components/` before the next sheet is generated, with CSS under `.maquette/components/css/` and JS under `.maquette/components/js/`; retrospective logs after all sheets are generated are not sufficient.
- Each component sheet batch must complete screenshot review or documented manual visual review against the generated sheet before the next sheet is generated.
- Component sheets are the source of truth for component styling. Coded componentized references must match the sheet's component families, variants, states, anatomy, density, spacing, radius, shadows, polish, and composites while using reusable CSS/JS and cataloged APIs from the start.
- Repeated-card sheets must show shared media/header/body/footer/action anatomy, consistent badge or eyebrow placement, equal-height cards, and bottom-pinned action rows when card grids are relevant.
- Sites or pages with global navigation need inspectable responsive navigation coverage before implementation: desktop inline nav, tablet/mobile collapsed state, menu toggle, expanded panel or drawer, active/focus states, and visible icons.
- Page concepts with headers or primary navigation must define desktop, tablet, and mobile behavior. A desktop-only navigation concept is incomplete.
- Page concepts must make visible regions identifiable for pre-code inventory: header, nav, hero, sidebars, annotations, product grids, promo cards, newsletter, footer, bottom bars, mobile/tablet callouts, app/device modules, social links, and imagery.
- Page concepts with product, pricing, service, offer, or promo cards must make repeated-card anatomy and action-row alignment clear enough to implement.
- Page and component concepts that need raster images must make required asset types identifiable, such as hero images, product-card images, promo images, lifestyle/story images, footer/app/device images, and background textures.
- Reject, regenerate, edit, or split an artifact before using it if labels are too small, unrelated families are crammed together, elements overlap, implementation notes dominate, or the image cannot guide implementation without heavy zooming.

## Fidelity gates

Before page implementation, create a concept-region inventory and generated asset manifest. Visible concept regions default to implementation, not omission. Any region or asset that is simplified, omitted, implemented differently, blocked on assets, or blocked on component coverage must be documented with a concrete reason before coding proceeds.

Before component coding, write a sheet inventory that lists visible component families, variants, states, larger patterns, unclear or cramped areas, missing coverage, and the decision to implement, regenerate, or create another focused sheet.

Before accepting component implementation, compare the coded componentized reference screenshots against the approved 16:9 component sheets with the component fidelity rubric:
- coverage: visible component families, variants, and states are implemented
- visual match: color, typography, spacing, radius, shadow, density, and polish match the sheet
- anatomy match: cards, navigation, forms, tables, and composites preserve visible structure
- responsive match: mobile, tablet, and navigation behavior shown or implied by the sheet is represented
- implementation quality: semantic HTML, token usage, working icons, readable active/selected/inverse states, no unintended overflow, and no unreadable or overlapping text

After the componentized reference passes review, ensure the component CSS/JS and component catalog expose the reusable APIs, slots, states, JS behavior, and usage examples proven by that reference. Page implementations should consume the reusable catalog, CSS, and JS, not copy the reference page layout.

Use Maquette's bundled scripts for optional QA tooling checks, screenshot capture, linked asset validation, responsive audits, contrast/API checks, JSON validation, and page-consumption smoke checks when available. Optional Node dependencies should be resolved from the current project; do not rely on global npm installs. For component workflows, check optional QA tooling immediately after the brand kit exists and before component sheets or component code are generated. If dependencies are missing and automated QA would materially improve confidence, ask the user through the Codex user-input/question tool before installing project-local dependencies. If the user agrees, install `playwright`, `ajv`, and `ajv-formats` in the current project and continue automated QA; if the user declines, continue with manual review and record the missing tooling. Generated run-local scripts are fallback-only and must be documented in the relevant approval notes with the reason the bundled helper did not cover the scenario.

No silent simplification is allowed across brand, component, or page phases. If implementation cannot match a generated artifact, record the deviation, reason, and recommended follow-up in the relevant `approved.md` or `review.md`.

## Responsive QA

When browser tooling is available, page and component QA must include responsive navigation and overflow checks at 390, 768, 1024, 1280, and 1440px.

- Primary navigation must not create document-level horizontal overflow.
- Tablet/mobile primary navigation should use an accessible menu toggle plus stacked panel or drawer, not horizontal-scrolling nav as the default.
- For tablet/mobile, inspect closed and open navigation states and record open-state screenshot paths.
- If a menu toggle exists, click it and verify `aria-expanded` changes.
- Opened mobile/tablet drawers must remain scrollable when content exceeds viewport height, even when body scroll lock is active. Prefer `overflow-y: auto` and `overscroll-behavior: contain`; close controls and links must remain reachable.
- Repeated product-card and comparable card grids must be checked for shared anatomy, equal-height cards, stable badge/eyebrow placement, and aligned CTA, quantity, price, or action rows across varied copy lengths.
- Rich footers must be compared against the concept for logo placement, link columns, social icons, app/download modules, device imagery, legal links, locale/shipping rows, cookie/bottom strips, and brand blurbs. Generic footer simplification fails unless documented.
- Footer social links shown as icons in the concept must render as recognizable social icons with accessible names, not unrelated generic icons or text abbreviations unless the concept explicitly uses text badges.
- Typography QA must compare coded font family, weight, width, scale, and line-height against the approved visual references. Record font fallback rationale, and avoid `Impact` unless explicitly approved by the brand system.
- Navigation and state contrast QA must check active, selected, current, focus, disabled, inverse, and dark-surface states so text and icons never disappear into their background.

## Final review requirements

Final component and page review files must summarize the generated asset manifest and missing assets, concept-region inventory, component sheet vs replica fidelity, reusable component readiness, card anatomy alignment, footer fidelity, mobile drawer scrollability, responsive overflow measurements, open nav screenshots, visual deviations, and fixes. "Screenshots captured" alone is not a sufficient review.

## Transparent image requests

Most Maquette artifacts are opaque boards, sheets, and page concepts. If a task explicitly requests a transparent PNG output, verify that the saved PNG has a real alpha channel before treating it as complete. If the image has a rendered checkerboard or solid background instead of true transparency, leave the original untouched, create a repaired transparent derivative, and verify the repaired PNG before reporting success.

## Editing visible images

When revising a previously generated or local image:
- make the image visible in the conversation first, typically via `view_image`
- ask `image_gen` to edit the visible image
- preserve approved style unless the user requested change

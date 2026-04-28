Generate a focused website component CSS-contract poster.

Use a 1:1 square composition. Exact generated pixel dimensions are not controllable; prioritize a clearly square poster with no cropping, letterboxing, or extra content outside the poster.

This is an experimental direct-contract mode for Maquette components. Do not render a visual component sheet. The output should be a readable CSS-like text poster that the implementation model can inspect with `view_image` using its absolute filesystem path and translate into tokenized HTML/CSS/JS.

Visual format:
- black or near-black background
- crisp white or near-white monospace CSS text
- compact readable columns or stacked sections
- large enough text to read at normal preview size
- no UI mockups, decorative component cards, gradients, marketing copy, or prose note panels

Source inputs:
- approved brand board and design-system tokens
- current product/component brief
- the requested focused component family
- an explicit selector allowlist supplied for this batch

Only include component CSS for the current requested family. Do not include teaser selectors or rules for later families.

Required selector discipline:
- include only selectors from the provided allowlist
- do not invent extra selectors
- do not include `body`, `html`, `main`, `section`, reset rules, typography globals, page layout, gallery, panel, note, documentation, media-query layout, or usage-demo CSS
- keep comments brief and adjacent to relevant selectors, such as `/* focus */`, `/* error */`, `/* disabled */`, `/* icon slot */`, or `/* a11y */`
- do not include Markdown fences or long prose blocks

Component contract content:
- base anatomy selectors
- slot selectors where relevant
- important variants
- important sizes
- major states: default, hover, focus-visible/focus-within, active, selected, error, disabled, readonly, loading, open/expanded as applicable
- dimensions, spacing, radius, border, shadow, type, icon sizing, and transitions
- accessibility-state hooks where they affect CSS, such as `aria-invalid`, `aria-expanded`, or selected/current states

Token policy:
- prefer brand token variable names when possible
- if the poster uses raw color or size values, keep them consistent with the approved brand board
- the implementation model will map raw values back to existing token variables before writing final CSS

Batch-size rules:
- use one component family per poster for complex families
- combine at most two tightly related simple families when the selector allowlist remains readable
- suitable focused families include actions, forms, selection controls, tabs/segmented controls, badges/alerts, navigation primitives, and compact card primitives
- do not combine forms, actions, navigation, data tables, and cards into one poster
- split the batch if text becomes small, rules overlap, or selector sections become hard to read

Quality requirements:
- the poster must be readable enough to implement without guessing
- component rules should preserve the approved brand's color, typography, spacing, radius, border, shadow, density, and interaction language
- foreground/background contrast in active, selected, focus, disabled, inverse, and error states must remain readable
- icon-only controls must specify icon size, contrast, and state color behavior
- repeated-card or product-card contracts must specify shared anatomy, equal-height behavior, and bottom-pinned actions
- navigation contracts must specify desktop, tablet/mobile, closed/open, active, focus, and accessible expanded states
- wide data contracts must not rely on page-level horizontal scrolling as the default behavior

Reject and regenerate or split the poster before implementation if:
- text is too small to read at normal preview size
- selectors outside the allowlist dominate the image
- page, gallery, reset, or documentation CSS appears
- non-component implementation notes dominate
- unrelated component families are crowded together
- the poster is too generic to guide component CSS beyond common defaults

This CSS-contract poster is a machine-readable component contract, not a final stylesheet and not the final visual source of truth for complex visual design. The coded replica/reference must still be reviewed in a browser, corrected after screenshots, and documented in the component catalog.

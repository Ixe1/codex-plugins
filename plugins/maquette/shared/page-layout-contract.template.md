# Page Layout Contract

Status: draft before implementation.

## Source References

- Page concept:
- Brand board:
- Visual implementation contract:
- Asset consistency notes:
- Component catalog:
- Component contract or sheet references:

## Global Layout

- Page max width:
- Section width behavior:
- Inline margin rhythm:
- Vertical rhythm:
- Desktop breakpoint notes:
- Tablet breakpoint notes:
- Mobile breakpoint notes:

## Section Contracts

For each visible concept region, record compact implementation guidance before writing code.
Each region must include a fidelity target: `strict`, `adaptive`, or `intentional-deviation`.

### Header / Navigation

- Fidelity target:
- Desktop:
- Tablet:
- Mobile closed:
- Mobile open:
- Height / density:
- Sticky or static behavior:

### Hero

- Fidelity target:
- Target height / min-height:
- Concept composition to preserve:
- Media aspect and crop:
- Text block width:
- CTA row behavior:
- Mobile stacking:

### Main Content Sections

- Region:
- Fidelity target:
- Target height / compactness:
- Grid or stack:
- Media aspect and crop:
- Required concept details:
- Component APIs used:
- Mobile behavior:

### Terminal Sections

- Fidelity target:
- Impact / CTA strip:
- Newsletter:
- Footer:
- Legal / bottom row:
- Target compactness:
- Mobile behavior:

## Image Container Rules

- Every major media region must state its intended aspect ratio or min-height.
- Images intended to fill a media container must use explicit sizing and `object-fit`.
- Blank bands, letterboxing, or visible parent backgrounds around fitted media are deviations unless documented as intentional.

## Deviations Accepted Before Coding

- Deviation:
- Reason:
- Follow-up:

Do not use broad exceptions such as "assets may not match the concept." Identity, product, packaging, and signage differences must be specific, intentional, and bounded by asset consistency notes.

## Region Fidelity Review

Fill this after screenshots are captured. Allowed statuses: `matches`, `minor deviation`, `major deviation`, `missing`, `simplified`, `blocked`, `intentional deviation`, `fixed`.

| Region | Expected fidelity | Screenshot evidence | Status | Fix or approved reason |
| --- | --- | --- | --- | --- |
| Header / Navigation |  |  |  |  |
| Hero |  |  |  |  |
| Main content |  |  |  |  |
| Terminal sections |  |  |  |  |

## Review Checklist

- Top, middle, and bottom page regions have explicit layout contracts.
- The bottom third of the page has been compared against the concept, not just the hero.
- Repeated cards have shared anatomy and aligned action rows.
- Rich footer details are either implemented or explicitly recorded as intentional deviations.
- Section density and compactness match the concept, or each adaptive difference is explicitly bounded.
- Final review has no `major deviation`, `missing`, `simplified`, or `blocked` region unless the user explicitly accepted that outcome.

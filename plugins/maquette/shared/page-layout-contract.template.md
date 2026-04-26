# Page Layout Contract

Status: draft before implementation.

## Source References

- Page concept:
- Brand board:
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

### Header / Navigation

- Desktop:
- Tablet:
- Mobile closed:
- Mobile open:
- Height / density:
- Sticky or static behavior:

### Hero

- Target height / min-height:
- Media aspect and crop:
- Text block width:
- CTA row behavior:
- Mobile stacking:

### Main Content Sections

- Region:
- Target height / compactness:
- Grid or stack:
- Media aspect and crop:
- Component APIs used:
- Mobile behavior:

### Terminal Sections

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

## Review Checklist

- Top, middle, and bottom page regions have explicit layout contracts.
- The bottom third of the page has been compared against the concept, not just the hero.
- Repeated cards have shared anatomy and aligned action rows.
- Rich footer details are either implemented or explicitly recorded as intentional deviations.
- Section density and compactness match the concept closely enough for the page type.

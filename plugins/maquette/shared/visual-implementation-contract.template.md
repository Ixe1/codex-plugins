# Visual Implementation Contract

Page: `<page-name>`
Concept image: `pages/<page-name>/concept.png`
Status: draft before coding.

Use this after concept approval and before optional component proofs, asset waves, or page code. The approved concept is not a pixel ruler, but this contract records the major visual decisions the coded page must preserve.

## Source Of Truth

- Approved page concept:
- Brand board:
- Brand proof:
- Design system:
- Existing component APIs, if any:

## Binding Page Shape

- Section order:
- Hero composition:
- Main content rhythm:
- Product/card anatomy:
- Newsletter / final CTA structure:
- Footer / terminal structure:
- Mobile/tablet adaptation:
- Section/detail references needed:
- Component proof strategy: page-local by default; component contracts only for Design System Mode, immediate multi-page reuse, or complex reusable interactions.

## Fidelity Targets

| Region | Target | Must preserve | Allowed adaptation | Forbidden drift |
| --- | --- | --- | --- | --- |
| Header / Navigation | strict |  |  |  |
| Hero | strict |  |  |  |
| Product grid / repeated cards | strict |  |  |  |
| Promo / story / content modules | adaptive |  |  |  |
| Newsletter / final CTA | strict |  |  |  |
| Footer / terminal region | strict |  |  |  |

Allowed target values:

- `strict`: preserve structure, density, relative visual weight, and visible anatomy.
- `adaptive`: preserve hierarchy and anatomy while changing layout for responsive or technical constraints.
- `intentional-deviation`: user-approved or pre-recorded change with a concrete reason.

Strict regions may not finish final review as `minor deviation` when the issue is fixable. They must be repaired to `matches` / `fixed`, or changed to `intentional-deviation` only with a specific user-approved reason.

## Asset Consistency Requirements

- Allowed brand text:
- Allowed product / flavor names:
- Approved identity asset ids:
- Approved product / packaging reference asset ids:
- Forbidden alternate brand names:
- Forbidden signage or label text:
- Retry criteria:
- Required section-role match: hero/card/story/footer assets must match the concept's crop, scale, background treatment, and composition closely enough for direct screenshot comparison.

## Pre-Code Exceptions

| Exception | Reason | User-approved? | Follow-up |
| --- | --- | --- | --- |
|  |  |  |  |

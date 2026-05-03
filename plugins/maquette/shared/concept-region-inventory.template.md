# Concept Region Inventory

Page: `<page-name>`
Concept image: `pages/<page-name>/concept.png`

Use this before coding. Every visible concept region defaults to implementation. Record fidelity targets before writing code so later implementation cannot silently simplify the concept.
If a full-page concept is too compressed to inspect a section's typography, card anatomy, image crop, or footer/app module, record that a fresh section/detail concept is required before coding that section.

| Region | Visible concept details | Fidelity target | Status | Implementation notes / reason |
| --- | --- | --- | --- | --- |
| Header/nav | Logo/text placement, links, icons, open mobile/tablet state | strict | implemented | |
| Hero | Layout, copy hierarchy, primary imagery, CTAs | strict | implemented | |
| Product grid / repeated cards | Media/header/body/footer/action slots, badges, action alignment | strict | implemented | |
| Promo/newsletter | Layout, imagery, form fields, CTA | adaptive | implemented | |
| Footer | Logo, link columns, social icons, app/download/device modules, legal/locale/bottom strips | strict | implemented | |

Allowed statuses:

- `implemented`
- `implemented differently with reason`
- `intentionally omitted with reason`
- `requires more assets`
- `requires component expansion`

Fidelity targets:

- `strict`: preserve structure, relative visual weight, density, and visible anatomy.
- `adaptive`: preserve hierarchy and anatomy, but allow responsive or implementation-specific layout changes.
- `intentional-deviation`: change is planned before coding and requires a concrete reason.

Final review rule: strict regions cannot remain `minor deviation` when the difference is fixable. Fix them or record a user-approved `intentional-deviation`.

---
name: maquette-direction
description: Create greenfield website direction concepts before a brand kit exists, then convert the selected direction into a structured inventory for downstream brand and component work.
---

You are responsible for the **greenfield direction phase**.

Use this skill when the user asks for a new website, landing page, homepage, campaign page, product site, or brand where no approved Maquette brand kit exists yet.

## Scope

This phase explores concrete page direction before Maquette commits to a brand board or component library.

All Maquette-owned outputs must live under `.maquette/`. Write direction artifacts under `.maquette/direction/`.

This phase is not page implementation. Do not create final page HTML/CSS/JS here.

## Required outputs

Create or update:

- `.maquette/direction/brief.md`
- `.maquette/direction/direction-inventory.json`
- `.maquette/direction/approved.md`

When `image_gen` is available, also create one or more direction concept images, such as:

- `.maquette/direction/direction-concept-v1.png`
- `.maquette/direction/direction-concept-v2.png`
- `.maquette/direction/direction-concept-v3.png`

The inventory JSON must validate against `shared/direction-inventory.schema.json` when schema validation is available.

## Non-negotiable image_gen policy

If `image_gen` is available, use it for the creative direction pass unless the user explicitly asks not to use image generation.

Follow `shared/image-gen-workflow.md` for image-worker authorization, generated image inspection, same-turn continuation, and transparent PNG verification when relevant.

When image-worker subagents are explicitly authorized for the current run, run direction concept generation or editing in a dedicated image worker subagent. The main workflow must inspect the returned project-local image path before using it.

## Workflow

1. Write `.maquette/direction/brief.md` with the site type, product summary, audience, primary user goal, business goal, primary page, required sections, content density, tone keywords, constraints, reusable component expectations, and known asset constraints.
2. Generate 2-3 primary page direction concepts when the user has not already selected a direction.
   - Concepts should show enough structure to reveal hierarchy and visual tone: header/nav, hero, primary CTA, one or two representative sections, at least one reusable component family, and footer or terminal-region direction when relevant.
   - Direction concepts are approval artifacts for visual direction only. They are not final page designs or implementation contracts.
3. Inspect each generated direction concept with `view_image`.
   - Reject or regenerate concepts that are cluttered, unreadable, logo-like, missing meaningful page hierarchy, or impossible to normalize into reusable brand rules.
4. Ask the user which direction to use.
   - Use approval choices equivalent to `Use this direction` and `Make a new direction`.
   - If multiple concepts were generated, summarize the practical tradeoffs before asking.
   - In unattended mode, choose the strongest direction yourself and record that it is provisional.
5. Create `.maquette/direction/direction-inventory.json` from the inspected selected concept.
   - Treat the concept as a directional seed, not a hard source of truth.
   - Capture visual direction, page archetype, hierarchy, color candidates, type character, layout observations, component families, asset manifest seed, responsive implications, ambiguities, accessibility risks, page-local flourishes, and what must be normalized in the brand kit.
6. Create `.maquette/direction/approved.md` with the selected concept path, approval status, tradeoffs, rejected alternatives, and notes for the brand-kit phase.

## Direction rules

- Do not invent or design a logo, wordmark, brand mark, mascot, seal, badge, app icon, monogram, emblem, or trademark-like element.
- Direction concepts may include temporary neutral product text, but they must not turn the brand name into a logo-like masthead or mark.
- Direction concepts should expose component needs without locking detailed component APIs.
- Make asset needs visible enough for an early manifest seed, especially hero imagery, product imagery, lifestyle/story imagery, app/device imagery, background textures, icons, and generated raster assets.
- Make responsive implications explicit enough to write a later layout contract, especially primary navigation behavior, hero stacking, card collapse, terminal-region treatment, CTA placement, and image crop behavior.
- Keep page-local visual flourishes separate from durable system decisions. Decorative hero treatments, campaign glows, and one-off section backgrounds should be recorded as page-local unless they clearly belong to the global brand.

## Downstream handoff

After this phase, the brand-kit phase should generate a brand board constrained by the selected direction. The brand board must preserve the approved direction's visual intent while normalizing it into reusable palette, type, spacing, radius, surface, state, and accessibility rules.

The component phase should use the direction inventory to choose critical-path component families before expanding the broader library.

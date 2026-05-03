![Maquette](./assets/logo.png)

# Maquette

Maquette is a Codex plugin by **Ixel** for image-guided website design-system workflows.

It is intentionally **image-guided**:
- `image_gen` is the creative design engine
- the coding model is the implementation and review engine
- screenshots of coded output are used for visual comparison and refinement

The default greenfield workflow is therefore:
1. **Generate or edit a concrete page direction first** with `image_gen`
2. **Inspect the generated direction** with `view_image`
3. **Convert the selected direction into a structured direction inventory**
4. **Generate a constrained brand board** and derive JSON/CSS tokens from it
5. **Build an executable brand canon**: `brand-primitives.css`, `brand-proof.html`, and review notes
6. **Generate a page concept** from the approved brand canon
7. **Create an asset manifest** and generate independent images in parallel image-worker waves
8. **Build a thin browser slice** using the brand canon before the full page
9. **Create just-in-time component contracts and browser proofs** only for page-critical components
10. **Compare implementation against the approved artifacts** and iterate

The components phase now defaults to structured contracts plus browser proofs. Maquette writes focused `.maquette/components/contracts/<batch>.contract.json` files, optionally renders deterministic `.contract.svg` posters from those JSON contracts for review, implements browser-rendered component proofs with reusable HTML/CSS/JS, and uses screenshots as the visual correction target. Visual component sheets are no longer part of the default workflow; they are explicit-request presentation artifacts only.

When subagent tooling is available, Maquette uses image-worker subagents automatically. It does not ask whether to use them. For multiple independent images, Maquette should spawn one worker per image asset or tightly related independent batch and run those workers in parallel waves. The main workflow then inspects every returned image path with `view_image`, accepts/rejects/retries assets, and updates manifests before coding.

This plugin includes a root workflow skill plus focused phase skills:
- `maquette`
- `maquette-direction`
- `maquette-brand-kit`
- `maquette-components`
- `maquette-pages`

## Quick start

Maquette helps Codex turn an approved visual direction into reusable website artifacts:
- brand kits with design-system JSON, CSS tokens, brand primitive CSS, and browser brand proofs
- just-in-time component contracts with reusable HTML/CSS/JS and reference QA
- implemented pages with screenshot and responsive review notes

Install the marketplace, restart Codex, then invoke the full workflow with `@Maquette` or `$maquette`:

```sh
codex plugin marketplace add Ixe1/codex-plugins --ref master
```

```text
@Maquette Make a homepage for "Northstar Metrics", a lightweight analytics product. Include a metrics overview, recent activity, and a clear signup path.
```

Use `$maquette-direction`, `$maquette-brand-kit`, `$maquette-components`, or `$maquette-pages` when you want to run one phase at a time.

See [`CHANGELOG.md`](./CHANGELOG.md) for notable Maquette workflow, prompt, and release changes.

## Core rule

Maquette chooses a workflow mode before generating artifacts:
- **Greenfield Website Mode** for new websites/brands: direction concept -> direction inventory -> constrained brand kit -> critical-path components -> page -> system backfill
- **Greenfield Website Mode** for new websites/brands: direction concept -> direction inventory -> constrained brand kit -> executable brand canon -> page concept -> parallel assets -> thin slice -> just-in-time components -> page -> system backfill
- **Existing Brand Mode** for existing identities: reference inventory -> brand kit -> executable brand canon -> just-in-time components/pages
- **One-Shot Fast Mode** only when explicitly requested: direction concept -> compact brand canon -> page concept -> parallel assets -> thin slice -> page -> summary
- **Design System Mode** when the user wants broader reusable coverage before pages: brand/page direction -> full brand canon -> scoped component contracts -> browser component proofs -> component catalog -> pages

If the `image_gen` tool is available in the environment, it is **not optional** for creative visual artifacts in the normal happy-path workflow.

Each creative phase must use it as follows unless the user explicitly asks to skip image generation or the environment genuinely lacks the tool:
- direction phase -> for greenfield websites, create concrete page direction concepts before the brand board exists
- brand-kit phase -> create or edit a focused foundational 1:1 **brand board image** with no logo, wordmark, brand mark, large product-name treatment, or detailed component inventory; record explicit typography recommendations and fallback strategy
- brand-canon phase -> create browser-rendered brand primitive CSS and `brand-proof.html` before components or pages can reinterpret the board
- components phase -> do not create visual component sheets by default; structured component contracts and browser proofs are the default source of truth
- pages phase -> create or edit a **page concept image**, then write a page layout contract before implementation

After every generated or edited image, inspect the actual result with `view_image` before using it as the basis for tokens, component specs, page blueprints, or code. Do not continue from the prompt alone.
Direction-concept, brand-board, and page-concept images are explicit user approval gates. After Maquette generates and inspects one, it should ask whether to use it or make a new one before deriving direction inventories, tokens, page blueprints, layout contracts, assets, or code. The approval buttons should not include a separate revise choice, though free-form revision notes may still be handled if the user provides them. Structured component contracts and deterministic posters remain internal implementation artifacts unless the user explicitly asks to approve each one.
Maquette should only skip these questions when the user explicitly asks for an unattended run with wording such as "do not ask questions", "no pauses", or "skip approval questions". Requests for a "one pass", "full workflow", "final homepage", "fresh disposable test", or "Maquette test" are not unattended requests by themselves.
Generated boards and explicit-request visual sheets should be readable at normal preview size. Maquette should regenerate, edit, or split visual artifacts that are cluttered, logo-like, or not inspectable enough to guide implementation.
Sites with primary navigation should define responsive navigation before page implementation: desktop inline nav, tablet/mobile menu toggle, expanded panel or drawer, accessible states, and no document-level horizontal scrolling for nav.
Repeated card grids should define equal-height cards and bottom-pinned action rows before page implementation. Footer social links should use recognizable social icons, and page typography should follow the approved font strategy rather than crude defaults such as `Impact`.
Maquette-authored logo, wordmark, monogram, mascot, emblem, lockup, and brand-mark assets must never be code-generated SVG. They must be supplied assets or generated raster image assets. Generic UI icons and non-identity ornaments may be SVG.
Component implementation includes hard gates per artifact: first make the optional QA tooling decision, then create one focused structured component contract by default, optionally render a deterministic poster, render an artifact-specific browser proof/reference using reusable CSS/JS and the brand canon, write batch artifacts, and only then move to the next artifact. Every contract must use a strict selector allowlist.
Page implementation includes a fidelity gate: inventory visible concept regions, write a page layout contract for section compactness, image fit/crop behavior, terminal regions, and responsive structure, create an asset manifest for required raster assets, then document section-by-section screenshot comparison notes before approval.

## Output philosophy

The direction concept is the greenfield visual-direction seed.
The direction inventory is the structured bridge from exploratory image to reusable system.
The brand reference inventory is the preservation contract for existing websites, screenshots, code, and supplied brand assets.
The brand board is the 1:1 visual-system contract.
The executable brand canon is the browser bridge from board to code: `design-system.json`, `tokens.css`, `brand-primitives.css`, `brand-proof.html`, and `brand-proof-review.md`.
The structured component contract is the default source for selectors, states, slots, dimensions, accessibility hooks, and token intent.
The deterministic contract poster is a review aid rendered from structured JSON, not implementation truth.
An explicit visual component sheet is an optional presentation artifact only when requested.
The reusable component library is the CSS/JS/catalog API proven by browser component proofs and consumed by pages.
The structured JSON/CSS files are the machine-readable source of truth.
The coded reference/page screenshots are the verification artifacts.
Token scripts are serializers, not design authorities: `tokens.css` should be exported from the inspected-board-derived `design-system.json`, not extracted from or overridden by a predetermined design file unless the user explicitly approves that file as a constraint.
All Maquette-owned project artifacts are isolated by the workflow under `.maquette/`, including direction concepts, direction inventories, brand proofs, generated images, HTML/CSS/JS, manifests, review notes, Playwright screenshots, and responsive audit output. Maquette should not create a root-level `index.html`; app integration is a separate explicit task.

## Example output

![Example Maquette snack cakes page output](./assets/example-board.png)

![Example Maquette page output](./assets/example-page.png)

## How to use

Maquette can be used as a one-shot workflow or as manual passes.

### One-shot workflow

For a new project or broad page request, invoke Maquette directly:

```text
@Maquette Make a homepage for "Northstar Metrics", a lightweight analytics product. Include a metrics overview, recent activity, and a clear signup path.
```

If no approved brand exists, Maquette should create or select a concrete page direction first, write the direction inventory, create the constrained brand kit, build the executable brand canon, generate the page concept, create the asset manifest, generate independent image assets in parallel, build a thin slice, then add just-in-time component contracts/proofs for page-critical components. Existing websites, screenshots, and code can inform the brand kit, but they do not replace the generated brand board or brand proof.

For existing websites or brands, Maquette should not run greenfield direction exploration unless the user asks for a redesign or new alternatives. It should first create `.maquette/brand/reference-inventory.md` to record preserved palette, type personality, imagery style, layout density, supplied assets, allowed evolution, do-not-change constraints, accessibility issues, and uncertainty. The generated brand board then normalizes that existing identity into tokens rather than inventing a new one.

### 1. Explore direction

For a greenfield website or brand, Maquette starts with `$maquette-direction`:

```text
$maquette-direction Explore directions for a new AI note-taking product homepage.
```

This pass creates a lightweight direction brief, one or more concrete page direction concepts, an approval note, and:

```text
direction/direction-inventory.json
```

The selected direction is a seed for the brand system, not a final page implementation contract.

### 2. Create a brand kit

Start with `$maquette-brand-kit` and describe the company, product, audience, or aesthetic direction:

```text
$maquette-brand-kit Make a branding kit for a boutique accounting firm for creative studios.
```

This pass creates a foundational brand board, constrained by the selected direction when one exists, then turns it into design-system files such as:

```text
brand/brief.md
brand/design-system.json
brand/tokens.css
brand/brand-primitives.css
brand/brand-proof.html
brand/brand-proof-review.md
brand/approved.md
```

Review the generated brand direction, then approve it or ask Maquette to make a new one.
Maquette should ask for approval immediately after viewing the generated board, before writing design-system JSON or CSS tokens.
After approval, Maquette should build and review the browser brand proof before component or page implementation.

### 3. Build components when needed

After the brand canon exists, use `$maquette-components` when you explicitly want component work:

```text
$maquette-components Make the product-card and responsive navigation components.
```

This pass creates a focused structured component contract first, optionally renders a deterministic poster from that contract, builds and reviews a browser component proof with reusable classes, states, slots, and usage examples, writes batch artifacts, then repeats only for needed data/composite/form/navigation/repeated-card/newsletter/footer-social artifacts.
Every default component contract is focused by selector allowlist. Visual component sheets are generated only when explicitly requested. Each batch should create concrete category-prefixed evidence directly under `.maquette/components/`, including `contracts/<batch-slug>.contract.json`, an optional `contracts/<batch-slug>.contract.svg`, `<batch-slug>.replica.html`, `css/<batch-slug>.components.css`, `js/<batch-slug>.components.js` when needed, `<batch-slug>.component-catalog.json`, and `<batch-slug>.review.md`. The final `replica-gallery.html` is the componentized reference, linked to the brand canon plus `css/components.css` and `js/components.js`.
Each batch must complete screenshot review or documented manual visual review against its structured contract and brand proof before Maquette creates the next component artifact.

### 4. Create pages

After the executable brand canon exists, use `$maquette-pages` for each page or screen:

```text
$maquette-pages Make a homepage for the accounting firm.
```

You can also give a more detailed page brief:

```text
$maquette-pages Make a homepage with a proof-led hero, services section, client logos, founder note, pricing preview, and consultation CTA.
```

This pass creates a page concept image, writes a page layout contract for section density, media crops, terminal sections, and responsive behavior, creates an asset manifest, generates independent image assets in parallel image-worker waves, builds a thin slice, implements just-in-time component proofs when needed, implements the page with the approved brand canon, captures screenshots when possible, and records review notes.
Maquette should ask for approval immediately after viewing the page concept, before writing the blueprint, inventory, layout contract, asset manifest, or page code.

## Invocation

You can invoke Maquette explicitly by naming the plugin or one of its bundled skills:

```text
@Maquette make a homepage for a new SaaS product.
$maquette-direction explore homepage directions for a new SaaS product.
$maquette-brand-kit create a brand kit for an AI note-taking app.
$maquette-components build page-critical components from the approved brand canon.
$maquette-pages make a pricing page.
```

Use `@Maquette` or `$maquette` when you want the full staged workflow. Use the individual phase skills when you intentionally want to work on only one phase.

## Optional QA tooling

Maquette can use project-local Node dependencies for automated screenshot capture, responsive overflow QA, component API smoke checks, page-consumption smoke checks, JSON schema validation, and same-size reference-image sharpening. These dependencies are **not** bundled with the plugin, and installing Maquette does not create `node_modules`.

If your project does not already have the optional QA dependencies installed, add them in the project where Maquette is generating UI files:

```sh
npm i -D playwright ajv ajv-formats
npx playwright install chromium
```

If the run will sharpen soft or compressed raster references before visual transcription or QA, install `sharp` in the same project:

```sh
npm --prefix <projectRoot> i -D sharp
```

You can check whether the current project has the optional QA tooling available without installing anything:

```sh
node plugins/maquette/shared/scripts/ensure-qa-tooling.mjs --project . --check-browser --json .maquette/qa-tooling.json
node plugins/maquette/shared/scripts/ensure-qa-tooling.mjs --project . --check-image-prep --json .maquette/image-prep-tooling.json
```

During a Maquette run, Codex should check optional QA tooling before component contracts, explicit visual component sheets, deterministic posters, or component code are created. Partial availability still counts as missing QA tooling: if Playwright is available but `ajv-formats` is missing, browser QA can run but schema validation is blocked. When a generated raster reference would benefit from sharpening before visual transcription or QA, run the tooling check with `--check-image-prep`; missing `sharp` blocks only the `reference-image-preprocessing` capability. If `ensure-qa-tooling.mjs` reports missing packages, blocked QA capabilities, or `installDecisionRequired: true`, Codex should ask before installing dependencies or skipping those automated checks, unless the user already declined for the run or installation is impossible. If the user agrees, Codex can run the project-local install commands and continue with automated QA, including `sharp` when image prep will be used. If the user declines, Maquette should continue with manual screenshot/schema review and record that automated QA tooling was unavailable.

Project-local installs are the recommended path. Global npm installs are not recommended because Node usually will not resolve global packages from plugin scripts unless the user also configures environment-specific module lookup such as `NODE_PATH`.

The bundled browser scripts load `playwright` from the current project when available and launch Chromium in headless mode. The JSON validation helper loads `ajv` and `ajv-formats` from the current project when available. The reference sharpening helper loads `sharp` from the current project when available and creates a separate same-size PNG derivative without overwriting the raw reference. It sharpens only; it does not upscale or resize Maquette artifacts:

```sh
node plugins/maquette/shared/scripts/ensure-qa-tooling.mjs --project . --check-browser
node plugins/maquette/shared/scripts/ensure-qa-tooling.mjs --project . --check-image-prep
node plugins/maquette/shared/scripts/sharpen-reference-image.mjs .maquette/brand/brand-board-v1.png .maquette/brand/brand-board-v1-sharpened.png --project . --json .maquette/brand/brand-board-v1-sharpened.json --role approval
node plugins/maquette/shared/scripts/capture-browser.mjs .maquette/components/replica-gallery.html .maquette/components/replica-gallery.png --json .maquette/components/reference-capture.json
node plugins/maquette/skills/maquette-components/scripts/capture-gallery.mjs .maquette/components/replica-gallery.html .maquette/components/replica-gallery.png
node plugins/maquette/skills/maquette-pages/scripts/capture-page.mjs .maquette/pages/homepage/page.html .maquette/pages/homepage/page.png
node plugins/maquette/shared/scripts/validate-linked-assets.mjs .maquette/components/replica-gallery.html --json .maquette/components/linked-assets.json
node plugins/maquette/shared/scripts/audit-responsive-layout.mjs .maquette/pages/homepage/page.html --json .maquette/pages/homepage/responsive-audit.json --screenshots-dir .maquette/pages/homepage/screenshots
node plugins/maquette/shared/scripts/check-component-gallery.mjs .maquette/components/replica-gallery.html --json .maquette/components/component-reference-check.json
node plugins/maquette/shared/scripts/page-consumption-smoke.mjs --project . --json .maquette/components/page-consumption-smoke.json
node plugins/maquette/shared/scripts/validate-artifacts.mjs --project . --json .maquette/components/artifact-validation.json
node plugins/maquette/shared/scripts/render-component-contract-poster.mjs .maquette/components/contracts/core-actions.contract.json .maquette/components/contracts/core-actions.contract.svg
```

Screenshot capture and responsive auditing should stay headless, and every browser instance opened for capture must be closed before the workflow finishes. The bundled scripts close Chromium in a `finally` block. If full-page capture falls back to a clipped full-document screenshot, record the metadata JSON and clipped fallback note in the relevant approval file. Linked asset validation should pass for each batch replica and the final component reference before the next component artifact or page phase begins.

Responsive review should record measured overflow results at 390, 768, 1024, 1280, and 1440px when browser tooling is available. Page-wide horizontal overflow greater than 1px should be fixed unless an explicit exception is documented. Internal scrolling for genuine wide components should be reported separately from true document overflow.
For pages with navigation, tablet/mobile review should capture closed and open nav states, verify the menu toggle changes `aria-expanded`, and reject nav that clips, overflows, or requires document-level horizontal scrolling.
For pages with repeated cards, review should compare shared anatomy, badge placement, CTA, quantity, price, and action-row alignment across cards with varied copy lengths. For rich footers, review should verify footer structure rather than accepting generic columns. For pages with social links, review should verify recognizable social icons with accessible names. Mobile drawer review should verify opened drawers can scroll independently when needed. Typography review should record the chosen font family, fallback stack, and rationale.

If Playwright is not available, Maquette can still create the design contracts and code, but screenshot-based visual comparison becomes a manual review step. In that case the component catalog should use `review_mode: "manual"`, record `blocked_screenshot_reason`, and put HTML or other non-screenshot evidence in `gallery_review_artifact_paths` rather than pretending those files are screenshots.

If `ajv` or `ajv-formats` is not available, Maquette can still continue only after the install decision has been made. Schema validation should then be recorded as unavailable or performed manually rather than reported as passed. When available, the bundled artifact validator also checks that component-catalog paths such as approval notes, references, structured contracts, batch reviews, screenshots, and catalog snapshots actually exist.

Generated project-local scripts are fallback-only. Prefer the bundled Maquette helpers for capture, responsive audits, contrast/API smoke checks, JSON validation, and page-consumption smoke checks; if a generated fallback script is necessary, document it in `approved.md` or `review.md` with the reason.

Disposable Maquette smoke runs used while developing this plugin should live under `.maquette-test/`. The repository ignores that directory so generated screenshots, local `node_modules`, and temporary validation artifacts are not committed.

## Installation

### Add the Ixel marketplace

For active development, add the Ixel marketplace from the `dev` branch:

```sh
codex plugin marketplace add Ixe1/codex-plugins --ref dev
```

If the Ixel marketplace is already configured, refresh it instead:

```sh
codex plugin marketplace upgrade ixel
```

For released versions, use the default branch:

```sh
codex plugin marketplace add Ixe1/codex-plugins --ref master
```

Then restart Codex, open the plugin directory, select the Ixel marketplace, and install Maquette.

In Codex CLI, open the plugin directory with:

```text
/plugins
```

If you want a sparse checkout for the marketplace source, include both the marketplace metadata and plugin folder:

```sh
codex plugin marketplace add Ixe1/codex-plugins --ref dev --sparse .agents/plugins --sparse plugins/maquette
```

### Manual local install

For local testing, copy or clone this plugin so the plugin root is available at:

```text
~/.codex/plugins/maquette
```

On Windows, that is typically:

```text
%USERPROFILE%\.codex\plugins\maquette
```

The plugin root is the directory that contains `.codex-plugin/plugin.json`, `skills/`, and `shared/`.

Then add a personal marketplace at `~/.agents/plugins/marketplace.json`:

```json
{
  "name": "ixel",
  "interface": {
    "displayName": "Ixel"
  },
  "plugins": [
    {
      "name": "maquette",
      "source": {
        "source": "local",
        "path": "./.codex/plugins/maquette"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Design"
    }
  ]
}
```

Restart Codex, open the plugin directory, select the Ixel marketplace, and install Maquette.

After installation, start a new thread and invoke the full workflow with `@Maquette` or `$maquette`. Use `$maquette-direction`, `$maquette-brand-kit`, `$maquette-components`, or `$maquette-pages` when you intentionally want a single phase.

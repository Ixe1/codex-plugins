![Maquette](./assets/logo.png)

# Maquette

Maquette is a Codex plugin by **Ixel** for image-guided website design-system workflows.

It is intentionally **image-guided**:
- `image_gen` is the creative design engine
- the coding model is the implementation and review engine
- screenshots of coded output are used for visual comparison and refinement

The default workflow is therefore:
1. **Generate or edit a visual artifact first** with `image_gen`
2. **Inspect the generated artifact** with `view_image`
3. **Convert that artifact into machine-readable design contracts** such as JSON and CSS tokens
4. **Build a componentized visual reference** for each component artifact using reusable HTML/CSS/JS from the start
5. **Document reusable APIs, slots, states, and usage examples** before moving to the next artifact
6. **Render and screenshot the implementation**
7. **Compare implementation against the approved visual artifact** and iterate

The components phase now defaults to focused direct CSS-contract posters for this experiment. Maquette generates a focused 1:1 black-background CSS-contract poster for one component family, inspects it, transcribes the recovered rules into a reviewable `.maquette/components/contracts/<batch>.contract.css` bridge file, implements the reusable component batch, and uses browser screenshots as the visual correction target. Visual component sheets are fallback or explicit-request artifacts.

This plugin includes a root workflow skill plus three focused phase skills:
- `maquette`
- `maquette-brand-kit`
- `maquette-components`
- `maquette-pages`

## Quick start

Maquette helps Codex turn an approved visual direction into reusable website artifacts:
- brand kits with design-system JSON and CSS tokens
- component libraries with reusable HTML/CSS/JS and reference QA
- implemented pages with screenshot and responsive review notes

Install the marketplace, restart Codex, then invoke the full workflow with `@Maquette` or `$maquette`:

```sh
codex plugin marketplace add Ixe1/maquette --ref master
```

```text
@Maquette Make a homepage for "Northstar Metrics", a lightweight analytics product. Include a metrics overview, recent activity, and a clear signup path.
```

Use `$maquette-brand-kit`, `$maquette-components`, or `$maquette-pages` when you want to run one phase at a time.

## Core rule

If the `image_gen` tool is available in the environment, it is **not optional** for the normal happy-path workflow.

Each phase must use it as follows unless the user explicitly asks to skip image generation or the environment genuinely lacks the tool:
- brand-kit phase -> create or edit a focused foundational 1:1 **brand board image** with no logo, wordmark, brand mark, large product-name treatment, or detailed component inventory; record explicit typography recommendations and fallback strategy
- components phase -> create one focused 1:1 text-only **CSS-contract poster** at a time, starting with core primitives, then additional focused 1:1 navigation/layout, data/display, or cards/composites posters when dense data, larger composites, navigation, repeated cards, newsletter modules, or footer/social modules need them. Create visual component sheet images only when explicitly requested or when a CSS-contract poster is too generic to guide implementation.
- pages phase -> create or edit a **page concept image**, then write a page layout contract before implementation

After every generated or edited image, inspect the actual result with `view_image` before using it as the basis for tokens, component specs, page blueprints, or code. Do not continue from the prompt alone.
Generated boards and sheets should be readable at normal preview size. Maquette should regenerate, edit, or split visual artifacts that are cluttered, logo-like, or not inspectable enough to guide implementation.
Sites with primary navigation should define responsive navigation before page implementation: desktop inline nav, tablet/mobile menu toggle, expanded panel or drawer, accessible states, and no document-level horizontal scrolling for nav.
Repeated card grids should define equal-height cards and bottom-pinned action rows before page implementation. Footer social links should use recognizable social icons, and page typography should follow the approved font strategy rather than crude defaults such as `Impact`.
Component implementation includes hard gates per artifact: first make the optional QA tooling decision, then generate one 1:1 CSS-contract poster by default, render an artifact-specific componentized replica/reference using reusable CSS/JS, write batch artifacts, and only then move to the next artifact. Every poster must use a strict selector allowlist.
Page implementation includes a fidelity gate: inventory visible concept regions, write a page layout contract for section compactness, image fit/crop behavior, terminal regions, and responsive structure, create an asset manifest for required raster assets, then document section-by-section screenshot comparison notes before approval.

## Output philosophy

The brand board is the 1:1 visual-system contract.
The CSS-contract poster is the default 1:1 text source for selectors, states, slots, and dimensions, not a full visual design target. The transcribed contract CSS is the implementation bridge from inspected image text to final tokenized component CSS.
An explicit visual component sheet is the 1:1 visual target for a coded componentized reference when that fallback path is used.
The reusable component library is the CSS/JS/catalog API proven by that reference and consumed by pages.
The structured JSON/CSS files are the machine-readable source of truth.
The coded reference/page screenshots are the verification artifacts.
Token scripts are serializers, not design authorities: `tokens.css` should be exported from the inspected-board-derived `design-system.json`, not extracted from or overridden by a predetermined design file unless the user explicitly approves that file as a constraint.
All Maquette-owned project artifacts are isolated by the workflow under `.maquette/`, including generated images, HTML/CSS/JS, manifests, review notes, Playwright screenshots, and responsive audit output. Maquette should not create a root-level `index.html`; app integration is a separate explicit task.

## Example output

![Example Maquette snack cakes page output](./assets/example-board.png)

![Example Maquette page output](./assets/example-page.png)

## How to use

Maquette can be used as a one-shot workflow or as three manual passes.

### One-shot workflow

For a new project or broad page request, invoke Maquette directly:

```text
@Maquette Make a homepage for "Northstar Metrics", a lightweight analytics product. Include a metrics overview, recent activity, and a clear signup path.
```

If brand or component artifacts are missing, Maquette should create them first, then create the requested page. Existing websites, screenshots, and code can inform the brand kit, but they do not replace the generated brand board and component sheet.

### 1. Create a brand kit

Start with `$maquette-brand-kit` and describe the company, product, audience, or aesthetic direction:

```text
$maquette-brand-kit Make a branding kit for a boutique accounting firm for creative studios.
```

This pass creates a foundational brand board first, then turns it into design-system files such as:

```text
brand/brief.md
brand/design-system.json
brand/tokens.css
brand/approved.md
```

Review the generated brand direction and ask for revisions until it is approved.

### 2. Build the component library

After the brand kit is approved, use `$maquette-components`:

```text
$maquette-components Make a component library.
```

This pass creates a focused core CSS-contract poster first, builds and reviews a componentized visual reference with reusable classes, states, slots, and usage examples, writes batch artifacts, then repeats that loop for focused data/composite/form/navigation/repeated-card/newsletter/footer-social artifacts when the product needs them.
When a site has global navigation, the component pass should include responsive nav variants for desktop, tablet, and mobile.
Every default CSS-contract poster is 1:1; explicit visual component sheets are also 1:1 when used. Maquette should not generate all component artifacts before implementation. Each multi-poster or multi-sheet batch should create concrete category-prefixed evidence directly under `.maquette/components/`, including `contracts/<batch-slug>.contract.css` for CSS-contract batches, `<batch-slug>.replica.html`, `css/<batch-slug>.components.css`, `js/<batch-slug>.components.js` when needed, `<batch-slug>.component-catalog.json`, and `<batch-slug>.review.md`. The final `replica-gallery.html` is the componentized reference, linked to `css/components.css` and `js/components.js`; pages should use the cataloged component API rather than copying that reference layout.
Each batch must complete screenshot review or documented manual visual review against its source sheet or poster before Maquette generates the next component artifact.

Experimental CSS-contract example:

```text
$maquette-components Use the direct CSS-contract approach for the Forms family first.
```

For this path, Maquette should generate one focused 1:1 text-only poster with a strict selector allowlist, reject posters with page/reset/gallery CSS, transcribe the inspected poster into a contract CSS file, map any raw values back to approved tokens, implement a batch replica, capture screenshots, and record that the artifact was a CSS contract rather than a visual component sheet.

### 3. Create pages

After the component library exists, use `$maquette-pages` for each page or screen:

```text
$maquette-pages Make a homepage for the accounting firm.
```

You can also give a more detailed page brief:

```text
$maquette-pages Make a homepage with a proof-led hero, services section, client logos, founder note, pricing preview, and consultation CTA.
```

This pass creates a page concept image, writes a page layout contract for section density, media crops, terminal sections, and responsive behavior, implements the page with the approved brand and component references, captures screenshots when possible, and records review notes.

## Invocation

You can invoke Maquette explicitly by naming the plugin or one of its bundled skills:

```text
@Maquette make a homepage for a new SaaS product.
$maquette-brand-kit create a brand kit for an AI note-taking app.
$maquette-components build the component library from the approved brand kit.
$maquette-pages make a pricing page.
```

Use `@Maquette` or `$maquette` when you want the full staged workflow. Use the individual phase skills when you intentionally want to work on only one phase.

## Optional QA tooling

Maquette can use project-local Node dependencies for automated screenshot capture, responsive overflow QA, component API smoke checks, page-consumption smoke checks, and JSON schema validation. These dependencies are **not** bundled with the plugin, and installing Maquette does not create `node_modules`.

If your project does not already have the optional QA dependencies installed, add them in the project where Maquette is generating UI files:

```sh
npm i -D playwright ajv ajv-formats
npx playwright install chromium
```

You can check whether the current project has the optional QA tooling available without installing anything:

```sh
node plugins/maquette/shared/scripts/ensure-qa-tooling.mjs --project . --check-browser --json .maquette/qa-tooling.json
```

During a Maquette run, Codex should check optional QA tooling before component sheets, CSS-contract posters, or component code are generated. Partial availability still counts as missing QA tooling: if Playwright is available but `ajv-formats` is missing, browser QA can run but schema validation is blocked. If `ensure-qa-tooling.mjs` reports missing packages, blocked QA capabilities, or `installDecisionRequired: true`, Codex should ask before installing dependencies or skipping those automated checks, unless the user already declined for the run or installation is impossible. If the user agrees, Codex can run the project-local install commands and continue with automated QA. If the user declines, Maquette should continue with manual screenshot/schema review and record that automated QA tooling was unavailable.

Project-local installs are the recommended path. Global npm installs are not recommended because Node usually will not resolve global packages from plugin scripts unless the user also configures environment-specific module lookup such as `NODE_PATH`.

The bundled browser scripts load `playwright` from the current project when available and launch Chromium in headless mode. The JSON validation helper loads `ajv` and `ajv-formats` from the current project when available:

```sh
node plugins/maquette/shared/scripts/ensure-qa-tooling.mjs --project . --check-browser
node plugins/maquette/shared/scripts/capture-browser.mjs .maquette/components/replica-gallery.html .maquette/components/replica-gallery.png --json .maquette/components/reference-capture.json
node plugins/maquette/skills/maquette-components/scripts/capture-gallery.mjs .maquette/components/replica-gallery.html .maquette/components/replica-gallery.png
node plugins/maquette/skills/maquette-pages/scripts/capture-page.mjs .maquette/pages/homepage/page.html .maquette/pages/homepage/page.png
node plugins/maquette/shared/scripts/validate-linked-assets.mjs .maquette/components/replica-gallery.html --json .maquette/components/linked-assets.json
node plugins/maquette/shared/scripts/audit-responsive-layout.mjs .maquette/pages/homepage/page.html --json .maquette/pages/homepage/responsive-audit.json --screenshots-dir .maquette/pages/homepage/screenshots
node plugins/maquette/shared/scripts/check-component-gallery.mjs .maquette/components/replica-gallery.html --json .maquette/components/component-reference-check.json
node plugins/maquette/shared/scripts/page-consumption-smoke.mjs --project . --json .maquette/components/page-consumption-smoke.json
node plugins/maquette/shared/scripts/validate-artifacts.mjs --project . --json .maquette/components/artifact-validation.json
```

Screenshot capture and responsive auditing should stay headless, and every browser instance opened for capture must be closed before the workflow finishes. The bundled scripts close Chromium in a `finally` block. If full-page capture falls back to a clipped full-document screenshot, record the metadata JSON and clipped fallback note in the relevant approval file. Linked asset validation should pass for each batch replica and the final component reference before the next component artifact or page phase begins.

Responsive review should record measured overflow results at 390, 768, 1024, 1280, and 1440px when browser tooling is available. Page-wide horizontal overflow greater than 1px should be fixed unless an explicit exception is documented. Internal scrolling for genuine wide components should be reported separately from true document overflow.
For pages with navigation, tablet/mobile review should capture closed and open nav states, verify the menu toggle changes `aria-expanded`, and reject nav that clips, overflows, or requires document-level horizontal scrolling.
For pages with repeated cards, review should compare shared anatomy, badge placement, CTA, quantity, price, and action-row alignment across cards with varied copy lengths. For rich footers, review should verify footer structure rather than accepting generic columns. For pages with social links, review should verify recognizable social icons with accessible names. Mobile drawer review should verify opened drawers can scroll independently when needed. Typography review should record the chosen font family, fallback stack, and rationale.

If Playwright is not available, Maquette can still create the design contracts and code, but screenshot-based visual comparison becomes a manual review step. In that case the component catalog should use `review_mode: "manual"`, record `blocked_screenshot_reason`, and put HTML or other non-screenshot evidence in `gallery_review_artifact_paths` rather than pretending those files are screenshots.

If `ajv` or `ajv-formats` is not available, Maquette can still continue only after the install decision has been made. Schema validation should then be recorded as unavailable or performed manually rather than reported as passed. When available, the bundled artifact validator also checks that component-catalog paths such as approval notes, references, transcribed contracts, batch reviews, screenshots, and catalog snapshots actually exist.

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

After installation, start a new thread and invoke the full workflow with `@Maquette` or `$maquette`. Use `$maquette-brand-kit`, `$maquette-components`, or `$maquette-pages` when you intentionally want a single phase.

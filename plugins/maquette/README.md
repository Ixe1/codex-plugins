![Maquette](./assets/logo.png)

# Maquette

Maquette is a Codex plugin by **Ixel** for image-guided website design-system workflows.

It is intentionally **image-guided**:
- `image_gen` is the creative design engine
- the coding model is the implementation and review engine
- screenshots of coded output are used for visual comparison and refinement

The workflow is therefore:
1. **Generate or edit a visual artifact first** with `image_gen`
2. **Inspect the generated artifact** with `view_image`
3. **Convert that artifact into machine-readable design contracts** such as JSON and CSS tokens
4. **Implement reusable HTML/CSS/JS**
5. **Render and screenshot the implementation**
6. **Compare implementation against the approved visual artifact** and iterate

This plugin includes a root workflow skill plus three focused phase skills:
- `maquette`
- `maquette-brand-kit`
- `maquette-components`
- `maquette-pages`

## Quick start

Maquette helps Codex turn an approved visual direction into reusable website artifacts:
- brand kits with design-system JSON and CSS tokens
- component libraries with reusable HTML/CSS/JS and gallery QA
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
- brand-kit phase -> create or edit a focused foundational **brand board image** with no logo, wordmark, brand mark, large product-name treatment, or detailed component inventory; record explicit typography recommendations and fallback strategy
- components phase -> create or edit a focused core **component sheet image** before or alongside implementation, plus additional focused sheets when dense data, larger composites, navigation, repeated cards, newsletter modules, or footer/social modules need them
- pages phase -> create or edit a **page concept image** before implementation

After every generated or edited image, inspect the actual result with `view_image` before using it as the basis for tokens, component specs, page blueprints, or code. Do not continue from the prompt alone.
Generated boards and sheets should be readable at normal preview size. Maquette should regenerate, edit, or split visual artifacts that are cluttered, logo-like, or not inspectable enough to guide implementation.
Sites with primary navigation should define responsive navigation before page implementation: desktop inline nav, tablet/mobile menu toggle, expanded panel or drawer, accessible states, and no document-level horizontal scrolling for nav.
Repeated card grids should define equal-height cards and bottom-pinned action rows before page implementation. Footer social links should use recognizable social icons, and page typography should follow the approved font strategy rather than crude defaults such as `Impact`.
Page implementation now includes a fidelity gate: inventory visible concept regions, create an asset manifest for required raster assets, then document section-by-section screenshot comparison notes before approval.

## Output philosophy

The visual artifact is the creative source and approval artifact.
The structured JSON/CSS files are the machine-readable source of truth.
The coded gallery/page screenshots are the verification artifacts.
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

This pass creates a focused core component sheet, adds focused data/composite/form/navigation/repeated-card/newsletter/footer-social sheets when the product needs them, and implements reusable components, states, and a gallery from the approved brand system.
When a site has global navigation, the component pass should include responsive nav variants for desktop, tablet, and mobile.

### 3. Create pages

After the component library exists, use `$maquette-pages` for each page or screen:

```text
$maquette-pages Make a homepage for the accounting firm.
```

You can also give a more detailed page brief:

```text
$maquette-pages Make a homepage with a proof-led hero, services section, client logos, founder note, pricing preview, and consultation CTA.
```

This pass creates a page concept image, implements the page with the approved brand and component references, captures screenshots when possible, and records review notes.

## Invocation

You can invoke Maquette explicitly by naming the plugin or one of its bundled skills:

```text
@Maquette make a homepage for a new SaaS product.
$maquette-brand-kit create a brand kit for an AI note-taking app.
$maquette-components build the component library from the approved brand kit.
$maquette-pages make a pricing page.
```

Use `@Maquette` or `$maquette` when you want the full staged workflow. Use the individual phase skills when you intentionally want to work on only one phase.

## Optional screenshot tooling

Maquette can use Playwright to capture coded component and page screenshots for visual review and responsive overflow QA.

If your project does not already have Playwright installed, add it in the project where Maquette is generating UI files:

```sh
npm i -D playwright
npx playwright install chromium
```

The bundled capture scripts import the `playwright` package directly and launch Chromium in headless mode:

```sh
node plugins/maquette/skills/maquette-components/scripts/capture-gallery.mjs components/gallery.html components/gallery.png
node plugins/maquette/skills/maquette-pages/scripts/capture-page.mjs pages/homepage/page.html pages/homepage/page.png
node plugins/maquette/shared/scripts/audit-responsive-layout.mjs pages/homepage/page.html --json pages/homepage/responsive-audit.json --screenshots-dir pages/homepage/screenshots
```

Screenshot capture and responsive auditing should stay headless, and every browser instance opened for capture must be closed before the workflow finishes. The bundled scripts close Chromium in a `finally` block.

Responsive review should record measured overflow results at 390, 768, 1024, 1280, and 1440px when browser tooling is available. Page-wide horizontal overflow greater than 1px should be fixed unless an explicit exception is documented.
For pages with navigation, tablet/mobile review should capture closed and open nav states, verify the menu toggle changes `aria-expanded`, and reject nav that clips, overflows, or requires document-level horizontal scrolling.
For pages with repeated cards, review should compare shared anatomy, badge placement, CTA, quantity, price, and action-row alignment across cards with varied copy lengths. For rich footers, review should verify footer structure rather than accepting generic columns. For pages with social links, review should verify recognizable social icons with accessible names. Mobile drawer review should verify opened drawers can scroll independently when needed. Typography review should record the chosen font family, fallback stack, and rationale.

If Playwright is not available, Maquette can still create the design contracts and code, but screenshot-based visual comparison becomes a manual review step.

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

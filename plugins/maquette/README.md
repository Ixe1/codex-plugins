![Maquette](./assets/logo.png)

# Maquette

Maquette is a Codex plugin by **Ixel** for image-guided website design-system workflows.

It is intentionally **image-guided**:
- `image_gen` is the creative design engine
- the coding model is the implementation and review engine
- screenshots of coded output are used for visual comparison and refinement

The default workflow is therefore:
1. **Generate or edit a visual artifact first** with `image_gen`
2. **Inspect the generated artifact** with `view_image` using its absolute filesystem path
3. **Convert that artifact into machine-readable design contracts** such as JSON and CSS tokens
4. **Build a componentized visual reference** for each component artifact using reusable HTML/CSS/JS from the start
5. **Document reusable APIs, slots, states, and usage examples** before moving to the next artifact
6. **Render and screenshot the implementation**
7. **Compare implementation against the approved visual artifact** and iterate

The components phase defaults to focused visual component sheets. Maquette generates one 1:1 visual sheet for a component family or pattern, inspects the final downstream artifact, derives a reviewable `.maquette/components/contracts/<batch>.contract.css` bridge file deterministically from that visual inspection, implements the reusable component batch, and uses browser screenshots as the visual correction target. CSS-contract poster images are optional supplemental references, not the primary source of truth.

When subagent tooling is available but the runtime requires explicit user authorization before spawning subagents, Maquette should ask once near the start of the run whether to use image-worker subagents. Lack of prior subagent authorization is a prompt condition, not a reason to skip image workers. If the user authorizes image workers, Maquette should run image creation and image editing in a dedicated image worker subagent, with exactly one image artifact assigned to each worker. The worker generates or edits the image, locates the saved file on disk, copies or preserves it under the expected raw `.maquette/...-vN.png` path, and returns structured metadata: source path, project raw path, derivative paths, dimensions, derivative method, sidecar path, and the downstream artifact to inspect. The main workflow then creates any available/accepted reference derivative, inspects the exact downstream artifact, and continues with approval, contracts, coding, and QA. Maquette should use the main workflow for image generation only when the user declines image workers, subagent tooling is unavailable after the question, or the user explicitly requests an unattended/no-question run, and it should record that reason.

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
codex plugin marketplace add Ixe1/codex-plugins --ref master
```

```text
@Maquette Make a homepage for "Northstar Metrics", a lightweight analytics product. Include a metrics overview, recent activity, and a clear signup path.
```

Use `$maquette-brand-kit`, `$maquette-components`, or `$maquette-pages` when you want to run one phase at a time.

See [`CHANGELOG.md`](./CHANGELOG.md) for notable Maquette workflow, prompt, and release changes.

## Core rule

If the `image_gen` tool is available in the environment, it is **not optional** for the normal happy-path workflow.

Each phase must use it as follows unless the user explicitly asks to skip image generation or the environment genuinely lacks the tool:
- brand-kit phase -> create or edit a focused foundational 1:1 **brand board image** with no logo, wordmark, brand mark, large product-name treatment, or detailed component inventory; record explicit typography recommendations and fallback strategy
- components phase -> create one focused 1:1 **visual component sheet** at a time, starting with core primitives, then additional focused navigation/layout, data/display, or cards/composites sheets when dense data, larger composites, navigation, repeated cards, newsletter modules, or footer/social modules need them. Derive deterministic CSS contracts after inspecting the visual sheet. Create CSS-contract poster images only as supplemental/non-authoritative references when explicitly requested or justified after the visual sheet exists.
- pages phase -> create or edit a **page concept image**, then write a page layout contract before implementation

After every generated or edited image, inspect the actual result with `view_image` using its absolute filesystem path before using it as the basis for tokens, component specs, page blueprints, or code. If you render a generated local image in chat Markdown, use an absolute filesystem path such as `![alt](/absolute/path.png)`, not a repo-relative path. Do not continue from the prompt alone.
For Maquette reference artifacts, strict naming applies: `...-vN.png` is the raw image_gen artifact, `...-vN-2k.png` is a safe-upscale derivative, and `...-vN-rendered.png` is a deterministic rendered derivative. Workers must not overwrite raw artifacts with derivatives. Every generated or derived reference image needs a JSON sidecar with source paths, derivative paths, dimensions, method, resize mode, aspect-preservation status, original/output aspect ratios, creation time, main-inspection status, and approval/transcription/implementation role.
The 2K derivative workflow applies only to Maquette reference artifacts: brand boards, visual component sheets, optional CSS-contract posters, and page concepts. It does not automatically apply to final website assets such as logos, icons, product images, hero banners, illustrations, textures, transparent cutouts, or other page/media assets.
Brand boards and visual component sheets are 1:1 artifacts, so `safe-upscale-image.mjs --size 2048` is appropriate for their 2K derivatives. Page concepts are often tall or otherwise non-square; they must use aspect-preserving upscaling such as `--scale 2`, `--long-edge 2048`, or `--width 2048`, not `--size 2048`.
Brand-board and page-concept images are explicit user approval gates. After Maquette generates one, it saves the raw project artifact, checks optional image-prep, creates the 2K derivative when accepted or available, views the exact final approval artifact, and only then asks whether to use it or make a new one before deriving tokens, page blueprints, layout contracts, assets, or code. The approval buttons should not include a separate revise choice, though free-form revision notes may still be handled if the user provides them. CSS-contract posters remain supplemental implementation artifacts unless the user explicitly asks to approve each one.
Maquette should only skip these questions when the user explicitly asks for an unattended run with wording such as "do not ask questions", "no pauses", or "skip approval questions". Requests for a "one pass", "full workflow", "final homepage", "fresh disposable test", or "Maquette test" are not unattended requests by themselves.
Generated boards and sheets should be readable at normal preview size. Maquette should regenerate, edit, or split visual artifacts that are cluttered, logo-like, or not inspectable enough to guide implementation.
Sites with primary navigation should define responsive navigation before page implementation: desktop inline nav, tablet/mobile menu toggle, expanded panel or drawer, accessible states, and no document-level horizontal scrolling for nav.
Repeated card grids should define equal-height cards and bottom-pinned action rows before page implementation. Footer social links should use recognizable social icons, and page typography should follow the approved font strategy rather than crude defaults such as `Impact`.
Component implementation includes hard gates per artifact: first make the optional QA tooling decision, then generate one 1:1 visual component sheet by default, derive a deterministic contract, render an artifact-specific componentized replica/reference using reusable CSS/JS, write batch artifacts, and only then move to the next artifact.
Page implementation includes a fidelity gate: inventory visible concept regions, write a page layout contract for section compactness, image fit/crop behavior, terminal regions, and responsive structure, create an asset manifest for required raster assets, then document section-by-section screenshot comparison notes before approval.

## Output philosophy

The brand board is the 1:1 visual-system contract.
The visual component sheet is the 1:1 component reference target for real anatomy, states, density, responsive navigation, repeated-card alignment, tables/cards/forms, and footer/social modules.
The deterministic contract CSS is the implementation bridge from inspected visual sheet to final tokenized component CSS.
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

Review the generated brand direction, then approve it or ask Maquette to make a new one.
Maquette should ask for approval immediately after viewing the final brand-board approval artifact, preferring the 2K derivative when available, before writing design-system JSON or CSS tokens.

### 2. Build the component library

After the brand kit is approved, use `$maquette-components`:

```text
$maquette-components Make a component library.
```

This pass creates a focused core visual component sheet first, builds and reviews a componentized visual reference with reusable classes, states, slots, and usage examples, writes batch artifacts, then repeats that loop for focused data/composite/form/navigation/repeated-card/newsletter/footer-social artifacts when the product needs them.
When a site has global navigation, the component pass should include responsive nav variants for desktop, tablet, and mobile.
Every default visual component sheet is 1:1. Maquette should not generate all component artifacts before implementation. Each multi-sheet batch should create concrete category-prefixed evidence directly under `.maquette/components/`, including `contracts/<batch-slug>.contract.css`, `<batch-slug>.replica.html`, `css/<batch-slug>.components.css`, `js/<batch-slug>.components.js` when needed, `<batch-slug>.component-catalog.json`, and `<batch-slug>.review.md`. The final `replica-gallery.html` is the componentized reference, linked to `css/components.css` and `js/components.js`; pages should use the cataloged component API rather than copying that reference layout.
Each batch must complete screenshot review or documented manual visual review against its source sheet before Maquette generates the next component artifact.

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
Maquette should ask for approval immediately after viewing the final page-concept approval artifact, preferring the 2K derivative when available, before writing the blueprint, inventory, layout contract, asset manifest, or page code.

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

Maquette can use project-local Node dependencies for automated screenshot capture, responsive overflow QA, component API smoke checks, page-consumption smoke checks, JSON schema validation, and safe reference-image preprocessing. These dependencies are **not** bundled with the plugin, and installing Maquette does not create `node_modules`.

If your project does not already have the optional QA dependencies installed, add them in the project where Maquette is generating UI files:

```sh
npm --prefix <projectRoot> i -D playwright ajv ajv-formats
npm --prefix <projectRoot> exec playwright install chromium
```

If the run will preprocess low-resolution raster references before visual transcription or QA, install `sharp` in the same project:

```sh
npm --prefix <projectRoot> i -D sharp
```

You can check whether the current project has the optional QA tooling available without installing anything:

```sh
node plugins/maquette/shared/scripts/ensure-qa-tooling.mjs --project . --check-browser --json .maquette/qa-tooling.json
node plugins/maquette/shared/scripts/ensure-qa-tooling.mjs --project . --check-image-prep --json .maquette/image-prep-tooling.json
```

During a Maquette run, Codex should check optional QA tooling before component sheets, supplemental CSS-contract posters, or component code are generated. Partial availability still counts as missing QA tooling: if Playwright is available but `ajv-formats` is missing, browser QA can run but schema validation is blocked. When low-resolution Maquette reference artifacts would benefit from preprocessing, run the tooling check with `--check-image-prep`; missing `sharp` blocks only the `reference-image-preprocessing` capability. If `ensure-qa-tooling.mjs` reports missing packages, blocked QA capabilities, or `installDecisionRequired: true`, Codex should ask before installing dependencies or skipping those automated checks, unless the user already declined for the run or installation is impossible. If the user agrees, Codex can run the project-local install commands and continue with automated QA, including `sharp` when image-prep will be used. If the user declines, Maquette should continue with manual screenshot/schema review and record that automated QA tooling was unavailable.

Project-local installs are the recommended path. Global npm installs are not recommended because Node usually will not resolve global packages from plugin scripts unless the user also configures environment-specific module lookup such as `NODE_PATH`.

The bundled browser scripts load `playwright` from the current project when available and launch Chromium in headless mode. The JSON validation helper loads `ajv` and `ajv-formats` from the current project when available. Parent and global `node_modules` do not count as project-local unless an explicit documented override is used. The safe-upscale helper loads `sharp` from the current project when available and creates a separate 2K Lanczos + mild-unsharp PNG for Maquette reference artifacts without overwriting the original reference. Use `--size 2048` only for square brand boards, component sheets, and square supplemental posters. Use `--long-edge 2048`, `--width 2048`, or `--scale 2` for non-square page concepts so the derivative preserves the concept aspect ratio:

```sh
node plugins/maquette/shared/scripts/ensure-qa-tooling.mjs --project . --check-browser
node plugins/maquette/shared/scripts/ensure-qa-tooling.mjs --project . --check-image-prep
node plugins/maquette/shared/scripts/safe-upscale-image.mjs .maquette/components/component-sheet-core-v1.png .maquette/components/component-sheet-core-v1-2k.png --project . --size 2048 --json .maquette/components/component-sheet-core-v1-2k.json --role component-sheet-transcription
node plugins/maquette/shared/scripts/safe-upscale-image.mjs .maquette/brand/brand-board-v1.png .maquette/brand/brand-board-v1-2k.png --project . --size 2048 --json .maquette/brand/brand-board-v1-2k.json --role brand-board-approval
node plugins/maquette/shared/scripts/safe-upscale-image.mjs .maquette/pages/homepage/concept-v1.png .maquette/pages/homepage/concept-v1-2k.png --project . --long-edge 2048 --json .maquette/pages/homepage/concept-v1-2k.json --role page-concept-approval
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

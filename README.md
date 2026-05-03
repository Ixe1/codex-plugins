# Ixel Codex Marketplace

This repository is the Ixel Codex plugin marketplace. It contains marketplace metadata plus one or more plugins under `plugins/`.

The marketplace currently includes:

- [Maquette](./plugins/maquette) - image-guided website directions, brand kits, component contracts, and implemented pages

## Install From Dev

For active development, add the marketplace from the `dev` branch:

```sh
codex plugin marketplace add Ixe1/codex-plugins --ref dev
```

If the Ixel marketplace is already configured, refresh it instead:

```sh
codex plugin marketplace upgrade ixel
```

Then restart Codex, open the plugin directory, select the Ixel marketplace, and install or update the plugins you want.

In Codex CLI, open the plugin directory with:

```text
/plugins
```

If you want a sparse checkout for the marketplace source, include both the marketplace metadata and plugin folders:

```sh
codex plugin marketplace add Ixe1/codex-plugins --ref dev --sparse .agents/plugins --sparse plugins
```

## Stable Install

For released versions, use the default branch instead:

```sh
codex plugin marketplace add Ixe1/codex-plugins --ref master
```

Stable release tags should be plugin-scoped once multiple plugins have independent release lifecycles. Maquette has an existing legacy tag named `v0.3.3`; future Maquette tags should prefer names such as `maquette/v0.4.0`.

## Marketplace Layout

```text
.agents/plugins/marketplace.json
plugins/
  maquette/
    .codex-plugin/plugin.json
    README.md
    skills/
    shared/
```

The canonical marketplace file is `.agents/plugins/marketplace.json`. It names the marketplace `ixel` and points plugin entries at their directories under `plugins/`.

The root `marketplace.json` mirrors the same marketplace metadata for compatibility with tooling that reads from the repository root.

## Available Plugins

### Maquette

Maquette is a Codex plugin for image-guided website design-system workflows.

It helps Codex turn an approved visual direction into reusable website artifacts:

- greenfield page direction concepts with structured direction inventories
- brand kits with design-system JSON and CSS tokens
- component contracts and reusable HTML/CSS/JS with reference QA
- implemented pages with screenshot and responsive review notes

Invoke the full staged workflow with `@Maquette` or `$maquette`:

```text
@Maquette Make a homepage for "Northstar Metrics", a lightweight analytics product. Include a metrics overview, recent activity, and a clear signup path.
```

Use `$maquette-direction`, `$maquette-brand-kit`, `$maquette-components`, or `$maquette-pages` when you want to run one phase at a time.

See the [Maquette README](./plugins/maquette/README.md) for the full workflow, image generation rules, optional QA tooling, and manual local install notes.

## Adding Plugins

Add new marketplace plugins under `plugins/<plugin-name>/`.

Each plugin should contain:

- `.codex-plugin/plugin.json`
- plugin-specific README documentation
- any plugin skills, shared files, assets, scripts, apps, or MCP config needed at runtime

Add the plugin entry to `.agents/plugins/marketplace.json`, and keep the root `marketplace.json` mirror aligned when it is still used by local tooling.

## Releases

For stable releases:

1. Create or switch to a release branch, for example `release/maquette/v0.4.0`.
2. Update the plugin version in that plugin's `.codex-plugin/plugin.json`.
3. Merge the release branch to `master`.
4. Create an annotated plugin-scoped tag for the released plugin version:

```sh
git tag -a maquette/v0.4.0 -m "Maquette v0.4.0"
git push origin refs/tags/maquette/v0.4.0
```

For development builds, publish or install from a branch ref such as `dev`, `next`, or `release/maquette/v0.4.0`. Do not use a stable version tag for moving development work.

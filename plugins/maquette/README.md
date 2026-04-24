# Maquette

Maquette is a Codex plugin by **Ixel** for image-guided website design-system workflows.

It is intentionally **image-guided**:
- `image_gen` is the creative design engine
- the coding model is the implementation and review engine
- screenshots of coded output are used for visual comparison and refinement

The workflow is therefore:
1. **Generate or edit a visual artifact first** with `image_gen`
2. **Convert that artifact into machine-readable design contracts** such as JSON and CSS tokens
3. **Implement reusable HTML/CSS/JS**
4. **Render and screenshot the implementation**
5. **Compare implementation against the approved visual artifact** and iterate

This plugin is split into three focused skills:
- `maquette-brand-kit`
- `maquette-components`
- `maquette-pages`

## Core rule

If the `image_gen` tool is available in the environment, it is **not optional** for the normal happy-path workflow.

Each phase must use it as follows unless the user explicitly asks to skip image generation or the environment genuinely lacks the tool:
- brand-kit phase -> create or edit a **brand board image**
- components phase -> create or edit a **component sheet image** before or alongside implementation
- pages phase -> create or edit a **page concept image** before implementation

## Output philosophy

The visual artifact is the creative source and approval artifact.
The structured JSON/CSS files are the machine-readable source of truth.
The coded gallery/page screenshots are the verification artifacts.

## Installation

### Add the marketplace

Once this repository is published, add its marketplace to Codex:

```sh
codex plugin marketplace add Ixe1/maquette --ref master
```

Then restart Codex, open the plugin directory, select the Ixel marketplace, and install Maquette.

In Codex CLI, open the plugin directory with:

```text
/plugins
```

If you want a sparse checkout for the marketplace source, include both the marketplace metadata and plugin folder:

```sh
codex plugin marketplace add Ixe1/maquette --ref master --sparse .agents/plugins --sparse plugins/maquette
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

After installation, start a new thread and invoke the skills directly with `$maquette-brand-kit`, `$maquette-components`, or `$maquette-pages`.

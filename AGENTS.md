# Repository Instructions

## Project Scope

This repository contains the Maquette Codex plugin and its marketplace metadata.

Plugin runtime behavior must live in plugin files, not only in repository instructions:

- `plugins/maquette/.codex-plugin/plugin.json`
- `plugins/maquette/skills/*/SKILL.md`
- `plugins/maquette/skills/*/agents/openai.yaml`
- `plugins/maquette/shared/*`
- skill asset prompt files under `plugins/maquette/skills/*/assets/`

Use this `AGENTS.md` for repository maintenance guidance only.

## Installed Plugin Cache

Do not edit installed plugin cache copies such as `%USERPROFILE%\.codex\plugins\cache\ixel\maquette\...` during normal repository work. Make changes in this repository under `plugins/maquette/` and let Codex install or refresh the plugin from the pushed ref after restart.

Only touch an installed cache path when the user explicitly asks to patch the local installed copy for immediate testing, and keep that separate from the source changes.

## Documentation

Keep the root `README.md` and `plugins/maquette/README.md` aligned when changing user-facing plugin behavior, invocation examples, installation notes, or release guidance.

When changing skill behavior, update the relevant `SKILL.md` first. Then update shared docs or README files only if the behavior should be visible to users.

## Versioning And Releases

The plugin version is defined in:

- `plugins/maquette/.codex-plugin/plugin.json`

For a stable release:

1. Create or switch to the release branch, for example `release/v0.3.0`.
2. Update the plugin version in `plugin.json`.
3. Commit the release changes.
4. Create an annotated tag with the same version, for example `v0.3.0`.

Prefer release branch names such as `release/v0.3.0` so they do not collide with version tags such as `v0.3.0`.

Use explicit refs when pushing release branches and tags:

```sh
git push origin refs/heads/release/v0.3.0
git push origin refs/tags/v0.3.0
```

For prereleases, use SemVer prerelease versions in `plugin.json` and matching annotated tags:

```text
0.4.0-alpha.1
0.4.0-beta.1
0.4.0-rc.1
```

Example prerelease tag:

```sh
git tag -a v0.4.0-alpha.1 -m "Maquette v0.4.0-alpha.1"
```

For development builds, publish or install from a branch ref such as `dev`, `next`, or `release/v0.4.0`. Do not use a stable version tag for moving development work.

## Skill Changes

When adding a new skill:

- create `plugins/maquette/skills/<skill-name>/SKILL.md`
- add `plugins/maquette/skills/<skill-name>/agents/openai.yaml` when the skill should appear as an explicit invocation target
- update `plugins/maquette/.codex-plugin/plugin.json` only when plugin-level behavior, metadata, screenshots, or default prompts change
- update README examples if the new skill changes the recommended user workflow

Do not rely on `AGENTS.md` to define behavior that installed-plugin users must receive.

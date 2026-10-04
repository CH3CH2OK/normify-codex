# Normify for Codex

English · [简体中文](README.md) · [MIT](LICENSE)

Analyze repositories into validated bilingual module trees and interactive,
drill-down architecture diagrams. This community adaptation exposes all 31 tools
from [yan-mc/dsh-normify](https://github.com/yan-mc/dsh-normify) through MCP and a
self-contained Codex `normify-gen` skill.

Based on upstream v0.5.4, commit
`ed404e5b8db0010ff57ec8486ec8749421072545`. This is not an official release by
the upstream author or OpenAI.

## Features

- Original module editing, dependency analysis, fingerprinting, validation,
  compilation, rendering, policies, planned development and change management.
- Bilingual module/API contracts and dependency arrows anchored to API rows.
- L1/L2/L3 validation and SHA-256 build receipts.
- Standalone HTML diagrams with navigation, search and language switching.
- MCP stdio transport, JSON Schema validation, sequential calls and error flags.
- A Codex skill with a local CLI fallback that works without the MCP connection.

No DSH desktop, DeepSeek account or API key is required. The optional DSH
post-edit reminder hook is not implemented; the companion workflow explicitly
syncs architecture data before closing a change.

## Install

Requires Node.js 18+, npm and local Codex.

```sh
git clone https://github.com/CH3CH2OK/normify-codex.git
cd normify-codex
npm ci --omit=dev --legacy-peer-deps
```

Installation prepares the self-contained skill runtime. If using
`--ignore-scripts`, run `npm run codex:sync-runtime` afterwards.

On Windows run `./codex/install.ps1` from the project directory. It installs the
skill and registers the MCP server, stopping if either already exists.

For manual installation, copy the entire `codex/skills/normify-gen` directory to
`$CODEX_HOME/skills/`, or `~/.codex/skills/` when unset. Current Codex versions
also support `~/.agents/skills/`; use one location to avoid duplicates.

```sh
codex mcp add normify -- node /absolute/path/to/normify-codex/codex/mcp.mjs
codex mcp get normify
```

Keep the project directory in place for MCP. Try the skill on the next turn;
restart Codex if the skill or tools are not discovered.

## Use

```text
Use $normify-gen to map this repository and render an interactive architecture
diagram. Analyze source code without modifying it.
```

The skill also supports synchronizing an existing tree and explicitly requested
architecture-guided development. Data and generated artifacts live in the
selected `normify-<slug>/` directory. Read-only mapping does not authorize source
changes.

For direct CLI access:

```sh
npm run codex:list
node codex/skills/normify-gen/scripts/normify.mjs call normify_help --args-file args.json
```

Example arguments: `{"topic":"tool:normify_project_init"}`. CLI failures return
a nonzero exit code; MCP failures set `isError`.

## Development

```sh
npm ci --legacy-peer-deps
npm run build
npm run typecheck
npm test
npm run test:codex
```

Build refreshes the bundled skill engine. The five original suites and the new
MCP integration suite cover tool discovery, errors, input rejection, dry-run,
activation without Git, fingerprint drift, compilation, rendering and standalone
skill execution. CI runs on Linux and Windows.

## Attribution and license

[MIT](LICENSE). The original `yan-mc` copyright and license are preserved.
Codex adaptation published by `CH3CH2OK`; the core engine and renderer remain
upstream work. See [NOTICE](NOTICE), [adaptation metadata](codex/ADAPTATION.json)
and [third-party notices](THIRD_PARTY_NOTICES.md).

Original documentation: [中文](UPSTREAM_README.zh-CN.md) ·
[English](UPSTREAM_README.en.md).

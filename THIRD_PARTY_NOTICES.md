# Third-party notices

The root MIT license applies to Normify and the Codex adaptation. It does not
replace third-party licenses. Preserve dependency license files when redistributing
the installed skill, npm package or an offline bundle.

| Component | License | Where the notice is retained |
| --- | --- | --- |
| dsh-normify v0.5.4, yan-mc | MIT | `LICENSE` and skill/runtime copies |
| Vendored schemastery 3.18.2, Shigma | MIT | `vendor/schemastery/LICENSE` |
| Vendored cosmokit 1.8.3, Shigma | MIT | `vendor/cosmokit/LICENSE` |
| `@modelcontextprotocol/sdk` 1.32.0 | MIT | Installed package `LICENSE` |
| `ajv` 8.20.0 | MIT | Installed/bundled package `LICENSE` |
| `yaml` 2.9.1 | ISC | Installed/bundled package `LICENSE` |

Vendored source is included in this repository with its original licenses. npm
dependencies are resolved using `package-lock.json`; their licenses remain in
the installed package directories. `codex/sync-runtime.mjs` copies full packages,
including their notices, for YAML parsing and JSON Schema validation. Transitive
dependencies keep their own notices in those copied directories.

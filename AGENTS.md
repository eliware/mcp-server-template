# AGENTS.md

## Project

Repository: eliware/mcp-server-template. Purpose: provide a reusable Model Context Protocol server application template.

## Scope and boundaries

Scope: this repository owns its MCP server template, tool behavior, tests, package metadata, documentation, and container/service examples. It does not own shared Eliware requirements, credentials, or production release and deployment execution. This AGENTS.md applies repository-wide; nearer AGENTS.md instructions apply within subdirectories.

## Layout

Required structure: mcp-server-template.mjs is the runtime entrypoint; src/ contains implementation and tests/ mirrors it. tools/ contains the root-level tool modules discovered by @eliware/mcp-server. docs/ contains end-user documentation, specs/ contains repository-specific directives, and .knit/deploy.yaml defines development validation.

## Development

This Development guidance applies repository-wide; nearer AGENTS.md instructions apply within subdirectories. Use Node.js 26, npm, and native ESM .mjs modules. Read README.md, applicable specifications, implementation, and tests before changing behavior. Every source and test module must have a single responsibility: one cohesive purpose and one reason to change. Business-logic modules and coordinators are valid, including coordinators of coordinators, when each module does only its own responsibility. When a change introduces a distinct responsibility, create a focused submodule with a mirrored test and wire it through its owner; do not add the new responsibility to an existing module. During ordinary review, refactor them when you notice mixed responsibilities. The 100-line source and 200-line test maxima are blocking. Passing them does not prove cohesion or permit mixed responsibilities.

The required files include README.md, AGENTS.md, package.json, LICENSE, RELEASE_NOTES.md, docs/README.md, specs/README.md, specs/directives.json, .knit/deploy.yaml, .github/workflows/ci.yml, and .github/workflows/publish.yml.

## Validation

Use Node.js 26 with npm. Runtime settings are MCP_TOKEN, MCP_HTTP_PORT, and LOG_LEVEL from the environment; package.json and .knit/deploy.yaml are not runtime configuration. Run npm ci after dependency changes and npm test before handoff. Aggregate validation runs Jest with 100% statement, branch, function, and line coverage, lint, format-check, audit, and applicable profile checks through eliware-test. CI runs npm ci followed by npm test.

## Security

Keep credentials, tokens, and machine-specific files out of version control. Use an untracked .env file or an authorized secret store. The public container image must not contain secrets. Restrict network exposure and tool permissions.

## Changes

Keep instructions actionable, current, and concise. Project-specific rules may add requirements without weakening shared rules unless authorized. A documented deviation does not waive any convention ID or validation stage. Do not publish, release, deploy, or modify external systems without explicit authorization through the applicable Operations handoff.

## Application

The application entrypoint is mcp-server-template.mjs and application implementation is under src/. The server supports HTTP and stdio modes. Validate configuration before opening listeners, and close transports and process handlers during shutdown. The safe operational boundaries exclude unintended network exposure. Runtime configuration comes from environment variables and is listed in .env.example.

## MCP server

Tools are discovered from the root tools/ directory and must follow the default-export registration contract. This starter defines no resources or prompts. The server supports Streamable HTTP and stdio transports with static bearer-token authentication. Validate tool schemas and protocol behavior. Preserve safe operational boundaries and do not expose a live endpoint unintentionally.

## GHCR publication

The public image is ghcr.io/eliware/mcp-server-template. Its visibility is public after publication. .github/workflows/publish.yml publishes version-tagged images after validation, attests the image with GitHub provenance, and verifies the pushed digest. GitHub token credentials are used only by that workflow. Publication does not deploy the image; deployment requires a separate GitOps handoff.

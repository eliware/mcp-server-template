# AGENTS.md

## Project

This repository is `eliware/mcp-server-template`.

It starts Model Context Protocol servers.

## Scope and boundaries

Use README.md for repository purpose, scope, and ownership.

## Layout

Use README.md and specs/README.md to find repository files.

## Development

Keep each source and test module focused on one responsibility.

## Validation

Use Node.js 26 or later and npm 12 or later.
Use native ESM for maintained JavaScript modules.
Run `npm test` for aggregate validation.
Run `npm run lint` for lint checks.
Run `npm run audit` for dependency checks.
Run `npm run format` to format files.
Run `npm run format:check` to check formatting.

## Security

Keep credentials, secret values, private data, and runtime state out of Git.

## Changes

Keep changes within this repository scope.
Use Eliware Operations for approval before external changes.

## Application

Document entrypoints, workflows, settings, startup, and shutdown in README.md.
For a small change, run one or more focused tests.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Run the full `npm test` suite before a commit or milestone.

## MCP server

Document tools, schemas, transports, authentication, and side effects in README.md.

## GHCR publication

Image: ghcr.io/eliware/mcp-server-template

Pull command: docker pull ghcr.io/eliware/mcp-server-template:v12.0.0

Supported tags: vMAJOR.MINOR.PATCH

Deployment boundary: publication does not deploy; deploy by immutable version tag and recorded sha256 digest.

Document image purpose, access, and deployment use in README.md.

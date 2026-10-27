# Release Notes

## 15.0.1 — 2026-10-26

### Added

- Start an MCP server with HTTP or stdio transport and support protocol revision `2026-07-28`.
- Add the `echo` tool with a Zod input schema and a JSON response.
- Add graceful shutdown for HTTP and stdio transports after shutdown signals during startup.
- Add tests for port validation, server lifecycle, runtime startup, and the echo tool.

### Fixed

- Close both server transports when a shutdown signal arrives while server creation is pending.

### Changed

- Align package metadata, repository directives, and validation with v13, v14, and v15 conventions.
- Use `PORT` to select the HTTP listener port. This variable replaces `MCP_HTTP_PORT`.
- Require `MCP_TOKEN` for HTTP authentication. Allow stdio startup without that token.
- Update setup, configuration, transport, authentication, tool, container, and deployment guidance.
- Mark template content for replacement in derived repositories. Clarify repository ownership boundaries.
- Use current GitHub Actions, complete Git history, and Eliware Test validation in CI.
- Publish GHCR images from immutable version tags and verify the published image digest.
- Update container configuration, health checks, and the deployment workflow for `PORT` and the release process.
- Update `@eliware/common`, `@eliware/mcp-server`, and `@eliware/test` to version 15.0.1. Keep `dotenv` at version 18.0.9.

### Breaking changes

- Replace `MCP_HTTP_PORT` with `PORT` for the HTTP listener.

### Migration

- Define `PORT` when the previous configuration used `MCP_HTTP_PORT`.

## 12.0.0 — 2026-10-12

### Changed

- Align package metadata, documentation, and validation with v12 conventions.
- Update shared packages and container validation workflows.
- Document HTTP and stdio setup, authentication, tools, and deployment limits.
- Keep HTTP access behind an approved boundary.

## 11.0.0 — 2026-10-03

### Changed

- Align repository metadata, documentation, specifications, and workflows with the v11 conventions.

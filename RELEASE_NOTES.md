# Release Notes

## 15.0.0 — 2026-10-24

### Added

- Start the sample MCP server with HTTP or stdio transport.
- Add the `echo` tool with a Zod input schema and a JSON response.
- Add graceful shutdown for active HTTP and stdio transports.
- Add port validation and lifecycle tests.
- Add GHCR image publication with release tag and digest verification.
- Document setup, configuration, transports, authentication, tools, containers, and deployment.

### Breaking changes

- Replace `MCP_HTTP_PORT` with `PORT` to select the HTTP port.

### Migration

- Set `PORT` when you previously set `MCP_HTTP_PORT`.

### Changed

- Align package metadata, repository directives, and maintained guidance with Eliware Test v15.
- Update `@eliware/common`, `@eliware/mcp-server`, and `@eliware/test` to version 15.0.0.
- Update `dotenv` to version 18.0.9.
- Use `PORT` for the HTTP listener and require `MCP_TOKEN` only for HTTP authentication.
- Keep stdio startup available without an HTTP bearer token.
- Use current GitHub Actions and fetch complete history in CI.
- Build containers with the current package lock and run the application as the unprivileged `node` user.
- Support MCP protocol revision `2026-07-28` with Streamable HTTP and stdio transports.

## 12.0.0 — 2026-10-12

### Changed

- Align package metadata, documentation, and validation with v12 conventions.
- Update shared packages and container validation workflows.
- Document HTTP and stdio setup, authentication, tools, and deployment limits.
- Keep HTTP access behind an approved boundary.

## 11.0.0 — 2026-10-03

### Changed

- Align repository metadata, documentation, specifications, and workflows with the v11 conventions.

# Release Notes

## 14.0.0 — 2026-10-20

### Added

- Add signed container image publication with release tag and digest verification.
- Add lifecycle handling that closes the active Fastify app or stdio transport.
- Add a placeholder MCP token value and instructions to replace template documentation.

### Changed

- Align package metadata, repository specifications, and workflows with the 14.0.0 conventions.
- Update `@eliware/common` and `@eliware/mcp-server` to version 13.0.0.
- Refresh runtime dependency locks with dotenv.
- Use `PORT` for HTTP listeners and require `MCP_TOKEN` only for HTTP authentication.
- Keep stdio startup available without an HTTP bearer token.
- Separate echo response construction from its tool handler and adapter.
- Keep echo tests focused by mocking the MCP server schema API.
- Combine default and configured HTTP startup checks in one runtime test.
- Close active transports asynchronously during shutdown and use concise runtime status messages.
- Document the protocol revision, environment variables, tools, container settings, health check, and deployment limits.
- Update CI to use current GitHub Actions and fetch complete Git history for release tag checks.
- Align GHCR publication and Knit deployment workflows with the shared procedures.
- Update package instructions, Docker configuration, and application guidance.
- Complete the README Troubleshooting section and the AGENTS.md Changes and MCP server sections.
- Update the GHCR pull example to use image tag `v14.0.0`.

## 12.0.0 — 2026-10-12

### Changed

- Align package metadata, documentation, and validation with v12 conventions.
- Update shared packages and container validation workflows.
- Document HTTP and stdio setup, authentication, tools, and deployment limits.
- Keep HTTP access behind an approved boundary.

## 11.0.0 — 2026-10-03

### Changed

- Align repository metadata, documentation, specifications, and workflows with the v11 conventions.

# Release Notes

## 13.0.0 — 2026-10-19

### Added

- Add a GHCR workflow that publishes signed container images.
- Add a lifecycle module that closes Fastify apps and stdio transports.

### Changed

- Set the template version to 13.0.0 and upgrade `@eliware/test` to v13.
- Keep `@eliware/mcp-server` at v12 because v13 is not available in npm.
- Refresh dotenv and sync the lock file.
- Use `PORT` for the HTTP listener and keep `MCP_TOKEN` for HTTP authentication.
- Allow stdio startup without an HTTP bearer token.
- Close the active Fastify app or stdio transport during shutdown.
- Keep echo response construction in the tool handler and test it through the adapter.
- Combine default and configured HTTP startup checks in one runtime test.
- Mock the server schema API in the echo test. The test then loads fewer modules.
- Align repository instructions, documentation, and directives with v13 conventions.
- Document protocol revision `2026-07-28`, environment variables, container listener mapping, health checks, and deployment steps.
- Update CI tag validation and fetch full Git history for tag checks.
- Update GHCR publishing and Knit deployment commands. The deploy workflow pulls repository changes.
- Use concise runtime status messages.
- Replace callback-based closing with async shutdown of the active Fastify app or stdio transport.
- Replace `publish.yaml` with the canonical `ghcr.yaml` workflow.
- Add an `.env.example` placeholder for the MCP token and document template replacement steps.
- Align package instructions, Docker configuration, and repository conventions with v13.

## 12.0.0 — 2026-10-12

### Changed

- Align package metadata, documentation, and validation with v12 conventions.
- Update shared packages and container validation workflows.
- Document HTTP and stdio setup, authentication, tools, and deployment limits.
- Keep HTTP access behind an approved boundary.

## 11.0.0 — 2026-10-03

### Changed

- Align repository metadata, documentation, specifications, and workflows with the v11 conventions.

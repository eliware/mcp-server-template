# MCP server guide

Use this guide to configure and run an MCP server from this template.

## Create and configure

1. Create a repository from this template.
2. Set the package name, description, URLs, and keywords.
3. Copy `.env.example` to an untracked `.env` file.
4. Set `MCP_TOKEN` before HTTP startup.
5. Keep the token in an approved secret store in deployed systems.

## Select a transport

Run `node bin/mcp-server-template.mjs` to start the HTTP transport. The listener uses `1234` by default. Set `MCP_HTTP_PORT` to select a different number.

Run `node bin/mcp-server-template.mjs --stdio` to start the stdio transport. Stdio mode does not open an HTTP listener.

Use HTTPS for remote HTTP access. Limit access to approved clients. Do not show a token in logs or command output.

## Add tools

Put each tool implementation under `src/tools/`. Add a root `tools/` adapter for discovery. Define and validate the input schema and response shape.

The sample `echo` tool returns the input text. The starter registers no resources or prompts.

## Stop the server

The runtime closes active transports during shutdown. Keep shutdown logic in `src/runtime.mjs` and test it with mocks.

## Container and deployment

Build the image with `docker build -t mcp-server-template .`. The image is `ghcr.io/eliware/mcp-server-template`.

Use a released version tag and its recorded SHA-256 digest for deployment. Publication does not deploy the server.

## Validate

Run `npm test` before handoff. It checks tests, lint, formatting, audit, and applicable profile rules.

# AGENTS.md

## Project

`@eliware/mcp-server-template` is a runnable MCP server template with tool discovery, Streamable HTTP/stdio modes, bearer authentication, Docker, Compose, and systemd support.

## Scope and boundaries

- This template owns its tools, examples, tests, packaging, and deployment examples.
- Do not publish, tag, deploy, or expose a live server without explicit authorization.

## Layout

- `tools/` contains tool registrations; `examples/` contains runnable examples.
- `.env.example`, Docker, Compose, and systemd files document deployment configuration.

## Development

- Use Node.js 26 and native ESM.
- Read README.md, applicable specs, and the shared Docs, Conventions, and Operations authorities before changing files.
- Keep tools under `tools/` and preserve the documented default-export tool contract.
- Validate tool schemas and transport behavior when changing an MCP tool or server entrypoint.
- Keep `MCP_TOKEN` and deployment credentials in `.env`; never commit secrets.
- Preserve safe HTTP and stdio startup, shutdown, and container examples.

## Validation

Run `npm test`, `npm run test:gaps`, `npm run lint`, and the documented Docker/Kubernetes checks only in controlled environments. Do not expose the server unintentionally.

## Security

Never commit `.env`, MCP bearer tokens, private keys, or credential-bearing URLs.

## Changes

Update README, `.env.example`, Docker/Compose/systemd files, and package dependencies together. Do not bump versions, tag, publish, or deploy unless explicitly requested.

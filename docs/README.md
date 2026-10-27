# MCP server guide

Use this guide to create, configure, run, and operate a server from this template.

> After you create a repository from this template, replace this document with end-user documentation for your repository.

## Requirements

Use Node.js 26 or later. Use an MCP client that supports protocol revision `2026-07-28`.
Use npm 12 or later to validate this repository.

## Create the application

1. Create a repository from this template.
2. Set the package name, description, URLs, and keywords.
3. Replace the sample tool and application metadata.
4. Run `npm ci` from the repository root.

## Configure the application

Copy `.env.example` to `.env`. Keep `.env` out of Git.

| Variable    | Default    | Purpose                                 |
| ----------- | ---------- | --------------------------------------- |
| `MCP_TOKEN` | No default | Bearer token for HTTP authentication.   |
| `PORT`      | `1234`     | Set the HTTP listener number.           |
| `LOG_LEVEL` | `info`     | Set the level for application messages. |

HTTP mode requires `MCP_TOKEN`. Stdio mode does not use HTTP authentication.
Set secrets through an approved secret store in deployed systems.

## Select a transport

Run `node bin/mcp-server-template.mjs` to start the HTTP transport.
Set `PORT` to select a listener number. The default is `1234`.

Run `node bin/mcp-server-template.mjs --stdio` to start the stdio transport.
The process communicates with its MCP client through stdin and stdout.
Send application logs to stderr. Do not write other data to stdout.

The server uses Streamable HTTP for network requests. It does not support HTTP with SSE.
The server accepts protocol revision `2026-07-28` only.

## Add a tool

Put each tool implementation under `src/tools/`. Add a matching adapter under `tools/`.
The adapter re-exports its handler. Its file name becomes the tool name.
Define the input with a Zod schema and return a valid MCP tool result.

The starter provides an `echo` tool. It returns the input text as JSON.
The starter adds no resources or prompts.

## Stop the server

The runtime closes active transports after it receives a shutdown signal.
The runtime handles `SIGINT` and `SIGTERM` through `@eliware/common`.
Keep cleanup for application resources in the derived application.

## Container operations

Build the image with `docker build -t mcp-server-template .`.
Run the image with `docker compose up --build` after you set `MCP_TOKEN` in `.env`.
Set `HOST_PORT` to change the host listener number. Set `PORT` to change the container listener number.
The health check sends a bearer token to the server.

Use a released image tag and its recorded SHA-256 digest for deployment.
Publication does not deploy the server.
Use HTTPS for remote access and limit access to approved clients.

## Validate changes

Run `npm test` before handoff. It checks tests, lint, formatting, audit, packaging, and repository rules.
Run `npm run format` to format files before you run the full validation.

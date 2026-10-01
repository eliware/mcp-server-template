# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/mcp-server-template [![license](https://img.shields.io/github/license/eliware/mcp-server-template.svg)](LICENSE) [![CI](https://github.com/eliware/mcp-server-template/actions/workflows/ci.yml/badge.svg)](https://github.com/eliware/mcp-server-template/actions/workflows/ci.yml)

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Configuration](#configuration)
- [Operations](#operations)
- [Tools](#tools)
- [Resources](#resources)
- [Prompts](#prompts)
- [Transport](#transport)
- [Authentication](#authentication)
- [Schemas](#schemas)
- [Support](#support)
- [License](#license)
- [Links](#links)

## Features

A Model Context Protocol (MCP) server template for building AI and automation tool APIs. It includes dynamic tool discovery, Streamable HTTP and stdio transports, bearer-token authentication, and Docker and systemd examples.

Package description: A Model Context Protocol (MCP) server template for building AI and automation tool APIs. Author: Eli Sterling, eliware.org <eli@eliware.org>. License: MIT.

## Requirements

Use Node.js 26 and npm. An MCP client is required to exercise a running server.

## Setup

Create a repository from this template, replace the package identity and repository URLs, then run npm ci. Copy .env.example to an untracked .env file and set MCP_TOKEN before starting the server.

## Usage

Run node mcp-server-template.mjs for the HTTP server. Run node mcp-server-template.mjs --stdio to use stdio transport. Keep HTTP access limited to the intended clients.

## Development

Read AGENTS.md, specs/README.md, and applicable shared conventions before changing the template. Keep tool implementation modules under src/tools/ and their root discovery adapters under tools/.

## Testing

Run npm test for Jest with 100% statement, branch, function, and line coverage, lint, format-check, audit, and applicable profile validation through eliware-test. CI runs npm ci followed by npm test.

## Troubleshooting

If startup reports a missing MCP_TOKEN, set it in the untracked .env file or the authorized deployment secret store. Check MCP_HTTP_PORT when the server listens on an unexpected port. A passing local validation does not prove a live endpoint is reachable or secure.

## Security

Never commit .env, bearer tokens, private keys, or credential-bearing URLs. Keep the server behind an approved network boundary, use HTTPS for remote access, and give each tool only the permissions and context it needs.

## Configuration

Startup validates MCP_TOKEN before opening a listener. Shutdown closes active transports and removes process handlers. MCP_TOKEN is required. MCP_HTTP_PORT defaults to 1234. LOG_LEVEL defaults to info. These runtime settings and defaults are read from environment variables; package metadata and deployment configuration are not runtime settings. See .env.example.

## Operations

Startup runs the HTTP server on MCP_HTTP_PORT and requires MCP_TOKEN. The externally observable workflows are HTTP requests and stdio requests; shutdown closes active transports. The operational boundaries prohibit unintended network exposure. The operational boundaries are limited to the documented HTTP and stdio workflows. Stdio mode does not open an HTTP listener. Docker, Compose, and systemd examples are provided for controlled environments. The template does not deploy itself. The GHCR image is ghcr.io/eliware/mcp-server-template; pull a released image with docker pull ghcr.io/eliware/mcp-server-template:v9.0.0. Only version tags identify releases. After publication, use a separate Operations release handoff and a separate GitOps deployment handoff for any rollout.

## Tools

Purpose: expose callable operations to MCP clients. The server discovers .mjs modules from the root tools/ directory. Each tool adapter registers one tool through a default-export function that receives the MCP server, tool name, logger, and configured context. src/tools/echo.mjs contains the implementation used by the root tools/echo.mjs discovery adapter.

## Resources

This starter registers no MCP resources.

## Prompts

This starter registers no MCP prompts.

## Transport

HTTP is the default transport and uses MCP_HTTP_PORT. Pass --stdio to start stdio transport. Do not expose the HTTP listener outside an approved network boundary.

## Authentication

HTTP requests use a static bearer token from MCP_TOKEN. Store that value only in an untracked .env file or an authorized secret store. The token is required before the server starts.

## Schemas

Tool input schemas use Zod definitions provided by @eliware/mcp-server. Validate each tool's schema and response shape with focused tests.

## Support

For help or discussion, join the Eliware community:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## License

[license](LICENSE)

## Links

- Documentation: [docs](docs/README.md) · [specifications](specs/README.md) · [release notes](RELEASE_NOTES.md)

- [Canonical repository profile specifications](https://github.com/eliware/test/blob/main/specs/conventions/README.md)
- [Home Page](https://eliware.org)
- [GitHub Repo](https://github.com/eliware/mcp-server-template)
- [GitHub Org](https://github.com/eliware)
- [Eli Sterling on GitHub](https://github.com/eli-sterling)
- [Discord](https://discord.gg/M6aTR9eTwN)

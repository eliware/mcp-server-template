# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/mcp-server-template [![License](https://img.shields.io/github/license/eliware/mcp-server-template)](https://github.com/eliware/mcp-server-template/blob/main/LICENSE) [![CI](https://github.com/eliware/mcp-server-template/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/mcp-server-template/actions/workflows/ci.yaml)

A Model Context Protocol (MCP) server template for building AI and automation tool APIs.

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
- [Links](#links)
- [License](#license)

## Features

This template provides a reusable starting point. Each derived repository owns its product behavior and operating decisions.

## Requirements

Use Node.js 26 or later and npm 12 or later for repository validation.

## Setup

Create a repository from this template. Replace the template name, description, URLs, keywords, and sample content.
Run `npm ci` from the repository root.

## Usage

Follow this README and the [user guide](docs/README.md). Read [release notes](RELEASE_NOTES.md) for release history.

## Development

Read [AGENTS.md](AGENTS.md) and [the specifications index](specs/README.md) before you change files.
Keep documents and records in the repository that owns them.
Read [release notes](RELEASE_NOTES.md) for release history.

## Testing

Run `npm test` before handoff. It runs the repository checks through `eliware-test`.

## Troubleshooting

Install the required Node.js and npm versions. Run `npm ci` after dependency changes.
Review the file and rule in any validation error.

## Security

Keep credentials, secrets, private data, and runtime state out of Git.
Use only approved secret stores for secret values.

## Configuration

Set `MCP_TOKEN` before HTTP startup. `MCP_HTTP_PORT` defaults to `1234`. `LOG_LEVEL` defaults to `info`.
Store the token in an untracked `.env` file or an approved secret store.

## Operations

Run `node bin/mcp-server-template.mjs` for HTTP. Run `node bin/mcp-server-template.mjs --stdio` for stdio.
The HTTP port defaults to `1234`. Build the image with `docker build -t mcp-server-template .`.
Deploy a released image by version tag and recorded SHA-256 digest. Publication does not deploy the server.

## Tools

The server discovers tool adapters from `tools/`. Keep tool logic in `src/tools/`.
The starter provides an `echo` tool. It returns the input text as JSON.

## Resources

The starter registers no resources.

## Prompts

The starter registers no prompts.

## Transport

HTTP is the default transport. Use `MCP_HTTP_PORT` to set its port.
Pass `--stdio` to start stdio. Stdio mode does not open an HTTP listener.

## Authentication

HTTP requires the bearer token in `MCP_TOKEN`. Keep the token secret.
Limit HTTP access to approved clients. Use HTTPS for remote access.

## Schemas

Define each tool input with a Zod schema. Test its input and response shape.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## Links

- [Home Page](https://eliware.org)
- [GitHub Org](https://github.com/eliware)
- [GitHub Repo](https://github.com/eliware/mcp-server-template)
- [Bug Reports](https://github.com/eliware/mcp-server-template/issues)
- [Discord](https://discord.gg/M6aTR9eTwN)

## License

[MIT © Eliware](LICENSE)

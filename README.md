# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

Documentation: [docs](docs/README.md) · [specifications](specs/README.md) · [examples](examples/README.md)

## @eliware/mcp-server-template [![npm version](https://img.shields.io/npm/v/@eliware/mcp-server-template.svg)](https://www.npmjs.com/package/@eliware/mcp-server-template)[![license](https://img.shields.io/github/license/eliware/mcp-server-template.svg)](LICENSE)[![build status](https://github.com/eliware/mcp-server-template/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/mcp-server-template/actions)

Template for building a production-ready Model Context Protocol server with
[`@eliware/mcp-server`](https://www.npmjs.com/package/@eliware/mcp-server).

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Environment](#environment)
- [Adding Tools](#adding-tools)
- [Testing and Linting](#testing-and-linting)
- [Deployment](#deployment)
  - [Docker](#docker)
  - [systemd](#systemd)
- [Errors / Troubleshooting](#errors--troubleshooting)
- [Security](#security)
- [Support](#support)
- [License](#license)
- [Links](#links)

## Features

- Automatic tool discovery from `tools/`
- Streamable HTTP and stdio modes
- Static bearer-token authentication
- Context injection into tools
- Docker, Compose, and systemd deployment files
- Native ESM and TypeScript-compatible MCP server package

## Requirements

- Node.js 26 or newer
- An MCP client for live HTTP/stdio operation

## Getting Started

```bash
npm install
cp .env.example .env
# Set MCP_TOKEN in .env.
npm start
```

The HTTP server listens on `MCP_HTTP_PORT` (default `1234`). Run stdio mode with:

```bash
node mcp-server-template.mjs --stdio
```

## Environment

| Variable | Default | Description |
| --- | --- | --- |
| `MCP_TOKEN` | required | Static bearer token. |
| `MCP_HTTP_PORT` | `1234` | HTTP listener port. |
| `NODE_ENV` | unset | Set to `production` for deployment. |

## Adding Tools

Create a `.mjs` file in `tools/`. The default export receives the MCP server,
tool name, logger, and any configured context:

```js
import { buildResponse, z } from '@eliware/mcp-server';

export default async function registerTool({ mcpServer, toolName, log }) {
  mcpServer.tool(
    toolName,
    'Describe the tool here.',
    { text: z.string() },
    async (args) => {
      log.debug(`${toolName} request`, { args });
      return buildResponse({ text: args.text });
    },
  );
}
```

The included `tools/echo.mjs` demonstrates the complete pattern.

## Testing and Linting

```bash
npm test
npm run test:gaps
npm run lint
npm run pack
npm audit
```

## Deployment

### Docker

```bash
docker build -t mcp-server-template:local .
docker run --rm \
  -e MCP_TOKEN=your-secret-token \
  -p 1234:1234 \
  mcp-server-template:local
```

Compose is also provided:

```bash
cp .env.example .env
# Set MCP_TOKEN in .env.
docker compose up --build -d
docker compose ps
```

## systemd

The service file runs as root by default to match the deployment standard.
Adjust `User=` and `Group=` for project-specific deployments. The service expects
the application from its checked-out project root:

```bash
sudo cp mcp-server-template.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mcp-server-template
sudo systemctl status mcp-server-template
```

## Errors / Troubleshooting

This is a starter server, not a production deployment. Keep `MCP_TOKEN` in `.env` or secret storage, verify the `/mcp` endpoint and configured port, and use stdio only with controlled child processes. Review tools and context injection before deployment.

## Security

Never commit `.env`, bearer tokens, private keys, or credential-bearing URLs. Use HTTPS and secret mounts for remote deployments, and grant tools only the minimum required context and permissions.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## License

MIT © Eli Sterling, eliware.org

## Links

- [Home Page](https://eliware.org)
- [GitHub Repo](https://github.com/eliware/mcp-server-template)
- [GitHub Org](https://github.com/eliware)
- [GitHub Personal](https://github.com/eli-sterling)
- [Discord](https://discord.gg/M6aTR9eTwN)

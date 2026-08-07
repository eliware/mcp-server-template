FROM node:26-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production \
    MCP_HTTP_PORT=1234

COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force

COPY --chown=node:node . .

USER node
EXPOSE 1234
CMD ["node", "mcp-server-template.mjs"]

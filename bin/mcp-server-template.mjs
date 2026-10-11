#!/usr/bin/env node
import { startServer } from "../src/runtime.mjs";
import "dotenv/config";
import { createLogger, registerHandlers, registerSignals } from "@eliware/common";
import { mcpServer } from "@eliware/mcp-server";

try {
  await startServer({ createLogger, registerHandlers, registerSignals, createServer: mcpServer });
} catch {
  process.exitCode = 1;
}

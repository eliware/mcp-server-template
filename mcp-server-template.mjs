#!/usr/bin/env node
import { startServer } from "./src/runtime.mjs";

try {
  await startServer();
} catch {
  process.exitCode = 1;
}

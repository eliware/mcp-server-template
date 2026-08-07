#!/usr/bin/env node

import 'dotenv/config';
import { startServer } from './src/runtime.mjs';

try {
    await startServer();
} catch {
    process.exitCode = 1;
}

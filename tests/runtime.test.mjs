import { EventEmitter } from "node:events";
import { jest, expect, test } from "@jest/globals";
import { registerSignals } from "@eliware/common";
import { startServer } from "../src/runtime.mjs";

const logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

function dependencies(overrides = {}) {
  return {
    createLogger: jest.fn(() => logger),
    registerHandlers: jest.fn(() => ({ removeHandlers: jest.fn() })),
    registerSignals: jest.fn(() => ({ removeHandlers: jest.fn() })),
    createServer: jest.fn().mockResolvedValue({}),
    logger,
    ...overrides,
  };
}

test("starts with process defaults and selected HTTP configuration", async () => {
  const previousToken = process.env.MCP_TOKEN;
  const previousPort = process.env.PORT;
  const previousLevel = process.env.LOG_LEVEL;
  const setup = dependencies();
  delete setup.logger;
  process.env.MCP_TOKEN = "secret";
  process.env.LOG_LEVEL = "debug";
  delete process.env.PORT;
  try {
    await startServer(setup);
    expect(setup.createLogger).toHaveBeenNthCalledWith(1, { level: "debug" });
    delete process.env.LOG_LEVEL;
    await startServer(setup);
    expect(setup.createLogger).toHaveBeenNthCalledWith(2, { level: "info" });
    expect(setup.createServer).toHaveBeenCalledWith(
      expect.objectContaining({ port: 1234, stdio: false }),
    );
    await startServer({
      ...setup,
      env: { LOG_LEVEL: "debug", MCP_TOKEN: "secret", PORT: "4321" },
      argv: ["node", "app.mjs"],
    });
    expect(setup.createServer).toHaveBeenLastCalledWith(
      expect.objectContaining({
        port: 4321,
        auth: { mode: "static", token: "secret" },
        stdio: false,
      }),
    );
  } finally {
    restoreEnvironment("MCP_TOKEN", previousToken);
    restoreEnvironment("PORT", previousPort);
    restoreEnvironment("LOG_LEVEL", previousLevel);
  }
});

test("waits for pending server creation and closes both handles before default signal exit", async () => {
  let resolveStartup;
  let resolveExit;
  let resolveClosesStarted;
  let closedHandles = 0;
  let closedHandlesAtExit = 0;
  const closeResolvers = [];
  let closeCount = 0;
  const closesStarted = new Promise((resolve) => {
    resolveClosesStarted = resolve;
  });
  const exitPromise = new Promise((resolve) => {
    resolveExit = resolve;
  });
  const processObj = new EventEmitter();
  processObj.exit = jest.fn((code) => {
    closedHandlesAtExit = closedHandles;
    resolveExit(code);
  });
  const close = jest.fn(
    () =>
      new Promise((resolve) => {
        closeResolvers.push(() => {
          closedHandles += 1;
          resolve();
        });
        closeCount += 1;
        if (closeCount === 2) resolveClosesStarted();
      }),
  );
  const setup = dependencies({
    createServer: jest.fn(
      () =>
        new Promise((resolve) => {
          resolveStartup = resolve;
        }),
    ),
    registerSignals: jest.fn((options) => registerSignals({ ...options, processObj })),
  });
  const startup = startServer({ ...setup, env: { MCP_TOKEN: "secret" } });
  processObj.emit("SIGTERM");
  await Promise.resolve();
  expect(processObj.exit).not.toHaveBeenCalled();
  resolveStartup({ app: { close }, transport: { close } });
  await closesStarted;
  expect(close).toHaveBeenCalledTimes(2);
  expect(closedHandles).toBe(0);
  expect(processObj.exit).not.toHaveBeenCalled();
  for (const resolveClose of closeResolvers) resolveClose();
  await expect(startup).resolves.toBeDefined();
  await expect(exitPromise).resolves.toBe(0);
  expect(close).toHaveBeenCalledTimes(2);
  expect(closedHandlesAtExit).toBe(2);
  expect(processObj.exit).toHaveBeenCalledWith(0);
});

test("waits for failed server creation and cleanup before default signal exit", async () => {
  let rejectStartup;
  let resolveExit;
  let cleanupFinished = false;
  let cleanupFinishedAtExit = false;
  const exitPromise = new Promise((resolve) => {
    resolveExit = resolve;
  });
  const processObj = new EventEmitter();
  processObj.exit = jest.fn((code) => {
    cleanupFinishedAtExit = cleanupFinished;
    resolveExit(code);
  });
  const startupError = new Error("startup failed after shutdown");
  const errors = {
    removeHandlers: jest.fn(() => {
      cleanupFinished = true;
    }),
  };
  const setup = dependencies({
    createServer: jest.fn(
      () =>
        new Promise((resolve, reject) => {
          rejectStartup = reject;
        }),
    ),
    registerHandlers: jest.fn(() => errors),
    registerSignals: jest.fn((options) => registerSignals({ ...options, processObj })),
  });
  const startup = startServer({ ...setup, env: { MCP_TOKEN: "secret" } });
  processObj.emit("SIGTERM");
  await Promise.resolve();
  expect(processObj.exit).not.toHaveBeenCalled();
  rejectStartup(startupError);
  await expect(startup).rejects.toBe(startupError);
  await expect(exitPromise).resolves.toBe(0);
  expect(cleanupFinishedAtExit).toBe(true);
  expect(processObj.exit).toHaveBeenCalledWith(0);
});

test("keeps an early shutdown request pending and idempotent", async () => {
  let resolveStartup;
  let shutdownHook;
  const close = jest.fn();
  const errors = { removeHandlers: jest.fn() };
  const signals = { removeHandlers: jest.fn() };
  const setup = dependencies({
    createServer: jest.fn(
      () =>
        new Promise((resolve) => {
          resolveStartup = resolve;
        }),
    ),
    registerHandlers: jest.fn(() => errors),
    registerSignals: jest.fn((options) => {
      shutdownHook = options.shutdownHook;
      void shutdownHook("SIGTERM");
      return signals;
    }),
  });
  const startup = startServer({ ...setup, env: { MCP_TOKEN: "secret" } });
  resolveStartup({ app: { close }, transport: { close } });
  await expect(startup).resolves.toBeDefined();
  await shutdownHook("SIGTERM");
  expect(close).toHaveBeenCalledTimes(2);
  expect(signals.removeHandlers).toHaveBeenCalledTimes(1);
  expect(errors.removeHandlers).toHaveBeenCalledTimes(1);
});

test("starts stdio without an HTTP token and runs every shutdown hook", async () => {
  const close = jest.fn();
  const errors = { removeHandlers: jest.fn() };
  const signals = { removeHandlers: jest.fn() };
  const setup = dependencies({
    createServer: jest.fn().mockResolvedValue({
      app: { close },
      transport: { close },
    }),
    registerHandlers: jest.fn(() => errors),
    registerSignals: jest.fn(() => signals),
  });
  const result = await startServer({
    ...setup,
    env: {},
    argv: ["node", "app.mjs", "--stdio"],
  });
  await setup.registerSignals.mock.calls[0][0].shutdownHook("SIGTERM");
  expect(setup.createServer).toHaveBeenCalledWith(
    expect.objectContaining({ stdio: true, auth: { mode: "none" } }),
  );
  expect(close).toHaveBeenCalledTimes(2);
  expect(errors.removeHandlers).toHaveBeenCalled();
  expect(result.signals).toBe(signals);
});

test("cleans up when startup fails", async () => {
  const startupError = new Error("startup failed");
  const errors = { removeHandlers: jest.fn() };
  const signals = { removeHandlers: jest.fn() };
  const setup = dependencies({
    createServer: jest.fn().mockRejectedValue(startupError),
    registerHandlers: jest.fn(() => errors),
    registerSignals: jest.fn(() => signals),
  });
  await expect(startServer({ ...setup, env: { MCP_TOKEN: "secret" } })).rejects.toBe(startupError);
  expect(signals.removeHandlers).toHaveBeenCalled();
  expect(errors.removeHandlers).toHaveBeenCalled();
  expect(logger.error).toHaveBeenCalledWith("Failed to start MCP server.", {
    error: startupError,
  });
});

test("rejects a missing token and removes process handlers", async () => {
  const errors = { removeHandlers: jest.fn() };
  const setup = dependencies({ registerHandlers: jest.fn(() => errors) });
  await expect(startServer({ ...setup, env: {} })).rejects.toMatchObject({
    code: "MISSING_MCP_TOKEN",
  });
  expect(errors.removeHandlers).toHaveBeenCalled();
});

function restoreEnvironment(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

import { jest, expect, test } from "@jest/globals";
import { closeServer, startServer } from "../src/runtime.mjs";

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

test("closes callback and promise based servers", async () => {
  const callbackServer = { close: jest.fn((callback) => callback()) };
  const promiseServer = { close: jest.fn(() => Promise.resolve()) };
  await expect(closeServer(callbackServer)).resolves.toBeUndefined();
  await expect(closeServer(promiseServer)).resolves.toBeUndefined();
  await expect(closeServer({})).resolves.toBeUndefined();
});

test("rejects when a server close callback fails", async () => {
  await expect(
    closeServer({ close: (callback) => callback(new Error("close failed")) }),
  ).rejects.toThrow("close failed");
});

test("uses process defaults and creates the default logger", async () => {
  const previousToken = process.env.MCP_TOKEN;
  const previousPort = process.env.MCP_HTTP_PORT;
  const previousLevel = process.env.LOG_LEVEL;
  const setup = dependencies();
  delete setup.logger;
  process.env.MCP_TOKEN = "secret";
  process.env.LOG_LEVEL = "debug";
  delete process.env.MCP_HTTP_PORT;
  try {
    await startServer(setup);
    expect(setup.createLogger).toHaveBeenNthCalledWith(1, { level: "debug" });
    delete process.env.LOG_LEVEL;
    await startServer(setup);
    expect(setup.createLogger).toHaveBeenNthCalledWith(2, { level: "info" });
    expect(setup.createServer).toHaveBeenCalledWith(
      expect.objectContaining({ httpPort: 1234, stdio: false }),
    );
  } finally {
    restoreEnvironment("MCP_TOKEN", previousToken);
    restoreEnvironment("MCP_HTTP_PORT", previousPort);
    restoreEnvironment("LOG_LEVEL", previousLevel);
  }
});

test("allows shutdown before startup finishes", async () => {
  let resolveStartup;
  const setup = dependencies({
    createServer: jest.fn(
      () =>
        new Promise((resolve) => {
          resolveStartup = resolve;
        }),
    ),
    registerSignals: jest.fn(({ shutdownHook }) => {
      void shutdownHook("SIGTERM");
      return { removeHandlers: jest.fn() };
    }),
  });
  const startup = startServer({ ...setup, env: { MCP_TOKEN: "secret" } });
  resolveStartup({});
  await expect(startup).resolves.toBeDefined();
});

test("starts HTTP mode with the selected port and token", async () => {
  const setup = dependencies({
    createServer: jest.fn().mockResolvedValue({
      httpInstance: { close: jest.fn((callback) => callback()) },
      mcpServer: { close: jest.fn() },
    }),
  });
  const result = await startServer({
    ...setup,
    env: { LOG_LEVEL: "debug", MCP_TOKEN: "secret", MCP_HTTP_PORT: "4321" },
    argv: ["node", "app.mjs"],
  });
  expect(setup.createServer).toHaveBeenCalledWith(
    expect.objectContaining({
      httpPort: 4321,
      auth: { mode: "static", token: "secret" },
      stdio: false,
    }),
  );
  expect(result.runtime).toBeDefined();
});

test("starts stdio mode and runs every shutdown hook", async () => {
  const close = jest.fn();
  const errors = { removeHandlers: jest.fn() };
  const signals = { removeHandlers: jest.fn() };
  const setup = dependencies({
    createServer: jest.fn().mockResolvedValue({
      mcpServer: { close },
      transport: { close },
    }),
    registerHandlers: jest.fn(() => errors),
    registerSignals: jest.fn(() => signals),
  });
  const result = await startServer({
    ...setup,
    env: { MCP_TOKEN: "secret" },
    argv: ["node", "app.mjs", "--stdio"],
  });
  await setup.registerSignals.mock.calls[0][0].shutdownHook("SIGTERM");
  expect(setup.createServer).toHaveBeenCalledWith(expect.objectContaining({ stdio: true }));
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

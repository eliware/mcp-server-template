import { jest, expect, test } from "@jest/globals";
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

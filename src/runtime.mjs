import { closeServer } from "./server-lifecycle.mjs";

export async function startServer({
  env = process.env,
  argv = process.argv,
  createLogger,
  registerHandlers,
  registerSignals,
  createServer,
  logger = createLogger({ level: env.LOG_LEVEL || "info" }),
}) {
  const errors = registerHandlers({ log: logger });
  const stdio = argv.includes("--stdio");
  const token = env.MCP_TOKEN;
  if (!stdio && !token) {
    logger.error("MCP_TOKEN environment variable is required.");
    errors.removeHandlers();
    const error = new Error("MCP_TOKEN environment variable is required.");
    error.code = "MISSING_MCP_TOKEN";
    throw error;
  }

  let runtime;
  const signals = registerSignals({
    log: logger,
    shutdownHook: async () => {
      if (!runtime) return;
      await Promise.all([closeServer(runtime.app), closeServer(runtime.transport)]);
      errors.removeHandlers();
      logger.info("MCP server stopped.");
    },
  });

  try {
    runtime = await createServer({
      log: logger,
      stdio,
      port: env.PORT ? Number(env.PORT) : 1234,
      auth: stdio ? { mode: "none" } : { mode: "static", token },
      toolsDir: new URL("../tools/", import.meta.url).pathname,
    });
    logger.info("MCP server started.", {
      port: env.PORT || 1234,
      stdio,
    });
    return { runtime, signals, errors };
  } catch (error) {
    logger.error("Failed to start MCP server.", { error });
    signals.removeHandlers();
    errors.removeHandlers();
    throw error;
  }
}

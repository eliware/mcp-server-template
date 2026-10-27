import { closeServer } from "./server-lifecycle.mjs";
import { parsePort } from "./configuration/port.mjs";

export async function startServer({
  env = process.env,
  argv = process.argv,
  createLogger,
  registerHandlers,
  registerSignals,
  createServer,
  logger = createLogger({ level: env.LOG_LEVEL || "info" }),
}) {
  const stdio = argv.includes("--stdio");
  const port = stdio ? 1234 : parsePort(env.PORT);
  const errors = registerHandlers({ log: logger });
  const token = env.MCP_TOKEN;
  if (!stdio && !token) {
    logger.error("MCP_TOKEN environment variable is required.");
    errors.removeHandlers();
    const error = new Error("MCP_TOKEN environment variable is required.");
    error.code = "MISSING_MCP_TOKEN";
    throw error;
  }

  let runtime;
  let signals;
  let stopping = false;
  let closePromise;
  let shutdownPromise;
  let finishStartup;
  const startupPromise = new Promise((resolve) => {
    finishStartup = resolve;
  });
  const closeRuntime = () => {
    if (!runtime || closePromise) return closePromise;
    closePromise = Promise.all([closeServer(runtime.app), closeServer(runtime.transport)]).then(
      () => logger.info("MCP server stopped."),
    );
    return closePromise;
  };
  signals = registerSignals({
    log: logger,
    shutdownHook: async () => {
      if (stopping) return shutdownPromise;
      stopping = true;
      signals?.removeHandlers();
      errors.removeHandlers();
      shutdownPromise = (async () => {
        await startupPromise;
        await closeRuntime();
      })();
      await shutdownPromise;
    },
  });
  if (stopping) signals.removeHandlers();

  try {
    runtime = await createServer({
      log: logger,
      stdio,
      port,
      auth: stdio ? { mode: "none" } : { mode: "static", token },
      toolsDir: new URL("../tools/", import.meta.url).pathname,
    });
    finishStartup();
    if (stopping) {
      await closeRuntime();
      return { runtime, signals, errors };
    }
    logger.info("MCP server started.", {
      port,
      stdio,
    });
    return { runtime, signals, errors };
  } catch (error) {
    logger.error("Failed to start MCP server.", { error });
    signals.removeHandlers();
    errors.removeHandlers();
    finishStartup();
    throw error;
  }
}

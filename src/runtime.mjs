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
  let shutdownPromise;
  const closeRuntime = () => {
    if (!runtime || shutdownPromise) return shutdownPromise;
    shutdownPromise = Promise.all([closeServer(runtime.app), closeServer(runtime.transport)]).then(
      () => logger.info("MCP server stopped."),
    );
    return shutdownPromise;
  };
  signals = registerSignals({
    log: logger,
    shutdownHook: async () => {
      if (stopping) return shutdownPromise;
      stopping = true;
      signals?.removeHandlers();
      errors.removeHandlers();
      await closeRuntime();
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
    throw error;
  }
}

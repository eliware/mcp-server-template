import { createLogger, registerHandlers, registerSignals } from '@eliware/common';
import { mcpServer } from '@eliware/mcp-server';

export const closeServer = (server) => new Promise((resolve, reject) => {
    if (!server?.close) return resolve();
    if (server.close.length === 0) {
        Promise.resolve(server.close()).then(resolve, reject);
        return;
    }
    server.close((error) => error ? reject(error) : resolve());
});

export async function startServer({
    env = process.env,
    argv = process.argv,
    logger = createLogger({ level: env.LOG_LEVEL || 'info' }),
    createServer = mcpServer,
} = {}) {
    const errors = registerHandlers({ log: logger });
    const token = env.MCP_TOKEN;
    if (!token) {
        logger.error('MCP_TOKEN environment variable is required.');
        errors.removeHandlers();
        const error = new Error('MCP_TOKEN environment variable is required.');
        error.code = 'MISSING_MCP_TOKEN';
        throw error;
    }

    let runtime;
    const signals = registerSignals({
        log: logger,
        shutdownHook: async () => {
            if (!runtime) return;
            await Promise.all([
                closeServer(runtime.httpInstance),
                closeServer(runtime.httpsInstance),
                closeServer(runtime.transport),
                closeServer(runtime.mcpServer),
            ]);
            errors.removeHandlers();
            logger.info('MCP server shut down.');
        },
    });

    try {
        runtime = await createServer({
            log: logger,
            stdio: argv.includes('--stdio'),
            httpPort: env.MCP_HTTP_PORT ? Number(env.MCP_HTTP_PORT) : 1234,
            auth: { mode: 'static', token },
            toolsDir: new URL('../tools/', import.meta.url).pathname,
        });
        logger.info('MCP server ready.', {
            httpPort: env.MCP_HTTP_PORT || 1234,
            stdio: argv.includes('--stdio'),
        });
        return { runtime, signals, errors };
    } catch (error) {
        logger.error('Failed to start MCP server.', { error });
        signals.removeHandlers();
        errors.removeHandlers();
        throw error;
    }
}

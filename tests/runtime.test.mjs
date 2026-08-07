import { jest } from '@jest/globals';
import { closeServer } from '../src/runtime.mjs';

describe('runtime', () => {
    const logger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    };

    beforeEach(() => jest.clearAllMocks());

    test('closes callback and promise based servers', async () => {
        const callbackServer = { close: jest.fn(callback => callback()) };
        const promiseServer = { close: jest.fn(() => Promise.resolve()) };
        const emptyServer = {};
        await expect(closeServer(callbackServer)).resolves.toBeUndefined();
        await expect(closeServer(promiseServer)).resolves.toBeUndefined();
        await expect(closeServer(emptyServer)).resolves.toBeUndefined();
    });

    test('rejects when a server close callback fails', async () => {
        const error = new Error('close failed');
        await expect(closeServer({ close: callback => callback(error) })).rejects.toThrow('close failed');
    });

    test('uses process defaults and default logger configuration', async () => {
        const createServer = jest.fn().mockResolvedValue({});
        const registerHandlers = jest.fn().mockReturnValue({ removeHandlers: jest.fn() });
        const registerSignals = jest.fn().mockReturnValue({ removeHandlers: jest.fn() });
        const createLogger = jest.fn().mockReturnValue(logger);
        jest.unstable_mockModule('@eliware/common', () => ({ createLogger, registerHandlers, registerSignals }));
        jest.unstable_mockModule('@eliware/mcp-server', () => ({ mcpServer: createServer }));
        const previousToken = process.env.MCP_TOKEN;
        const previousPort = process.env.MCP_HTTP_PORT;
        const previousLogLevel = process.env.LOG_LEVEL;
        process.env.MCP_TOKEN = 'secret';
        process.env.LOG_LEVEL = 'debug';
        delete process.env.MCP_HTTP_PORT;
        jest.resetModules();
        const { startServer: mockedStart } = await import(`../src/runtime.mjs?defaults=${Date.now()}`);
        try {
            await mockedStart();
            expect(createLogger).toHaveBeenCalledWith({ level: 'debug' });
            delete process.env.LOG_LEVEL;
            await mockedStart();
            expect(createLogger).toHaveBeenCalledWith({ level: 'info' });
            expect(createServer).toHaveBeenCalledWith(expect.objectContaining({ httpPort: 1234, stdio: false }));
        } finally {
            if (previousToken === undefined) delete process.env.MCP_TOKEN;
            else process.env.MCP_TOKEN = previousToken;
            if (previousPort === undefined) delete process.env.MCP_HTTP_PORT;
            else process.env.MCP_HTTP_PORT = previousPort;
            if (previousLogLevel === undefined) delete process.env.LOG_LEVEL;
            else process.env.LOG_LEVEL = previousLogLevel;
        }
    });

    test('allows shutdown hook before startup finishes', async () => {
        let resolveStartup;
        const createServer = jest.fn().mockReturnValue(new Promise(resolve => { resolveStartup = resolve; }));
        const registerHandlers = jest.fn().mockReturnValue({ removeHandlers: jest.fn() });
        const registerSignals = jest.fn().mockImplementation(({ shutdownHook }) => {
            void shutdownHook('SIGTERM');
            return { removeHandlers: jest.fn() };
        });
        jest.unstable_mockModule('@eliware/common', () => ({ createLogger: () => logger, registerHandlers, registerSignals }));
        jest.unstable_mockModule('@eliware/mcp-server', () => ({ mcpServer: createServer }));
        jest.resetModules();
        const { startServer: mockedStart } = await import(`../src/runtime.mjs?early-shutdown=${Date.now()}`);
        const startup = mockedStart({ env: { MCP_TOKEN: 'secret' }, logger, createServer });
        resolveStartup({});
        await expect(startup).resolves.toBeDefined();
    });

    test('starts HTTP mode with current configuration', async () => {
        const createServer = jest.fn().mockResolvedValue({
            httpInstance: { close: jest.fn(callback => callback()) },
            httpsInstance: undefined,
            transport: undefined,
            mcpServer: { close: jest.fn() },
        });
        const registerHandlers = jest.fn();
        const registerSignals = jest.fn();
        jest.unstable_mockModule('@eliware/common', () => ({
            createLogger: () => logger,
            registerHandlers,
            registerSignals,
        }));
        jest.unstable_mockModule('@eliware/mcp-server', () => ({ mcpServer: createServer }));
        jest.resetModules();
        const { startServer: mockedStart } = await import(`../src/runtime.mjs?success=${Date.now()}`);
        registerHandlers.mockReturnValue({ removeHandlers: jest.fn() });
        registerSignals.mockReturnValue({ removeHandlers: jest.fn() });
        const result = await mockedStart({
            env: { LOG_LEVEL: 'debug', MCP_TOKEN: 'secret', MCP_HTTP_PORT: '4321' },
            argv: ['node', 'app.mjs'],
            logger,
            createServer,
        });
        expect(createServer).toHaveBeenCalledWith(expect.objectContaining({
            httpPort: 4321,
            auth: { mode: 'static', token: 'secret' },
            stdio: false,
        }));
        expect(result.runtime).toBeDefined();
    });

    test('supports stdio mode and runs shutdown hooks', async () => {
        const close = jest.fn();
        const createServer = jest.fn().mockResolvedValue({ mcpServer: { close }, transport: { close } });
        const errors = { removeHandlers: jest.fn() };
        const signals = { removeHandlers: jest.fn() };
        const registerHandlers = jest.fn().mockReturnValue(errors);
        const registerSignals = jest.fn().mockReturnValue(signals);
        jest.unstable_mockModule('@eliware/common', () => ({ createLogger: () => logger, registerHandlers, registerSignals }));
        jest.unstable_mockModule('@eliware/mcp-server', () => ({ mcpServer: createServer }));
        jest.resetModules();
        const { startServer: mockedStart } = await import(`../src/runtime.mjs?stdio=${Date.now()}`);
        const result = await mockedStart({
            env: { MCP_TOKEN: 'secret' },
            argv: ['node', 'app.mjs', '--stdio'],
            logger,
            createServer,
        });
        const hook = registerSignals.mock.calls[0][0].shutdownHook;
        await hook('SIGTERM');
        expect(createServer).toHaveBeenCalledWith(expect.objectContaining({ stdio: true }));
        expect(close).toHaveBeenCalledTimes(2);
        expect(errors.removeHandlers).toHaveBeenCalled();
        expect(result.signals).toBe(signals);
    });

    test('cleans up when startup fails', async () => {
        const startupError = new Error('startup failed');
        const errors = { removeHandlers: jest.fn() };
        const signals = { removeHandlers: jest.fn() };
        const registerHandlers = jest.fn().mockReturnValue(errors);
        const registerSignals = jest.fn().mockReturnValue(signals);
        const createServer = jest.fn().mockRejectedValue(startupError);
        jest.unstable_mockModule('@eliware/common', () => ({ createLogger: () => logger, registerHandlers, registerSignals }));
        jest.resetModules();
        const { startServer: mockedStart } = await import(`../src/runtime.mjs?failure=${Date.now()}`);
        await expect(mockedStart({ env: { MCP_TOKEN: 'secret' }, logger, createServer })).rejects.toBe(startupError);
        expect(signals.removeHandlers).toHaveBeenCalled();
        expect(errors.removeHandlers).toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalled();
    });

    test('rejects missing token', async () => {
        const errors = { removeHandlers: jest.fn() };
        const registerHandlers = jest.fn().mockReturnValue(errors);
        jest.unstable_mockModule('@eliware/common', () => ({ createLogger: () => logger, registerHandlers, registerSignals: jest.fn() }));
        jest.resetModules();
        const { startServer: mockedStart } = await import(`../src/runtime.mjs?missing=${Date.now()}`);
        await expect(mockedStart({ env: {}, logger, createServer: jest.fn() })).rejects.toMatchObject({ code: 'MISSING_MCP_TOKEN' });
        expect(errors.removeHandlers).toHaveBeenCalled();
    });
});

import fs from 'fs';
import { path, pathUrl } from '@eliware/path';
import { jest } from '@jest/globals';

describe('custom tool handlers', () => {
    const toolsDir = path(import.meta, '..', 'tools');
    const files = fs.readdirSync(toolsDir).filter(file => file.endsWith('.mjs'));

    for (const file of files) {
        test(`${file} exports a default function`, async () => {
            const mod = await import(pathUrl(toolsDir, file));
            expect(typeof mod.default).toBe('function');
        });

        test(`${file} registers and handles a tool call`, async () => {
            const toolMock = jest.fn();
            const logMock = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            };
            const mod = await import(pathUrl(toolsDir, file));
            await mod.default({
                mcpServer: { tool: toolMock },
                toolName: 'test-tool',
                log: logMock,
                appName: 'template-test',
            });

            expect(toolMock).toHaveBeenCalledTimes(1);
            const [name, description, schema, handler] = toolMock.mock.calls[0];
            expect(name).toBe('test-tool');
            expect(description).toEqual(expect.any(String));
            expect(schema).toBeDefined();
            expect(handler).toEqual(expect.any(Function));

            const response = await handler({ echoText: 'hello' }, {});
            expect(response.content[0].type).toBe('text');
            expect(JSON.parse(response.content[0].text)).toEqual({
                message: 'echo-reply',
                data: { text: 'hello' },
            });
            expect(logMock.debug).toHaveBeenCalledTimes(2);
        });
    }
});

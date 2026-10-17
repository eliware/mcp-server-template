import { expect, jest, test } from "@jest/globals";

const stringSchema = { type: "string" };
const string = jest.fn(() => stringSchema);
jest.unstable_mockModule("@eliware/mcp-server", () => ({ z: { string } }));

const { default: registerEcho } = await import("../../src/tools/echo.mjs");

test("echo tool registers a schema and returns the requested text", async () => {
  const registerTool = jest.fn();
  const log = { debug: jest.fn() };
  await registerEcho({ mcpServer: { registerTool }, toolName: "echo", log });

  expect(registerTool).toHaveBeenCalledTimes(1);
  const [name, options, handler] = registerTool.mock.calls[0];
  expect(name).toBe("echo");
  expect(options.description).toBe("Echo text to the caller.");
  expect(options.inputSchema.echoText).toBe(stringSchema);
  expect(string).toHaveBeenCalledTimes(1);

  const response = await handler({ echoText: "hello" });
  expect(JSON.parse(response.content[0].text)).toEqual({
    message: "echo-reply",
    data: { text: "hello" },
  });
  expect(log.debug).toHaveBeenCalledTimes(2);
});

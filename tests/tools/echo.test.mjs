import { expect, jest, test } from "@jest/globals";
import registerEcho from "../../src/tools/echo.mjs";

test("echo tool registers a schema and returns the requested text", async () => {
  const tool = jest.fn();
  const log = { debug: jest.fn() };
  await registerEcho({ mcpServer: { tool }, toolName: "echo", log });

  expect(tool).toHaveBeenCalledTimes(1);
  const [name, description, schema, handler] = tool.mock.calls[0];
  expect(name).toBe("echo");
  expect(description).toBe("Echo Tool");
  expect(schema.echoText).toBeDefined();

  const response = await handler({ echoText: "hello" });
  expect(JSON.parse(response.content[0].text)).toEqual({
    message: "echo-reply",
    data: { text: "hello" },
  });
  expect(log.debug).toHaveBeenCalledTimes(2);
});

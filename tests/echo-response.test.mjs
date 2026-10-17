import { expect, test } from "@jest/globals";
import { createEchoResponse } from "../src/echo-response.mjs";

test("creates an echo response from the requested text", () => {
  expect(createEchoResponse({ echoText: "hello" })).toEqual({
    message: "echo-reply",
    data: { text: "hello" },
  });
});

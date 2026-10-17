import { expect, jest, test } from "@jest/globals";
import { closeServer } from "../src/server-lifecycle.mjs";

test("closes callback and promise based servers", async () => {
  const callbackServer = { close: jest.fn((callback) => callback()) };
  const promiseServer = { close: jest.fn(() => Promise.resolve()) };
  await expect(closeServer(callbackServer)).resolves.toBeUndefined();
  await expect(closeServer(promiseServer)).resolves.toBeUndefined();
  await expect(closeServer({})).resolves.toBeUndefined();
});

test("rejects when a server close callback fails", async () => {
  await expect(
    closeServer({ close: (callback) => callback(new Error("close failed")) }),
  ).rejects.toThrow("close failed");
});

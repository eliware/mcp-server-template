import { expect, jest, test } from "@jest/globals";
import { closeServer } from "../src/server-lifecycle.mjs";

test("closes current async server handles", async () => {
  const promiseServer = { close: jest.fn(() => Promise.resolve()) };
  await expect(closeServer(promiseServer)).resolves.toBeUndefined();
  await expect(closeServer(undefined)).resolves.toBeUndefined();
});

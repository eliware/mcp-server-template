import { expect, test } from "@jest/globals";
import { parsePort } from "../../src/configuration/port.mjs";

test.each([undefined, ""])("uses the default port for %s", (value) => {
  expect(parsePort(value)).toBe(1234);
});

test("parses a configured port", () => {
  expect(parsePort("4321")).toBe(4321);
});

test.each(["0", "65536", "1.5", "not-a-port"])("rejects invalid port %s", (value) => {
  expect(() => parsePort(value)).toThrow(RangeError);
});

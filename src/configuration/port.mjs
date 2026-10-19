export function parsePort(value, defaultPort = 1234) {
  if (value === undefined || value === "") return defaultPort;

  const port = Number(value);
  if (Number.isInteger(port) && port > 0 && port <= 65535) return port;

  throw new RangeError("PORT must be an integer from 1 through 65535.");
}

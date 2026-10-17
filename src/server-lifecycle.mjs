export function closeServer(server) {
  return new Promise((resolve, reject) => {
    if (!server?.close) return resolve();
    if (server.close.length === 0) {
      Promise.resolve(server.close()).then(resolve, reject);
      return;
    }
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

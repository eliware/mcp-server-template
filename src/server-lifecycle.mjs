export async function closeServer(server) {
  if (server) await server.close();
}

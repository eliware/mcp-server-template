import { z } from "@eliware/mcp-server";
import { buildResponse } from "@eliware/mcp-server/utilities";
import { createEchoResponse } from "../echo-response.mjs";

export default async function ({ mcpServer, toolName, log }) {
  mcpServer.tool(toolName, "Echo Tool", { echoText: z.string() }, async (_args, _extra) => {
    log.debug(`${toolName} Request`, { _args });
    const response = createEchoResponse(_args);
    log.debug(`${toolName} Response`, { response });
    return buildResponse(response);
  });
}

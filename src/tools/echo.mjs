import { z } from "@eliware/mcp-server";
import { buildResponse } from "@eliware/mcp-server/utilities";

export default async function ({ mcpServer, toolName, log }) {
  mcpServer.registerTool(
    toolName,
    { description: "Echo text to the caller.", inputSchema: { echoText: z.string() } },
    async ({ echoText }) => {
      log.debug(`${toolName} request`, { echoText });
      const response = {
        message: "echo-reply",
        data: {
          text: echoText,
        },
      };
      log.debug(`${toolName} response`, { response });
      return buildResponse(response);
    },
  );
}

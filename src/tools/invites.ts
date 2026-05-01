// src/tools/invites.ts
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createGhostRestClient } from "../ghostApi";

const invitesClient = createGhostRestClient('invites');

// Parameter schemas as ZodRawShape (object literals)
const browseParams = {
  filter: z.string().optional(),
  limit: z.number().optional(),
  page: z.number().optional(),
  order: z.string().optional(),
};
const addParams = {
  role_id: z.string(),
  email: z.string(),
};
const deleteParams = {
  id: z.string(),
};

export function registerInviteTools(server: McpServer) {
  // Browse invites
  server.tool(
    "invites_browse",
    browseParams,
    async (args, _extra) => {
      const invites = await invitesClient.browse(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(invites, null, 2),
          },
        ],
      };
    }
  );

  // Add invite
  server.tool(
    "invites_add",
    addParams,
    async (args, _extra) => {
      const invite = await invitesClient.add(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(invite, null, 2),
          },
        ],
      };
    }
  );

  // Delete invite
  server.tool(
    "invites_delete",
    deleteParams,
    async (args, _extra) => {
      await invitesClient.delete(args);
      return {
        content: [
          {
            type: "text",
            text: `Invite with id ${args.id} deleted.`,
          },
        ],
      };
    }
  );
}
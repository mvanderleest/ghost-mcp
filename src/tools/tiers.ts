// src/tools/tiers.ts
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createGhostRestClient } from "../ghostApi";

const tiersClient = createGhostRestClient('tiers');

// Parameter schemas as ZodRawShape (object literals)
const browseParams = {
  filter: z.string().optional(),
  limit: z.number().optional(),
  page: z.number().optional(),
  order: z.string().optional(),
  include: z.string().optional(),
};
const readParams = {
  id: z.string().optional(),
  slug: z.string().optional(),
  include: z.string().optional(),
};
const addParams = {
  name: z.string(),
  description: z.string().optional(),
  welcome_page_url: z.string().optional(),
  visibility: z.string().optional(),
  monthly_price: z.number().optional(),
  yearly_price: z.number().optional(),
  currency: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  // Add more fields as needed
};
const editParams = {
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  welcome_page_url: z.string().optional(),
  visibility: z.string().optional(),
  monthly_price: z.number().optional(),
  yearly_price: z.number().optional(),
  currency: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  // Add more fields as needed
};
const deleteParams = {
  id: z.string(),
};

export function registerTierTools(server: McpServer) {
  // Browse tiers
  server.tool(
    "tiers_browse",
    browseParams,
    async (args, _extra) => {
      const tiers = await tiersClient.browse(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tiers, null, 2),
          },
        ],
      };
    }
  );

  // Read tier
  server.tool(
    "tiers_read",
    readParams,
    async (args, _extra) => {
      const tier = await tiersClient.read(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tier, null, 2),
          },
        ],
      };
    }
  );

  // Add tier
  server.tool(
    "tiers_add",
    addParams,
    async (args, _extra) => {
      const tier = await tiersClient.add(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tier, null, 2),
          },
        ],
      };
    }
  );

  // Edit tier
  server.tool(
    "tiers_edit",
    editParams,
    async (args, _extra) => {
      const tier = await tiersClient.edit(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tier, null, 2),
          },
        ],
      };
    }
  );

  // Delete tier
  server.tool(
    "tiers_delete",
    deleteParams,
    async (args, _extra) => {
      await tiersClient.delete(args);
      return {
        content: [
          {
            type: "text",
            text: `Tier with id ${args.id} deleted.`,
          },
        ],
      };
    }
  );
}
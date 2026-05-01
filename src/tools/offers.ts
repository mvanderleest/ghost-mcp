// src/tools/offers.ts
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createGhostRestClient } from "../ghostApi";

const offersClient = createGhostRestClient('offers');

// Parameter schemas as ZodRawShape (object literals)
const browseParams = {
  filter: z.string().optional(),
  limit: z.number().optional(),
  page: z.number().optional(),
  order: z.string().optional(),
};
const readParams = {
  id: z.string().optional(),
  code: z.string().optional(),
};
const addParams = {
  name: z.string(),
  code: z.string(),
  cadence: z.string(),
  duration: z.string(),
  amount: z.number(),
  tier_id: z.string(),
  type: z.string(),
  display_title: z.string().optional(),
  display_description: z.string().optional(),
  duration_in_months: z.number().optional(),
  currency: z.string().optional(),
  // Add more fields as needed
};
const editParams = {
  id: z.string(),
  name: z.string().optional(),
  code: z.string().optional(),
  display_title: z.string().optional(),
  display_description: z.string().optional(),
  // Only a subset of fields are editable per Ghost API docs
};
const deleteParams = {
  id: z.string(),
};

export function registerOfferTools(server: McpServer) {
  // Browse offers
  server.tool(
    "offers_browse",
    browseParams,
    async (args, _extra) => {
      const offers = await offersClient.browse(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(offers, null, 2),
          },
        ],
      };
    }
  );

  // Read offer
  server.tool(
    "offers_read",
    readParams,
    async (args, _extra) => {
      const offer = await offersClient.read(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(offer, null, 2),
          },
        ],
      };
    }
  );

  // Add offer
  server.tool(
    "offers_add",
    addParams,
    async (args, _extra) => {
      const offer = await offersClient.add(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(offer, null, 2),
          },
        ],
      };
    }
  );

  // Edit offer
  server.tool(
    "offers_edit",
    editParams,
    async (args, _extra) => {
      const offer = await offersClient.edit(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(offer, null, 2),
          },
        ],
      };
    }
  );

  // Delete offer
  server.tool(
    "offers_delete",
    deleteParams,
    async (args, _extra) => {
      await offersClient.delete(args);
      return {
        content: [
          {
            type: "text",
            text: `Offer with id ${args.id} deleted.`,
          },
        ],
      };
    }
  );
}
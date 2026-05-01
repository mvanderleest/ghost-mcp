// src/tools/settings.ts
//
// Ghost Admin API — Settings
// Endpoint: GET /ghost/api/admin/settings/
//           PUT /ghost/api/admin/settings/
//
// Settings is a singleton resource (not a collection), so there is no browse/read
// distinction — one tool reads all settings, one tool edits them.

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import { GHOST_API_URL } from "../config";
import { generateGhostToken } from "../ghostApi";

const baseUrl = () => `${GHOST_API_URL}/ghost/api/admin/settings`;

function authHeaders() {
  return { Authorization: `Ghost ${generateGhostToken()}` };
}

// settings_read takes no required params but accepts an optional `group` filter
const readParams = {
  group: z.string().optional(),
};

export function registerSettingsTools(server: McpServer) {
  // Read all settings (optionally filtered by group)
  server.tool(
    "settings_read",
    readParams,
    async (args, _extra) => {
      const params: Record<string, string> = {};
      if (args.group) params.group = args.group;
      const res = await axios.get<{ settings: unknown }>(
        `${baseUrl()}/`,
        { headers: authHeaders(), params }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(res.data.settings, null, 2),
          },
        ],
      };
    }
  );
}

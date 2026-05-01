// src/tools/images.ts
//
// Ghost Admin API — Images
// Endpoint: POST /ghost/api/admin/images/upload/
//
// Ghost only exposes upload for images — there is no browse, read, edit, or
// delete endpoint in the Admin API for image assets.
//
// The SDK's images.upload() does not work with Ghost v6 API keys due to a
// version-prefix mismatch in the SDK. This implementation uses a direct REST
// call (multipart/form-data) to ensure compatibility.
//
// Supported purposes (Ghost docs): "image" | "profile_image" | "icon"

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { GHOST_API_URL } from "../config";
import { generateGhostToken } from "../ghostApi";

const uploadParams = {
  file: z.string().describe(
    "Absolute path to the image file on the local filesystem (e.g. /tmp/photo.jpg). " +
    "Supported formats: JPEG, PNG, GIF, SVG, WEBP."
  ),
  purpose: z
    .enum(["image", "profile_image", "icon"])
    .optional()
    .describe(
      "Upload purpose. Defaults to 'image'. Use 'profile_image' for user avatars, " +
      "'icon' for the site favicon."
    ),
  ref: z.string().optional().describe(
    "Optional reference string returned in the response (e.g. the original filename)."
  ),
};

export function registerImageTools(server: McpServer) {
  // Upload an image
  server.tool(
    "images_upload",
    uploadParams,
    async (args, _extra) => {
      const form = new FormData();
      form.append("file", fs.createReadStream(args.file), {
        filename: args.file.split("/").pop() || "upload",
      });
      form.append("purpose", args.purpose ?? "image");
      if (args.ref) form.append("ref", args.ref);

      const res = await axios.post<{ images: unknown[] }>(
        `${GHOST_API_URL}/ghost/api/admin/images/upload/`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Ghost ${generateGhostToken()}`,
          },
        }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(res.data.images, null, 2),
          },
        ],
      };
    }
  );
}

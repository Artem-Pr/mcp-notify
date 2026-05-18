import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import notifier from "node-notifier";

function notify(
  title: string,
  message: string,
  sound?: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    notifier.notify(
      { title, message, sound: sound || "Ping" },
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });
}

const server = new McpServer({
  name: "mcp-notify",
  version: "1.3.0",
});

server.tool(
  "notify",
  "Send a native OS notification",
  {
    title: z.string().default("Kiro"),
    message: z.string().describe("Notification message"),
    sound: z
      .string()
      .default("Ping")
      .describe("Sound name to play for the notification"),
  },
  async ({ title, message, sound }) => {
    await notify(title, message, sound);
    return {
      content: [{ type: "text", text: `Notification sent: ${message}` }],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);

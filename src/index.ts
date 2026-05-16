import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import notifier from "node-notifier";

async function notify(title: string, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    notifier.notify(
      { title, message, sound: true, wait: false },
      (err) => (err ? reject(err) : resolve())
    );
  });
}

const server = new McpServer({
  name: "mcp-notify",
  version: "1.1.0",
});

server.tool(
  "notify",
  "Send a native OS notification",
  {
    title: z.string().default("Kiro"),
    message: z.string().describe("Notification message"),
  },
  async ({ title, message }) => {
    await notify(title, message);
    return { content: [{ type: "text", text: `Notification sent: ${message}` }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

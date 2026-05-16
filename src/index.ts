import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "child_process";
import { promisify } from "util";
import { readFileSync, existsSync } from "fs";

const exec = promisify(execFile);

const isWSL = existsSync("/proc/version") &&
  readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft");

async function notify(title: string, message: string): Promise<void> {
  const safeTitle = title.replace(/['"]/g, "");
  const safeMsg = message.replace(/['"]/g, "");

  if (process.platform === "win32" || isWSL) {
    const script = `
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
$t = @"
<toast duration="long"><visual><binding template="ToastGeneric"><text>${safeTitle}</text><text>${safeMsg}</text></binding></visual><audio src="ms-winsoundevent:Notification.Default"/></toast>
"@
$x = New-Object Windows.Data.Xml.Dom.XmlDocument
$x.LoadXml($t)
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Kiro").Show([Windows.UI.Notifications.ToastNotification]::new($x))
`;
    const ps = isWSL ? "powershell.exe" : "powershell";
    await exec(ps, ["-NoProfile", "-Command", script]);
  } else if (process.platform === "darwin") {
    const escaped = safeMsg.replace(/\\/g, "\\\\");
    await exec("osascript", ["-e", `display notification "${escaped}" with title "${safeTitle}" sound name "default"`]);
  } else {
    await exec("notify-send", [safeTitle, safeMsg]);
  }
}

const server = new McpServer({
  name: "mcp-notify",
  version: "1.2.0",
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

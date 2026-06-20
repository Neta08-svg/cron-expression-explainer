#!/usr/bin/env node
// cronkit MCP server — exposes the live https://cron.wrapper-agency.com API as
// MCP tools so agents can call it natively. Thin wrapper over /api/v1.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = process.env.CRONKIT_BASE || "https://cron.wrapper-agency.com";
const server = new McpServer({ name: 'cronkit', version: "1.0.0" });

server.registerTool(
  'explain_cron',
  {
    description: 'Explain a cron expression in plain English and list the next run times.',
    inputSchema: {
      expr: z.string().describe('Cron expression, e.g. */5 * * * *'),
      n: z.coerce.number().optional().describe('How many upcoming runs to return'),
      tz: z.string().optional().describe('IANA timezone for run times, e.g. UTC')
    },
  },
  async (args) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(args)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const r = await fetch(`${BASE}/api/v1/cron?${qs.toString()}`);
    return { content: [{ type: "text", text: await r.text() }] };
  }
);

await server.connect(new StdioServerTransport());

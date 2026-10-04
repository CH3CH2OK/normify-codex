#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createAdapter } from './skills/normify-gen/scripts/adapter.mjs';

const args = process.argv.slice(2);
if (args.length && (args[0] !== '--root' || args.length !== 2)) {
  process.stderr.write('Usage: node codex/mcp.mjs [--root <default-project-directory>]\n');
  process.exit(1);
}
const adapter = createAdapter(args[1] || process.env.NORMIFY_ROOT || process.cwd());
const server = new Server({ name: 'normify-codex', version: '0.5.4-codex.1' },
  { capabilities: { tools: {} }, instructions: 'Use normify_help for schemas. Always provide absolute dir and repoRoot for the user-selected project. Architecture-only requests do not authorize editing source code.' });
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: adapter.list() }));
server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    const value = await adapter.call(request.params.name, request.params.arguments ?? {});
    return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
      isError: value?.ok === false };
  } catch (error) {
    return { content: [{ type: 'text', text: JSON.stringify({ ok: false,
      error: { code: 'adapter/execute', message: String(error?.message ?? error) } }) }], isError: true };
  }
});
server.onerror = error => process.stderr.write(String(error) + '\n');
await server.connect(new StdioServerTransport());

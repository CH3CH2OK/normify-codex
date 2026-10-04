import { registerTools } from '../runtime/lib/tools.js';
import Ajv from '../runtime/node_modules/ajv/dist/ajv.js';
import { resolve } from 'node:path';

// Reuse the original registry without loading the DSH plugin or its services.
export function createAdapter(rootDir = process.cwd()) {
  const tools = new Map();
  registerTools({ tools: { register: tool => tools.set(tool.name, tool) } },
    { rootDir: resolve(rootDir), requireBilingual: true });
  const ajv = new Ajv({ strict: false, allErrors: true });
  const validators = new Map([...tools].map(([name, tool]) =>
    [name, ajv.compile(tool.parameters ?? { type: 'object' })]));
  let queue = Promise.resolve();
  return {
    list() {
      return [...tools.values()].map(tool => ({
        name: tool.name, description: tool.description,
        inputSchema: tool.parameters ?? { type: 'object' },
        annotations: { readOnlyHint: tool.readOnly, destructiveHint: tool.destructive,
          idempotentHint: tool.idempotent, openWorldHint: false },
      }));
    },
    call(name, args = {}) {
      // Serialize calls, including reads: a read must never observe half a batch.
      const run = queue.then(async () => {
        const tool = tools.get(name);
        if (!tool) return { ok: false, error: { code: 'tool/not-found', message: name } };
        const valid = validators.get(name);
        if (!valid(args)) return { ok: false, error: { code: 'args/schema',
          message: ajv.errorsText(valid.errors), details: valid.errors } };
        return tool.execute(structuredClone(args));
      });
      queue = run.catch(() => {});
      return run;
    },
  };
}

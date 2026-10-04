import { cp, mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const runtime = join(root, 'codex/skills/normify-gen/runtime');
await mkdir(runtime, { recursive: true });
await cp(join(root, 'lib'), join(runtime, 'lib'), { recursive: true });
await cp(join(root, 'vendor'), join(runtime, 'vendor'), { recursive: true });
await cp(join(root, 'LICENSE'), join(runtime, 'LICENSE'));
const copied = new Set();
async function copyDependency(name) {
  if (copied.has(name)) return;
  copied.add(name);
  const source = join(root, 'node_modules', name);
  const pkg = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'));
  await cp(source, join(runtime, 'node_modules', name), { recursive: true });
  for (const dependency of Object.keys(pkg.dependencies ?? {})) await copyDependency(dependency);
}
await copyDependency('yaml');
await copyDependency('ajv');
console.log('Self-contained Codex skill runtime refreshed.');

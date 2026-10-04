import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const temp = await mkdtemp(join(tmpdir(), 'normify-codex-'));
const repo = join(temp, 'repo');
const dir = join(repo, 'normify-demo');
await mkdir(join(repo, 'src'), { recursive: true });
await writeFile(join(repo, 'src/hello.js'), 'export function hello() { return "hello"; }\n');
const client = new Client({ name: 'normify-test', version: '1.0.0' });
const transport = new StdioClientTransport({ command: process.execPath,
  args: [join(root, 'codex/mcp.mjs'), '--root', repo], stderr: 'pipe' });
let stderr = '';
transport.stderr?.on('data', part => { stderr += part; });
let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS ' + name); }
async function call(name, args, success = true) {
  const response = await client.callTool({ name, arguments: args });
  const value = JSON.parse(response.content[0].text);
  assert.equal(response.isError, !success, JSON.stringify(value));
  assert.equal(value.ok, success, JSON.stringify(value));
  return value;
}
try {
  await client.connect(transport);
  const listing = await client.listTools();
  check('MCP initializes and discovers all 31 tools', () => {
    assert.equal(listing.tools.length, 31);
    assert.equal(new Set(listing.tools.map(t => t.name)).size, 31);
    assert.equal(listing.tools.find(t => t.name === 'normify_validate').annotations.readOnlyHint, true);
    assert.equal(listing.tools.find(t => t.name === 'normify_module_delete').annotations.destructiveHint, true);
  });
  const help = await call('normify_help', { topic: 'tool:normify_module_batch' });
  check('runtime help returns tool schema', () => assert.match(JSON.stringify(help), /items/));
  await call('normify_help', { topic: 'not-a-topic' }, false);
  await call('unknown', {}, false);
  check('engine and unknown-tool errors set MCP isError', () => {});
  await call('normify_project_init', { dir, root: { id: 'demo',
    name: { zh: '示例', en: 'Demo' }, description: { zh: '测试工程', en: 'Test project' } } });
  const leaf = { uid: '1234abcd', id: 'demo.hello', parent: 'demo',
    name: { zh: '问候', en: 'Hello' }, description: { zh: '提供问候函数', en: 'Provides a greeting function' },
    source: [{ path: 'src/hello.js' }], revision: '0'.repeat(40),
    updated_at: new Date().toISOString(), fingerprint: 'pending', state: 'planned',
    apis: [{ protocol: 'rpc', path: 'hello', description: { zh: '返回问候', en: 'Returns a greeting' } }] };
  await call('normify_module_upsert', { dir, frontmatter: leaf });
  await call('normify_layout_upsert', { dir, id: 'demo', mode: 'grid', order: ['demo.hello'],
    reading: { zh: '示例模块', en: 'Demo module' } });
  const filename = join(dir, 'modules/demo/hello.md');
  const before = await readFile(filename, 'utf8');
  await call('normify_module_patch', { dir, id: 'demo.hello', patch: { tags: ['bad'] }, dry_run: 'false' }, false);
  await call('normify_module_upsert', { dir, frontmatter: { ...leaf, source: 'wrong-type' } }, false);
  await call('normify_module_patch', { dir, id: 'demo.hello', patch: {} }, false);
  check('invalid parameters and empty patches do not mutate module', () => {});
  assert.equal(await readFile(filename, 'utf8'), before);
  await call('normify_module_patch', { dir, id: 'demo.hello', patch: { tags: ['preview'] }, dry_run: true });
  assert.equal(await readFile(filename, 'utf8'), before);
  passed++; console.log('PASS dry-run leaves source data unchanged');
  await call('normify_module_refresh', { dir, repoRoot: repo, ids: ['demo.hello', 'demo'], activate: true });
  await call('normify_validate', { dir, repoRoot: repo });
  await call('normify_build', { dir, repoRoot: repo });
  const rendered = await call('normify_render', { dir });
  const tree = JSON.parse(await readFile(join(dir, 'tree.json'), 'utf8'));
  const html = await readFile(rendered.html, 'utf8');
  check('non-Git source activates, validates, builds and renders HTML', () => {
    assert.match(JSON.stringify(tree), /demo.hello/);
    assert.match(html, /<!doctype html/i);
    assert.match(html, /demo.hello/);
  });
  await writeFile(join(repo, 'src/hello.js'), 'export function hello() { return "changed"; }\n');
  const drift = await call('normify_validate', { dir, repoRoot: repo }, false);
  check('source drift is detected through MCP', () => assert.match(JSON.stringify(drift), /fingerprint-drift/));
  const isolated = join(temp, 'standalone-skill');
  await cp(join(root, 'codex/skills/normify-gen'), isolated, { recursive: true });
  const argsFile = join(temp, 'args.json');
  await writeFile(argsFile, '\uFEFF' + JSON.stringify({ topic: 'tools' }));
  const cli = spawnSync(process.execPath, [join(isolated, 'scripts/normify.mjs'), 'call', 'normify_help', '--args-file', argsFile],
    { cwd: temp, encoding: 'utf8' });
  check('installed skill works independently, accepting UTF-8 BOM JSON', () => {
    assert.equal(cli.status, 0, cli.stderr);
    assert.equal(JSON.parse(cli.stdout).ok, true);
  });
  await writeFile(argsFile, JSON.stringify({ topic: 'invalid' }));
  const failure = spawnSync(process.execPath, [join(isolated, 'scripts/normify.mjs'), 'call', 'normify_help', '--args-file', argsFile],
    { cwd: temp, encoding: 'utf8' });
  check('standalone CLI propagates failure through exit status', () => {
    assert.equal(failure.status, 1);
    assert.equal(JSON.parse(failure.stdout).ok, false);
  });
  console.log(`${passed} Codex integration checks passed.`);
} finally {
  await client.close();
  if (stderr) console.error(stderr);
  // Only delete this test's mkdtemp directory.
  await rm(temp, { recursive: true, force: true });
}

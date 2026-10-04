#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { createAdapter } from './adapter.mjs';

try {
  const [command, ...rest] = process.argv.slice(2);
  const adapter = createAdapter(process.env.NORMIFY_ROOT || process.cwd());
  if (command === 'list') {
    process.stdout.write(JSON.stringify(adapter.list(), null, 2) + '\n');
  } else if (command === 'call' && rest[0]) {
    const [name, flag, file] = rest;
    if ((flag && flag !== '--args-file') || (flag && !file) || rest.length > 3)
      throw new Error('Usage: normify.mjs call <tool> [--args-file <json-file|->]');
    let raw = '{}';
    if (flag) {
      if (file === '-') { raw = ''; for await (const part of process.stdin) raw += part; }
      else raw = await readFile(file, 'utf8');
    }
    const result = await adapter.call(name, JSON.parse(raw.replace(/^\uFEFF/, '')));
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    if (result?.ok === false) process.exitCode = 1;
  } else {
    throw new Error('Usage: normify.mjs list | call <tool> [--args-file <json-file|->]');
  }
} catch (error) {
  process.stderr.write(String(error?.message ?? error) + '\n');
  process.exitCode = 1;
}

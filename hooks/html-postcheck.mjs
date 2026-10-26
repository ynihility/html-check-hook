#!/usr/bin/env node
// PostToolUse hook: Edit/Write で *.html が変更された時、同じディレクトリに check.mjs があれば
// node check.mjs <変更ファイル> を自動実行し、結果をフィードバックする。
// check.mjs が無いプロジェクト・html以外のファイルでは何もしない(exit 0, 出力なし)。

import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, extname } from 'node:path';

function readStdin() {
  const chunks = [];
  process.stdin.setEncoding('utf8');
  return new Promise((resolve) => {
    process.stdin.on('data', (c) => chunks.push(c));
    process.stdin.on('end', () => resolve(chunks.join('')));
    process.stdin.on('error', () => resolve(''));
  });
}

const raw = await readStdin();

let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const filePath = input?.tool_input?.file_path || input?.tool_response?.filePath;
if (!filePath || extname(filePath).toLowerCase() !== '.html') {
  process.exit(0);
}

const dir = dirname(filePath);
const checkScript = join(dir, 'check.mjs');
if (!existsSync(checkScript)) {
  process.exit(0);
}

let output = '';
let passed = true;
try {
  output = execFileSync('node', [checkScript, filePath], { encoding: 'utf8' });
} catch (e) {
  passed = false;
  output = (e.stdout || '') + (e.stderr || '') || e.message;
}

const status = passed ? 'PASS' : 'FAIL';
const summary = `[check.mjs ${status}] ${filePath}\n${output}`.trim();

console.log(JSON.stringify({
  systemMessage: summary,
  hookSpecificOutput: {
    hookEventName: 'PostToolUse',
    additionalContext: summary,
  },
}));
process.exit(0);

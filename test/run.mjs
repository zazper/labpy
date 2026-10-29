// Test entry point.
//   npm test                    fast checks (content, page, markdown, release script, build, server)
//   npm run test:samples        run every tutorial example in real Python (slow, needs Python 3.11+)
//   node test/run.mjs --all     everything
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const all = args.includes('--all');
const samplesOnly = args.includes('--samples');

const files = readdirSync(dir)
  .filter((f) => f.endsWith('.test.mjs'))
  .sort()
  .filter((f) => (all ? true : samplesOnly ? f.startsWith('samples') : !f.startsWith('samples')));

for (const f of files) await import('./' + f);

// Shared helpers for the LabPy tests.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const TUT = path.join(ROOT, 'site', 'tutorial');
export const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
export const toc = () => JSON.parse(fs.readFileSync(path.join(TUT, 'toc.json'), 'utf8'));
export const topics = () => toc().groups.flatMap((g) => g.topics.map((t) => ({ ...t, group: g.title })));

// Finds ```lang run|cloud|static Title fences in a tutorial file.
export function fences(text) {
  const out = [], lines = text.replace(/\r/g, '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^```(\w+)?\s*(run|cloud|static)?\s*(.*)$/);
    if (!m) continue;
    const line = i + 1, code = [];
    i++;
    while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
    out.push({ lang: m[1] || '', kind: m[2] || 'static', title: m[3] || '', code: code.join('\n'), line, closed: i < lines.length });
  }
  return out;
}

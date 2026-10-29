// Tiny Markdown renderer and Python highlighter used by the tutorial (kept separate so it can be tested).
export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const KW = new Set(['import', 'as', 'def', 'return', 'if', 'else', 'elif', 'for', 'in', 'while', 'from', 'with', 'class', 'True', 'False', 'None', 'and', 'or', 'not', 'try', 'except', 'finally', 'raise', 'pass', 'break', 'continue', 'lambda']);

export function hl(src) {
  return src.split('\n').map((line) => {
    const t = line.match(/"[^"]*"|'[^']*'|#.*|\w+|\s+|./g) || [];
    return t.map((x, i) => {
      const e = esc(x); let c = '';
      if (x[0] === '"' || x[0] === "'") c = 's';
      else if (x[0] === '#') c = 'cm';
      else if (KW.has(x)) c = 'kw';
      else if (/^\d+$/.test(x)) c = 'nu';
      else if (/^\w/.test(x) && t[i + 1] === '(') c = 'f';
      return c ? `<span class="${c}">${e}</span>` : e;
    }).join('');
  }).join('\n');
}

// Inline formatting. Code spans are set aside first so ** inside `code` is never treated as bold.
const inl = (s) => {
  const codes = [];
  const t = esc(s).replace(/`([^`]+)`/g, (m, c) => '\u0000' + (codes.push(c) - 1) + '\u0000').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  return t.replace(/\u0000(\d+)\u0000/g, (m, i) => '<code>' + codes[i] + '</code>');
};

function sample(kind, title, text, n) {
  if (kind === 'cloud') {
    return `<div class="ex"><div class="exh"><b>${esc(title)}</b><span class="lock">Needs the cloud runner</span></div><div class="cbx dim">${hl(text)}</div><div class="hint">Running this needs a trial or paid plan (coming soon).</div></div>`;
  }
  return `<div class="ex"><div class="exh"><b>${esc(title)}</b><button class="primary" data-i="${n}">Try it ▶</button></div><a href="#" class="cbx" data-i="${n}" aria-label="Open this example in the editor">${hl(text)}</a><div class="hint">Click the code or Try it to open it in the editor.</div></div>`;
}

// Tiny Markdown: ## headings, paragraphs, - lists, `code`, **bold**, and ```python run|cloud|static Title fences.
export function md(src) {
  const samples = [], out = [], lines = src.replace(/\r/g, '').split('\n');
  let i = 0, para = [];
  const flush = () => { if (para.length) { out.push('<p>' + inl(para.join(' ')) + '</p>'); para = []; } };
  while (i < lines.length) {
    const l = lines[i];
    const f = l.match(/^```(\w+)?\s*(run|cloud|static)?\s*(.*)$/);
    if (f) {
      flush(); const code = []; i++;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      i++;
      const kind = f[2] || 'static', text = code.join('\n');
      if (kind === 'static') out.push(`<div class="cbx">${hl(text)}</div>`);
      else out.push(sample(kind, f[3] || 'Example', text, samples.push(text) - 1));
      continue;
    }
    const h = l.match(/^(#{1,3}) (.*)/);
    if (h) { flush(); out.push(`<h${h[1].length + 1}>${inl(h[2])}</h${h[1].length + 1}>`); }
    else if (l.startsWith('- ')) {
      flush(); const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) items.push('<li>' + inl(lines[i++].slice(2)) + '</li>');
      out.push('<ul>' + items.join('') + '</ul>'); continue;
    } else if (!l.trim()) flush(); else para.push(l);
    i++;
  }
  flush();
  return { html: out.join(''), samples };
}

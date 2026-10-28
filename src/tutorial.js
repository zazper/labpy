// Topic-based Python tutorial: topics list, reading view and runnable examples.
const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const KW = new Set(['import', 'as', 'def', 'return', 'if', 'else', 'elif', 'for', 'in', 'while', 'from', 'with', 'class', 'True', 'False', 'None', 'and', 'or', 'not', 'try', 'except', 'finally', 'raise', 'pass', 'break', 'continue', 'lambda']);

function hl(src) {
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
function md(src) {
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

export function initTutorial({ trySample }) {
  const body = document.body;
  let toc = null, flat = [], cur = null, samples = [];

  async function load() {
    if (toc) return;
    toc = await (await fetch('tutorial/toc.json')).json();
    flat = toc.groups.flatMap((g) => g.topics);
  }

  function renderList() {
    const q = $('tsearch').value.trim().toLowerCase();
    $('tlist').innerHTML = '';
    for (const g of toc.groups) {
      const ts = g.topics.filter((t) => !q || t.title.toLowerCase().includes(q));
      if (!ts.length) continue;
      const d = document.createElement('details');
      d.open = !!q || ts.some((t) => t === cur) || (!cur && g === toc.groups[0]);
      d.innerHTML = `<summary>${esc(g.title)}</summary>`;
      for (const t of ts) {
        const b = document.createElement('button');
        b.className = 'ti' + (t === cur ? ' on' : '') + (t.file ? '' : ' soon');
        b.textContent = t.title + (t.file ? '' : ' (soon)');
        b.onclick = () => openTopic(t);
        d.append(b);
      }
      $('tlist').append(d);
    }
  }

  async function openTopic(t) {
    cur = t; body.classList.add('tut', 'read');
    const g = toc.groups.find((x) => x.topics.includes(t));
    let html = `<div class="crumb">Python › ${esc(g.title)}</div><h1>${esc(t.title)}</h1>`;
    samples = [];
    if (t.file) {
      try {
        const r = md(await (await fetch('tutorial/' + t.file)).text());
        html += r.html; samples = r.samples;
      } catch (e) { html += '<p>Could not load this topic. Check your connection and try again.</p>'; }
    } else html += '<p>This topic is coming soon.</p>';
    const i = flat.indexOf(t), p = flat[i - 1], n = flat[i + 1];
    html += `<div class="nav"><span>${p ? `<button data-go="${i - 1}">‹ ${esc(p.title)}</button>` : ''}</span><span>${n ? `<button data-go="${i + 1}">${esc(n.title)} ›</button>` : ''}</span></div>`;
    const doc = $('doc'); doc.innerHTML = html; doc.scrollTop = 0;
    doc.querySelectorAll('[data-i]').forEach((el) => el.addEventListener('click', (e) => {
      e.preventDefault();
      const n = +el.dataset.i, slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      trySample(samples[n], `${slug}${samples.length > 1 ? '_' + (n + 1) : ''}.py`);
    }));
    doc.querySelectorAll('[data-go]').forEach((el) => el.addEventListener('click', () => openTopic(flat[+el.dataset.go])));
    renderList();
  }

  async function open() {
    body.classList.add('tut');
    $('drawer').hidden = false; $('menuBtn').setAttribute('aria-expanded', 'true'); $('learn').classList.add('sel');
    try { await load(); } catch (e) { $('doc').innerHTML = '<p>Could not load the topic list.</p>'; body.classList.add('read'); return; }
    if (cur) { body.classList.add('read'); renderList(); } else openTopic(flat.find((t) => t.file) || flat[0]);
  }

  $('tsearch').addEventListener('input', () => toc && renderList());
  // « and » sit side by side between the menu and the topics. « shrinks the menu (or brings the topics back);
  // » shrinks the topics (or brings the menu back). So the user chooses which side gets the room.
  function sync() {
    const m = body.classList.contains('mcol'), t = body.classList.contains('tcol');
    const label = (b, text) => { b.setAttribute('aria-label', text); b.title = text; };
    $('mfold').disabled = m; $('tfold').disabled = t;
    label($('mfold'), t ? 'Expand topics' : 'Collapse menu');
    label($('tfold'), m ? 'Expand menu' : 'Collapse topics');
  }
  $('mfold').onclick = () => { if (body.classList.contains('tcol')) body.classList.remove('tcol'); else body.classList.add('mcol'); sync(); };
  $('tfold').onclick = () => { if (body.classList.contains('mcol')) body.classList.remove('mcol'); else body.classList.add('tcol'); sync(); };
  $('topicsClose').onclick = () => {
    body.classList.remove('tut', 'read', 'tcol', 'mcol');
    $('drawer').hidden = true; $('scrim').hidden = true; $('learn').classList.remove('sel'); sync();
  };
  sync();
  return { open, backToLesson: () => { if (cur) body.classList.add('read'); }, hasTopic: () => !!cur };
}

import { md, esc } from './markdown.mjs';

// Topic-based Python tutorial: topics list, reading view and runnable examples.
const $ = (id) => document.getElementById(id);

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

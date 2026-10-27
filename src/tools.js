// Format and Check with Ruff (WebAssembly). Loaded only when first used.
import * as ruff from '@astral-sh/ruff-wasm-web';

let ready = null;
function get() {
  if (!ready) {
    ready = (async () => {
      await ruff.default(new URL('ruff/ruff_wasm_bg.wasm', document.baseURI).href);
      const W = ruff.Workspace;
      const settings = W.defaultSettings ? W.defaultSettings() : {};
      settings['line-length'] = 88;
      try { return new W(settings, ruff.PositionEncoding ? ruff.PositionEncoding.Utf16 : undefined); }
      catch (e) { return new W(settings); }
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

export async function formatCode(src) { return (await get()).format(src); }

export async function checkCode(src) {
  const diags = (await get()).check(src);
  return diags.map((d) => {
    const loc = d.start_location || d.location || {};
    return { code: d.code || '', message: d.message || '', row: loc.row || 1, col: loc.column || 1 };
  });
}

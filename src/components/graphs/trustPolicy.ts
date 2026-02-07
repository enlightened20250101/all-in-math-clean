import type { KatexOptions } from 'katex';

const SAFE = new Set([
  'frac','dfrac','tfrac','text','cdot','times','sin','cos','tan','log','ln','lim','to','sum','int','sqrt',
  'left','right','pm','ge','le','ne','approx','infty','alpha','beta','gamma','theta','phi','pi','cdots',
  'ldots','vdots','ddots','dots','vec','overrightarrow','overline','underline','boxed','cases','mathrm',
  'mathbb','binom','hat','bar','langle','rangle','lfloor','rfloor','lceil','rceil','lVert','rVert'
]);

export const katexTrust: KatexOptions['trust'] = (ctx) => {
  const name = (typeof ctx.command === 'string' ? ctx.command : '').replace(/^\\/, '');
  if (!name) return false;
  if (name === 'href' || name === 'url' || name.startsWith('html')) return false;
  return SAFE.has(name);
};

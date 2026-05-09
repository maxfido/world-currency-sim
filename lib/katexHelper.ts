// Server + client safe KaTeX rendering
// katex.renderToString returns an HTML string

let katex: typeof import('katex') | null = null;

function getKatex() {
  if (typeof window === 'undefined') {
    // Server: require directly
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('katex') as typeof import('katex');
  }
  return katex;
}

export function renderKatex(latex: string, displayMode = false): string {
  try {
    const k = getKatex();
    if (!k) return `<span class="font-mono text-xs">${latex}</span>`;
    return k.renderToString(latex, {
      throwOnError: false,
      displayMode,
      output: 'html',
    });
  } catch {
    return `<span class="font-mono text-xs">${latex}</span>`;
  }
}

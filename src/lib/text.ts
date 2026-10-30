// Text helpers for lettering drawn in SVG
/** Break text into lines of at most n characters, at spaces. */
export function wrap(str: string, n: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const w of str.split(' ')) {
    if (line && (line + ' ' + w).length > n) { out.push(line); line = w; } else line = line ? `${line} ${w}` : w;
  }
  if (line) out.push(line);
  return out;
}

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
/** A small count as a word ("Three"), larger ones as digits. */
export const countWord = (n: number) => WORDS[n] ?? String(n);

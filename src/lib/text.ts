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

/** The largest size, up to max, at which text fits maxW. em is the lettering's width per character in ems: Archivo
 *  measures about 0.52 for bold caps (.lt) and 0.42–0.50 for the condensed .lab/.mk styles, so the values passed carry
 *  headroom. Rounded down, so the size written can never overflow. */
export const fit = (str: string, maxW: number, max: number, em = 0.64) =>
  Math.floor(Math.min(max, maxW / (Math.max(1, str.length) * em)) * 100) / 100;

/** At most n lines; when the text is cut, the last line kept ends with an ellipsis. */
export const clip = (lines: string[], n: number) => (lines.length <= n ? lines : [...lines.slice(0, n - 1), `${lines[n - 1]}…`]);

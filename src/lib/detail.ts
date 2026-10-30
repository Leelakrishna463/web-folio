// What a probe-able part says, for the popup card, the phone panel and the screen-reader list
export type Row = { small: string } | { text: string } | { load: 1 | 2 | 3; text: string } | { act: string };
export interface Detail { key: string; title: string; tag?: string; rows: Row[] }

/** A row's class and text, for rendering. */
export function rowView(r: Row): { cls?: string; text: string; load?: 1 | 2 | 3 } {
  if ('small' in r) return { cls: 'dt-small', text: r.small };
  if ('act' in r) return { cls: 'dt-act', text: r.act };
  if ('load' in r) return { cls: 'dt-load', text: r.text, load: r.load };
  return { text: r.text };
}

/** The facts a part states, in plain words (actions such as "Click to open" left out). */
export function plainText(d: Detail): string {
  return `${d.title}${d.tag ? ` (${d.tag})` : ''}: ${d.rows.filter((r) => !('act' in r)).map((r) => rowView(r).text).join(' ')}`;
}

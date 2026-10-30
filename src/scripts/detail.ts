// A part's details, from its <template data-detail> (see components/layout/Details.astro)
export function detailFor(key: string): DocumentFragment | null {
  const t = document.querySelector<HTMLTemplateElement>(`template[data-detail="${CSS.escape(key)}"]`);
  return t ? (t.content.cloneNode(true) as DocumentFragment) : null;
}

/** Plain text of a part's details, for the live region. */
export function detailText(key: string): string {
  const f = detailFor(key);
  return f ? [...f.querySelectorAll('b, span:not(.sq), p')].map((n) => n.textContent?.trim()).filter(Boolean).join('. ') : '';
}

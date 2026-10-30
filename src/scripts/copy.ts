// Copy text to the clipboard, falling back to selecting it; the button says "Copied" for a moment
export function initCopy(button: HTMLButtonElement, text: string, target?: HTMLElement): void {
  const label = button.textContent;
  let back = 0;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied';
      clearTimeout(back);
      back = window.setTimeout(() => { button.textContent = label; }, 1600);
    } catch {
      if (!target) return;
      const r = document.createRange(), s = getSelection();
      r.selectNodeContents(target);
      s?.removeAllRanges();
      s?.addRange(r);
    }
  });
}

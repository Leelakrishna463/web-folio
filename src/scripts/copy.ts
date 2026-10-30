// Copy text to the clipboard, falling back to selecting it; the button says "Copied" for a moment
export function initCopy(button: HTMLButtonElement, text: string, target?: HTMLElement): void {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      const label = button.textContent;
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = label; }, 1600);
    } catch {
      if (!target) return;
      const r = document.createRange(), s = getSelection();
      r.selectNodeContents(target);
      s?.removeAllRanges();
      s?.addRange(r);
    }
  });
}

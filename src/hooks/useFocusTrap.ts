import { useEffect, RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Focus management per dialog/popover modali (WCAG 2.4.3 / 2.1.2):
 * - all'apertura sposta il focus sul primo elemento focusabile (o sul container);
 * - intrappola Tab / Shift+Tab entro il contenitore, così la tastiera non
 *   raggiunge il contenuto di sfondo (che `aria-modal` promette ma non impone);
 * - alla chiusura ripristina il focus sull'elemento che aveva aperto il dialog.
 *
 * Il container referenziato dovrebbe avere `tabIndex={-1}` per essere un target
 * di focus valido anche quando non contiene elementi focusabili.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);

    // Focus iniziale: primo elemento focusabile, altrimenti il container stesso.
    const focusables = getFocusable();
    (focusables[0] || node).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = getFocusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !node.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !node.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [ref, isOpen]);
}

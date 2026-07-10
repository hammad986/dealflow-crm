import { useEffect } from 'react';

// NOTE: The `shortcuts` parameter should be memoized by the caller (e.g., via useMemo or useCallback)
// to prevent the effect from re-running on every render. If the shortcuts object is created inline,
// the effect will detach and re-attach event listeners unnecessarily.
export function useKeyboardShortcuts(
  shortcuts: Record<string, (e: KeyboardEvent) => void>
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey ? 'ctrl+' : '',
        e.metaKey ? 'cmd+' : '',
        e.altKey ? 'alt+' : '',
        e.shiftKey ? 'shift+' : '',
        e.key.toLowerCase(),
      ].join('');

      const callback = shortcuts[key];
      if (callback) {
        e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
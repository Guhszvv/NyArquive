import { type Dispatch, type SetStateAction, useEffect } from 'react';

const useKeyboardShortcuts = (
  numPages: number,
  onSetPage: Dispatch<SetStateAction<number>>,
  onSetZoom: Dispatch<SetStateAction<number>>,
) => {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onSetPage((currentPage) => Math.max(1, currentPage - 1));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onSetPage((currentPage) => Math.min(numPages || 1, currentPage + 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        onSetZoom((currentZoom) => Math.min(currentZoom + 0.2, 10));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        onSetZoom((currentZoom) => Math.max(currentZoom - 0.2, 0.2));
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [numPages, onSetPage, onSetZoom]);
};

export default useKeyboardShortcuts;

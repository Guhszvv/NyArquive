import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';

const clampPage = (page: number, numPages: number) => Math.min(Math.max(page, 1), numPages);

const usePagePersistence = (
  file: string,
  page: number,
  numPages: number,
  onSetPage: Dispatch<SetStateAction<number>>,
) => {
  const hasLoadedSavedPage = useRef(false);
  const storageKey = `pdf-page-${file}`;

  useEffect(() => {
    hasLoadedSavedPage.current = false;
  }, [storageKey]);

  useEffect(() => {
    if (numPages < 1 || hasLoadedSavedPage.current) return;

    const savedPage = Number(localStorage.getItem(storageKey));
    if (Number.isInteger(savedPage) && savedPage >= 1) {
      onSetPage(clampPage(savedPage, numPages));
    }

    localStorage.setItem('max_page', String(numPages));
    hasLoadedSavedPage.current = true;
  }, [numPages, onSetPage, storageKey]);

  useEffect(() => {
    if (numPages < 1 || !hasLoadedSavedPage.current) return;

    localStorage.setItem(storageKey, String(clampPage(page, numPages)));
    localStorage.setItem('max_page', String(numPages));
  }, [numPages, page, storageKey]);
};

export default usePagePersistence;

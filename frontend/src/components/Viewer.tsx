import React, { type SetStateAction, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PDFViewer from './PDFViewer';
import usePDFLoader from '../hooks/usePDFLoader';
import usePDFRender from '../hooks/usePDFRender';
import usePagePersistence from '../hooks/usePagePersistence';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import useResize from '../hooks/useResize';

const Viewer: React.FC = () => {
  const { file } = useParams<{ file: string }>();
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const width = useResize();
  const url = useMemo(() => {
    if (!file) return '';

    return `${window.__CONFIG__.apiUrl}/pdf/${encodeURIComponent(file)}`;
  }, [file]);
  const { pdfDocument, loading, error } = usePDFLoader(url);
  const numPages = pdfDocument?.numPages ?? 0;
  const visiblePage = numPages > 0 ? Math.min(Math.max(page, 1), numPages) : page;
  const setClampedPage = useCallback((nextPage: SetStateAction<number>) => {
    setPage((currentPage) => {
      const pageValue = typeof nextPage === 'function' ? nextPage(currentPage) : nextPage;
      const upperBound = numPages || pageValue;

      return Math.min(Math.max(pageValue, 1), upperBound);
    });
  }, [numPages]);
  const { canvasRef, textLayerRef } = usePDFRender(pdfDocument, visiblePage, width, zoom);

  usePagePersistence(file ?? '', visiblePage, numPages, setClampedPage);
  useKeyboardShortcuts(numPages, setClampedPage, setZoom);

  if (!file) return <div>PDF não encontrado.</div>;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!pdfDocument) return <div>PDF não encontrado.</div>;

  return (
    <PDFViewer
      canvasRef={canvasRef}
      textLayerRef={textLayerRef}
      page={visiblePage}
      numPages={numPages}
      onSetPage={setClampedPage}
    />
  );
};

export default Viewer;

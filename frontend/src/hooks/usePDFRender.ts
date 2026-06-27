import { useCallback, useEffect, useRef } from 'react';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';

const usePDFRender = (
  pdfDocument: PDFDocumentProxy | null,
  page: number,
  width: number,
  zoom: number,
) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  const renderPage = useCallback(async () => {
    if (!pdfDocument || canvasRef.current === null || textLayerRef.current === null) return;

    const pdfPage: PDFPageProxy = await pdfDocument.getPage(page);
    const baseViewport = pdfPage.getViewport({ scale: 1 });
    const canvas = canvasRef.current;
    const wrapperWidth = canvas.parentElement?.clientWidth ?? width;
    const availableWidth = Math.max(wrapperWidth - 32, 320);
    const scale = Math.min(2, availableWidth / baseViewport.width) * zoom;
    const viewport = pdfPage.getViewport({ scale });
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.height = `${viewport.height}px`;
    canvas.style.width = `${viewport.width}px`;
    textLayerRef.current.replaceChildren();

    const renderContext = {
      canvasContext: context,
      viewport,
    };

    renderTaskRef.current?.cancel();
    const renderTask = pdfPage.render(renderContext);
    renderTaskRef.current = renderTask;
    await renderTask.promise;
  }, [pdfDocument, page, width, zoom]);

  useEffect(() => {
    let cancelled = false;

    renderPage().catch((err) => {
      if (!cancelled && err?.name !== 'RenderingCancelledException') {
        console.error(err);
      }
    });

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [renderPage]);

  return { renderPage, canvasRef, textLayerRef };
};

export default usePDFRender;

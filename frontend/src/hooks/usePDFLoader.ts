import { useEffect, useState } from 'react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist';

const usePDFLoader = (url: string) => {
  const [pdfDocument, setPDFDocument] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setPDFDocument(null);
      setLoading(false);
      setError(null);
      return;
    }

    GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url,
    ).toString();

    let cancelled = false;
    const loadingTask = getDocument(url);
    const loadPDF = async () => {
      setLoading(true);
      setError(null);
      setPDFDocument(null);

      try {
        const pdfDocument = await loadingTask.promise;
        if (!cancelled) {
          setPDFDocument(pdfDocument);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      cancelled = true;
      void loadingTask.destroy();
    };
  }, [url]);

  return { pdfDocument, loading, error };
};

export default usePDFLoader;

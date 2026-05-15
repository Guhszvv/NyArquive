import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
import { useParams } from "react-router-dom";
import "pdfjs-dist/web/pdf_viewer.css";
import { updateLocalStorage } from "../modules/localStorage";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function Viewer() {
  const renderTaskRef = useRef<any>(null);
  const { file } = useParams<{ file: string }>();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState<number | null>(null);
  const [, setMaxPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [darkMode, setDarkMode] = useState(false);

  const storageKey = `pdf-page-${file}`;
  const storageKeyMaxPage = `max-page-${file}`;

  // Update last page
  useEffect(() => {
    if (!file || pageNum === null || Number.isNaN(pageNum)) return;
    const timeout = setTimeout(() => {
      fetch(`${window.__CONFIG__.apiUrl}/book/${encodeURIComponent(file)}/${pageNum}`, {
        method: "POST",
      });
      localStorage.setItem(storageKey, String(pageNum));
    }, 500);
    return () => clearTimeout(timeout);
  }, [pageNum, file, storageKey]);

  // Load PDF
  useEffect(() => {
    if (!file) return;

    const loadPdf = async () => {

      await updateLocalStorage(`${window.__CONFIG__.apiUrl}/book`);

      const encoded = encodeURIComponent(file);

      const loadingTask = pdfjsLib.getDocument(
        `${window.__CONFIG__.apiUrl}/pdf/${encoded}`
      );

      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);

      const savedPage = localStorage.getItem(storageKey);
      const maxPage = localStorage.getItem(storageKeyMaxPage);
      if (savedPage) setPageNum(Number(savedPage));
      if (maxPage) setMaxPage(Number(maxPage));
    };

    loadPdf();
  }, [file, storageKey, storageKeyMaxPage]);

  // Render page
  useEffect(() => {
    if (!pdf || pageNum === null || Number.isNaN(pageNum)) return;

    if (
      !canvasRef.current ||
      !textLayerRef.current ||
      !containerRef.current
    ) return;

    let cancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(pageNum);

        if (cancelled) return;

        const containerWidth = containerRef.current!.clientWidth;

        const baseViewport = page.getViewport({ scale: 1 });

        const responsiveScale = containerWidth / baseViewport.width;

        const finalScale = responsiveScale * scale;

        const viewport = page.getViewport({ scale: finalScale });

        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const textLayer = textLayerRef.current!;

        textLayer.style.setProperty(
          "--scale-factor",
          viewport.scale.toString()
        );

        textLayer.innerHTML = "";

        textLayer.style.width = `${viewport.width}px`;
        textLayer.style.height = `${viewport.height}px`;

        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch { }
        }

        renderTaskRef.current = page.render({
          canvasContext: context,
          viewport,
        });

        await renderTaskRef.current.promise;

        if (cancelled) return;

        const textContent = await page.getTextContent();

        if (cancelled) return;

        pdfjsLib.renderTextLayer({
          textContentSource: textContent,
          container: textLayer,
          viewport,
          textDivs: [],
        });

      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error(err);
        }
      }
    };

    renderPage();

    return () => {
      cancelled = true;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch { }
      }
    };
  }, [pdf, pageNum, scale]);

  // Keybinds
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!pdf || pageNum === null || Number.isNaN(pageNum)) return;

      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.shiftKey && e.key === "D"
      ) {
        e.preventDefault();
      }

      if (e.shiftKey && e.key === "D") {
        setDarkMode((p) => !p);
      }

      if (e.key === "ArrowRight") {
        setPageNum((p) => {
          if (p === null || Number.isNaN(p)) return 1;

          return Math.min(p + 1, pdf.numPages);
        });
      }

      if (e.key === "ArrowLeft") {
        setPageNum((p) => {
          if (p === null || Number.isNaN(p)) return 1;

          return Math.max(p - 1, 1);
        });
      }

      if (e.key === "ArrowUp") {
        setScale((s) => Math.min(s + 0.2, 10));
      }

      if (e.key === "ArrowDown") {
        setScale((s) => Math.max(s - 0.2, 0.2));
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pdf, darkMode]);

  // Resize
  useEffect(() => {
    const handleResize = () => {
      setPageNum((p) => p);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{}}>
      <div>
        {/* <NavBar isVisible={false} isViewer={true}/> */}
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            right: "10px",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "8px",
            fontSize: "14px",
            zIndex: "9999"
          }}
        >
          {" "}
          <input
            className="input-page"
            type="number"
            min="1"
            max={pdf?.numPages ?? 1}
            value={pageNum ?? ""}
            onChange={(e) => setPageNum(Number(e.target.value))}
            style={{
              width: "60px",
              padding: "2px",
              margin: "0 5px",
              border: "1px solid #fff",
              borderRadius: "4px",
              color: "#fff",
              background: "rgba(255,255,255,0.2)",
              textAlign: "center",
            }}
          />{" "}
          / {pdf?.numPages ?? "-"}
        </div>
      </div>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}>
        <div style={{ position: "relative" }}>

          {/* Dark mode filter and conditional expression */}
          <canvas ref={canvasRef} style={{ filter: darkMode ? 'invert(80%) brightness(100%) contrast(120%) sepia(50%) saturate(2) hue-rotate(180deg)' : '' }} className="canvas"></canvas>

          <div
            ref={textLayerRef}
            className="textLayer"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default Viewer;

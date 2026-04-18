import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
import { useParams } from "react-router-dom";
import "pdfjs-dist/web/pdf_viewer.css";
import NavBar from "./NavBar";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function Viewer() {
  const { file } = useParams<{ file: string }>();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);

  const storageKey = `pdf-page-${file}`;
  const storageKeyMaxPage = `max-page-${file}`;  

  // 🔹 Carregar PDF
  useEffect(() => {
    if (!file) return;

    const loadPdf = async () => {
      const encoded = encodeURIComponent(file);

      const loadingTask = pdfjsLib.getDocument(
        `${import.meta.env.VITE_API_URL}/pdf/${encoded}`
      );

      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);

      const savedPage = localStorage.getItem(storageKey);
      const maxPage = localStorage.getItem(storageKeyMaxPage);
      if (savedPage) setPageNum(Number(savedPage));
      if (maxPage) setMaxPage(Number(maxPage));
    };

    loadPdf();
  }, [file, storageKey]);

  // 🔹 Renderizar página
  useEffect(() => {
    if (!pdf) return;
    if (!canvasRef.current || !textLayerRef.current || !containerRef.current) return;

    const renderPage = async () => {
      const page = await pdf.getPage(pageNum);

      const containerWidth = containerRef.current!.clientWidth;

      const baseViewport = page.getViewport({ scale: 1 });

      const responsiveScale = containerWidth / baseViewport.width;

      const finalScale = responsiveScale * scale;

      const viewport = page.getViewport({ scale: finalScale });

      containerRef.current?.style.setProperty(
        "--scale-factor",
        finalScale.toString()
      );

      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d");

      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const textLayer = textLayerRef.current!;
      textLayer.innerHTML = "";

      textLayer.style.width = `${viewport.width}px`;
      textLayer.style.height = `${viewport.height}px`;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      const textContent = await page.getTextContent();

      pdfjsLib.renderTextLayer({
        textContentSource: textContent,
        container: textLayer,
        viewport,
        textDivs: [],
      });

      localStorage.setItem(storageKey, String(pageNum));
      localStorage.setItem(storageKeyMaxPage, String(pdf?.numPages ?? "-"));
    };

    renderPage();
  }, [pdf, pageNum, storageKey, scale]);

  // 🔹 Navegação teclado
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!pdf) return;

      if (
          e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight"
        ) {
          e.preventDefault();
      }

      if (e.key === "ArrowRight") {
        setPageNum((p) => Math.min(p + 1, pdf.numPages));
      }

      if (e.key === "ArrowLeft") {
        setPageNum((p) => Math.max(p - 1, 1));
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
  }, [pdf]);

  // 🔹 Resize
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
        <NavBar isVisible={false} isViewer={true}/>
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
          Página{" "}
          <input
            className="input-page"
            type="number"
            min="1"
            max={pdf?.numPages ?? 1}
            value={pageNum}
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
          de {pdf?.numPages ?? "-"}
        </div>
      </div>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative" }}>
          <canvas ref={canvasRef}></canvas>

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
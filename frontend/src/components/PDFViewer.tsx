import React from 'react';
import 'pdfjs-dist/web/pdf_viewer.css';
import './Viewer.css';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export interface PDFViewerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  textLayerRef: React.RefObject<HTMLDivElement | null>;
  page: number;
  numPages: number;
  onSetPage: (page: number) => void;
  mode: boolean
}

const PDFViewer: React.FC<PDFViewerProps> = ({ canvasRef, textLayerRef, page, numPages, onSetPage, mode }) => {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages) {
      onSetPage(newPage);
    }
  };

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer-page">
        <canvas className="pdf-viewer-canvas" ref={canvasRef} style={{ filter: mode ? 'invert(80%) brightness(100%) contrast(120%) sepia(50%) saturate(2) hue-rotate(180deg)' : "" }} />
        <div className="pdf-viewer-text-layer textLayer" ref={textLayerRef} />
      </div>

      <div className="pdf-viewer-controls">
        <button
          className="pdf-viewer-button"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          <FaArrowLeft className='page-control-svg' />
        </button>

        <div className="pdf-viewer-page-control">
          <input
            className="pdf-viewer-page-input"
            type="number"
            min={1}
            max={numPages}
            value={page}
            onChange={(event) => handlePageChange(Number(event.target.value))}
          />
          <span className="pdf-viewer-page-total">/ {numPages}</span>
        </div>

        <button
          className="pdf-viewer-button"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= numPages}
        >
          <FaArrowRight className='page-control-svg' />
        </button>

      </div>
    </div>
  );
};

export default PDFViewer;

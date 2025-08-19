'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Download, FileText, Image, File } from 'lucide-react';
import dynamic from 'next/dynamic';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// Dynamically import react-pdf components to avoid SSR issues
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div></div>
});

const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div></div>
});

// Set up PDF.js worker only on client side
let pdfjs = null;
if (typeof window !== 'undefined') {
  import('react-pdf').then(mod => {
    pdfjs = mod.pdfjs;
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  });
  
  // Import PDF styles
  import('react-pdf/dist/Page/AnnotationLayer.css');
  import('react-pdf/dist/Page/TextLayer.css');
}

const FilePreviewer = ({ file, className = '', scale: externalScale = 0 }) => {
  const [fileType, setFileType] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [pdfPages, setPdfPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(externalScale || 0); // Use external scale or default to 0
  const [textContent, setTextContent] = useState('');
  
  // Pan state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);

  useEffect(() => {
    if (!file) return;

    // Reset scale to 0 (fit to container) for new files
    setScale(externalScale);
    // Reset pan when file changes
    setPan({ x: 0, y: 0 });

    // Determine file type
    const type = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'bmp', 'tiff'].includes(extension)) {
      setFileType('image');
    } else if (type === 'application/pdf' || extension === 'pdf') {
      setFileType('pdf');
    } else if (['text/plain', 'text/csv'].includes(type) || ['txt', 'csv'].includes(extension)) {
      setFileType('text');
    } else {
      setFileType('unsupported');
    }

    // Create object URL for file
    const url = URL.createObjectURL(file);
    setFileUrl(url);

    // Read text content for text files
    if (['text/plain', 'text/csv'].includes(type) || ['txt', 'csv'].includes(extension)) {
      const reader = new FileReader();
      reader.onload = (e) => setTextContent(e.target.result);
      reader.readAsText(file);
    }

    // Cleanup function
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  // Sync scale changes from parent component
  useEffect(() => {
    setScale(externalScale);
    // Reset pan when scale changes to fit-to-container
    if (externalScale === 0) {
      setPan({ x: 0, y: 0 });
    }
  }, [externalScale]);

  // Mouse event handlers for panning
  const handleMouseDown = (e) => {
    if (scale <= 1.0) return; // Only allow panning when zoomed in
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1.0) return;
    
    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPan({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    if (scale <= 1.0) return; // Only allow panning when zoomed in
    
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || scale <= 1.0) return;
    
    if (e.touches.length === 1) {
      e.preventDefault();
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      
      setPan({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Reset pan when zooming out to fit-to-container
  const resetPan = () => {
    setPan({ x: 0, y: 0 });
  };

  const handlePdfLoadSuccess = ({ numPages }) => {
    setPdfPages(numPages);
  };

  const handleZoomIn = () => {
    if (scale === 0) {
      setScale(0.7); // Start from 70% when zooming in from fit-to-container
    } else {
      setScale(prev => {
        // Convert to percentage, round up to next 10% interval, then convert back to decimal
        const currentPercent = Math.ceil(prev * 100);
        const nextPercent = Math.min(currentPercent + 10, 300);
        return nextPercent / 100;
      });
    }
  };

  const handleZoomOut = () => {
    if (scale <= 0.7) {
      setScale(0); // Return to fit-to-container mode
      resetPan(); // Reset pan when returning to fit mode
    } else {
      setScale(prev => {
        // Convert to percentage, round down to previous 10% interval, then convert back to decimal
        const currentPercent = Math.floor(prev * 100);
        const nextPercent = Math.max(currentPercent - 10, 70);
        return nextPercent / 100;
      });
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Get cursor style based on zoom and drag state
  const getCursorStyle = () => {
    if (scale <= 1.0) return 'default';
    return isDragging ? 'grabbing' : 'grab';
  };

  // Get transform style with both scale and pan
  const getTransformStyle = () => {
    if (scale === 0) {
      return { transformOrigin: 'center' };
    }
    return {
      transform: `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
      transformOrigin: 'center'
    };
  };

  if (!file) {
    return (
      <div className={`flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 ${className}`}>
        <div className="text-center">
          <File className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No file selected</p>
        </div>
      </div>
    );
  }

  if (fileType === 'unsupported') {
    return (
      <div className={`flex items-center justify-center h-64 border-2 border-dashed border-red-300 rounded-lg bg-red-50 ${className}`}>
        <div className="text-center">
          <File className="mx-auto h-12 w-12 text-red-400" />
          <p className="text-xs text-red-400 mt-1">{file.name}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`h-full overflow-hidden border border-gray-200 rounded-lg bg-white ${className}`}>
        {/* Zoom Controls */}
        <div className="absolute top-2 right-2 z-10 flex items-center space-x-2 bg-white bg-opacity-90 rounded-lg shadow-md p-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.7}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <span className="text-sm text-gray-600 min-w-[3rem] text-center font-medium">
            {scale === 0 ? 'Fit' : `${Math.round(scale * 100)}%`}
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7M10 7v6" />
            </svg>
          </button>
          <button
            onClick={() => {
              setScale(1.0);
              resetPan();
            }}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Reset to 100%"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* File content */}
        <div className="h-full w-full">
          {fileType === 'image' && (
            <div 
              className="w-full h-full overflow-hidden"
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: getCursorStyle() }}
            >
              <div 
                className="relative w-full h-full flex items-center justify-center"
              >
                <img
                  src={fileUrl}
                  alt={file.name}
                  className="block max-w-full max-h-full object-contain"
                  style={getTransformStyle()}
                  draggable={false}
                />
              </div>
            </div>
          )}

          {fileType === 'pdf' && (
            <div className="p-4">
              {typeof window !== 'undefined' ? (
                <Document
                  file={fileUrl}
                  onLoadSuccess={handlePdfLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center h-32 text-red-500">
                      <p>Error loading PDF</p>
                    </div>
                  }
                >
                  {Array.from(new Array(pdfPages), (el, index) => (
                    <div key={`page_${index + 1}`} className="mb-4">
                      <Page
                        pageNumber={index + 1}
                        scale={scale}
                        loading={
                          <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                          </div>
                        }
                      />
                    </div>
                  ))}
                </Document>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>PDF preview loading...</p>
                </div>
              )}
            </div>
          )}

          {fileType === 'text' && (
            <div className="p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono bg-gray-50 p-4 rounded-lg overflow-auto max-h-[calc(80vh-120px)]">
                {textContent}
              </pre>
            </div>
          )}
        </div>

        {/* PDF pagination */}
        {fileType === 'pdf' && pdfPages && (
          <div className="flex items-center justify-center p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="mx-4 text-sm text-gray-600">
              Page {currentPage} of {pdfPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pdfPages))}
              disabled={currentPage >= pdfPages}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default FilePreviewer;
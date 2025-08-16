'use client';

import React, { useState, useEffect } from 'react';
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
  const [scale, setScale] = useState(externalScale); // Use external scale or default to 0
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    if (!file) return;

    // Reset scale to 0 (fit to container) for new files
    setScale(externalScale);

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
  }, [externalScale]);

  const handlePdfLoadSuccess = ({ numPages }) => {
    setPdfPages(numPages);
  };

  const handleZoomIn = () => {
    if (scale === 0) {
      setScale(0.5); // Start from 50% when zooming in from fit-to-container
    } else {
      setScale(prev => Math.min(prev + 0.2, 3.0));
    }
  };

  const handleZoomOut = () => {
    if (scale <= 0.5) {
      setScale(0); // Return to fit-to-container mode
    } else {
      setScale(prev => Math.max(prev - 0.2, 0.5));
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
          <p className="mt-2 text-sm text-red-500">Unsupported file format</p>
          <p className="text-xs text-red-400 mt-1">{file.name}</p>
        </div>
      </div>
    );
  }

  return (
    <>

      <div className={`h-full overflow-hidden border border-gray-200 rounded-lg bg-white ${className}`}>


      {/* File content */}
      <div className="h-full w-full">
        {fileType === 'image' && (
          <div 
            className="w-full h-full overflow-hidden"
          >
            <div 
              className="relative w-full h-full flex items-center justify-center"
            >
              <img
                src={fileUrl}
                alt={file.name}
                className="block max-w-full max-h-full object-contain"
                style={{ 
                  transform: `scale(${scale})`,
                  transformOrigin: 'center'
                }}
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

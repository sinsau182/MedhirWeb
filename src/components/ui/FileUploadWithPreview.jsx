'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import FilePreviewer from './FilePreviewer';

const FileUploadWithPreview = ({ 
  onFileChange, 
  acceptedFileTypes = '*',
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  className = '',
  placeholder = 'Choose a file or drag it here',
  showPreview = true,
  multiple = false
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [scale, setScale] = useState(1.0); // Default to 100% zoom
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size must be less than ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
    }

    // Check file type if specific types are specified
    if (acceptedFileTypes !== '*') {
      const acceptedTypes = acceptedFileTypes.split(',').map(type => type.trim());
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const fileType = file.type;
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.substring(1);
        } else if (type.includes('/')) {
          return fileType === type;
        } else {
          return fileExtension === type;
        }
      });
      
      if (!isAccepted) {
        return `File type not supported. Accepted types: ${acceptedFileTypes}`;
      }
    }

    return null;
  };

  const handleFileSelect = (file) => {
    setError('');
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    if (onFileChange) {
      onFileChange(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError('');
    setScale(0.7); // Reset scale to 70% when removing file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileChange) {
      onFileChange(null);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => {
      // Convert to percentage, round up to next 10% interval, then convert back to decimal
      const currentPercent = Math.ceil(prev * 100);
      const nextPercent = Math.min(currentPercent + 10, 300);
      return nextPercent / 100;
    });
  };

  const handleZoomOut = () => {
    setScale(prev => {
      // Convert to percentage, round down to previous 10% interval, then convert back to decimal
      const currentPercent = Math.floor(prev * 100);
      const nextPercent = Math.max(currentPercent - 10, 70);
      return nextPercent / 100;
    });
  };

  const getFileIcon = (file) => {
    if (!file) return <File className="h-8 w-8 text-gray-400" />;
    
    const type = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'bmp', 'tiff'].includes(extension)) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (type === 'application/pdf' || extension === 'pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (['text/plain', 'text/csv'].includes(type) || ['txt', 'csv'].includes(extension)) {
      return <FileText className="h-8 w-8 text-green-500" />;
    }
    
    return <File className="h-8 w-8 text-gray-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload Area - Only show when no file is selected */}
      {!selectedFile && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileInputChange}
            accept={acceptedFileTypes}
            multiple={multiple}
          />
          
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-600">{placeholder}</p>
            <p className="text-xs text-gray-500">
              {acceptedFileTypes === '*' 
                ? 'All file types supported' 
                : `Accepted types: ${acceptedFileTypes}`
              }
            </p>
            <p className="text-xs text-gray-500">
              Max file size: {formatFileSize(maxFileSize)}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* File Preview */}
      {showPreview && selectedFile && (
        <div className="relative">

          
          <FilePreviewer file={selectedFile} scale={scale} />
        </div>
      )}
    </div>
  );
};

export default FileUploadWithPreview;
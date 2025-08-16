'use client';

import React, { useState } from 'react';
import FilePreviewer from '../ui/FilePreviewer';
import FileUploadWithPreview from '../ui/FileUploadWithPreview';

const FilePreviewerExample = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileChange = (file) => {
    setUploadedFile(file);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">File Previewer Demo</h1>
        <p className="text-gray-600">
          Upload and preview various file types including images, PDFs, and text files
        </p>
      </div>

      {/* File Upload with Preview */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">File Upload with Preview</h2>
        <FileUploadWithPreview
          onFileChange={handleFileChange}
          acceptedFileTypes=".jpg,.jpeg,.png,.bmp,.tiff,.pdf,.txt,.csv"
          maxFileSize={20 * 1024 * 1024} // 20MB
          placeholder="Drag and drop files here or click to browse"
          showPreview={true}
        />
      </div>

      {/* Standalone File Previewer */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Standalone File Previewer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Select a File</h3>
            <input
              type="file"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              accept=".jpg,.jpeg,.png,.bmp,.tiff,.pdf,.txt,.csv"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>

          {/* File Preview */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Preview</h3>
            <FilePreviewer file={selectedFile} />
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Usage Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Usage */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Basic FilePreviewer</h4>
            <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
{`import FilePreviewer from './components/ui/FilePreviewer';

<FilePreviewer file={fileObject} />`}
            </pre>
          </div>

          {/* With Custom Styling */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">With Custom Styling</h4>
            <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
{`<FilePreviewer 
  file={fileObject} 
  className="border-2 border-blue-300" 
/>`}
            </pre>
          </div>

          {/* File Upload Component */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">FileUploadWithPreview</h4>
            <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
{`import FileUploadWithPreview from './components/ui/FileUploadWithPreview';

<FileUploadWithPreview
  onFileChange={handleFileChange}
  acceptedFileTypes=".jpg,.pdf,.txt"
  maxFileSize={10 * 1024 * 1024}
  showPreview={true}
/>`}
            </pre>
          </div>

          {/* Advanced Configuration */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Advanced Configuration</h4>
            <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
{`<FileUploadWithPreview
  onFileChange={handleFileChange}
  acceptedFileTypes="image/*,.pdf,.txt,.csv"
  maxFileSize={50 * 1024 * 1024}
  placeholder="Upload your documents here"
  showPreview={false}
  multiple={true}
/>`}
            </pre>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Image Support</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• JPG, JPEG, PNG, BMP, TIFF</li>
              <li>• Zoom in/out functionality</li>
              <li>• Responsive display</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">PDF Support</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Multi-page rendering</li>
              <li>• Zoom and scroll</li>
              <li>• Page navigation</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Text Support</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• TXT and CSV files</li>
              <li>• Proper line breaks</li>
              <li>• Scrollable content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewerExample;

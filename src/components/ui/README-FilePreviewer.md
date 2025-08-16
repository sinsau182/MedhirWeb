# File Previewer Components

This directory contains two React components for file handling and previewing:

## FilePreviewer

A comprehensive file preview component that supports multiple file types with zoom and scroll functionality.

### Features

- **Image Support**: JPG, JPEG, PNG, BMP, TIFF with zoom in/out using `react-medium-image-zoom`
- **PDF Support**: Multi-page rendering with zoom and scroll using `react-pdf`
- **Text Support**: TXT and CSV files displayed in scrollable pre-formatted blocks
- **Responsive Design**: Height limited to 80vh for consistent UI
- **File Information**: Displays filename, size, and type icon
- **Download Functionality**: Built-in download button for all file types

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `file` | File | null | File object from input or drag & drop |
| `className` | string | '' | Additional CSS classes |

### Usage

```jsx
import FilePreviewer from './components/ui/FilePreviewer';

function MyComponent() {
  const [file, setFile] = useState(null);
  
  return (
    <FilePreviewer file={file} />
  );
}
```

## FileUploadWithPreview

A wrapper component that combines file upload functionality with immediate preview using FilePreviewer.

### Features

- **Drag & Drop**: Support for drag and drop file uploads
- **File Validation**: Size and type validation with error messages
- **Multiple File Types**: Configurable accepted file types
- **File Size Limits**: Configurable maximum file size
- **Immediate Preview**: Shows file preview after selection
- **Responsive UI**: Adapts to different screen sizes

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onFileChange` | function | - | Callback when file changes |
| `acceptedFileTypes` | string | '*' | Comma-separated list of accepted file types |
| `maxFileSize` | number | 10MB | Maximum file size in bytes |
| `className` | string | '' | Additional CSS classes |
| `placeholder` | string | 'Choose a file or drag it here' | Upload area placeholder text |
| `showPreview` | boolean | true | Whether to show file preview |
| `multiple` | boolean | false | Allow multiple file selection |

### Usage

```jsx
import FileUploadWithPreview from './components/ui/FileUploadWithPreview';

function MyComponent() {
  const handleFileChange = (file) => {
    console.log('File selected:', file);
  };
  
  return (
    <FileUploadWithPreview
      onFileChange={handleFileChange}
      acceptedFileTypes=".jpg,.pdf,.txt"
      maxFileSize={5 * 1024 * 1024} // 5MB
      placeholder="Upload your documents here"
    />
  );
}
```

## File Type Support

### Images
- **Formats**: JPG, JPEG, PNG, BMP, TIFF
- **Features**: Zoom in/out, responsive display, no cropping
- **Dependencies**: `react-medium-image-zoom`

### PDFs
- **Features**: Multi-page rendering, zoom, scroll, page navigation
- **Dependencies**: `react-pdf`

### Text Files
- **Formats**: TXT, CSV
- **Features**: Proper line breaks, scrollable content, monospace font

## Dependencies

Make sure to install the required packages:

```bash
npm install react-medium-image-zoom react-pdf
```

## Example

See `src/components/examples/FilePreviewerExample.jsx` for a complete demonstration of both components.

## Styling

Both components use Tailwind CSS classes and can be customized using the `className` prop or by modifying the component source code.

## Browser Support

- Modern browsers with ES6+ support
- PDF.js worker loaded from CDN for PDF rendering
- File API support for drag & drop functionality

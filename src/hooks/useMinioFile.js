import { useDispatch } from 'react-redux';
import { fetchImageFromMinio, generatePresignedUrl } from '../redux/slices/minioSlice';
import { toast } from 'react-hot-toast';

export const useMinioFile = () => {
  const dispatch = useDispatch();

  const handleViewFile = async (url, fileName = null) => {
    try {
      // Try to generate pre-signed URL first (preferred method)
      try {
        const { presignedUrl } = await dispatch(generatePresignedUrl({ url, action: 'view' })).unwrap();
        const newWindow = window.open(presignedUrl, '_blank', 'noopener,noreferrer');
        if (newWindow) {
          newWindow.document.title = fileName || 'File Preview';
          newWindow.focus();
        }
      } catch (presignedError) {
        console.warn('Pre-signed URL generation failed, falling back to fetch method:', presignedError);
        // Fallback to the old method if pre-signed URL generation fails
        const { dataUrl } = await dispatch(fetchImageFromMinio({ url })).unwrap();
        const newWindow = window.open(dataUrl, '_blank', 'noopener,noreferrer');
        if (newWindow) {
          newWindow.document.title = fileName || 'File Preview';
          newWindow.focus();
        }
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      toast.error('Failed to open file. Please try again.');
    }
  };

  const handleDownloadFile = async (url, fileName = null) => {
    try {
      // Try to generate pre-signed URL first (preferred method)
      try {
        const { presignedUrl } = await dispatch(generatePresignedUrl({ url, action: 'download' })).unwrap();
        const a = document.createElement("a");
        a.href = presignedUrl;
        a.download = fileName || url.split("/").pop().split("?")[0];
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (presignedError) {
        console.warn('Pre-signed URL generation failed, falling back to fetch method:', presignedError);
        // Fallback to the old method if pre-signed URL generation fails
        const { dataUrl } = await dispatch(fetchImageFromMinio({ url })).unwrap();
        
        // Create a temporary link to download the file
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName || url.split("/").pop().split("?")[0];
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up blob URL
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  return {
    handleViewFile,
    handleDownloadFile,
  };
}; 
import React, { useState } from 'react';
import { useMinioImage } from '../../hooks/useMinioImage';

/**
 * MinioImage Component
 * A reusable component for displaying images from Minio storage
 */
const MinioImage = ({
  src,
  alt = '',
  className = '',
  style = {},
  fallbackSrc = '/placeholder-image.jpg', // Default placeholder
  loadingComponent = null,
  errorComponent = null,
  onClick = null,
  onLoad = null,
  onError = null,
  autoFetch = true,
  forceRefresh = false,
  showLoadingState = true,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use the Minio hook
  const { 
    dataUrl, 
    isLoading, 
    isCached, 
    error, 
    fetchImage 
  } = useMinioImage(src, { 
    autoFetch, 
    forceRefresh 
  });

  // Handle image load
  const handleImageLoad = (e) => {
    setImageLoaded(true);
    setImageError(false);
    onLoad?.(e);
  };

  // Handle image error
  const handleImageError = (e) => {
    setImageError(true);
    setImageLoaded(false);
    onError?.(e);
  };

  // Handle click
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (error && !isCached) {
      // Retry fetching if there's an error and image isn't cached
      fetchImage();
    }
  };

  // Determine what to display
  const displaySrc = imageError ? fallbackSrc : (dataUrl || src);
  const isActuallyLoading = isLoading && showLoadingState && !isCached;

  // Loading component
  if (isActuallyLoading && loadingComponent) {
    return loadingComponent;
  }

  // Error component
  if (error && !isCached && errorComponent) {
    return errorComponent;
  }

  // Default loading state
  if (isActuallyLoading) {
    return (
      <div 
        className={`minio-image-loading ${className}`}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          minHeight: '100px',
        }}
        {...props}
      >
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading image...</span>
        </div>
      </div>
    );
  }

  // Default error state
  if (error && !isCached) {
    return (
      <div 
        className={`minio-image-error ${className}`}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          minHeight: '100px',
          cursor: 'pointer',
        }}
        onClick={handleClick}
        {...props}
      >
        <div className="error-content">
          <span>Failed to load image</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              fetchImage();
            }}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={`minio-image ${className} ${imageLoaded ? 'loaded' : 'loading'}`}
      style={{
        ...style,
        opacity: imageLoaded ? 1 : 0.7,
        transition: 'opacity 0.3s ease',
      }}
      onLoad={handleImageLoad}
      onError={handleImageError}
      onClick={handleClick}
      {...props}
    />
  );
};

// Add some basic styles
const MinioImageStyles = () => (
  <style jsx>{`
    .minio-image-loading .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    
    .minio-image-loading .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .minio-image-error .error-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #666;
    }
    
    .minio-image.loaded {
      opacity: 1;
    }
    
    .minio-image.loading {
      opacity: 0.7;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}</style>
);

// Enhanced MinioImage with styles
const MinioImageWithStyles = (props) => (
  <>
    <MinioImageStyles />
    <MinioImage {...props} />
  </>
);

export default MinioImageWithStyles;
export { MinioImage }; 
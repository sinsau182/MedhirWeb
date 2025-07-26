import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import MinioImage from '../ui/MinioImage';
import { useMinioImage, useMinioImages } from '../../hooks/useMinioImage';
import { preloadImages, clearImageCache } from '../../redux/slices/minioSlice';

/**
 * Example component demonstrating Minio slice usage
 */
const MinioImageExample = () => {
  const dispatch = useDispatch();
  const [imageUrl, setImageUrl] = useState('');
  const [multipleUrls, setMultipleUrls] = useState([]);
  
  // Example Minio URLs (replace with your actual URLs)
  const exampleUrls = [
    'https://minio-dev.medhir.in/bucket1/image1.jpg',
    'https://minio-dev.medhir.in/bucket2/image2.png',
    'https://minio-dev.medhir.in/bucket3/image3.jpeg',
  ];

  // Using the hook for multiple images
  const { 
    images, 
    dataUrls, 
    loadingStates, 
    isLoading, 
    allCached,
    fetchImages 
  } = useMinioImages(exampleUrls);

  // Handle preload images
  const handlePreloadImages = () => {
    dispatch(preloadImages({ urls: exampleUrls }));
  };

  // Handle clear cache
  const handleClearCache = () => {
    dispatch(clearImageCache());
  };

  // Handle single image fetch
  const handleFetchSingleImage = () => {
    if (imageUrl) {
      // This will trigger the Minio slice to fetch the image
      // The MinioImage component will automatically use the cached result
    }
  };

  return (
    <div className="minio-example" style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>Minio Image Integration Example</h2>
      
      {/* Single Image Example */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Single Image Example</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Enter Minio image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button 
            onClick={handleFetchSingleImage}
            style={{ padding: '8px 16px', marginRight: '10px' }}
          >
            Fetch Image
          </button>
        </div>
        
        {imageUrl && (
          <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
            <h4>Image Preview:</h4>
            <MinioImage
              src={imageUrl}
              alt="Minio Image"
              style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
              fallbackSrc="/placeholder-image.jpg"
              onClick={() => console.log('Image clicked!')}
            />
          </div>
        )}
      </div>

      {/* Multiple Images Example */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Multiple Images Example</h3>
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={handlePreloadImages}
            disabled={isLoading}
            style={{ padding: '8px 16px', marginRight: '10px' }}
          >
            {isLoading ? 'Loading...' : 'Preload All Images'}
          </button>
          <button 
            onClick={handleClearCache}
            style={{ padding: '8px 16px', marginRight: '10px' }}
          >
            Clear Cache
          </button>
          <span style={{ marginLeft: '10px', color: allCached ? 'green' : 'orange' }}>
            {allCached ? 'All images cached' : 'Some images not cached'}
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {exampleUrls.map((url, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
              <h4>Image {index + 1}</h4>
              <MinioImage
                src={url}
                alt={`Minio Image ${index + 1}`}
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                fallbackSrc="/placeholder-image.jpg"
              />
              <div style={{ marginTop: '5px', fontSize: '12px' }}>
                Status: {loadingStates[url] ? 'Loading...' : (dataUrls[url] ? 'Loaded' : 'Not loaded')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Usage Example */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Advanced Usage Example</h3>
        <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
          <h4>Custom Loading Component:</h4>
          <MinioImage
            src={exampleUrls[0]}
            alt="Custom Loading Example"
            style={{ width: '200px', height: '150px', objectFit: 'cover' }}
            loadingComponent={
              <div style={{ 
                width: '200px', 
                height: '150px', 
                backgroundColor: '#f0f0f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px dashed #ccc'
              }}>
                <div>Custom Loading...</div>
              </div>
            }
            errorComponent={
              <div style={{ 
                width: '200px', 
                height: '150px', 
                backgroundColor: '#ffe6e6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px dashed #ff9999'
              }}>
                <div>Custom Error State</div>
              </div>
            }
          />
        </div>
      </div>

      {/* Cache Information */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Cache Information</h3>
        <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          <p><strong>Total Images:</strong> {exampleUrls.length}</p>
          <p><strong>Cached Images:</strong> {Object.keys(dataUrls).filter(url => dataUrls[url]).length}</p>
          <p><strong>Loading Images:</strong> {Object.values(loadingStates).filter(Boolean).length}</p>
          <p><strong>All Cached:</strong> {allCached ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* Usage Instructions */}
      <div style={{ backgroundColor: '#e6f3ff', padding: '15px', borderRadius: '4px' }}>
        <h3>How to Use</h3>
        <ol>
          <li><strong>Basic Usage:</strong> Simply use the MinioImage component with a Minio URL</li>
          <li><strong>Custom Hook:</strong> Use useMinioImage() for more control over image fetching</li>
          <li><strong>Multiple Images:</strong> Use useMinioImages() for handling multiple images</li>
          <li><strong>Preloading:</strong> Use preloadImages action to fetch multiple images at once</li>
          <li><strong>Cache Management:</strong> Use clearImageCache action to clear the image cache</li>
        </ol>
      </div>
    </div>
  );
};

export default MinioImageExample; 
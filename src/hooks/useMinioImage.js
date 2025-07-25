import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchImageFromMinio, 
  selectCachedImage, 
  selectIsImageCached, 
  selectMinioLoading, 
  selectMinioError 
} from '../redux/slices/minioSlice';

/**
 * Custom hook for handling Minio image operations
 * @param {string} imageUrl - The Minio image URL to fetch
 * @param {Object} options - Additional options
 * @param {boolean} options.autoFetch - Whether to automatically fetch the image (default: true)
 * @param {boolean} options.forceRefresh - Whether to force refresh even if cached (default: false)
 * @returns {Object} - Object containing image data and loading states
 */
export const useMinioImage = (imageUrl, options = {}) => {
  const { autoFetch = true, forceRefresh = false } = options;
  
  const dispatch = useDispatch();
  const [localLoading, setLocalLoading] = useState(false);
  
  // Selectors
  const cachedImage = useSelector(state => selectCachedImage(state, imageUrl));
  const isCached = useSelector(state => selectIsImageCached(state, imageUrl));
  const globalLoading = useSelector(selectMinioLoading);
  const error = useSelector(selectMinioError);
  
  // Fetch image function
  const fetchImage = useCallback(async () => {
    if (!imageUrl) return;
    
    setLocalLoading(true);
    try {
      await dispatch(fetchImageFromMinio({ url: imageUrl })).unwrap();
    } catch (err) {
      console.error('Failed to fetch image:', err);
      // Handle authentication errors specifically
      if (err?.response?.status === 401) {
        console.error('Authentication failed - please login again');
      }
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch, imageUrl]);
  
  // Auto-fetch effect
  useEffect(() => {
    if (autoFetch && imageUrl) {
      if (!isCached || forceRefresh) {
        fetchImage();
      }
    }
  }, [autoFetch, imageUrl, isCached, forceRefresh, fetchImage]);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  return {
    // Image data
    imageData: cachedImage,
    dataUrl: cachedImage?.dataUrl,
    blob: cachedImage?.blob,
    contentType: cachedImage?.contentType,
    
    // States
    isLoading: localLoading || globalLoading,
    isCached,
    error,
    
    // Actions
    fetchImage,
    refreshImage: () => fetchImage(),
  };
};

/**
 * Hook for handling multiple Minio images
 * @param {string[]} imageUrls - Array of Minio image URLs
 * @param {Object} options - Additional options
 * @returns {Object} - Object containing multiple image data
 */
export const useMinioImages = (imageUrls = [], options = {}) => {
  const { autoFetch = true } = options;
  
  const dispatch = useDispatch();
  const [loadingStates, setLoadingStates] = useState({});
  
  // Selectors for all images
  const imageData = useSelector(state => {
    const data = {};
    imageUrls.forEach(url => {
      data[url] = selectCachedImage(state, url);
    });
    return data;
  });
  
  const cachedStates = useSelector(state => {
    const states = {};
    imageUrls.forEach(url => {
      states[url] = selectIsImageCached(state, url);
    });
    return states;
  });
  
  const error = useSelector(selectMinioError);
  
  // Fetch multiple images
  const fetchImages = useCallback(async (urls = imageUrls) => {
    const newLoadingStates = {};
    urls.forEach(url => {
      newLoadingStates[url] = true;
    });
    setLoadingStates(newLoadingStates);
    
    try {
      const promises = urls.map(url => 
        dispatch(fetchImageFromMinio({ url })).unwrap()
      );
      
      await Promise.allSettled(promises);
    } catch (err) {
      console.error('Failed to fetch images:', err);
    } finally {
      setLoadingStates({});
    }
  }, [dispatch, imageUrls]);
  
  // Auto-fetch effect
  useEffect(() => {
    if (autoFetch && imageUrls.length > 0) {
      const uncachedUrls = imageUrls.filter(url => !cachedStates[url]);
      if (uncachedUrls.length > 0) {
        fetchImages(uncachedUrls);
      }
    }
  }, [autoFetch, imageUrls, cachedStates, fetchImages]);
  
  return {
    // Image data
    images: imageData,
    dataUrls: Object.fromEntries(
      Object.entries(imageData).map(([url, data]) => [url, data?.dataUrl])
    ),
    
    // States
    loadingStates,
    isLoading: Object.values(loadingStates).some(Boolean),
    cachedStates,
    allCached: Object.values(cachedStates).every(Boolean),
    error,
    
    // Actions
    fetchImages,
    fetchImage: (url) => fetchImages([url]),
  };
};

export default useMinioImage; 
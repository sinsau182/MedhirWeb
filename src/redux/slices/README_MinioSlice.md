# Minio Slice Documentation

## Overview

The Minio slice is a Redux slice that handles image fetching from Minio storage. It integrates with your Spring Boot controller (`ViewImageController`) to fetch images and provides caching, loading states, and error handling.

## Features

- **Image Caching**: Automatically caches fetched images in Redux state
- **Loading States**: Provides loading indicators during image fetch
- **Error Handling**: Graceful error handling with retry functionality
- **Multiple Images**: Support for fetching and managing multiple images
- **Memory Management**: Automatic cleanup of object URLs to prevent memory leaks
- **Custom Components**: Reusable MinioImage component with customizable loading/error states

## Integration with Your Controller

The slice integrates with your `ViewImageController` by making HTTP requests to the `/minio/fetch-image` endpoint with proper authentication:

```java
@GetMapping("/fetch-image")
public void fetchImage(@RequestParam("url") String url, HttpServletResponse response)
```

The slice sends the Minio URL as a query parameter along with the authentication token, and your controller:
1. Validates the authentication token
2. Extracts the bucket and object name from the URL
3. Streams the image from Minio
4. Returns the image data as a blob

## Usage Examples

### 1. Basic Usage with MinioImage Component

```jsx
import MinioImage from '../components/ui/MinioImage';

function MyComponent() {
  return (
    <MinioImage
      src="https://minio-dev.medhir.in/bucket1/image.jpg"
      alt="My Image"
      style={{ width: '200px', height: '150px' }}
      onClick={() => console.log('Image clicked!')}
    />
  );
}
```

### 2. Using the Custom Hook

```jsx
import { useMinioImage } from '../hooks/useMinioImage';

function MyComponent() {
  const { 
    dataUrl, 
    isLoading, 
    isCached, 
    error, 
    fetchImage 
  } = useMinioImage('https://minio-dev.medhir.in/bucket1/image.jpg');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <img 
      src={dataUrl} 
      alt="My Image" 
      style={{ width: '200px', height: '150px' }}
    />
  );
}
```

### 3. Multiple Images

```jsx
import { useMinioImages } from '../hooks/useMinioImage';

function MyComponent() {
  const urls = [
    'https://minio-dev.medhir.in/bucket1/image1.jpg',
    'https://minio-dev.medhir.in/bucket2/image2.png',
  ];

  const { 
    images, 
    dataUrls, 
    loadingStates, 
    isLoading, 
    allCached,
    fetchImages 
  } = useMinioImages(urls);

  return (
    <div>
      {urls.map((url, index) => (
        <div key={index}>
          <img 
            src={dataUrls[url]} 
            alt={`Image ${index}`}
            style={{ width: '100px', height: '75px' }}
          />
          <span>{loadingStates[url] ? 'Loading...' : 'Loaded'}</span>
        </div>
      ))}
    </div>
  );
}
```

### 4. Preloading Images

```jsx
import { useDispatch } from 'react-redux';
import { preloadImages } from '../redux/slices/minioSlice';

function MyComponent() {
  const dispatch = useDispatch();

  const handlePreload = () => {
    const urls = [
      'https://minio-dev.medhir.in/bucket1/image1.jpg',
      'https://minio-dev.medhir.in/bucket2/image2.png',
    ];
    dispatch(preloadImages({ urls }));
  };

  return (
    <button onClick={handlePreload}>
      Preload Images
    </button>
  );
}
```

### 5. Cache Management

```jsx
import { useDispatch } from 'react-redux';
import { clearImageCache, removeImageFromCache } from '../redux/slices/minioSlice';

function MyComponent() {
  const dispatch = useDispatch();

  const handleClearAll = () => {
    dispatch(clearImageCache());
  };

  const handleRemoveSpecific = (url) => {
    dispatch(removeImageFromCache(url));
  };

  return (
    <div>
      <button onClick={handleClearAll}>Clear All Cache</button>
      <button onClick={() => handleRemoveSpecific('https://minio-dev.medhir.in/bucket1/image.jpg')}>
        Remove Specific Image
      </button>
    </div>
  );
}
```

## API Reference

### MinioImage Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | - | Minio image URL (required) |
| `alt` | string | '' | Alt text for the image |
| `className` | string | '' | CSS class name |
| `style` | object | {} | Inline styles |
| `fallbackSrc` | string | '/placeholder-image.jpg' | Fallback image URL |
| `loadingComponent` | ReactNode | null | Custom loading component |
| `errorComponent` | ReactNode | null | Custom error component |
| `onClick` | function | null | Click handler |
| `onLoad` | function | null | Load event handler |
| `onError` | function | null | Error event handler |
| `autoFetch` | boolean | true | Auto-fetch image on mount |
| `forceRefresh` | boolean | false | Force refresh even if cached |
| `showLoadingState` | boolean | true | Show loading state |

### useMinioImage Hook

```jsx
const {
  imageData,      // Full image data object
  dataUrl,        // Data URL for the image
  blob,           // Blob object
  contentType,    // MIME type
  isLoading,      // Loading state
  isCached,       // Whether image is cached
  error,          // Error message
  fetchImage,     // Function to fetch image
  refreshImage,   // Function to refresh image
} = useMinioImage(imageUrl, options);
```

### useMinioImages Hook

```jsx
const {
  images,         // Object with all image data
  dataUrls,       // Object with data URLs
  loadingStates,  // Object with loading states
  isLoading,      // Overall loading state
  cachedStates,   // Object with cache states
  allCached,      // Whether all images are cached
  error,          // Error message
  fetchImages,    // Function to fetch multiple images
  fetchImage,     // Function to fetch single image
} = useMinioImages(imageUrls, options);
```

### Redux Actions

| Action | Description |
|--------|-------------|
| `fetchImageFromMinio({ url })` | Fetch single image |
| `preloadImages({ urls })` | Preload multiple images |
| `clearImageCache()` | Clear all cached images |
| `addImageToCache({ url, dataUrl, blob, contentType })` | Manually add image to cache |
| `removeImageFromCache(url)` | Remove specific image from cache |

### Redux Selectors

| Selector | Description |
|----------|-------------|
| `selectCachedImage(state, url)` | Get cached image data |
| `selectIsImageCached(state, url)` | Check if image is cached |
| `selectMinioLoading(state)` | Get global loading state |
| `selectMinioError(state)` | Get error state |
| `selectPreloadStatus(state)` | Get preload status |
| `selectPreloadProgress(state)` | Get preload progress |

## Configuration

The slice uses the API URL from your Next.js configuration:

```javascript
// next.config.mjs
const nextConfig = {
  publicRuntimeConfig: {
    apiURL: process.env.NEXT_PUBLIC_API_URL,
  },
};
```

The Minio endpoint is constructed as: `${apiURL}/minio/fetch-image`

## Error Handling

The slice handles various error scenarios:

1. **Network Errors**: Connection issues, timeouts
2. **Server Errors**: 4xx/5xx responses from your controller
3. **Invalid URLs**: Malformed Minio URLs
4. **Missing Images**: Images that don't exist in Minio

Error states are available in the Redux state and can be handled in components.

## Performance Considerations

1. **Caching**: Images are cached in Redux state to avoid repeated requests
2. **Memory Management**: Object URLs are automatically revoked when cache is cleared
3. **Batch Loading**: Use `preloadImages` for loading multiple images efficiently
4. **Lazy Loading**: Images are only fetched when needed (unless autoFetch is disabled)

## Best Practices

1. **Use MinioImage Component**: For simple image display with built-in loading/error states
2. **Use Custom Hooks**: For more control over image fetching and state management
3. **Preload Critical Images**: Use `preloadImages` for images that will be needed soon
4. **Handle Errors Gracefully**: Always provide fallback images and error states
5. **Clear Cache When Needed**: Clear cache when images are updated or to free memory

## Troubleshooting

### Common Issues

1. **Images not loading**: Check if the Minio URL is correct and accessible
2. **CORS errors**: Ensure your controller allows requests from your frontend domain
3. **Memory leaks**: Make sure to clear cache when components unmount
4. **Slow loading**: Consider preloading images or optimizing image sizes

### Debug Mode

Enable debug logging by checking the Redux DevTools or console for detailed error messages and state changes. 
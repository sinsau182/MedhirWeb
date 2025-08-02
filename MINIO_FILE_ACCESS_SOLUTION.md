# MinIO File Access Solution

## Problem Summary

The frontend was experiencing "Access Denied" errors when trying to view bill and purchase order attachments from the MinIO `bills` bucket. This occurred because the frontend was trying to access MinIO URLs directly without proper authentication.

## Root Cause

In `src/pages/account/vendor.js`, the attachment modal was using direct MinIO URLs:

```javascript
// ❌ Problematic code (line 843)
onClick={() => window.open(attachment, '_blank')}
```

This bypassed the authentication system and tried to access MinIO files directly, resulting in access denied errors.

## Solution Implemented

### 1. Created Reusable Hook (`src/hooks/useMinioFile.js`)

A new hook that provides authenticated file access methods:

```javascript
import { useMinioFile } from '../../hooks/useMinioFile';

const { handleViewFile, handleDownloadFile } = useMinioFile();

// Usage
handleViewFile(fileUrl, fileName);
handleDownloadFile(fileUrl, fileName);
```

### 2. Updated MinIO Slice (`src/redux/slices/minioSlice.js`)

Added new functionality for pre-signed URL generation:

- `generatePresignedUrl` thunk for generating authenticated URLs
- Proper error handling and fallback mechanisms
- Support for both viewing and downloading actions

### 3. Fixed Vendor Page (`src/pages/account/vendor.js`)

Updated the attachment modal to use authenticated file access:

```javascript
// ✅ Fixed code
onClick={() => handleViewFile(attachment, fileName)}
onClick={() => handleDownloadFile(attachment, fileName)}
```

### 4. Backend API Specification (`BACKEND_API_SPECIFICATION.md`)

Created a comprehensive specification for the backend team to implement pre-signed URL generation.

## Key Features

### Graceful Fallback System

The solution includes a fallback mechanism:

1. **Primary Method**: Try to generate pre-signed URL (preferred)
2. **Fallback Method**: Use existing `fetchImageFromMinio` if pre-signed URL fails
3. **Error Handling**: Proper error messages and user feedback

### Security Benefits

- **Authentication**: All file access goes through proper authentication
- **Authorization**: Backend can implement access control per file
- **Audit Trail**: File access can be logged and monitored
- **Time-Limited Access**: Pre-signed URLs expire automatically

### Performance Benefits

- **Direct Access**: Pre-signed URLs allow direct browser access
- **Reduced Server Load**: No need to proxy file content through backend
- **Better User Experience**: Faster file loading and preview

## Files Modified

### Frontend Changes

1. **`src/hooks/useMinioFile.js`** (NEW)
   - Reusable hook for MinIO file operations
   - Handles both viewing and downloading
   - Includes fallback mechanisms

2. **`src/redux/slices/minioSlice.js`** (UPDATED)
   - Added `generatePresignedUrl` thunk
   - Added reducer cases for pre-signed URL handling
   - Maintains backward compatibility

3. **`src/pages/account/vendor.js`** (UPDATED)
   - Imported and used `useMinioFile` hook
   - Updated attachment modal to use authenticated access
   - Fixed the specific issue causing access denied errors

### Backend Requirements

4. **`BACKEND_API_SPECIFICATION.md`** (NEW)
   - Complete API specification for pre-signed URL generation
   - Implementation example in Node.js/Express
   - Security considerations and testing guidelines

## Testing

### Test Cases

1. **Valid File Access**
   - User with proper permissions can view/download files
   - Pre-signed URLs work correctly
   - Fallback mechanism works when pre-signed URL fails

2. **Invalid File Access**
   - Users without permissions get proper error messages
   - Access denied scenarios are handled gracefully

3. **Different File Types**
   - PDF files open correctly in browser
   - Images display properly
   - Large files download successfully

4. **Error Scenarios**
   - Network failures are handled
   - Invalid URLs show appropriate errors
   - Expired URLs are handled gracefully

## Migration Plan

### Phase 1: Backend Implementation
- [ ] Implement pre-signed URL generation endpoint
- [ ] Add proper authentication and authorization
- [ ] Test with various file types and sizes

### Phase 2: Frontend Integration
- [x] Create reusable hook for file operations
- [x] Update vendor page to use authenticated access
- [ ] Test all file viewing/downloading scenarios

### Phase 3: Rollout
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Monitor for any issues

### Phase 4: Cleanup (Optional)
- [ ] Remove old `fetch-image` endpoint if no longer needed
- [ ] Update documentation

## Usage Examples

### Basic File Viewing

```javascript
import { useMinioFile } from '../../hooks/useMinioFile';

const MyComponent = () => {
  const { handleViewFile } = useMinioFile();
  
  const handleViewAttachment = (fileUrl) => {
    handleViewFile(fileUrl, 'document.pdf');
  };
  
  return (
    <button onClick={() => handleViewAttachment(fileUrl)}>
      View File
    </button>
  );
};
```

### File Downloading

```javascript
const { handleDownloadFile } = useMinioFile();

const handleDownloadAttachment = (fileUrl) => {
  handleDownloadFile(fileUrl, 'document.pdf');
};
```

## Monitoring and Debugging

### Console Logs

The solution includes helpful console logs:

- `Pre-signed URL generation failed, falling back to fetch method` - When fallback occurs
- `Failed to open file` - When both methods fail
- `Failed to download file` - When download fails

### Error Handling

All errors are caught and displayed to users via toast notifications, ensuring a good user experience even when things go wrong.

## Security Considerations

1. **Authentication**: All requests include JWT tokens
2. **Authorization**: Backend validates file access permissions
3. **URL Validation**: Prevents directory traversal attacks
4. **Time Limits**: Pre-signed URLs expire automatically
5. **Audit Logging**: File access can be logged for security monitoring

## Next Steps

1. **Backend Team**: Implement the pre-signed URL generation endpoint
2. **Frontend Team**: Test the updated file access functionality
3. **DevOps Team**: Monitor for any performance or security issues
4. **QA Team**: Test all file access scenarios thoroughly

## Support

If you encounter any issues:

1. Check browser console for error messages
2. Verify that the backend pre-signed URL endpoint is working
3. Ensure user has proper permissions for the requested files
4. Check network connectivity and authentication status 
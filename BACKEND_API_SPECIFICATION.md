# Backend API Specification: MinIO Pre-signed URL Generation

## Problem Statement
Currently, the frontend is experiencing "Access Denied" errors when trying to view bill and purchase order attachments from the MinIO `bills` bucket. The issue occurs because the frontend is trying to access MinIO URLs directly without proper authentication.

## Solution: Pre-signed URL Generation

### New API Endpoint

**Endpoint:** `POST /api/minio/generate-presigned-url`

**Request Body:**
```json
{
  "fileUrl": "https://minio-dev.medhir.in/bills/VID1950539908988932096/341828520126717952_thumb.pdf",
  "action": "view" // or "download"
}
```

**Response:**
```json
{
  "success": true,
  "presignedUrl": "https://minio-dev.medhir.in/bills/VID1950539908988932096/341828520126717952_thumb.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  "expiresIn": 3600 // seconds
}
```

### Implementation Details

1. **Authentication:** The endpoint should verify the user's JWT token and ensure they have permission to access the requested file.

2. **URL Validation:** Validate that the requested file URL belongs to the authenticated user's company/context.

3. **Pre-signed URL Generation:** Use MinIO's pre-signed URL functionality with appropriate expiration time (recommended: 1 hour for viewing, 15 minutes for downloads).

4. **Security Considerations:**
   - Validate file paths to prevent directory traversal attacks
   - Ensure users can only access files they have permission to view
   - Log all file access attempts for audit purposes

### Example Implementation (Node.js/Express)

```javascript
const AWS = require('aws-sdk');
const { promisify } = require('util');

// Configure MinIO client
const minioClient = new AWS.S3({
  endpoint: process.env.MINIO_ENDPOINT,
  accessKeyId: process.env.MINIO_ACCESS_KEY,
  secretAccessKey: process.env.MINIO_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

app.post('/api/minio/generate-presigned-url', authenticateToken, async (req, res) => {
  try {
    const { fileUrl, action } = req.body;
    
    // Validate file URL
    if (!fileUrl || !fileUrl.includes('minio-dev.medhir.in/bills/')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid file URL' 
      });
    }
    
    // Extract bucket and key from URL
    const urlParts = fileUrl.replace('https://minio-dev.medhir.in/', '').split('/');
    const bucketName = urlParts[0];
    const key = urlParts.slice(1).join('/');
    
    // Verify user has access to this file (implement your access control logic)
    const hasAccess = await verifyFileAccess(req.user, bucketName, key);
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }
    
    // Generate pre-signed URL
    const expiresIn = action === 'download' ? 900 : 3600; // 15 min for download, 1 hour for view
    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn
    };
    
    const presignedUrl = await minioClient.getSignedUrlPromise('getObject', params);
    
    res.json({
      success: true,
      presignedUrl,
      expiresIn
    });
    
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate pre-signed URL' 
    });
  }
});

async function verifyFileAccess(user, bucketName, key) {
  // Implement your access control logic here
  // This should verify that the user has permission to access this specific file
  // You might check if the file belongs to the user's company, project, etc.
  return true; // Placeholder
}
```

### Updated Frontend Integration

The frontend will be updated to use this new endpoint instead of the current `fetch-image` endpoint for file viewing and downloading.

### Migration Plan

1. **Phase 1:** Implement the new pre-signed URL endpoint
2. **Phase 2:** Update frontend to use the new endpoint for file viewing
3. **Phase 3:** Update frontend to use the new endpoint for file downloading
4. **Phase 4:** Remove the old `fetch-image` endpoint (optional, for cleanup)

### Testing

Test cases should include:
- Valid file access with proper authentication
- Invalid file access (should be denied)
- Expired pre-signed URLs
- Different file types (PDF, images, etc.)
- Large file downloads
- Concurrent access to the same file

### Security Notes

- Pre-signed URLs should have appropriate expiration times
- Implement rate limiting to prevent abuse
- Log all file access for audit purposes
- Consider implementing file access analytics 
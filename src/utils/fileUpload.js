/**
 * Upload a file as base64 to Firestore (no Firebase Storage needed)
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (for organization only)
 * @param {function} onProgress - Callback for upload progress (percentage)
 * @returns {Promise<{success: boolean, url?: string, fileName?: string, error?: string}>}
 */
export const uploadFile = async (file, path, onProgress = null) => {
  try {
    // Validate file size (max 5MB for base64 storage)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 5MB' };
    }

    // Convert file to base64
    const base64Data = await fileToBase64(file);

    if (onProgress) {
      onProgress(100); // Instant upload since it's local
    }

    return {
      success: true,
      url: base64Data, // Store base64 data as URL
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storagePath: `${path}/${file.name}`, // Virtual path for organization
    };
  } catch (error) {
    console.error('Upload file error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Convert file to base64 string
 * @param {File} file
 * @returns {Promise<string>}
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Delete a file (no-op for base64, just for API compatibility)
 * @param {string} storagePath - The storage path of the file
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFile = async (storagePath) => {
  // For base64 storage, files are deleted when removed from Firestore
  return { success: true };
};

/**
 * Get file icon based on file type
 * @param {string} fileType - MIME type of the file
 * @returns {string} - Icon name
 */
export const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return 'Image';
  if (fileType.startsWith('video/')) return 'Video';
  if (fileType.startsWith('audio/')) return 'Music';
  if (fileType.includes('pdf')) return 'FileText';
  if (fileType.includes('word') || fileType.includes('document')) return 'FileText';
  if (fileType.includes('sheet') || fileType.includes('excel')) return 'FileSpreadsheet';
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'FilePresentation';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed')) return 'Archive';
  return 'File';
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate file type for upload
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types or extensions
 * @returns {boolean}
 */
export const validateFileType = (file, allowedTypes = []) => {
  if (allowedTypes.length === 0) return true; // Allow all if no restrictions

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileName.endsWith(type);
    }
    return fileType.includes(type);
  });
};

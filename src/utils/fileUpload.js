/**
 * Sanitize filename to prevent path traversal and injection attacks
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
const sanitizeFilename = (filename) => {
  // Remove path traversal attempts and dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Only allow alphanumeric, dots, underscores, hyphens
    .replace(/\.{2,}/g, '.') // Remove multiple consecutive dots
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
};

/**
 * Validate file MIME type against common malicious types
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file type is safe
 */
const isValidFileType = (file) => {
  // Block potentially dangerous file types
  const dangerousTypes = [
    'application/x-msdownload', // .exe
    'application/x-sh', // shell scripts
    'application/x-php', // PHP files
    'text/x-python', // Python scripts
    'application/javascript', // JS files (could be malicious)
    'application/x-executable',
    'application/x-sharedlib',
  ];

  const dangerousExtensions = /\.(exe|bat|cmd|sh|php|py|js|vbs|msi|app|deb|rpm)$/i;

  if (dangerousTypes.includes(file.type)) {
    return false;
  }

  if (dangerousExtensions.test(file.name)) {
    return false;
  }

  return true;
};

/**
 * Upload a file as base64 to Firestore (no Firebase Storage needed)
 * @param {File} file - The file to upload
 * @param {function} onProgress - Callback for upload progress (percentage)
 * @returns {Promise<{success: boolean, file?: object, error?: string}>}
 */
export const uploadFile = async (file, onProgress = null) => {
  try {
    // Validate file type for security
    if (!isValidFileType(file)) {
      return { success: false, error: 'File type not allowed for security reasons' };
    }

    // Validate file size (max 2MB to prevent Firestore document size issues)
    // Base64 encoding increases size by ~33%, and Firestore has 1MB limit per document
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 2MB' };
    }

    // Sanitize filename
    const sanitizedName = sanitizeFilename(file.name);

    // Convert file to base64
    const base64Data = await fileToBase64(file);

    if (onProgress) {
      onProgress(100); // Instant upload since it's local
    }

    return {
      success: true,
      file: {
        url: base64Data,
        name: sanitizedName,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      }
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

/**
 * Calculate total size of attachments array (including base64 overhead)
 * Estimates the final Firestore document size for attachments
 * @param {Array} attachments - Array of attachment objects with url property
 * @returns {number} Total size in bytes
 */
export const calculateAttachmentsSize = (attachments) => {
  if (!attachments || !Array.isArray(attachments)) return 0;

  return attachments.reduce((total, attachment) => {
    if (attachment && attachment.url) {
      // Calculate size of the base64 data URL string
      const urlSize = new Blob([attachment.url]).size;
      // Add overhead for other properties (name, type, size, uploadedAt)
      const metadataOverhead = 200; // Conservative estimate for JSON properties
      return total + urlSize + metadataOverhead;
    }
    return total;
  }, 0);
};

/**
 * Validate that attachments array won't exceed Firestore document size limit
 * Firestore has 1MB (1,048,576 bytes) limit per document
 * @param {Array} attachments - Array of attachment objects
 * @param {number} safeThreshold - Safe size limit in bytes (default 700KB to allow room for other fields)
 * @returns {Object} {valid: boolean, size: number, maxSize: number, message: string}
 */
export const validateAttachmentsSize = (attachments, safeThreshold = 700 * 1024) => {
  const totalSize = calculateAttachmentsSize(attachments);
  const valid = totalSize <= safeThreshold;

  return {
    valid,
    size: totalSize,
    maxSize: safeThreshold,
    message: valid
      ? 'Attachments size is acceptable'
      : `Total attachment size (${formatFileSize(totalSize)}) exceeds safe limit (${formatFileSize(safeThreshold)}). Please upload fewer files or compress images.`
  };
};

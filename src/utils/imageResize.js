/**
 * Resize image to optimal resolution (70% of original)
 * @param {File} file - The image file to resize
 * @param {number} quality - Quality percentage (default 0.7 for 70%)
 * @returns {Promise<File>} - Resized image file
 */
export const resizeImage = async (file, quality = 0.7) => {
  // Only process image files
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (70% of original)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const targetWidth = Math.floor(img.width * quality);
        const targetHeight = Math.floor(img.height * quality);
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            
            // Create new file from blob
            const resizedFile = new File(
              [blob],
              file.name,
              {
                type: file.type,
                lastModified: Date.now()
              }
            );
            
            resolve(resizedFile);
          },
          file.type,
          quality // JPEG/WebP quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Resize multiple images
 * @param {File[]} files - Array of image files to resize
 * @param {number} quality - Quality percentage (default 0.7 for 70%)
 * @returns {Promise<File[]>} - Array of resized image files
 */
export const resizeImages = async (files, quality = 0.7) => {
  const resizePromises = files.map(file => resizeImage(file, quality));
  return Promise.all(resizePromises);
};

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

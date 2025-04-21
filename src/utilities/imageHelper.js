// utilities/imageHelper.js

/**
 * Generates the correct image URL for book covers
 * @param {string} coverImage - The image path from the API
 * @returns {string} - The complete URL to the image
 */
export const getBookCoverUrl = (coverImage) => {
    // Backend URL (would be better from environment variables)
    const backendUrl = 'http://localhost:5001';
    
    // Handle default or missing cover
    if (!coverImage || coverImage === 'default-book-cover.jpg') {
      return '/img/default-book-cover.jpg';
    }
    
    // Check if the path already includes the full URL
    if (coverImage.startsWith('http')) {
      return coverImage;
    }
    
    // Check if the path includes '/uploads' or similar patterns
    if (coverImage.includes('/uploads')) {
      return `${backendUrl}${coverImage}`;
    }
    
    // Check if it's a relative path to a covers directory
    if (coverImage.includes('/covers/')) {
      return `${backendUrl}${coverImage}`;
    }
    
    // If it's just a filename, assume it's in the covers directory
    if (!coverImage.includes('/')) {
      return `${backendUrl}/direct-file/covers/${coverImage}`;
    }
    
    // Default fallback - just return the path as provided
    return coverImage;
  };
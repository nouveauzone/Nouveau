import API from '../config/api';

const FALLBACK = '/product1.jpeg';

// Images that don't exist on server - use fallback
const BROKEN_IMAGES = ['ethnic1.jpeg', 'ethnic1.jpg'];

const isBrokenImage = (url) => {
  if (!url) return true;
  return BROKEN_IMAGES.some(bad => url.includes(bad));
};

export const fixImageUrl = (url) => {
  if (!url) return FALLBACK;

  // Handled nested arrays occasionally passed down as single elements
  let targetUrl = url;
  if (Array.isArray(url)) {
    targetUrl = url[0];
  }
  if (typeof targetUrl !== 'string' || !targetUrl) {
    return FALLBACK;
  }

  // If it's a known broken/missing image, return fallback immediately
  if (isBrokenImage(targetUrl)) {
    return FALLBACK;
  }

  // If it's a full URL to the production server, return as-is (the backend serves /uploads directly)
  if (targetUrl.startsWith('http') && !targetUrl.includes('localhost')) {
    return targetUrl;
  }

  // Directly point to the uploads directory (served by backend at /uploads/)
  if (targetUrl.includes('/uploads/')) {
    const cleanPath = targetUrl.split('/uploads/')[1];
    if (cleanPath) {
      return `/uploads/${cleanPath}`;
    }
  }

  // Catch relative edge cases like "uploads/..."
  if (targetUrl.startsWith('uploads/')) {
    const cleanPath = targetUrl.replace(/^uploads\//, '');
    return `/uploads/${cleanPath}`;
  }

  // If it's a plain filename without directory (bare filename)
  if (!targetUrl.startsWith('/') && !targetUrl.startsWith('http')) {
    return `/uploads/${targetUrl}`;
  }

  return targetUrl;
};

// Aliases in case something still relies on the old names temporarily
export const resolveImageUrl = fixImageUrl;
export const getImageUrl = fixImageUrl;
import API_URL from "../config/api";

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

  if (targetUrl.startsWith('data:') || targetUrl.startsWith('blob:')) {
    return targetUrl;
  }

  // If it's a full URL to the production server, return as-is (the backend serves /uploads directly)
  if (targetUrl.startsWith('http') && !targetUrl.includes('localhost')) {
    return targetUrl;
  }

  const envUploadsBase = String(process.env.REACT_APP_UPLOADS_BASE_URL || '').trim().replace(/\/+$/, '');
  const apiUploadsBase = String(API_URL || '').trim().replace(/\/+$/, '');
  const uploadsBase = envUploadsBase || apiUploadsBase;

  if (uploadsBase) {
    if (targetUrl.includes('/uploads/')) {
      const cleanPath = targetUrl.split('/uploads/')[1];
      if (cleanPath) return `${uploadsBase}/uploads/${cleanPath}`;
    }

    if (targetUrl.startsWith('uploads/')) {
      const cleanPath = targetUrl.replace(/^uploads\//, '');
      return `${uploadsBase}/uploads/${cleanPath}`;
    }

    if (!targetUrl.startsWith('/') && !targetUrl.startsWith('http')) {
      return `${uploadsBase}/uploads/${targetUrl}`;
    }
  }

  return targetUrl;
};

// Aliases in case something still relies on the old names temporarily
export const resolveImageUrl = fixImageUrl;
export const getImageUrl = fixImageUrl;
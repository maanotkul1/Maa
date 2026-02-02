// Utility untuk lazy load images dan assets
export const createLazyImageLoader = (src, alt = '') => {
  return {
    src,
    alt,
    loading: 'lazy',
    decoding: 'async'
  };
};

// Preload critical images untuk Login page
export const preloadLoginAssets = () => {
  if (typeof window !== 'undefined') {
    // Preload logo
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = '/retina-bnet-1.png';
    document.head.appendChild(link);
  }
};

// Request idle callback untuk defer non-critical resources
export const deferNonCritical = (callback) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
};

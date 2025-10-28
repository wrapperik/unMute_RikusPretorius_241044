// Simple GA4 helper for gtag.js
export const GA_ID = 'G-PPVS8W04SY';

// Send a page_view for SPA route changes
export const pageview = (path) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_ID, { page_path: path });
  }
};

// Generic event helper: { action: 'click', params: { ... } }
export const event = ({ action, params }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
  }
};

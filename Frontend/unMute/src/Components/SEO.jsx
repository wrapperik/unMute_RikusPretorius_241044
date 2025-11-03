import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component for dynamic page titles and meta tags
 * Updates document title and meta tags based on current page
 * 
 * Usage:
 * <SEO 
 *   title="Page Title" 
 *   description="Page description"
 *   keywords="keyword1, keyword2"
 *   image="/path-to-image.png"
 * />
 */

export default function SEO({ 
  title = 'unMute - Breaking the Silence on Men\'s Mental Health',
  description = 'A safe, judgment-free platform where men can share their stories, connect anonymously, and access mental health resources.',
  keywords = 'men\'s mental health, anonymous support, mental wellness, emotional support',
  image = '/unmute.png',
  url = ''
}) {
  const location = useLocation();
  const currentUrl = url || `https://www.unmute.digital${location.pathname}`;
  const fullTitle = title.includes('unMute') ? title : `${title} | unMute`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (property, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Update meta description
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:image', `https://www.unmute.digital${image}`, true);

    // Update Twitter Card tags
    updateMetaTag('twitter:title', fullTitle, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:url', currentUrl, true);
    updateMetaTag('twitter:image', `https://www.unmute.digital${image}`, true);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

  }, [fullTitle, description, keywords, image, currentUrl]);

  return null;
}

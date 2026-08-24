import { useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import officialLogoFallback from '../images/official_logo.jpg';

let currentLogoUrl: string | null = null;
const logoListeners: Array<(url: string | null) => void> = [];

function updateDOMMetaTags(logoUrl: string) {
  if (typeof window === 'undefined') return;

  try {
    const fullUrl = logoUrl.startsWith('http') ? logoUrl : new URL(logoUrl, window.location.origin).href;

    // Update Open Graph tags
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', fullUrl);

    const ogSecureImage = document.querySelector('meta[property="og:image:secure_url"]');
    if (ogSecureImage) ogSecureImage.setAttribute('content', fullUrl);

    // Update Twitter Card tags
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', fullUrl);

    // Update Favicon & Apple Touch Icons
    const iconLink = document.querySelector('link[rel="icon"]');
    if (iconLink) iconLink.setAttribute('href', fullUrl);

    const shortcutIcon = document.querySelector('link[rel="shortcut icon"]');
    if (shortcutIcon) shortcutIcon.setAttribute('href', fullUrl);

    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (appleTouchIcon) appleTouchIcon.setAttribute('href', fullUrl);
  } catch (err) {
    console.warn('Failed to update meta tags:', err);
  }
}

// Initialize real-time listener for app logo settings
let initialized = false;

function initLogoListener() {
  if (initialized) return;
  initialized = true;

  try {
    onSnapshot(
      doc(db, 'adminSettings', 'default'),
      (snap) => {
        if (snap.exists() && snap.data().appLogoUrl) {
          currentLogoUrl = snap.data().appLogoUrl;
        } else {
          currentLogoUrl = null;
        }
        const activeUrl = currentLogoUrl || officialLogoFallback;
        updateDOMMetaTags(activeUrl);
        logoListeners.forEach((listener) => listener(currentLogoUrl));
      },
      (err) => {
        console.warn('Logo settings listener warn:', err);
        updateDOMMetaTags(officialLogoFallback);
      }
    );
  } catch (err) {
    console.warn('Firestore not ready for logo listener:', err);
    updateDOMMetaTags(officialLogoFallback);
  }
}

/**
 * Subscribe to real-time changes of the custom logo URL.
 */
export function subscribeToAppLogo(callback: (url: string | null) => void): () => void {
  initLogoListener();
  logoListeners.push(callback);
  callback(currentLogoUrl);

  return () => {
    const idx = logoListeners.indexOf(callback);
    if (idx >= 0) {
      logoListeners.splice(idx, 1);
    }
  };
}

/**
 * React hook to get the current App Logo URL with automatic fallback to officialLogo.
 */
export function useAppLogo(): { logoUrl: string; isCustomLogo: boolean; defaultLogo: string } {
  const [customUrl, setCustomUrl] = useState<string | null>(currentLogoUrl);

  useEffect(() => {
    const unsub = subscribeToAppLogo((url) => {
      setCustomUrl(url);
    });
    return () => unsub();
  }, []);

  const logoUrl = customUrl || officialLogoFallback;
  return {
    logoUrl,
    isCustomLogo: !!customUrl,
    defaultLogo: officialLogoFallback,
  };
}

export { officialLogoFallback };

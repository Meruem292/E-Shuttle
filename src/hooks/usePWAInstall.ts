import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global variable to capture prompt event immediately if it fires before React mounts
declare global {
  interface Window {
    __PWA_DEFERRED_PROMPT__?: BeforeInstallPromptEvent | null;
  }
}

// Listen globally immediately at module load
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    window.__PWA_DEFERRED_PROMPT__ = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });
}

export type PlatformType = 'ios' | 'android' | 'desktop-chrome' | 'desktop-safari' | 'desktop-other';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    return typeof window !== 'undefined' ? window.__PWA_DEFERRED_PROMPT__ || null : null;
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);
  const [platform, setPlatform] = useState<PlatformType>('android');
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  useEffect(() => {
    // Check if running inside iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // Detect Platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);
    const isMacOrWin = /macintosh|mac os x|windows|cros|linux/.test(ua) && !isIosDevice && !isAndroidDevice;

    if (isIosDevice) {
      setPlatform('ios');
    } else if (isAndroidDevice) {
      setPlatform('android');
    } else if (isMacOrWin && (ua.includes('chrome') || ua.includes('edg') || ua.includes('brave') || ua.includes('opr'))) {
      setPlatform('desktop-chrome');
    } else if (isMacOrWin && ua.includes('safari') && !ua.includes('chrome')) {
      setPlatform('desktop-safari');
    } else {
      setPlatform('desktop-other');
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__PWA_DEFERRED_PROMPT__ = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handlePromptReady = () => {
      if (window.__PWA_DEFERRED_PROMPT__) {
        setDeferredPrompt(window.__PWA_DEFERRED_PROMPT__);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__PWA_DEFERRED_PROMPT__ = null;
      setShowInstallModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async (): Promise<'accepted' | 'dismissed' | 'modal_opened'> => {
    const prompt = deferredPrompt || window.__PWA_DEFERRED_PROMPT__;

    if (prompt) {
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          window.__PWA_DEFERRED_PROMPT__ = null;
          setShowInstallModal(false);
          return 'accepted';
        } else {
          return 'dismissed';
        }
      } catch (err) {
        console.error('Error triggering PWA prompt:', err);
        setShowInstallModal(true);
        return 'modal_opened';
      }
    } else {
      // If prompt event is not directly available (e.g. iOS Safari, iframe, desktop browser before trigger, etc.)
      setShowInstallModal(true);
      return 'modal_opened';
    }
  }, [deferredPrompt]);

  return {
    deferredPrompt: deferredPrompt || window.__PWA_DEFERRED_PROMPT__ || null,
    canInstall: !isInstalled,
    isInstalled,
    isInIframe,
    platform,
    showInstallModal,
    setShowInstallModal,
    installApp,
  };
}

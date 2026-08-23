import React, { useState } from 'react';
import { usePWAInstall, PlatformType } from '../hooks/usePWAInstall';
import { useBackHandler } from '../contexts/NativeBackContext';
import {
  Download,
  Smartphone,
  X,
  CheckCircle2,
  Share2,
  PlusSquare,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Monitor,
  Globe,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';

import officialLogo from '../images/official_logo.jpg';

interface PWAInstallButtonProps {
  variant?: 'banner' | 'button' | 'compact' | 'floating';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const {
    deferredPrompt,
    isInstalled,
    isInIframe,
    platform,
    showInstallModal,
    setShowInstallModal,
    installApp,
  } = usePWAInstall();

  // Native back handler for install guide modal
  useBackHandler(
    showInstallModal,
    () => {
      setShowInstallModal(false);
      return true;
    },
    25,
    'pwa-install-modal'
  );

  const [installing, setInstalling] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  if (isInstalled) {
    if (variant === 'compact') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 shadow-sm">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>App Installed</span>
        </span>
      );
    }
    return null;
  }

  if (dismissed && variant === 'banner') {
    return null;
  }

  const handleInstallClick = async () => {
    setInstalling(true);
    const result = await installApp();
    setInstalling(false);
    if (result === 'accepted') {
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 4000);
    }
  };

  // 1. Floating / Banner Prominent Top Prompt
  if (variant === 'banner') {
    return (
      <>
        <div className={`z-50 bg-[#0D47A1] text-white shadow-2xl border-b border-blue-400/30 px-3.5 py-2.5 flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300 ${className}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={officialLogo}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/official_logo.jpg';
              }}
              alt="E-Shuttle Official Logo"
              className="w-9 h-9 rounded-xl object-cover border border-white/30 shrink-0 shadow-md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs tracking-tight text-white uppercase">Install E-Shuttle App</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Official
                </span>
              </div>
              <p className="text-[10px] text-blue-100 truncate">
                Install to device home screen for fast 1-tap rides!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="bg-white text-blue-900 hover:bg-blue-50 active:scale-95 text-xs font-black px-3.5 py-1.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-700 animate-bounce" />
              <span>{installing ? 'Installing...' : 'Install App'}</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-blue-200 hover:text-white rounded-lg cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Multi-Platform Install Guide Modal */}
        {showInstallModal && (
          <PWAInstallModal
            platform={platform}
            isInIframe={isInIframe}
            deferredPrompt={deferredPrompt}
            onClose={() => setShowInstallModal(false)}
          />
        )}
      </>
    );
  }

  // 2. Compact Pill Button (for headers or profile cards)
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          disabled={installing}
          className={`bg-[#0D47A1] hover:bg-[#1565C0] text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-lg border border-white/20 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-300" />
          <span>Install App</span>
        </button>

        {showInstallModal && (
          <PWAInstallModal
            platform={platform}
            isInIframe={isInIframe}
            deferredPrompt={deferredPrompt}
            onClose={() => setShowInstallModal(false)}
          />
        )}
      </>
    );
  }

  // 3. Full Button (Standard Component)
  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={installing}
        className={`w-full bg-[#0D47A1] hover:bg-[#1565C0] active:scale-98 text-white font-black text-xs py-3 px-4 rounded-2xl shadow-xl border border-blue-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer ${className}`}
      >
        <Download className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>{installing ? 'Opening Install Dialog...' : 'Install E-Shuttle on Device'}</span>
      </button>

      {successMessage && (
        <div className="p-2.5 bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2 mt-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>E-Shuttle app successfully added to your device!</span>
        </div>
      )}

      {showInstallModal && (
        <PWAInstallModal
          platform={platform}
          isInIframe={isInIframe}
          deferredPrompt={deferredPrompt}
          onClose={() => setShowInstallModal(false)}
        />
      )}
    </>
  );
};

// Interactive Multi-Platform Install Modal
interface PWAInstallModalProps {
  platform: PlatformType;
  isInIframe: boolean;
  deferredPrompt: any;
  onClose: () => void;
}

const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  platform,
  isInIframe,
  deferredPrompt,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>(() => {
    if (platform === 'ios') return 'ios';
    if (platform === 'desktop-chrome' || platform === 'desktop-safari' || platform === 'desktop-other') {
      return 'desktop';
    }
    return 'android';
  });

  const [copied, setCopied] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTriggerNativePrompt = async () => {
    if (deferredPrompt) {
      setIsPrompting(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          onClose();
        }
      } catch (err) {
        console.error('Prompt trigger error:', err);
      } finally {
        setIsPrompting(false);
      }
    }
  };

  const handleOpenStandalone = () => {
    const targetUrl = window.location.origin;
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center gap-3 pr-8">
          <img
            src={officialLogo}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/official_logo.jpg';
            }}
            alt="E-Shuttle Official Logo"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/50 shadow-xl shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white">Install E-Shuttle</h3>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wide">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-400">Add to your device for instant launch & offline access</p>
          </div>
        </div>

        {/* Direct Native 1-Tap Trigger if available */}
        {deferredPrompt && (
          <div className="p-3 bg-[#0D47A1]/90 border border-blue-400/50 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Instant Browser Install Ready!</span>
            </div>
            <button
              onClick={handleTriggerNativePrompt}
              disabled={isPrompting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 px-4 rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isPrompting ? 'Triggering...' : 'Click Here to Install Directly'}</span>
            </button>
          </div>
        )}

        {/* Notice for Preview / Iframe environments */}
        {isInIframe && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl space-y-2 text-xs text-amber-200">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-amber-300">
                <HelpCircle className="w-4 h-4" />
                <span>Running in Preview Window</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Browsers restrict direct 1-tap install prompts inside embedded iframes. Open the standalone tab below for full browser installation:
            </p>
            <button
              onClick={handleOpenStandalone}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <span>Open in Full Browser Tab</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'android'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-300" />
            <span>iPhone / iOS</span>
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        {/* Step-by-Step Instructions based on selected platform */}
        {activeTab === 'android' && (
          <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Android (Chrome / Samsung Internet / Edge)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <span>Tap the <b className="text-white">Three-Dots Menu (⋮)</b> in the top right of your browser.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <span>Select <b className="text-white">Install App</b> or <b className="text-white">Add to Home screen</b>.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <span>Tap <b className="text-white">Install</b>. E-Shuttle will appear directly on your home screen!</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ios' && (
          <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone & iPad (Safari Browser)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <span>Tap the <b className="text-white">Share button</b> <Share2 className="w-3.5 h-3.5 text-blue-400 inline mx-0.5" /> at the bottom of Safari.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <span>Scroll down and tap <b className="text-white">Add to Home Screen</b> <PlusSquare className="w-3.5 h-3.5 text-purple-400 inline mx-0.5" />.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <span>Tap <b className="text-white">Add</b> on the top right corner to complete installation!</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'desktop' && (
          <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop Chrome / Edge / Brave / macOS Safari</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <span>Look at the right side of your browser URL address bar for the <b className="text-white">Install Icon (⊕ or 💻)</b>.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <span>Or click browser menu <b className="text-white">(⋮)</b> &gt; <b className="text-white">Cast, save, and share</b> &gt; <b className="text-white">Install E-Shuttle</b>.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <span>Click <b className="text-white">Install</b> to open as a dedicated, standalone desktop window.</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Link Share & Close actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCopyLink}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy App URL</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-2xl text-xs transition-colors cursor-pointer shadow-lg"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

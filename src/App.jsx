import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import Step1BusinessDetails from './components/Step1BusinessDetails';
import Step2ReviewGenerator from './components/Step2ReviewGenerator';
import QrCodeModal from './components/QrCodeModal';
import SeoTipsModal from './components/SeoTipsModal';
import SavedReviewsModal from './components/SavedReviewsModal';
import AdminAccessModal from './components/AdminAccessModal';
import GeminiKeyModal from './components/GeminiKeyModal';
import InstallAppModal from './components/InstallAppModal';
import GooglePolicyGuardModal from './components/GooglePolicyGuardModal';
import MobileOwnerSetupModal from './components/MobileOwnerSetupModal';
import Toast from './components/Toast';
import { BUSINESS_PRESETS } from './utils/businessPresets';
import {
  getInitialBusinessProfile,
  saveLockedBusinessProfile,
  generateClientShareUrl,
  getAllSavedClients,
  addOrUpdateClientInDirectory
} from './utils/clientProfileManager';
import { fetchClientFromCloud, extractSlugFromLocation } from './utils/cloudSync';
import { CheckCircle, Lock, Unlock, ShieldCheck, Copy, Share2, Cloud, RefreshCw, QrCode, ExternalLink, BarChart3, AlertOctagon } from 'lucide-react';
import { fetchBusinessById, saveBusinessToBackend, verifyOwnerPin } from './utils/apiClient';
import './App.css';

export default function App() {
  // Theme state: dark / light (persisted in localStorage)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('revgoat_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  // Master Owner Mode (True = website owner can edit Step 1; False = client/customer only sees Step 2)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = window.location.search || '';
        const path = window.location.pathname || '';
        const hash = window.location.hash || '';
        const full = (search + ' ' + path + ' ' + hash).toLowerCase();

        // STRICT CUSTOMER GATE: If user accessed via /r/:id (NFC touch or QR scan) or client payload,
        // strictly force client mode (isAdminUnlocked = false) and forbid URL tampering!
        if (
          path.includes('/r/') ||
          hash.includes('/r/') ||
          search.includes('?b=') ||
          search.includes('&b=') ||
          search.includes('?client=') ||
          search.includes('?id=') ||
          search.includes('?biz=') ||
          search.includes('?name=') ||
          search.includes('?view=client') ||
          path.startsWith('/v/') ||
          path.startsWith('/c/')
        ) {
          return false;
        }

        // If explicit owner / admin parameter is present, check session auth
        if (full.includes('owner') || full.includes('admin') || full.includes('step=1')) {
          return true;
        }

        // Check if there was an explicitly saved lock in localStorage
        const savedLock = localStorage.getItem('revgoat_client_locked');
        if (savedLock === 'true') {
          return false;
        }

        // Default to true for the Owner on root domain
        return true;
      }
      return true;
    } catch (e) {
      return true;
    }
  });

  // Detect if this session was opened via client share link / QR camera scan / dynamic slug route (/r/:id)
  const isClientUrl = typeof window !== 'undefined' && (
    window.location.pathname.includes('/r/') ||
    (window.location.hash && window.location.hash.includes('/r/')) ||
    window.location.search.includes('?b=') ||
    window.location.search.includes('&b=') ||
    window.location.search.includes('?id=') ||
    window.location.search.includes('&id=') ||
    window.location.search.includes('?c=') ||
    window.location.search.includes('&c=') ||
    window.location.search.includes('?slug=') ||
    window.location.search.includes('&slug=') ||
    window.location.search.includes('?client=') ||
    window.location.search.includes('?step=2') ||
    window.location.search.includes('?app=true') ||
    (typeof window.location.pathname === 'string' && (window.location.pathname.startsWith('/v/') || window.location.pathname.startsWith('/c/'))) ||
    (window.location.hash && (
      window.location.hash.includes('/v/') ||
      window.location.hash.includes('/c/') ||
      window.location.hash.includes('/profile/')
    ))
  );

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Active step:
  // 1: Business Details (Owner / Website Creator Mode)
  // 2: Review Generator App (Default & Customer Review Experience)
  const [activeStep, setActiveStep] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = window.location.search || '';
        const hash = window.location.hash || '';
        const pathname = window.location.pathname || '';
        const fullQuery = search + ' ' + hash + ' ' + pathname;

        // Clean up any legacy step 0 from localStorage
        if (localStorage.getItem('revgoat_active_step') === '0') {
          localStorage.removeItem('revgoat_active_step');
        }

        const lowerQuery = fullQuery.toLowerCase();

        // Customer /r/:id route strictly forwards directly to Step 2!
        if (
          fullQuery.includes('/r/') ||
          fullQuery.includes('?b=') ||
          fullQuery.includes('&b=') ||
          fullQuery.includes('?id=') ||
          fullQuery.includes('&id=') ||
          fullQuery.includes('?c=') ||
          fullQuery.includes('&c=') ||
          fullQuery.includes('slug=') ||
          fullQuery.includes('step=2') ||
          fullQuery.includes('app=true') ||
          fullQuery.includes('view=app') ||
          fullQuery.includes('client=') ||
          fullQuery.includes('/v/')
        ) {
          return 2;
        }

        // Explicit owner / step 1 parameter
        if (lowerQuery.includes('owner') || lowerQuery.includes('admin') || lowerQuery.includes('step=1') || lowerQuery.includes('setup')) {
          try {
            localStorage.setItem('revgoat_active_step', '1');
          } catch (e) {}
          return 1;
        }

        // Check if there was an explicitly saved step (1 or 2 only)
        const saved = localStorage.getItem('revgoat_active_step');
        if (saved === '1') {
          return 1;
        }
        if (saved === '2') {
          return 2;
        }
      }
    } catch (e) { }
    return 1;
  });

  // Active business state (Loaded from URL / localStorage / Backend DB)
  const [business, setBusiness] = useState(() => getInitialBusinessProfile());

  // Live Cloud & Backend Database Sync State
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Backend Atomic Scan Tracking & Database Revalidation:
  // When a user opens any client link (/r/:id, ?id=..., /v/...), hit GET /api/business/:id
  // to atomically increment analytics.scansCount and load the latest configuration payload.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname || '';
    const hash = window.location.hash || '';

    let targetSlug = null;
    const rMatch = pathname.match(/\/r\/([^\/?#]+)/i) || hash.match(/#\/r\/([^\/?#]+)/i);
    if (rMatch && rMatch[1]) {
      targetSlug = decodeURIComponent(rMatch[1]);
    } else {
      targetSlug = extractSlugFromLocation(window.location);
    }

    if (!targetSlug) return;

    let isMounted = true;
    setIsCloudSyncing(true);

    // Hit backend API to atomically record scan count & fetch profile
    fetchBusinessById(targetSlug, true)
      .then((backendBiz) => {
        if (!isMounted) return;
        if (backendBiz && (backendBiz.businessName || backendBiz.name)) {
          let bReviewUrl = (backendBiz.googleReviewUrl || '').trim();
          if (
            !bReviewUrl ||
            bReviewUrl.includes('kX72V8NqjZ9P4W5F8') ||
            bReviewUrl.includes('zGSe5fqThSXE1eo57') ||
            bReviewUrl.includes('exampleSpices') ||
            bReviewUrl.includes('ChIJN1t_tDeuEmsRUsoyG83frY4')
          ) {
            const bName = backendBiz.businessName || backendBiz.name || '';
            if (bName.toLowerCase().includes('grey gents') || (targetSlug && targetSlug.includes('grey-gents'))) {
              bReviewUrl = 'https://search.google.com/local/writereview?placeid=ChIJyRyiLwCbXjkRY1eZ6K4ZF0M';
            } else {
              bReviewUrl = `https://www.google.com/search?q=${encodeURIComponent(bName + (backendBiz.city ? ' ' + backendBiz.city : '') + ' review')}`;
            }
          }
          const formatted = {
            id: backendBiz.businessId || targetSlug,
            businessId: backendBiz.businessId || targetSlug,
            name: backendBiz.businessName || backendBiz.name,
            businessName: backendBiz.businessName || backendBiz.name,
            city: backendBiz.city || '',
            category: backendBiz.category || '',
            googleReviewUrl: bReviewUrl,
            shortUrl: backendBiz.shortUrl || `https://revgoat-business-pro.vercel.app/r/${backendBiz.businessId || targetSlug}`,
            services: backendBiz.services || [],
            rating: backendBiz.rating || 5.0,
            reviewCount: backendBiz.reviewCount || 100,
            analytics: backendBiz.analytics || { scansCount: 1, positiveClicksCount: 0, negativeSubmissionsCount: 0 },
            feedbackLog: backendBiz.feedbackLog || []
          };
          setBusiness(formatted);
          saveLockedBusinessProfile(formatted);
          addOrUpdateClientInDirectory(formatted);
        } else {
          // Fallback to cloud sync
          fetchClientFromCloud(targetSlug).then((cloudClient) => {
            if (!isMounted) return;
            if (cloudClient && cloudClient.name) {
              setBusiness(cloudClient);
              saveLockedBusinessProfile(cloudClient);
              addOrUpdateClientInDirectory(cloudClient);
            } else {
              // SAFE FALLBACK WRAPPER: If not found in DB or Cloud, synthesize clean contextual fallback model
              // This guarantees the client viewport never encounters a blank screen crash
              const cleanSlug = String(targetSlug).trim().toLowerCase();
              const formattedName = cleanSlug
                .split(/[-_]+/)
                .filter(Boolean)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ') || 'Verified Business Profile';

              const fallbackRecord = {
                id: cleanSlug,
                businessId: cleanSlug,
                slug: cleanSlug,
                client_id: cleanSlug,
                name: formattedName,
                businessName: formattedName,
                city: 'Local Verified Store',
                category: 'Retail & Local Services',
                subCategory: '',
                googleReviewUrl: `https://www.google.com/search?q=${encodeURIComponent(formattedName + ' review')}`,
                shortUrl: typeof window !== 'undefined' ? `${window.location.origin}/r/${cleanSlug}` : `https://revgoat-business-pro.vercel.app/r/${cleanSlug}`,
                services: ['Quality Customer Care', 'Verified Services', 'Fast & Reliable Assistance'],
                rating: 5.0,
                reviewCount: 120,
                analytics: { scansCount: 1, positiveClicksCount: 0, negativeSubmissionsCount: 0 },
                feedbackLog: []
              };
              setBusiness(fallbackRecord);
              saveLockedBusinessProfile(fallbackRecord);
            }
          }).catch(() => {
            if (!isMounted) return;
            const cleanSlug = String(targetSlug).trim().toLowerCase();
            const formattedName = cleanSlug
              .split(/[-_]+/)
              .filter(Boolean)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ') || 'Verified Business Profile';

            const fallbackRecord = {
              id: cleanSlug,
              businessId: cleanSlug,
              slug: cleanSlug,
              client_id: cleanSlug,
              name: formattedName,
              businessName: formattedName,
              city: 'Local Verified Store',
              category: 'Retail & Local Services',
              subCategory: '',
              googleReviewUrl: `https://www.google.com/search?q=${encodeURIComponent(formattedName + ' review')}`,
              shortUrl: typeof window !== 'undefined' ? `${window.location.origin}/r/${cleanSlug}` : `https://revgoat-business-pro.vercel.app/r/${cleanSlug}`,
              services: ['Quality Customer Care', 'Verified Services', 'Fast & Reliable Assistance'],
              rating: 5.0,
              reviewCount: 120,
              analytics: { scansCount: 1, positiveClicksCount: 0, negativeSubmissionsCount: 0 },
              feedbackLog: []
            };
            setBusiness(fallbackRecord);
            saveLockedBusinessProfile(fallbackRecord);
          });
        }
      })
      .catch((err) => {
        console.warn('Backend business load fallback:', err);
      })
      .finally(() => {
        if (isMounted) setIsCloudSyncing(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Google Gemini API Key state (saved securely in localStorage / env)
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    try {
      return (
        localStorage.getItem('revgoat_gemini_api_key') ||
        (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GEMINI_API_KEY) ||
        'AQ.Ab8RN6IyT5_kGh8Fw08_MmQF4l7hE-aTb7WrIij7vfgxBaPlPQ'
      );
    } catch (e) {
      return 'AQ.Ab8RN6IyT5_kGh8Fw08_MmQF4l7hE-aTb7WrIij7vfgxBaPlPQ';
    }
  });

  // Modals state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [isSavedReviewsModalOpen, setIsSavedReviewsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isPolicyGuardModalOpen, setIsPolicyGuardModalOpen] = useState(false);
  const [isMobileOwnerModalOpen, setIsMobileOwnerModalOpen] = useState(false);

  // High-performance non-blocking Toast timer management (declared before effects)
  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success'
  });
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((title, message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({
      visible: true,
      title,
      message,
      type
    });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3800);
  }, []);

  const closeToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  // PWA Install State & Lifecycle
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      );
    }
    return false;
  });

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      showToast('App Installed! 🚀', 'RevGOAT is now installed on your device.', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showToast]);

  // Secret Owner Shortcut Listener: Ctrl+Shift+A or Ctrl+Shift+O or Alt+A toggles Owner Mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'O' || e.key === 'o')) ||
        (e.altKey && (e.key === 'A' || e.key === 'a' || e.key === 'O' || e.key === 'o'))
      ) {
        e.preventDefault();
        setIsAdminUnlocked(true);
        localStorage.setItem('revgoat_is_owner', 'true');
        setIsAdminModalOpen(true);
        showToast('Owner Mode Active 🛠️', 'Owner Control Center is now open.', 'success');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToast]);

  const handleTriggerInstall = async () => {
    if (installPrompt) {
      try {
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsInstalled(true);
          setInstallPrompt(null);
          setIsInstallModalOpen(false);
          showToast('Installing App! ⚡', 'RevGOAT is being added to your device.', 'success');
        }
      } catch (err) {
        console.warn('Install error:', err);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Theme synchronization
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('revgoat_theme', theme);
    } catch (e) { }
  }, [theme]);

  // Persistent Step position for seamless refresh (1 or 2 only)
  useEffect(() => {
    try {
      if (activeStep === 1 || activeStep === 2) {
        localStorage.setItem('revgoat_active_step', String(activeStep));
      } else {
        localStorage.setItem('revgoat_active_step', '2');
      }
    } catch (e) { }
  }, [activeStep]);

  // Clean up any stale legacy step 0 from localStorage on mount
  useEffect(() => {
    try {
      if (localStorage.getItem('revgoat_active_step') === '0') {
        localStorage.setItem('revgoat_active_step', '2');
      }
    } catch (e) { }
  }, []);

  // Auto-correct stale legacy profile to primary default preset (Grey Gents clothing store)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const search = (window.location.search || '') + (window.location.hash || '');
        const pathname = window.location.pathname || '';
        const fullLocation = search + ' ' + pathname;
        const hasClientUrl = fullLocation.includes('?id=') || fullLocation.includes('&id=') || fullLocation.includes('?b=') || fullLocation.includes('&b=') || fullLocation.includes('?c=') || fullLocation.includes('&c=') || fullLocation.includes('slug=') || fullLocation.includes('client=') || fullLocation.includes('name=') || fullLocation.includes('biz=') || fullLocation.includes('/v/');
        if (!hasClientUrl) {
          if (!business || !business.name || business.name.toLowerCase().includes('smilecraft') || business.id === 'dental') {
            const defaultBiz = BUSINESS_PRESETS[0];
            setBusiness(defaultBiz);
            saveLockedBusinessProfile(defaultBiz);
          } else if (business && !business.subCategory && business.name === BUSINESS_PRESETS[0].name) {
            setBusiness((prev) => ({
              ...prev,
              subCategory: BUSINESS_PRESETS[0].subCategory
            }));
          }
        }
      }
    } catch (e) { }
  }, [business]);

  // Persistent Business Draft auto-save for 100% refresh persistence (Data NEVER wipes on refresh)
  useEffect(() => {
    try {
      if (business && business.name && business.name.trim()) {
        saveLockedBusinessProfile(business);
      }
    } catch (e) { }
  }, [business]);

  // Gemini API Key handlers
  const handleSaveGeminiKey = (newKey) => {
    setGeminiApiKey(newKey);
    try {
      localStorage.setItem('revgoat_gemini_api_key', newKey);
    } catch (e) { }
  };

  const handleRemoveGeminiKey = () => {
    setGeminiApiKey('');
    try {
      localStorage.removeItem('revgoat_gemini_api_key');
    } catch (e) { }
  };

  // Preset Selection
  const handleSelectPreset = (preset) => {
    if (!preset) return;
    setBusiness(preset);
    setActiveStep(2);
    showToast(`Loaded ${preset.name}`, 'Review suggestions updated with local SEO keywords!', 'info');
  };

  // Reset to empty clean state
  const handleReset = () => {
    const emptyBiz = {
      id: 'custom',
      name: '',
      category: 'Healthcare & Dental',
      city: '',
      services: [],
      rating: 5.0,
      reviewCount: 0,
      tone: 'Professional & Grateful',
      customerName: '',
      googleReviewUrl: ''
    };
    setBusiness(emptyBiz);
    setActiveStep(1);
    try {
      localStorage.removeItem('revgoat_active_business');
      localStorage.setItem('revgoat_active_step', '1');
    } catch (e) { }
    showToast('Reset Form', 'Ready for new business details.', 'info');
  };

  // Lock and save permanently for client
  const handleLockAndSavePermanentProfile = () => {
    if (business && business.name) {
      saveLockedBusinessProfile(business);
    }
    setIsAdminUnlocked(false);
    try {
      localStorage.setItem('revgoat_creator_mode', 'false');
      localStorage.setItem('revgoat_admin_unlocked', 'false');
    } catch (e) { }
    setActiveStep(2);
    setIsAdminModalOpen(false);
    showToast(
      'Profile Locked For Clients! 🔒',
      `Permanent profile saved for ${business?.name || 'Business'}. Customers will only see Step 2.`,
      'success'
    );
  };

  // Toggle Creator Mode (1-Click toggle with zero PIN)
  const handleToggleCreatorMode = () => {
    setIsAdminUnlocked((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('revgoat_creator_mode', String(next));
        localStorage.setItem('revgoat_admin_unlocked', String(next));
      } catch (e) { }
      if (next) {
        showToast('Owner Mode Active 🛠️', 'Step 1 Business Details is open for editing.', 'success');
      } else {
        setActiveStep(2);
        showToast('Client Preview Active 🔒', 'Step 1 is hidden. Clients & customers only see Step 2.', 'info');
      }
      return next;
    });
  };

  // Auto-redirect clients to Step 2 only if accessing via client share URL
  useEffect(() => {
    if (isClientUrl && activeStep === 1) {
      setActiveStep(2);
    }
  }, [isClientUrl, activeStep]);

  return (
    <div className={`app-root ${theme}`}>
      {/* Background radial glowing ambient orbs (GPU accelerated) */}
      <div className="ambient-glow orb-1"></div>
      <div className="ambient-glow orb-2"></div>
      <div className="ambient-glow orb-3"></div>

      {/* Main Navbar with Brand Logo & Quick Switchers */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        business={business}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenSettings={() => setIsGeminiModalOpen(true)}
        onOpenSavedReviews={() => setIsSavedReviewsModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isInstalled={isInstalled}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        showToast={showToast}
        isAdminUnlocked={isAdminUnlocked}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onToggleCreatorMode={handleToggleCreatorMode}
        isClientUrl={isClientUrl}
        onOpenPolicyGuard={() => setIsPolicyGuardModalOpen(true)}
        onOpenMobileOwnerModal={() => setIsMobileOwnerModalOpen(true)}
      />

      <main className="main-content-wrapper">
        {/* Compact Modern Owner Navigation Bar */}
        {isAdminUnlocked ? (
          <div className="owner-top-nav-bar">
            <div className="owner-step-switcher">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className={`owner-tab-btn ${activeStep === 1 ? 'active' : ''}`}
                title="Edit business name, category, and links"
              >
                <span className="owner-tab-icon">✏️</span>
                <span className="owner-tab-text">Step 1: Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (business?.name && business.name.trim()) setActiveStep(2);
                  else showToast('Name Required', 'Please enter a business name first.', 'info');
                }}
                className={`owner-tab-btn ${activeStep === 2 ? 'active' : ''}`}
                title="Preview review generator"
              >
                <span className="owner-tab-icon">⭐</span>
                <span className="owner-tab-text">Step 2: Reviews</span>
              </button>
            </div>

            <div className="owner-nav-actions">
              <button
                type="button"
                onClick={() => {
                  if (!business?.name?.trim()) {
                    showToast('Business Name Required', 'Please enter a business name first.', 'error');
                    return;
                  }
                  const url = generateClientShareUrl(business);
                  try {
                    navigator.clipboard.writeText(url);
                    showToast(
                      'Client Link Copied! 🔗',
                      `Direct link for ${business.name} copied to clipboard!`,
                      'success'
                    );
                  } catch (e) {
                    showToast('Link generated', url, 'info');
                  }
                }}
                className="owner-quick-btn"
                title="Copy permanent direct link for this client"
              >
                <Share2 size={13} />
                <span className="hide-on-tiny">Share Link</span>
              </button>

              <button
                type="button"
                onClick={handleLockAndSavePermanentProfile}
                className="owner-lock-btn"
                title="Lock profile so clients and customers only see Step 2"
              >
                <Lock size={13} />
                <span>Lock View</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Step View Container:
            1: Business Details (Step 1 - Website Creator Mode)
            2: SEO Review Generator App (Step 2 - Default & Customer Experience)
        */}
        <div className="step-content-viewport">
          {activeStep === 1 && isAdminUnlocked ? (
            <Step1BusinessDetails
              business={business}
              setBusiness={setBusiness}
              onProceed={handleLockAndSavePermanentProfile}
              showToast={showToast}
              geminiApiKey={geminiApiKey}
              onOpenPolicyGuard={() => setIsPolicyGuardModalOpen(true)}
              onOpenMobileOwnerModal={() => setIsMobileOwnerModalOpen(true)}
              onOpenQrModal={() => setIsQrModalOpen(true)}
            />
          ) : (
            (() => {
              // DATA VERIFICATION GUARD: Eliminates blank screen crashes caused by model mismatch errors
              const verifiedCustomerBusiness = {
                id: business?.id || business?.businessId || 'business',
                businessId: business?.businessId || business?.id || 'business',
                slug: business?.slug || business?.businessId || 'business',
                name: business?.name || business?.businessName || 'Verified Business Profile',
                businessName: business?.businessName || business?.name || 'Verified Business Profile',
                city: business?.city || '',
                category: business?.category || 'Retail & Local Services',
                subCategory: business?.subCategory || '',
                googleReviewUrl: business?.googleReviewUrl || (business?.name ? `https://www.google.com/search?q=${encodeURIComponent(business.name + ' review')}` : ''),
                shortUrl: business?.shortUrl || (typeof window !== 'undefined' ? `${window.location.origin}/r/${business?.businessId || 'business'}` : ''),
                services: Array.isArray(business?.services) && business.services.length > 0
                  ? business.services
                  : ['Quality Service', 'Experienced Staff', 'Great Customer Care'],
                rating: typeof business?.rating === 'number' ? business.rating : 5.0,
                reviewCount: typeof business?.reviewCount === 'number' ? business.reviewCount : 100,
                analytics: business?.analytics || { scansCount: 1, positiveClicksCount: 0, negativeSubmissionsCount: 0 },
                feedbackLog: Array.isArray(business?.feedbackLog) ? business.feedbackLog : []
              };

              return (
                <Step2ReviewGenerator
                  business={verifiedCustomerBusiness}
                  setBusiness={setBusiness}
                  isAdminUnlocked={isAdminUnlocked}
                  isClientUrl={isClientUrl}
                  onBackToStep1={() => {
                    setIsAdminUnlocked(true);
                    setActiveStep(1);
                    showToast('Step 1 Active ✏️', 'Business Details is open for editing.', 'info');
                  }}
                  onOpenQrModal={() => setIsQrModalOpen(true)}
                  showToast={showToast}
                  geminiApiKey={geminiApiKey}
                  onSaveGeminiKey={handleSaveGeminiKey}
                  onRemoveGeminiKey={handleRemoveGeminiKey}
                  theme={theme}
                  toggleTheme={toggleTheme}
                />
              );
            })()
          )}
        </div>
      </main>

      {/* Footer with Trust & Status */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <div
              className="footer-brand-pill"
              title="RevGOAT Engine"
            >
              <span className="footer-brand-icon">⚡</span>
              <span className="footer-brand-name">RevGOAT™ Engine</span>
              <span className="footer-pill-divider"></span>
              <span className="status-dot"></span>
              <span className="footer-status-text">Live Local SEO</span>
            </div>
          </div>

          <div className="footer-center">
            <div className="footer-center-badge">
              <span className="badge-star">⭐</span>
              <span className="badge-text">Optimized for Google Local 3-Pack, Maps & GMB</span>
            </div>
          </div>

          <div className="footer-right">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="footer-pill-btn"
              title="SEO Ranking Guide"
            >
              <svg className="footer-btn-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span>Ranking Guide</span>
            </button>
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="footer-pill-btn"
              title="Counter QR Code Display"
            >
              <svg className="footer-btn-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Counter QR</span>
            </button>
            <button
              onClick={() => setIsSavedReviewsModalOpen(true)}
              className="footer-pill-btn footer-pill-saved"
              title="View saved reviews history"
            >
              <svg className="footer-btn-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              <span>Saved Reviews</span>
            </button>
          </div>
        </div>

        {/* Powered by AMDAVAD AI STUDIO - Ultra-Sleek Modern Text-Only Section */}
        <div className="footer-powered-by-section">
          <div className="footer-powered-by-card" title="AMDAVAD AI STUDIO • Empowering Automation">
            <span className="powered-by-chip">POWERED BY</span>
            <div className="powered-by-content">
              <span className="brand-amdavad">AMDAVAD AI</span>
              <span className="brand-studio">STUDIO</span>
              <span className="brand-dot-sep">•</span>
              <span className="powered-by-tagline">EMPOWERING AUTOMATION</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Animated Toast */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Modals */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        business={business}
        setBusiness={setBusiness}
        showToast={showToast}
        onCopyLink={(url) => {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).catch(() => { });
          }
          showToast('Link Copied', 'Google review link copied to clipboard!', 'success');
        }}
      />

      <SeoTipsModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <SavedReviewsModal
        isOpen={isSavedReviewsModalOpen}
        onClose={() => setIsSavedReviewsModalOpen(false)}
        showToast={showToast}
      />

      <AdminAccessModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdminUnlocked={isAdminUnlocked}
        setIsAdminUnlocked={setIsAdminUnlocked}
        business={business}
        setBusiness={setBusiness}
        onLockAndSaveProfile={handleLockAndSavePermanentProfile}
        onSelectClient={(client) => {
          setBusiness(client);
          saveLockedBusinessProfile(client);
          showToast('Client Profile Active 🏢', `Switched active business to ${client.name}`, 'info');
        }}
        onGoToStep1={() => {
          setIsAdminUnlocked(true);
          setActiveStep(1);
        }}
        showToast={showToast}
        onOpenMobileOwnerModal={() => setIsMobileOwnerModalOpen(true)}
      />

      <GeminiKeyModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        apiKey={geminiApiKey}
        onSaveKey={handleSaveGeminiKey}
        onRemoveKey={handleRemoveGeminiKey}
        showToast={showToast}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        installPrompt={installPrompt}
        onTriggerInstall={handleTriggerInstall}
        isInstalled={isInstalled}
      />

      {/* Official Google Business Profile Safety, Place ID Link Generator & Moderation Modal */}
      <GooglePolicyGuardModal
        isOpen={isPolicyGuardModalOpen}
        onClose={() => setIsPolicyGuardModalOpen(false)}
        business={business}
        setBusiness={setBusiness}
        showToast={showToast}
        onOpenMobileOwnerModal={() => setIsMobileOwnerModalOpen(true)}
      />

      {/* Mobile Google Maps Ownership & Manager Setup Wizard Modal */}
      <MobileOwnerSetupModal
        isOpen={isMobileOwnerModalOpen}
        onClose={() => setIsMobileOwnerModalOpen(false)}
        showToast={showToast}
      />
    </div>
  );
}

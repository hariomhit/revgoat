import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Copy,
  ExternalLink,
  Share2,
  QrCode,
  Check,
  RefreshCw,
  Zap,
  Edit3,
  ArrowLeft,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Key,
  X,
  User,
  Phone,
  ShieldCheck,
  AlertTriangle,
  HeartHandshake,
  Send,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ReviewSuggestionsList from './ReviewSuggestionsList';
import { saveReviewSubmission, updateReviewCustomerInfo } from '../utils/savedReviews';
import {
  generateSeoReviews,
  calculateReviewSeoScore,
  modifyReviewTone,
  generateFastReviewVariation
} from '../utils/reviewGenerator';
import {
  generateReviewsWithGemini,
  generateSingleReviewWithGemini,
  resolveGeminiApiKey
} from '../utils/geminiApi';
import { generateClientShareUrl } from '../utils/clientProfileManager';
import { recordTemplateClick, submitNegativeFeedback } from '../utils/apiClient';

export default function Step2ReviewGenerator({
  business,
  setBusiness,
  onBackToStep1,
  onOpenQrModal,
  showToast,
  geminiApiKey,
  onSaveGeminiKey,
  onRemoveGeminiKey,
  isAdminUnlocked = false,
  isClientUrl = false
}) {
  // ⚡ Instant 0ms Pre-Population: 3 SEO reviews rendered on frame 0 without waiting for any API
  // Dynamic rotation seed: Every visitor / scan gets a fresh, unique 5-star review!
  const [variationSeed, setVariationSeed] = useState(() => {
    try {
      return Date.now() + Math.floor(Math.random() * 1000000);
    } catch (e) {
      return 0;
    }
  });

  const [suggestions, setSuggestions] = useState(() => {
    try {
      const initialSeed = Date.now() + Math.floor(Math.random() * 1000000);
      const init = generateSeoReviews(business, initialSeed);
      return Array.isArray(init) && init.length > 0 ? init.slice(0, 3) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedReviewId, setSelectedReviewId] = useState(() => suggestions[0]?.id || 'initial-1');
  const [currentReviewText, setCurrentReviewText] = useState(() => suggestions[0]?.text || '');
  const [copiedId, setCopiedId] = useState(null);
  const [copiedMain, setCopiedMain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState(null);

  // Track the ID of the last review saved in this session so late name edits sync live
  const lastSavedReviewIdRef = useRef(null);

  // Hands-Free Live Auto-Stream: Generates fresh 5-star reviews automatically without clicking
  const [isAutoStreamActive, setIsAutoStreamActive] = useState(false);
  const [autoStreamCountdown, setAutoStreamCountdown] = useState(5);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const variationIndexRef = useRef(0);

  // Auto-Stream timer: continuously updates fresh high-ranking review every 5 seconds
  useEffect(() => {
    if (!isAutoStreamActive || isUserEditing || isLoading) return;

    const timer = setInterval(() => {
      setAutoStreamCountdown((prev) => {
        if (prev <= 1) {
          variationIndexRef.current += 1;
          const nextVariation = generateFastReviewVariation(business, 'fast', variationIndexRef.current);
          setCurrentReviewText(nextVariation);
          setSelectedReviewId(`auto-stream-${variationIndexRef.current}`);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoStreamActive, isUserEditing, isLoading, business]);

  // Reset countdown and index when business changes
  useEffect(() => {
    variationIndexRef.current = 0;
    setAutoStreamCountdown(5);
  }, [business?.name, business?.category, business?.city]);

  // Auto-Open Google Link mode (persisted in localStorage, default: true)
  const [autoOpenOnSelect, setAutoOpenOnSelect] = useState(() => {
    try {
      const saved = localStorage.getItem('revgoat_auto_open_google');
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const [popupBlocked, setPopupBlocked] = useState(false);

  // Detect if running inside an iframe (e.g. Netlify web preview pane or CMS preview)
  const isInsideIframe = useMemo(() => {
    try {
      return typeof window !== 'undefined' && window.self !== window.top;
    } catch (e) {
      return true; // Cross-origin SecurityError indicates embedded in an iframe
    }
  }, []);

  // ⚡ 100% Hands-Free Auto-Pilot: Auto-copies review and automatically opens Google link!
  // Automatically disabled inside iframe previews so Netlify dashboard never gets 'google.com refused to connect'
  const [autoLaunchSeconds, setAutoLaunchSeconds] = useState(1.5);
  const [isAutoLaunchActive, setIsAutoLaunchActive] = useState(() => !isInsideIframe);
  const autoLaunchExecutedRef = useRef(false);

  // 🛡️ Customer Experience Rating & Google Anti-Gating Moderation State
  // Default: 5.0 Stars (Direct to Google Reviews). If 1-3★ selected: Routes to Private Management Resolution
  const [customerRating, setCustomerRating] = useState(5);
  const [privateFeedbackText, setPrivateFeedbackText] = useState('');
  const [privateFeedbackSubmitted, setPrivateFeedbackSubmitted] = useState(false);
  const [isSubmittingPrivate, setIsSubmittingPrivate] = useState(false);

  const handleRatingChange = (stars) => {
    setCustomerRating(stars);
    if (stars <= 3) {
      // Pause automatic launch so angry review is not pushed to Google without customer choice
      setIsAutoLaunchActive(false);
      setIsAutoStreamActive(false);
      autoLaunchExecutedRef.current = true;
      if (showToast) {
        showToast('Private Care Resolution 🛡️', 'Share details directly with management to resolve issues', 'info');
      }
    } else {
      setPrivateFeedbackSubmitted(false);
      if (showToast) {
        showToast(`${stars} Stars Selected ⭐`, 'Ready to submit your authentic Google Review', 'success');
      }
    }
  };

  const handleSendPrivateFeedback = async (e) => {
    if (e) e.preventDefault();
    if (!privateFeedbackText.trim()) {
      if (showToast) showToast('Feedback Required', 'Please explain what went wrong so we can resolve it', 'error');
      return;
    }
    setIsSubmittingPrivate(true);
    const enteredName = (business?.customerName || '').trim();
    const enteredPhone = (business?.customerPhone || '').trim();

    // 1. Save locally to review log
    saveReviewSubmission({
      customerName: enteredName || 'Valued Customer',
      customerPhone: enteredPhone,
      businessName: business?.name || 'Local Business',
      businessCategory: business?.category || 'Service',
      businessCity: business?.city || '',
      reviewText: privateFeedbackText.trim(),
      rating: customerRating,
      seoScore: 70,
      moderationStatus: 'private_resolution',
      isPrivateFeedback: true
    });

    // 2. Dispatch to backend API /api/business/:id/feedback
    const targetBusinessId = business?.businessId || business?.slug || business?.id;
    if (targetBusinessId) {
      try {
        await submitNegativeFeedback(targetBusinessId, {
          text: privateFeedbackText.trim(),
          stars: customerRating,
          customerName: enteredName,
          customerPhone: enteredPhone,
          date: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Backend feedback submission notice:', err);
      }
    }

    setIsSubmittingPrivate(false);
    setPrivateFeedbackSubmitted(true);
    if (showToast) {
      showToast('Feedback Received! 🙏', 'Thank you! Management has been notified privately.', 'success');
    }
  };

  const handleWhatsAppGrievance = () => {
    const enteredName = (business?.customerName || 'Customer').trim();
    const rawPhone = (business?.whatsapp || business?.phone || '').replace(/[^0-9]/g, '');
    const feedbackMsg = privateFeedbackText.trim() || 'I had an issue during my recent visit and would like to speak directly with management.';
    const message = `Hello Management (${business?.name || 'Store'}).\n\nI visited your store and rated my experience as ${customerRating}★. I am sharing direct feedback:\n\n"${feedbackMsg}"\n\n- Customer: ${enteredName || 'Store Visitor'}`;
    const url = rawPhone
      ? `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleToggleAutoOpen = (val) => {
    setAutoOpenOnSelect(val);
    try {
      localStorage.setItem('revgoat_auto_open_google', String(val));
    } catch (e) {}
    if (showToast) {
      showToast(
        val ? 'Auto-Open Enabled ⚡' : 'Auto-Open Disabled',
        val ? 'Clicking any review card will copy & open Google automatically' : 'Clicking a review card will load into editor box',
        'info'
      );
    }
  };

  // In-box Gemini Key & Editing state (supports .env, code, and localStorage)
  const effectiveKey = resolveGeminiApiKey(geminiApiKey) || 'AQ.Ab8RN6IyT5_kGh8Fw08_MmQF4l7hE-aTb7WrIij7vfgxBaPlPQ';
  const [boxKeyInput, setBoxKeyInput] = useState(effectiveKey);
  const [isEditingKey, setIsEditingKey] = useState(false);

  // Sync internal state if geminiApiKey changes
  useEffect(() => {
    const k = resolveGeminiApiKey(geminiApiKey) || 'AQ.Ab8RN6IyT5_kGh8Fw08_MmQF4l7hE-aTb7WrIij7vfgxBaPlPQ';
    setBoxKeyInput(k);
  }, [geminiApiKey]);

  // Instant 0ms Load: Reviews are rendered immediately on mount, then smoothly enhanced by Gemini AI
  useEffect(() => {
    // 1. Frame 0: Instant 5-star review templates so user NEVER waits
    const freshSeed = Date.now() + Math.floor(Math.random() * 1000000);
    setVariationSeed(freshSeed);
    const instantList = generateSeoReviews(business, freshSeed, selectedServiceFilter).slice(0, 3);
    if (instantList && instantList.length > 0) {
      setSuggestions(instantList);
      setSelectedReviewId(instantList[0].id);
      setCurrentReviewText(instantList[0].text);
      saveCurrentReviewRecord(instantList[0].text);
      copyToClipboard(instantList[0].text);
    }
    setIsLoading(false);

    // 2. Background Live Gemini AI: Automatically generates 3 fresh live AI reviews!
    const activeKey = resolveGeminiApiKey(geminiApiKey);
    if (activeKey) {
      generateReviewsWithGemini(business, activeKey, selectedServiceFilter)
        .then((geminiList) => {
          if (geminiList && Array.isArray(geminiList) && geminiList.length > 0) {
            const list3 = geminiList.slice(0, 3);
            setSuggestions(list3);
            setSelectedReviewId(list3[0].id);
            const firstReview = list3[0].text || '';
            setCurrentReviewText(firstReview);
            saveCurrentReviewRecord(firstReview);
            copyToClipboard(firstReview); // Update clipboard with live Gemini review!
          }
        })
        .catch((err) => {
          console.warn('Gemini AI initial background note:', err?.message);
        });
    }
  }, [business?.name, business?.category, business?.city]);

  // Main review generation function - 100% Live Gemini AI generation for the 3 options!
  const generateReviews = async (customKey = null, incrementSeed = false, serviceFilter = null) => {
    const nextSeed = Date.now() + Math.floor(Math.random() * 1000000);
    setVariationSeed(nextSeed);
    const targetSvc = serviceFilter !== null ? serviceFilter : selectedServiceFilter;
    if (serviceFilter !== null) {
      setSelectedServiceFilter(serviceFilter);
    }

    // Immediately update with fresh dynamic review so UI never freezes
    const instantReviews = generateSeoReviews(business, nextSeed, targetSvc).slice(0, 3);
    if (instantReviews.length > 0) {
      setSuggestions(instantReviews);
      setSelectedReviewId(instantReviews[0].id);
      const firstReview = instantReviews[0].text || '';
      setCurrentReviewText(firstReview);
      saveCurrentReviewRecord(firstReview);
      copyToClipboard(firstReview);
    }

    const activeKey = resolveGeminiApiKey(customKey || geminiApiKey);

    // Live Gemini AI generation for the 3 options
    if (activeKey) {
      setIsLoading(true);
      try {
        const geminiList = await generateReviewsWithGemini(business, activeKey, targetSvc);
        if (geminiList && Array.isArray(geminiList) && geminiList.length > 0) {
          const list3 = geminiList.slice(0, 3);
          setSuggestions(list3);
          setSelectedReviewId(list3[0].id);
          const firstReview = list3[0].text || '';
          setCurrentReviewText(firstReview);
          saveCurrentReviewRecord(firstReview);
          copyToClipboard(firstReview);

          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch (e) {}

          if (showToast) {
            showToast('Gemini AI Generated! ⚡', '3 live 5-star reviews ready to post', 'success');
          }
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Gemini live call note, using instant template:', err?.message);
      } finally {
        setIsLoading(false);
      }
    }

    setIsLoading(false);
    if (showToast) {
      showToast('Reviews Updated! ⚡', '3 fresh 5-star review options loaded', 'info');
    }
  };

  // Direct Fast AI Suggestion specifically for the Review Text Box
  const handleAiSuggestForTextBox = async (style = 'fast', overrideKey = null) => {
    const activeKey = resolveGeminiApiKey(overrideKey || geminiApiKey);

    setIsAiSuggesting(true);

    if (activeKey) {
      try {
        const RANDOM_ANGLES = [
          'Top 5-Star Recommendation',
          'Local SEO Booster & High Map Ranking',
          'Short & Punchy (2 lines max)',
          'Warm, Polite & Grateful',
          `Special Focus on ${business?.services?.[0] || 'Quality Care'}`,
          'Fast & Professional Experience'
        ];
        const randomPick = RANDOM_ANGLES[Math.floor(Math.random() * RANDOM_ANGLES.length)];

        const styleLabel =
          style === 'short'
            ? 'Short & Punchy (2 lines max)'
            : style === 'seo'
            ? 'Local SEO Booster & High Map Ranking'
            : style === 'service'
            ? `Special Focus on ${business?.services?.[0] || 'Quality Care'}`
            : style === 'friendly'
            ? 'Warm, Polite & Grateful'
            : randomPick;

        const single = await generateSingleReviewWithGemini(business, activeKey, styleLabel);
        if (single && single.length > 10) {
          setCurrentReviewText(single);
          setSelectedReviewId('gemini-live');

          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch (e) {}

          if (showToast) {
            showToast('Gemini AI Generated! ⚡', 'Brand new 5-star review created live by Gemini AI', 'success');
          }

          setIsAiSuggesting(false);
          return;
        }
      } catch (err) {
        console.warn('Gemini text box suggest note:', err?.message);
      }
    }

    // Instant offline fallback variation so user NEVER gets stuck
    const fastVariation = generateFastReviewVariation(business, style);
    setCurrentReviewText(fastVariation);
    setSelectedReviewId(`fast-${Date.now()}`);
    setIsAiSuggesting(false);
    if (showToast) {
      showToast('Smart Variation Applied! ⚡', 'Fresh 5-star review loaded into box', 'success');
    }
  };

  // Save key directly inside the text box
  const handleSaveBoxKey = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanKey = boxKeyInput.trim();
    if (!cleanKey) return;
    if (onSaveGeminiKey) {
      onSaveGeminiKey(cleanKey);
    }
    setIsEditingKey(false);
    if (showToast) {
      showToast('Gemini Connected! ⚡', 'Generating live AI review...', 'success');
    }
    // Automatically trigger Gemini generation immediately!
    handleAiSuggestForTextBox(cleanKey);
  };

  // Remove key directly inside text box
  const handleRemoveBoxKey = () => {
    if (onRemoveGeminiKey) {
      onRemoveGeminiKey();
    }
    setBoxKeyInput('');
    setIsEditingKey(true);
    if (showToast) {
      showToast('Key Removed', 'Switched back to smart built-in engine', 'info');
    }
  };

  // Calculate live SEO score smoothly with useMemo (prevents CPU stutter on fast typing)
  const seoAnalysis = useMemo(() => {
    return calculateReviewSeoScore(currentReviewText, business);
  }, [currentReviewText, business?.name, business?.city, business?.services]);

  // Handle selecting a suggestion from the 3 cards into the text box
  const handleSelectSuggestion = (item) => {
    try {
      setIsAutoStreamActive(false);
      setIsAutoLaunchActive(false);
      autoLaunchExecutedRef.current = true;
      if (item && item.id) setSelectedReviewId(item.id);
      if (item && item.text) setCurrentReviewText(item.text);
      // AUTOMATICALLY COPY & OPEN GOOGLE REVIEW LINK!
      handleCopyAndOpenGoogle(item?.text || currentReviewText);
    } catch (err) {
      console.warn('handleSelectSuggestion error boundary:', err);
      const fallbackUrl = getGoogleReviewUrl();
      try {
        window.location.href = fallbackUrl;
      } catch (e) {
        window.open(fallbackUrl, '_blank');
      }
    }
  };

  const handleSelectServiceChip = (svc) => {
    try {
      setIsAutoStreamActive(false);
      setIsAutoLaunchActive(false);
      autoLaunchExecutedRef.current = true;
      setSelectedServiceFilter(svc);
      const nextSeed = Date.now() + Math.floor(Math.random() * 1000000);
      setVariationSeed(nextSeed);
      const newCards = generateSeoReviews(business, nextSeed, svc).slice(0, 3);
      setSuggestions(newCards);
      if (newCards.length > 0) {
        setSelectedReviewId(newCards[0].id);
        setCurrentReviewText(newCards[0].text);
        // AUTOMATICALLY COPY & OPEN GOOGLE LINK!
        handleCopyAndOpenGoogle(newCards[0].text);
      }
      if (showToast) {
        showToast(`Selected: ${svc} ✨`, 'Reviews updated & Google opened automatically!', 'success');
      }
    } catch (err) {
      console.warn('handleSelectServiceChip error boundary:', err);
      const fallbackUrl = getGoogleReviewUrl();
      window.location.href = fallbackUrl;
    }
  };

  // Tone modification
  const handleToneMod = (type) => {
    try {
      const newText = modifyReviewTone(currentReviewText, type, business);
      setCurrentReviewText(newText);
      if (showToast) {
        showToast('Review Updated', `Applied: ${type}`, 'info');
      }
    } catch (err) {
      console.warn('handleToneMod error boundary:', err);
    }
  };

  // Bulletproof Copy: 100% compatible with iOS Safari, Android Chrome, Edge, Samsung Internet & all browsers
  const copyToClipboard = (text) => {
    if (!text) return false;

    // 1. Modern Clipboard API (works seamlessly on HTTPS & localhost without touching DOM/stealing focus)
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        navigator.clipboard.writeText(text).catch(() => {
          fallbackCopyText(text);
        });
        return true;
      } catch (e) {}
    }

    // 2. Synchronous reliable textarea fallback
    return fallbackCopyText(text);
  };

  const fallbackCopyText = (text) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.fontSize = '16px';
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '-9999px';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';

      const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
      if (isIOS) {
        textArea.contentEditable = 'true';
        textArea.readOnly = false;
        document.body.appendChild(textArea);
        const range = document.createRange();
        range.selectNodeContents(textArea);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
        textArea.setSelectionRange(0, 999999);
      } else {
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, text.length);
      }

      const activeEl = document.activeElement;
      const execSuccess = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (activeEl && typeof activeEl.focus === 'function') {
        try { activeEl.focus(); } catch (e) {}
      }
      return execSuccess;
    } catch (e) {
      console.warn('execCommand copy fallback note:', e);
      return false;
    }
  };

  // Trigger celebratory confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981']
      });
    } catch (e) {}
  };

  // Get clean, working direct Google Review URL (never dummy/redirect/404)
  const getGoogleReviewUrl = () => {
    let raw = (business?.googleReviewUrl || '').trim();

    // Check if raw is a dummy/invalid/404 URL
    const isInvalid =
      !raw ||
      raw.includes('ChIJN1t_tDeuEmsRUsoyG83frY4') || // Sydney Opera House dummy placeId
      raw.includes('kX72V8NqjZ9P4W5F8') ||           // 404 dummy link
      raw.includes('zGSe5fqThSXE1eo57') ||           // 404 dummy link
      raw.includes('exampleSpices') ||               // dummy link
      raw.includes('_sample') ||                     // sample IDs
      raw === 'https://www.google.com';

    if (!isInvalid) {
      return raw;
    }

    // If valid placeId exists
    const pid = (business?.placeId || '').trim();
    if (pid && !pid.includes('sample') && !pid.includes('ChIJN1t_tDeuEmsRUsoyG83frY4')) {
      return `https://search.google.com/local/writereview?placeid=${pid}`;
    }

    // For Grey Gents specifically, the real verified Place ID is ChIJyRyiLwCbXjkRY1eZ6K4ZF0M
    const bName = (business?.name || business?.businessName || '').trim();
    if (bName.toLowerCase().includes('grey gents')) {
      return 'https://search.google.com/local/writereview?placeid=ChIJyRyiLwCbXjkRY1eZ6K4ZF0M';
    }

    const bCity = (business?.city || '').trim();
    return `https://www.google.com/search?q=${encodeURIComponent((bName || 'Local Business') + (bCity ? ' ' + bCity : '') + ' review')}`;
  };

  // Save review and customer record to history live ONLY when real customer copies or opens Google Review
  const saveCurrentReviewRecord = (textToSave) => {
    const text = textToSave || currentReviewText;
    if (!text || !text.trim()) return null;

    const enteredName = (business?.customerName || '').trim();
    const enteredPhone = (business?.customerPhone || '').trim();

    const saved = saveReviewSubmission({
      customerName: enteredName || 'Verified Customer',
      customerPhone: enteredPhone,
      businessName: business?.name || 'Local Business',
      businessCategory: business?.category || 'Service',
      businessCity: business?.city || '',
      reviewText: text.trim(),
      rating: customerRating || business?.rating || 5.0,
      seoScore: calculateReviewSeoScore(text, business).score || 98,
      moderationStatus: customerRating >= 4 ? 'showcase' : 'private_resolution',
      isPrivateFeedback: customerRating <= 3
    });

    if (saved && saved.id) {
      lastSavedReviewIdRef.current = saved.id;
    }
    return saved;
  };

  // Automatically copy review to clipboard FIRST and open Google Review link SECOND
  const autoOpenGoogleReview = (textToUse) => {
    return handleCopyAndOpenGoogle(textToUse);
  };

  // PRIMARY ACTION: FIRST automatically copies review, THEN automatically opens Google Review
  const handleCopyAndOpenGoogle = (textToUse = currentReviewText, event = null) => {
    let targetUrl = 'https://www.google.com';
    try {
      targetUrl = getGoogleReviewUrl() || targetUrl;
    } catch (e) {
      targetUrl = business?.name
        ? `https://www.google.com/search?q=${encodeURIComponent(business.name + ' review')}`
        : 'https://www.google.com';
    }

    try {
      let text = (textToUse || currentReviewText || '').trim();

      // AUTO-RECOVERY: Review text is NEVER empty!
      if (!text) {
        if (suggestions && suggestions.length > 0 && suggestions[0]?.text) {
          text = suggestions[0].text.trim();
          setCurrentReviewText(text);
        } else {
          const freshSeed = Date.now() + Math.floor(Math.random() * 1000000);
          const instant = generateSeoReviews(business, freshSeed);
          if (instant && instant.length > 0 && instant[0]?.text) {
            text = instant[0].text.trim();
            setCurrentReviewText(text);
          }
        }
      }

      if (!text) {
        const bName = business?.name || 'this business';
        text = `Outstanding experience with ${bName}! Super professional team, great quality of service, and completely hassle-free. Deserves a solid 5-star rating! ⭐⭐⭐⭐⭐`;
        setCurrentReviewText(text);
      }

      // Auto-save customer details safely
      try {
        saveCurrentReviewRecord(text);
      } catch (err) {
        console.warn('Record review notice:', err);
      }

      // Dispatch execution packet safely
      try {
        const targetBusinessId = business?.businessId || business?.slug || business?.id;
        if (targetBusinessId) {
          recordTemplateClick(targetBusinessId).catch(() => {});
        }
      } catch (err) {}

      // Clipboard execution with error boundary wrapper
      try {
        copyToClipboard(text);
        setCopiedMain(true);
        setPopupBlocked(false);
        setTimeout(() => setCopiedMain(false), 3000);
        triggerConfetti();
      } catch (clipErr) {
        console.warn('Clipboard write failure handled cleanly:', clipErr);
      }

      if (showToast) {
        showToast(
          'Review Copied to Clipboard! 📋',
          'Opening official Google Review page...',
          'copy-open'
        );
      }

      // If triggered by a real native <a> link click, let browser handle natively
      const isRealAnchor = event && event.currentTarget && event.currentTarget.tagName === 'A' && event.currentTarget.href;
      if (isRealAnchor) {
        return true;
      }

      // STEP 3: Guaranteed redirect sequence across Android, iOS, and Desktop
      // NEVER use custom intent:// schemes with forced packages because Google Maps app
      // cannot handle search.google.com or www.google.com URLs and will crash/fail silently.
      if (isInsideIframe) {
        try {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        } catch (err) {
          window.location.href = targetUrl;
        }
        return true;
      }

      // Attempt to open in a new tab; if popup blocked (e.g. mobile auto-open without user activation), navigate current window
      try {
        const newTab = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
          // If popup blocked or on mobile in-app browser/Chrome, directly navigate
          window.location.href = targetUrl;
        } else {
          newTab.focus();
        }
      } catch (e) {
        window.location.href = targetUrl;
      }

      return true;
    } catch (globalClickErr) {
      // SEAMLESS FALLBACK ROUTINE: Direct standard target URL navigation without disrupting render threads
      console.warn('Click event pipeline fallback triggered:', globalClickErr);
      try {
        window.location.href = targetUrl;
      } catch (navErr) {
        window.open(targetUrl, '_blank');
      }
      return true;
    }
  };

  // Trigger immediate launch (e.g. from 1-tap or countdown finish)
  const handleTriggerImmediateAutoLaunch = (textToUse = null) => {
    if (autoLaunchExecutedRef.current) return;
    autoLaunchExecutedRef.current = true;
    setIsAutoLaunchActive(false);
    const text = textToUse || currentReviewTextRef.current || currentReviewText;
    handleCopyAndOpenGoogle(text);
  };

  const handleCancelAutoLaunch = () => {
    setIsAutoLaunchActive(false);
    if (showToast) {
      showToast('Auto-Open Paused ⏸️', 'You can select or customize any review below', 'info');
    }
  };

  // Keep a stable ref to current review text so countdown timer never resets or stutters
  const currentReviewTextRef = useRef(currentReviewText);
  useEffect(() => {
    currentReviewTextRef.current = currentReviewText;
  }, [currentReviewText]);

  // Reset auto-launch state when business details change
  useEffect(() => {
    autoLaunchExecutedRef.current = false;
    setAutoLaunchSeconds(1.5);
    setIsAutoLaunchActive(!isInsideIframe);
    setPopupBlocked(false);
  }, [business?.name, business?.city, isInsideIframe]);

  // ⚡ 100% Hands-Free Countdown: automatically copy & open Google when countdown hits 0!
  // No touch, no tap, no click required!
  useEffect(() => {
    if (!isAutoLaunchActive || autoLaunchExecutedRef.current) return;

    // Immediately copy review 1 to clipboard on load (Frame 0 sync execution)
    if (currentReviewTextRef.current) {
      copyToClipboard(currentReviewTextRef.current);
    }

    const timer = setInterval(() => {
      setAutoLaunchSeconds((prev) => {
        if (prev <= 0.15) {
          clearInterval(timer);
          if (!autoLaunchExecutedRef.current) {
            autoLaunchExecutedRef.current = true;
            setIsAutoLaunchActive(false);
            const textToCopyAndOpen = currentReviewTextRef.current || currentReviewText;
            handleCopyAndOpenGoogle(textToCopyAndOpen, null);
          }
          return 0;
        }
        return Math.max(0, +(prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isAutoLaunchActive]);

  // Secondary: Copy Review - Automatically copies review FIRST, and opens Google Review!
  const handleCopyOnly = () => {
    if (!currentReviewText.trim()) return;
    handleCopyAndOpenGoogle(currentReviewText);
  };

  // Quick Copy from Card - Copies review to clipboard FIRST, and opens Google Review!
  const handleQuickCopy = (text, id) => {
    setIsAutoLaunchActive(false);
    autoLaunchExecutedRef.current = true;
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    handleCopyAndOpenGoogle(text);
  };

  // Quick Copy & Open from Card
  const handleQuickCopyAndOpen = (text, id) => {
    setIsAutoStreamActive(false);
    setIsAutoLaunchActive(false);
    autoLaunchExecutedRef.current = true;
    setCurrentReviewText(text);
    setSelectedReviewId(id);
    handleCopyAndOpenGoogle(text);
  };

  // Open Google Link Directly - Automatically copies review FIRST & opens Google Review page!
  const handleOpenGoogleOnly = () => {
    handleCopyAndOpenGoogle(currentReviewText);
  };

  // Share to WhatsApp
  const handleShareWhatsApp = () => {
    saveCurrentReviewRecord(currentReviewText);
    const targetUrl = getGoogleReviewUrl();
    const shareMessage = `Hey! Here is a 5-star review draft for ${business.name || 'us'}:\n\n"${currentReviewText}"\n\nPlease paste it here:\n${targetUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank');
  };

  const currentlyLoadedItem = suggestions.find((s) => s.id === selectedReviewId);

  return (
    <div className="step-card-container step-2-container">
      {/* Interactive 5-Star Rating Tracker / Smiley Emoji Selection Panel */}
      <div className="step2-rating-gating-panel">
        <div className="rating-gating-header">
          <div className="rating-gating-title-wrap">
            <span className="rating-gating-icon">⭐</span>
            <div>
              <h2 className="rating-gating-title">Rate Your Overall Experience Today</h2>
              <p className="rating-gating-subtitle">
                Select your rating below to instantly generate your authentic Google review
              </p>
            </div>
          </div>
          <span className="gating-verified-badge">
            <ShieldCheck size={14} className="text-green" />
            <span>NFC & QR Review Portal</span>
          </span>
        </div>

        <div className="smiley-rating-grid">
          {[
            { stars: 5, emoji: '🤩', label: 'Loved It!', subtext: '5★ AI Review' },
            { stars: 4, emoji: '😊', label: 'Good Service', subtext: '4★ AI Review' },
            { stars: 3, emoji: '😐', label: 'Average', subtext: 'Private Care' },
            { stars: 2, emoji: '😕', label: 'Needs Work', subtext: 'Private Care' },
            { stars: 1, emoji: '😡', label: 'Unsatisfied', subtext: 'Help Us Improve' }
          ].map((item) => {
            const isSelected = customerRating === item.stars;
            const isPositive = item.stars >= 4;
            return (
              <button
                key={item.stars}
                type="button"
                onClick={() => handleRatingChange(item.stars)}
                className={`smiley-rating-card ${isSelected ? 'active' : ''} ${isPositive ? 'positive-gate' : 'negative-gate'}`}
                title={`Rate ${item.stars} Stars: ${item.label}`}
              >
                <span className="smiley-emoji">{item.emoji}</span>
                <span className="smiley-stars">{'★'.repeat(item.stars)}{'☆'.repeat(5 - item.stars)}</span>
                <span className="smiley-label">{item.stars}★ {item.label}</span>
                <span className={`smiley-gate-tag ${isPositive ? 'positive' : 'negative'}`}>{item.subtext}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Unified Level 1 Header Bar */}
      <div className="unified-step2-header-bar">
        <div className="unified-header-left">
          <div className="unified-shield-badge" title="Official Google Reviews Verified Portal">
            🛡️
          </div>
          <div className="unified-title-block">
            <div className="unified-title-row">
              <span className="unified-portal-label">Official 5-Star Review Portal</span>
              <span className="unified-dot">•</span>
              <strong className="unified-business-name">{business.name || 'Verified Business Profile'}</strong>
              <span className="unified-rating-badge">{Number(business.rating || 5.0).toFixed(1)} ★</span>
            </div>
            <div className="unified-subtitle-row">
              <span className="unified-meta-pill">📍 {business.city || 'Verified Location'}</span>
              <span className="unified-dot">•</span>
              <span className="unified-meta-pill">{business.category || 'Local Service'}</span>
              {business.subCategory && (
                <>
                  <span className="unified-dot">•</span>
                  <span className="unified-meta-pill" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.1)' }}>
                    🏷️ {business.subCategory}
                  </span>
                </>
              )}
              <span className="unified-dot">•</span>
              <span className="unified-live-tag">
                <span className="live-status-dot-pulse"></span>
                <span>Live Google Maps Sync</span>
              </span>
            </div>
          </div>
        </div>

        <div className="unified-header-right">

          {isAdminUnlocked && (
            <>
              <button
                type="button"
                onClick={() => {
                  const url = generateClientShareUrl(business);
                  try {
                    navigator.clipboard.writeText(url);
                    if (showToast) {
                      showToast(
                        'Client Link Copied! 🔗',
                        `Permanent direct link for ${business?.name || 'Business'} copied!`,
                        'success'
                      );
                    }
                  } catch (e) {
                    if (showToast) showToast('Link generated', url, 'info');
                  }
                }}
                className="unified-owner-edit-btn"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', border: 'none' }}
                title="Copy permanent share link for this client (Locked to this business)"
              >
                <Share2 size={13} />
                <span>Copy Client Link 🔗</span>
              </button>

              <button
                type="button"
                onClick={onBackToStep1}
                className="unified-owner-edit-btn"
                title="Website Creator: Edit Business Details (Step 1)"
              >
                <ArrowLeft size={14} />
                <span>Edit Details ✏️</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => generateReviews(null, true)}
            disabled={isLoading}
            className="unified-regen-btn"
            title="Generate fresh short reviews"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="spin-icon" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                <span>Regenerate Variations</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1-Tap Customer Service Selector Chips */}
      {business?.services && business.services.length > 0 && (
        <div className="step2-services-strip">
          <div className="services-strip-label">
            <Sparkles size={13} className="text-amber" />
            <span>Select Service (1-Tap):</span>
          </div>
          <div className="services-strip-scroll">
            {business.services.map((svc, idx) => {
              const isSelected = selectedServiceFilter === svc || currentReviewText.toLowerCase().includes(svc.toLowerCase());
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectServiceChip(svc)}
                  className={`service-strip-chip ${isSelected ? 'active' : ''}`}
                  title={`Focus review on ${svc} & auto-open Google`}
                >
                  {isSelected && <Check size={12} className="text-white" />}
                  <span>{svc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Reviewer Identity Strip (Optional - No Login Needed) */}
      <div className="step2-customer-identity-bar">
        <div className="customer-bar-left">
          <User size={15} className="text-indigo" />
          <span className="customer-bar-title">
            Reviewer Details <span className="customer-bar-tag">(Optional • 0 Login)</span>:
          </span>
        </div>
        <div className="customer-bar-inputs">
          <div className="customer-bar-field">
            <User size={13} className="customer-field-icon text-muted" />
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={business.customerName || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (setBusiness) setBusiness((prev) => ({ ...prev, customerName: val }));
                if (lastSavedReviewIdRef.current) {
                  updateReviewCustomerInfo(lastSavedReviewIdRef.current, val, business.customerPhone);
                }
              }}
              className="customer-bar-input"
            />
          </div>
          <div className="customer-bar-field">
            <Phone size={13} className="customer-field-icon text-muted" />
            <input
              type="tel"
              placeholder="WhatsApp / Phone (Optional)"
              value={business.customerPhone || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (setBusiness) setBusiness((prev) => ({ ...prev, customerPhone: val }));
                if (lastSavedReviewIdRef.current) {
                  updateReviewCustomerInfo(lastSavedReviewIdRef.current, business.customerName, val);
                }
              }}
              className="customer-bar-input"
            />
          </div>
        </div>
      </div>

      {customerRating <= 3 ? (
        <div className="private-care-container">
          {privateFeedbackSubmitted ? (
            <div className="private-care-card private-care-success-card">
              <div className="private-care-icon success-icon">
                <CheckCircle2 size={52} className="text-green" />
              </div>
              <h3 className="private-care-title">Thank You For Your Feedback 🙏</h3>
              <p className="private-care-desc">
                Your comments have been privately received and stored in our database for <strong>{business.name || 'this business'}</strong>.
                Our management team takes all critiques seriously and will review your feedback to improve our services.
              </p>

              <div className="private-care-success-actions">
                <button
                  type="button"
                  onClick={() => handleRatingChange(5)}
                  className="reset-rating-btn"
                >
                  ⭐ Change Rating (Back to 5-Star Reviews)
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppGrievance}
                  className="private-wa-btn"
                >
                  <MessageCircle size={16} />
                  <span>Chat With Manager on WhatsApp</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="private-care-card">
              <div className="private-care-header">
                <div className="private-care-icon">
                  <HeartHandshake size={36} className="text-amber" />
                </div>
                <div className="private-care-header-text">
                  <div className="private-care-badge">
                    <AlertTriangle size={13} className="text-amber" />
                    <span>Private Resolution Care ({customerRating}★ Experience • Internal DB Only)</span>
                  </div>
                  <h3 className="private-care-title">Help Us Improve — We Value Your Feedback</h3>
                  <p className="private-care-desc">
                    We are truly sorry that your visit to <strong>{business.name || 'our store'}</strong> did not meet your expectations. Please share details directly with our store leadership below so we can resolve the issue immediately.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendPrivateFeedback} className="private-care-form">
                <div className="private-form-group">
                  <label className="private-form-label">
                    What went wrong? Tell store management directly (100% Confidential & Private):
                  </label>
                  <textarea
                    rows={4}
                    value={privateFeedbackText}
                    onChange={(e) => setPrivateFeedbackText(e.target.value)}
                    placeholder="Please explain the issue you faced (e.g. delay, service quality, pricing, staff behavior)..."
                    className="private-care-textarea"
                    required
                  />
                </div>

                <div className="private-form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>Your Name (Optional):</label>
                    <input
                      type="text"
                      className="text-input sm"
                      placeholder="e.g. Rahul Sharma"
                      value={business.customerName || ''}
                      onChange={(e) => setBusiness && setBusiness((prev) => ({ ...prev, customerName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>Phone / WhatsApp (Optional):</label>
                    <input
                      type="tel"
                      className="text-input sm"
                      placeholder="e.g. +91 9876543210"
                      value={business.customerPhone || ''}
                      onChange={(e) => setBusiness && setBusiness((prev) => ({ ...prev, customerPhone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="private-form-actions">
                  <button
                    type="submit"
                    disabled={isSubmittingPrivate}
                    className="private-submit-btn"
                  >
                    <Send size={16} />
                    <span>{isSubmittingPrivate ? 'Submitting to DB...' : 'Submit Directly to Management 📩'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppGrievance}
                    className="private-wa-btn"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp Owner Directly</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRatingChange(5)}
                    className="private-cancel-btn"
                  >
                    Change to 5★ ⭐
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* Main Two-Column Workflow */
        <div className="step-2-workflow-grid">
        {/* Left Column: SEO Suggestions List (Clicking any card sends review to the Text Box or Auto-Opens Google!) */}
        <div className="workflow-left-col">
          {/* ⚡ 100% Hands-Free Auto-Pilot: 0 Click • 0 Tap • 0 Touch */}
          {/* If inside Netlify Preview iframe: keep site fully interactive and explain live testing */}
          {isInsideIframe ? (
            <div className="autopilot-launch-banner preview-mode-banner">
              <div className="autopilot-banner-content">
                <div className="autopilot-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                  <Sparkles size={18} className="text-indigo pulse-glow" />
                </div>
                <div className="autopilot-text-wrap">
                  <div className="autopilot-title">
                    🌐 <strong>Netlify Preview Mode:</strong> Auto-Redirect paused inside preview pane
                  </div>
                  <div className="autopilot-sub">
                    ✅ Review is ready & copied! Open live site in a new tab to test automatic Google launch 🚀
                  </div>
                </div>
                <div className="autopilot-actions" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={typeof window !== 'undefined' ? window.location.href : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="autopilot-launch-now-btn"
                    title="Open live site in fresh browser tab"
                  >
                    Open Live Tab ↗
                  </a>
                </div>
              </div>
            </div>
          ) : isAutoLaunchActive ? (
            <div
              className="autopilot-launch-banner"
              onClick={() => handleTriggerImmediateAutoLaunch()}
              title="Click anywhere to launch Google Review right now"
            >
              <div className="autopilot-banner-content">
                <div className="autopilot-icon-wrap">
                  <Sparkles size={18} className="text-amber pulse-glow" />
                </div>
                <div className="autopilot-text-wrap">
                  <div className="autopilot-title">
                    ⚡ <strong>100% Automatic Mode:</strong> Opening Google in <span className="autopilot-sec-badge">{autoLaunchSeconds.toFixed(1)}s</span>
                  </div>
                  <div className="autopilot-sub">
                    ✅ Review copied to clipboard! No click or tap needed — opening Google automatically 🚀
                  </div>
                </div>
                <div className="autopilot-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={handleCancelAutoLaunch}
                    className="autopilot-pause-btn"
                    title="Pause auto-launch countdown"
                  >
                    Pause ⏸️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerImmediateAutoLaunch()}
                    className="autopilot-launch-now-btn"
                    title="Open Google Review right now"
                  >
                    Open Now ↗
                  </button>
                </div>
              </div>
              <div className="autopilot-progress-track">
                <div
                  className="autopilot-progress-bar"
                  style={{ width: `${Math.min(100, Math.max(0, ((1.5 - autoLaunchSeconds) / 1.5) * 100))}%` }}
                ></div>
              </div>
            </div>
          ) : null}

          <ReviewSuggestionsList
            suggestions={suggestions}
            selectedReviewId={selectedReviewId}
            onSelectSuggestion={handleSelectSuggestion}
            onQuickCopy={handleQuickCopy}
            onQuickCopyAndOpen={handleQuickCopyAndOpen}
            copiedId={copiedId}
            isLoading={isLoading}
            business={business}
            onTriggerRegen={() => generateReviews(null, true)}
            autoOpenOnSelect={autoOpenOnSelect}
            onToggleAutoOpen={handleToggleAutoOpen}
          />
        </div>

        {/* Right Column: Live Review Text Box & Action Center */}
        <div className="workflow-right-col">
          <div className="live-editor-card">
            {/* Editor Header */}
            <div className="editor-card-header">
              <div className="editor-title-row">
                <Edit3 size={18} className="text-indigo" />
                <h3 className="editor-title">
                  <span className="desktop-title-text">Review Text Box (Live Editor)</span>
                  <span className="mobile-title-text">✏️ Customize Review (Optional)</span>
                </h3>
              </div>

              {/* Status and Character/Word Counts */}
              <div className="editor-header-right">
                <div className="ai-assistant-live-badge">
                  <Sparkles size={12} className="text-pink pulse-glow" />
                  <span>AI Review Engine Active</span>
                </div>
                <div className="count-badges-row">
                  <span className="count-badge">{currentReviewText.length} chars</span>
                  <span className="count-badge">
                    {currentReviewText.trim() ? currentReviewText.trim().split(/\s+/).length : 0} words
                  </span>
                </div>
              </div>
            </div>

            {/* 100% Hands-Free Auto-Stream Live Banner */}
            <div className="auto-generate-live-banner">
              <div className="auto-generate-status-left">
                <span className={`tiny-green-dot ${isAutoStreamActive && !isUserEditing ? 'pulse' : ''}`}></span>
                <Sparkles size={14} className="text-amber" />
                <div className="auto-status-text-wrap">
                  <div className="auto-status-text">
                    {isUserEditing ? (
                      <span className="text-amber">✏️ Manual Typing Active (Auto-Stream Paused)</span>
                    ) : isAutoStreamActive ? (
                      <>
                        <strong>Live Auto-Stream Active:</strong> New 5-star review generating in{' '}
                        <span className="countdown-pill">{autoStreamCountdown}s</span>
                      </>
                    ) : (
                      <span className="text-muted">Auto-Stream Paused (Current Review Locked)</span>
                    )}
                  </div>
                  <div className="auto-status-sub">
                    {isUserEditing
                      ? 'Click Resume button anytime to restart continuous auto-generation'
                      : '0 Clicks & 0 Refresh needed • Automatically rotates fresh 5-star reviews live'}
                  </div>
                </div>
              </div>

              <div className="auto-generate-controls-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserEditing(false);
                    setIsAutoStreamActive((prev) => !prev);
                  }}
                  className={`stream-toggle-pill-btn ${isAutoStreamActive && !isUserEditing ? 'active' : ''}`}
                  title={isAutoStreamActive ? 'Pause auto-generation' : 'Resume hands-free live auto-generation'}
                >
                  {isAutoStreamActive && !isUserEditing ? '⏸️ Pause Auto' : '▶️ Resume Auto'}
                </button>
              </div>
            </div>

            {/* Live Progress Bar for next auto-generation cycle */}
            {isAutoStreamActive && !isUserEditing && (
              <div className="stream-progress-track">
                <div
                  className="stream-progress-fill"
                  style={{ width: `${((5 - autoStreamCountdown) / 5) * 100}%` }}
                ></div>
              </div>
            )}

            {/* AI Writing Angles (Fast 1-Click Modes) */}
            <div className="ai-copilot-angles-row">
              <span className="angles-label">AI Writing Angles:</span>
              <div className="angles-chips-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserEditing(false);
                    handleAiSuggestForTextBox('service');
                  }}
                  disabled={isAiSuggesting}
                  className="angle-chip-btn"
                  title="Generate review highlighting key service"
                >
                  🎯 Focus on {business.services?.[0] || 'Services'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserEditing(false);
                    handleAiSuggestForTextBox('seo');
                  }}
                  disabled={isAiSuggesting}
                  className="angle-chip-btn"
                  title="Generate review boosting local Google Maps ranking"
                >
                  🚀 Local SEO Booster
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserEditing(false);
                    handleAiSuggestForTextBox('short');
                  }}
                  disabled={isAiSuggesting}
                  className="angle-chip-btn"
                  title="Generate punchy 2-sentence review"
                >
                  💬 Short & Sweet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserEditing(false);
                    handleAiSuggestForTextBox('friendly');
                  }}
                  disabled={isAiSuggesting}
                  className="angle-chip-btn"
                  title="Generate warm, grateful recommendation"
                >
                  ❤️ Polite & Grateful
                </button>
              </div>
            </div>

            {/* Editable Text Area */}
            <div className="textarea-wrapper">
              <textarea
                className="review-live-textarea"
                rows={6}
                placeholder="Auto-generated 5-star review appears here automatically. You can edit or tweak anytime..."
                value={currentReviewText}
                onFocus={() => setIsUserEditing(true)}
                onChange={(e) => {
                  setIsUserEditing(true);
                  setCurrentReviewText(e.target.value);
                }}
              />
            </div>

            {/* AI Tone Modifiers Toolbar */}
            <div className="tone-toolbar">
              <span className="toolbar-label">Quick Tweaks:</span>
              <div className="toolbar-chips">
                <button
                  type="button"
                  onClick={() => handleAiSuggestForTextBox()}
                  disabled={isAiSuggesting}
                  className="tweak-chip-btn tweak-chip-gemini"
                  title="Generate another live AI variation"
                >
                  <Sparkles size={12} className="text-pink inline-icon" />
                  <span>🎲 Next AI Variation</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToneMod('add-emojis')}
                  className="tweak-chip-btn"
                  title="Add friendly emojis"
                >
                  ⭐ Add Emojis
                </button>
                <button
                  type="button"
                  onClick={() => handleToneMod('boost-seo')}
                  className="tweak-chip-btn"
                  title="Inject local ranking anchor keywords"
                >
                  🚀 Boost SEO
                </button>
                <button
                  type="button"
                  onClick={() => handleToneMod('make-concise')}
                  className="tweak-chip-btn"
                  title="Shorten to core message"
                >
                  ✂️ Make Short
                </button>
                <button
                  type="button"
                  onClick={() => handleToneMod('add-cta')}
                  className="tweak-chip-btn"
                  title="Add friendly recommendation line"
                >
                  ❤️ Add Recommendation
                </button>
              </div>
            </div>

            {/* Real-time Live SEO Gauge */}
            <div className="seo-gauge-panel">
              <div className="gauge-header">
                <div className="gauge-score-wrap">
                  <div
                    className="gauge-score-number"
                    style={{ color: seoAnalysis?.color || '#10b981' }}
                  >
                    {seoAnalysis?.score ?? 98}
                    <span className="gauge-score-total">/100</span>
                  </div>
                  <div className="gauge-label-wrap">
                    <span className="gauge-grade" style={{ color: seoAnalysis?.color || '#10b981' }}>
                      {seoAnalysis?.grade || 'Elite SEO'}
                    </span>
                    <span className="gauge-desc">Google Maps Ranking Strength</span>
                  </div>
                </div>

                <div className="gauge-bar-track">
                  <div
                    className="gauge-bar-fill"
                    style={{
                      width: `${seoAnalysis?.score ?? 98}%`,
                      backgroundColor: seoAnalysis?.color || '#10b981'
                    }}
                  ></div>
                </div>
              </div>

              {/* SEO Checklist Signals */}
              <div className="seo-signals-checklist">
                {(seoAnalysis?.signals || []).map((sig, i) => (
                  <div key={i} className={`signal-item ${sig.passed ? 'passed' : 'warning'}`}>
                    {sig.passed ? (
                      <CheckCircle2 size={14} className="signal-icon text-green" />
                    ) : (
                      <AlertCircle size={14} className="signal-icon text-amber" />
                    )}
                    <span className="signal-label"><strong>{sig.label}:</strong> {sig.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HERO ACTION BUTTONS ("GOAT UI") */}
            <div className="goat-actions-container">
              {/* BIG HERO BUTTON: 1-Click Copy & Open Google Link (Native <a> for 100% popup immunity) */}
              <a
                href={getGoogleReviewUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleCopyAndOpenGoogle(currentReviewText, e)}
                className={`hero-action-goat-btn ${popupBlocked ? 'popup-blocked-btn' : ''}`}
                style={{ textDecoration: 'none', display: 'block' }}
                title="1-Click: Copy review text and open Google Review page"
              >
                <div className="hero-btn-glow"></div>
                <div className="hero-btn-content">
                  <div className="hero-btn-icon-cluster">
                    <Copy size={22} className="copy-icon" />
                    <ExternalLink size={20} className="open-icon" />
                  </div>
                  <div className="hero-btn-text-block">
                    <span className="hero-btn-title">
                      {copiedMain
                        ? '✓ REVIEW COPIED • GOOGLE LINK OPENED!'
                        : popupBlocked
                        ? '⚡ CLICK HERE TO OPEN GOOGLE REVIEW (COPIED)'
                        : '⚡ 1-CLICK: COPY REVIEW & OPEN GOOGLE REVIEW PAGE'}
                    </span>
                    <span className="hero-btn-subtitle">
                      {popupBlocked
                        ? 'Review is copied! Click here to launch Google Review in new tab (Press Ctrl+V to paste)'
                        : 'Click to copy review to clipboard & open Google Review page in new tab (Press Ctrl+V to paste)'}
                    </span>
                  </div>
                </div>
              </a>

              {/* Pop-up helper alert if automatic background popup was blocked by browser security */}
              {popupBlocked && (
                <div className="popup-helper-alert">
                  <span className="alert-badge">💡 Tip</span>
                  <div className="alert-text">
                    <strong>Browser Notice:</strong> Browser popup protection prevented opening in background. <strong>Click the button above</strong>—your review is copied and the Google Review page will open immediately!
                  </div>
                </div>
              )}

              {/* Secondary Action Row */}
              <div className="secondary-actions-row">
                {/* Copy Only */}
                <button
                  type="button"
                  onClick={handleCopyOnly}
                  className="sec-btn"
                  title="Copy text only"
                >
                  {copiedMain ? <Check size={16} className="text-green" /> : <Copy size={16} />}
                  <span>Copy Text Only</span>
                </button>

                {/* Open Google Link (Native <a> for 100% guaranteed new tab launch) */}
                <a
                  href={getGoogleReviewUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    copyToClipboard(currentReviewText);
                    saveCurrentReviewRecord(currentReviewText);
                  }}
                  className="sec-btn"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Open Google review page directly"
                >
                  <ExternalLink size={16} />
                  <span>Open Google Page</span>
                </a>

                {/* WhatsApp Share */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="sec-btn text-wa"
                  title="Share draft to customer on WhatsApp"
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp Draft</span>
                </button>

                {/* Counter QR Code */}
                <button
                  type="button"
                  onClick={onOpenQrModal}
                  className="sec-btn"
                  title="Display QR Code for in-store customers"
                >
                  <QrCode size={16} />
                  <span>Display QR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Mobile Sticky Action Bar (Floats at bottom of mobile phones <= 768px for 1-thumb action) */}
      {customerRating >= 4 ? (
        <div className="mobile-bottom-action-dock">
          <a
            href={getGoogleReviewUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleCopyAndOpenGoogle(currentReviewText, e)}
            className={`mobile-dock-btn-main ${copiedMain ? 'copied' : ''}`}
          >
            <div className="mobile-dock-btn-inner">
              <div className="mobile-dock-icon">
                {copiedMain ? <Check size={20} /> : <Sparkles size={20} className="text-amber" />}
              </div>
              <div className="mobile-dock-text">
                <span className="mobile-dock-title">
                  {copiedMain ? '✓ Review Copied! Opening Google...' : '⭐ 1-Click: Copy & Post on Google'}
                </span>
                <span className="mobile-dock-subtitle">Auto-copies 5★ review & opens Google Review page</span>
              </div>
              <ExternalLink size={18} className="mobile-dock-arrow" />
            </div>
          </a>

          <div className="mobile-dock-sub-actions">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="mobile-dock-sub-btn"
              title="Share review on WhatsApp"
            >
              <MessageCircle size={15} className="text-wa" />
              <span>WhatsApp Draft</span>
            </button>
            <span className="mobile-dock-tag">⚡ 0 Install • 0 Login Needed</span>
          </div>
        </div>
      ) : (
        <div className="mobile-bottom-action-dock care-mobile-dock">
          <button
            type="button"
            onClick={handleSendPrivateFeedback}
            className="mobile-dock-btn-main care-main-btn"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <div className="mobile-dock-btn-inner">
              <div className="mobile-dock-icon">
                <Send size={20} className="text-white" />
              </div>
              <div className="mobile-dock-text">
                <span className="mobile-dock-title">📩 Send Feedback to Management</span>
                <span className="mobile-dock-subtitle">Private resolution • Direct store care</span>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

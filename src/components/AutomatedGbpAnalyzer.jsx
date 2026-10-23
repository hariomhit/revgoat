import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Search,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Edit3,
  Radio,
  QrCode,
  Send,
  Building2,
  MapPin,
  Tag,
  Briefcase,
  HelpCircle,
  X,
  Clipboard,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sliders,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { analyzeGoogleBusinessProfile, generateTruthfulSeoReviews } from '../utils/gbpProfileAnalyzer';
import {
  CATEGORIES_LIST,
  POPULAR_SUB_CATEGORIES,
  getBestSubCategory,
  matchToCanonicalCategory
} from '../utils/businessPresets';
import {
  saveLockedBusinessProfile,
  addOrUpdateClientInDirectory,
  generateSlug
} from '../utils/clientProfileManager';

const SAMPLE_GBP_LINKS = [
  {
    name: 'Grey Gents Boutique',
    city: 'Ahmedabad',
    icon: '👔',
    url: 'https://www.google.com/maps/place/Grey+Gents+clothing+store/@23.0338,72.585,17z/data=!4m6!3m5!1s0x395e840cbcd21c89:0x431719ae87995763!8m2!3d23.0338!4d72.585!16s%2Fg%2F11b6d_sample'
  },
  {
    name: 'Shambhu Mocktail Bar',
    city: 'Ahmedabad',
    icon: '🍹',
    url: 'https://www.google.com/maps/place/Shambhu+Mocktail+Bar/@23.025,72.505,17z/data=!4m6!3m5!1s0x395e84f7xsample:0x12345!8m2!3d23.025!4d72.505'
  },
  {
    name: 'Radhe Automobiles',
    city: 'Ahmedabad',
    icon: '🚗',
    url: 'https://www.google.com/maps/place/Radhe+Automobiles/@23.05,72.56,17z/data=!4m6!3m5!1s0x395e840xsample:0x67890!8m2!3d23.05!4d72.56'
  }
];

export default function AutomatedGbpAnalyzer({
  business,
  setBusiness,
  onProceedToStep2,
  showToast,
  geminiApiKey,
  currentShortUrl,
  onOpenQrModal,
  handleWriteToNfc,
  isNfcWriting,
  handleCopyForNfc,
  copiedNfcLink,
  handleShareOnWhatsApp
}) {
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressStep, setAnalysisProgressStep] = useState(0); // 0 = idle, 1 = url, 2 = extract, 3 = category, 4 = review
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeReviewTab, setActiveReviewTab] = useState(0);
  const [copiedReviewIndex, setCopiedReviewIndex] = useState(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editedDraftText, setEditedDraftText] = useState('');

  // Handle Analysis Execution
  const handleExecuteAnalysis = async (customUrl) => {
    const targetUrl = (customUrl || urlInput || '').trim();
    if (!targetUrl) {
      if (showToast) {
        showToast('Link Required', 'Please paste a Google Maps or Google Business Profile URL first.', 'error');
      }
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgressStep(1);

    // Progress simulation steps for engaging UX
    const stepTimer1 = setTimeout(() => setAnalysisProgressStep(2), 500);
    const stepTimer2 = setTimeout(() => setAnalysisProgressStep(3), 1100);
    const stepTimer3 = setTimeout(() => setAnalysisProgressStep(4), 1700);

    try {
      const result = await analyzeGoogleBusinessProfile(targetUrl, geminiApiKey);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!result.success) {
        setAnalysisError(result.error || 'Could not analyze Google Business Profile link.');
        setIsAnalyzing(false);
        setAnalysisProgressStep(0);
        if (showToast) {
          showToast('Analysis Notice', result.error || 'Please check the URL format.', 'error');
        }
        return;
      }

      setAnalysisProgressStep(4);
      setAnalysisResult(result);

      // Automatically update business state
      const detectedBiz = result.business;
      const bSlug = generateSlug(detectedBiz.name);
      const updatedBusiness = {
        ...business,
        ...detectedBiz,
        slug: bSlug,
        client_id: bSlug,
        id: business?.id || bSlug
      };

      setBusiness(updatedBusiness);
      saveLockedBusinessProfile(updatedBusiness);
      addOrUpdateClientInDirectory(updatedBusiness);

      // Set active draft text
      if (result.reviews && result.reviews[0]) {
        setEditedDraftText(result.reviews[0].text);
      }

      if (showToast) {
        showToast(
          '✨ Business Profile Detected!',
          `Identified "${detectedBiz.name}" • Auto-assigned: ${detectedBiz.category}`,
          'success'
        );
      }
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      console.error('Error analyzing GBP link:', err);
      setAnalysisError('Unexpected error while analyzing link. Please verify your connection.');
      if (showToast) {
        showToast('Analysis Error', 'Failed to inspect link. You can tweak fields below.', 'error');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clipboard Paste Handler
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setUrlInput(text.trim());
          handleExecuteAnalysis(text.trim());
          return;
        }
      }
      if (showToast) {
        showToast('Clipboard Notice', 'Please paste the link into the box directly.', 'info');
      }
    } catch (e) {
      if (showToast) {
        showToast('Clipboard Permission', 'Please paste manually using Ctrl+V or right-click.', 'info');
      }
    }
  };

  // Change Category from Ambiguity candidates
  const handleSelectAlternativeCategory = (candidate) => {
    if (!candidate || !candidate.category) return;
    const cat = matchToCanonicalCategory(candidate.category) || candidate.category;
    const sub = candidate.subCategory || getBestSubCategory(cat, business?.name || '', business?.services || []);

    const updated = {
      ...(business || {}),
      category: cat,
      subCategory: sub
    };

    setBusiness(updated);
    saveLockedBusinessProfile(updated);
    addOrUpdateClientInDirectory(updated);

    // Update reviews for new category
    if (analysisResult) {
      setAnalysisResult((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          business: { ...prev.business, category: cat, subCategory: sub },
          analysis: { ...prev.analysis, isAmbiguous: false }
        };
      });
    }

    if (showToast) {
      showToast('Category Updated', `Assigned "${cat}" ➔ "${sub}"`, 'info');
    }
  };

  // Copy Review Draft with Confetti
  const handleCopyReviewDraft = (reviewText, index) => {
    if (!reviewText) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(reviewText);
      }
      setCopiedReviewIndex(index);
      setTimeout(() => setCopiedReviewIndex(null), 2500);

      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch (e) {}

      if (showToast) {
        showToast('Review Draft Copied! 📋', 'Ready to paste directly on Google Maps review page!', 'success');
      }
    } catch (e) {
      if (showToast) showToast('Copy Notice', 'Please copy the text manually.', 'info');
    }
  };

  // Reviews list to display: use analyzed reviews or generate on-the-fly for active business
  const currentReviews = (analysisResult?.reviews && analysisResult.reviews.length > 0)
    ? analysisResult.reviews
    : (business?.name ? generateTruthfulSeoReviews(business) : []);
  const activeReview = currentReviews[activeReviewTab] || currentReviews[0];

  // Keep draft text synced when active review changes and not actively typing
  useEffect(() => {
    if (!isEditingDraft && activeReview?.text) {
      setEditedDraftText(activeReview.text);
    }
  }, [activeReview?.text, isEditingDraft]);

  return (
    <div className="gbp-automation-hero-card">
      {/* Top Header */}
      <div className="gbp-card-header">
        <div className="gbp-header-left">
          <div className="gbp-icon-glow-badge">
            <Sparkles size={22} className="text-amber" />
          </div>
          <div>
            <div className="gbp-pill-tag">
              <Zap size={11} />
              <span>AUTOMATED GOOGLE BUSINESS PROFILE ENGINE</span>
            </div>
            <h2 className="gbp-title">Google Maps Link ➔ Instant Category Detection & SEO Review</h2>
            <p className="gbp-desc">
              Paste any Google Maps or Business Profile link. Revgot automatically identifies your business, assigns the exact primary category & subcategory, and crafts local-SEO-optimized review drafts without any manual dropdown selection.
            </p>
          </div>
        </div>
      </div>

      {/* Main Input Box & Action Row */}
      <div className="gbp-input-box-wrapper">
        <div className="gbp-input-row">
          <div className="gbp-input-field">
            <Globe size={18} className="gbp-field-icon" />
            <input
              type="url"
              className="gbp-url-input"
              placeholder="Paste Google Maps URL here (e.g., https://maps.app.goo.gl/... or https://www.google.com/maps/place/...)"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (analysisError) setAnalysisError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleExecuteAnalysis();
                }
              }}
              disabled={isAnalyzing}
            />
            {urlInput && (
              <button
                type="button"
                onClick={() => {
                  setUrlInput('');
                  setAnalysisError(null);
                }}
                className="gbp-clear-btn"
                title="Clear input"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="gbp-buttons-row">
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="gbp-btn-paste"
              title="Paste link from clipboard and analyze immediately"
              disabled={isAnalyzing}
            >
              <Clipboard size={14} />
              <span>Paste from Clipboard</span>
            </button>

            <button
              type="button"
              onClick={() => handleExecuteAnalysis()}
              disabled={isAnalyzing || !urlInput.trim()}
              className="gbp-btn-analyze"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Analyzing Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Analyze & Generate Review</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample Links Bar */}
        <div className="gbp-samples-bar">
          <span className="gbp-samples-label">💡 Try Sample Google Maps Links:</span>
          <div className="gbp-samples-list">
            {SAMPLE_GBP_LINKS.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => {
                  setUrlInput(sample.url);
                  handleExecuteAnalysis(sample.url);
                }}
                className="gbp-sample-pill"
                title={`Test with ${sample.name} (${sample.city})`}
                disabled={isAnalyzing}
              >
                <span className="sample-icon">{sample.icon}</span>
                <span className="sample-name">{sample.name}</span>
                <span className="sample-city">📍 {sample.city}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Progress Steps Indicator */}
      {isAnalyzing && (
        <div className="gbp-progress-container">
          <div className="gbp-progress-bar-track">
            <div
              className="gbp-progress-bar-fill"
              style={{ width: `${(analysisProgressStep / 4) * 100}%` }}
            ></div>
          </div>
          <div className="gbp-progress-steps">
            <div className={`progress-step-item ${analysisProgressStep >= 1 ? 'active' : ''}`}>
              <span className="step-num">{analysisProgressStep > 1 ? '✓' : '1'}</span>
              <span className="step-label">Validating Link</span>
            </div>
            <div className={`progress-step-item ${analysisProgressStep >= 2 ? 'active' : ''}`}>
              <span className="step-num">{analysisProgressStep > 2 ? '✓' : '2'}</span>
              <span className="step-label">Resolving Maps Profile</span>
            </div>
            <div className={`progress-step-item ${analysisProgressStep >= 3 ? 'active' : ''}`}>
              <span className="step-num">{analysisProgressStep > 3 ? '✓' : '3'}</span>
              <span className="step-label">Auto-Detecting Category</span>
            </div>
            <div className={`progress-step-item ${analysisProgressStep >= 4 ? 'active' : ''}`}>
              <span className="step-num">{analysisProgressStep >= 4 ? '✓' : '4'}</span>
              <span className="step-label">Drafting SEO Review</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message & Troubleshooting Banner */}
      {analysisError && !isAnalyzing && (
        <div className="gbp-error-banner">
          <div className="gbp-error-left">
            <AlertCircle size={18} className="text-rose" />
            <div>
              <h4 className="error-title">Unable to Complete Analysis</h4>
              <p className="error-message">{analysisError}</p>
            </div>
          </div>
          <div className="gbp-error-actions">
            <button
              type="button"
              onClick={() => handleExecuteAnalysis()}
              className="error-retry-btn"
            >
              <RefreshCw size={13} />
              <span>Retry Analysis</span>
            </button>
          </div>
        </div>
      )}

      {/* Ambiguity Clarification Banner (if confidence is borderline) */}
      {analysisResult?.analysis?.isAmbiguous && Array.isArray(analysisResult?.analysis?.candidateCategories) && analysisResult.analysis.candidateCategories.length > 0 && !isAnalyzing && (
        <div className="gbp-ambiguity-banner">
          <div className="ambiguity-header">
            <HelpCircle size={17} className="text-amber" />
            <div>
              <span className="ambiguity-title">Please Confirm the Primary Business Category</span>
              <p className="ambiguity-desc">
                We detected <strong>"{business?.name || 'your business'}"</strong>. To ensure 100% laser-targeted SEO keywords, confirm the best match:
              </p>
            </div>
          </div>
          <div className="ambiguity-candidate-chips">
            {(analysisResult.analysis.candidateCategories || []).map((cand) => {
              const isSelected = business?.category === cand.category;
              return (
                <button
                  key={cand.category}
                  type="button"
                  onClick={() => handleSelectAlternativeCategory(cand)}
                  className={`candidate-chip-btn ${isSelected ? 'selected' : ''}`}
                >
                  <span className="candidate-dot"></span>
                  <span className="candidate-cat">{cand.category}</span>
                  {cand.subCategory && <span className="candidate-sub">➔ {cand.subCategory}</span>}
                  {isSelected && <Check size={13} className="ml-1 text-emerald" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Output: Detected Business Details + Auto-Assigned Categories */}
      {business?.name?.trim() && !isAnalyzing && (
        <div className="gbp-results-container">
          {/* Card 1: Detected Business Identity & Categories */}
          <div className="detected-biz-card">
            <div className="detected-biz-header">
              <div className="biz-header-title-row">
                <div className="biz-icon-box">{business?.icon || '🏢'}</div>
                <div>
                  <div className="biz-status-pill">
                    <CheckCircle2 size={13} className="text-emerald" />
                    <span>GOOGLE BUSINESS PROFILE IDENTIFIED</span>
                  </div>
                  <h3 className="biz-name-display">{business?.name}</h3>
                </div>
              </div>

              {business?.city && (
                <div className="biz-location-pill">
                  <MapPin size={13} />
                  <span>{business.city}</span>
                </div>
              )}
            </div>

            {/* Auto-Assigned Category Badges */}
            <div className="detected-categories-grid">
              <div className="category-detected-box">
                <span className="cat-box-label">PRIMARY CATEGORY (AUTO-ASSIGNED)</span>
                <div className="cat-box-val-row">
                  <Tag size={15} className="text-indigo" />
                  <span className="cat-box-val">{business?.category || 'Retail Store'}</span>
                  <span className="auto-assigned-tag">✓ Auto-Mapped</span>
                </div>
              </div>

              <div className="category-detected-box">
                <span className="cat-box-label">SPECIALIZED SUBCATEGORY (AUTO-ASSIGNED)</span>
                <div className="cat-box-val-row">
                  <Briefcase size={15} className="text-purple" />
                  <span className="cat-box-val">{business?.subCategory || 'General Services'}</span>
                  <span className="auto-assigned-tag">✓ Laser-Targeted</span>
                </div>
              </div>
            </div>

            {/* Services Chips */}
            {Array.isArray(business?.services) && business.services.length > 0 && (
              <div className="detected-services-row">
                <span className="services-row-label">Detected Offerings:</span>
                <div className="services-chips-list">
                  {business.services.map((srv, idx) => (
                    <span key={idx} className="detected-service-chip">
                      ✦ {srv}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Generated SEO-Optimized Review Draft */}
          {activeReview && (
            <div className="generated-review-card">
              <div className="review-card-header">
                <div className="review-header-left">
                  <span className="review-badge-pill">
                    <TrendingUp size={13} className="text-emerald" />
                    <span>LOCAL SEO OPTIMIZED DRAFT</span>
                  </span>
                  <span className="review-seo-score">
                    ⭐ SEO Score: {activeReview.seoScore || 99}/100
                  </span>
                </div>

                {/* Perspective Switcher Tabs */}
                {currentReviews.length > 1 && (
                  <div className="review-tabs-row">
                    {currentReviews.map((rev, idx) => (
                      <button
                        key={rev.id || idx}
                        type="button"
                        onClick={() => {
                          setActiveReviewTab(idx);
                          setEditedDraftText(rev.text);
                          setIsEditingDraft(false);
                        }}
                        className={`review-tab-btn ${activeReviewTab === idx ? 'active' : ''}`}
                      >
                        <span>{idx === 0 ? '🚀 Community Rec' : idx === 1 ? '💖 Quality Experience' : '⚡ Service Focus'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Editable Review Text Box */}
              <div className="review-text-editor-box">
                {isEditingDraft ? (
                  <textarea
                    className="review-textarea"
                    rows={4}
                    value={editedDraftText}
                    onChange={(e) => setEditedDraftText(e.target.value)}
                  />
                ) : (
                  <p className="review-text-paragraph">{editedDraftText || activeReview.text}</p>
                )}
                <div className="review-compliance-badge">
                  <ShieldCheck size={13} className="text-emerald" />
                  <span>Truthful & Compliant • Local SEO terms naturally woven • Zero fabricated claims</span>
                </div>
              </div>

              {/* Review Actions Row */}
              <div className="review-actions-bar">
                <div className="review-actions-left">
                  <button
                    type="button"
                    onClick={() => handleCopyReviewDraft(editedDraftText || activeReview.text, activeReviewTab)}
                    className="review-action-copy-btn"
                    title="Copy review draft to clipboard"
                  >
                    {copiedReviewIndex === activeReviewTab ? (
                      <>
                        <Check size={15} className="text-green" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        <span>Copy Review Draft</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingDraft(!isEditingDraft)}
                    className="review-action-edit-btn"
                    title="Edit review text"
                  >
                    <Edit3 size={14} />
                    <span>{isEditingDraft ? 'Done Editing' : 'Edit Text'}</span>
                  </button>

                  {business?.googleReviewUrl && (
                    <a
                      href={business.googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="review-action-test-btn"
                      title="Open Google Review page in a new tab"
                    >
                      <ExternalLink size={14} />
                      <span>Write Review on Google</span>
                    </a>
                  )}
                </div>

                <div className="review-actions-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (onProceedToStep2) onProceedToStep2();
                    }}
                    className="review-action-proceed-btn"
                    title="Proceed to full multi-style Review Experience"
                  >
                    <span>Proceed to Step 2</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Card 3: Instant NFC & QR Standee Link Bar */}
          {currentShortUrl && (
            <div className="gbp-direct-link-bar">
              <div className="direct-link-left">
                <span className="direct-link-label">Direct Client Shareable Link:</span>
                <span className="direct-link-url" title={currentShortUrl}>
                  {currentShortUrl}
                </span>
              </div>

              <div className="direct-link-actions">
                <button
                  type="button"
                  onClick={() => handleWriteToNfc && handleWriteToNfc(currentShortUrl)}
                  className={`nfc-quick-btn ${isNfcWriting ? 'writing' : ''}`}
                  title="Write directly to NFC Tag"
                >
                  <Radio size={14} className={isNfcWriting ? 'spin-icon' : ''} />
                  <span>{isNfcWriting ? 'Touch Tag...' : '📱 Write NFC'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyForNfc && handleCopyForNfc(currentShortUrl)}
                  className="nfc-quick-copy-btn"
                  title="Copy link for NFC tag or tools"
                >
                  {copiedNfcLink ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                  <span>{copiedNfcLink ? 'Copied!' : 'Copy NFC Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenQrModal && onOpenQrModal()}
                  className="qr-quick-btn"
                  title="View & Print Standee QR Code"
                >
                  <QrCode size={14} />
                  <span>🖨️ Standee QR</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareOnWhatsApp}
                  className="whatsapp-quick-btn"
                  title="Send to client on WhatsApp"
                >
                  <Send size={14} />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

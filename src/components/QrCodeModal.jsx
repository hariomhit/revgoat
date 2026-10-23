import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Download,
  ExternalLink,
  Copy,
  Check,
  Link2,
  RotateCcw,
  Printer,
  Sparkles,
  Clipboard,
  Smartphone,
  Globe,
  Settings,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import {
  generateClientShareUrl,
  generateClientShortUrl,
  getSavedBaseUrl,
  setSavedBaseUrl
} from '../utils/clientProfileManager';

export default function QrCodeModal({
  isOpen,
  onClose,
  business = {},
  setBusiness,
  showToast,
  onCopyLink
}) {
  if (!isOpen) return null;

  const safeBiz = business || {};

  // Mode: 'slug' (/r/:id NFC & QR standee target) vs 'app' (payload) vs 'direct' (Google)
  const [qrMode, setQrMode] = useState('slug');

  // Custom base domain if user wants to point to their hosted Vercel/Netlify domain while testing on localhost
  const [customBaseUrl, setCustomBaseUrlState] = useState(() => getSavedBaseUrl());
  const [showDomainConfig, setShowDomainConfig] = useState(false);
  const [domainInput, setDomainInput] = useState(() => getSavedBaseUrl());

  // Direct Google Review URL
  const defaultGoogleUrl =
    safeBiz.googleReviewUrl ||
    `https://www.google.com/search?q=${encodeURIComponent(
      (safeBiz.name || 'Your Business') + ' ' + (safeBiz.city || '')
    )}`;
  const [directGoogleUrl, setDirectGoogleUrl] = useState(defaultGoogleUrl);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sync direct URL if business changes
  useEffect(() => {
    if (safeBiz.googleReviewUrl) {
      setDirectGoogleUrl(safeBiz.googleReviewUrl);
    } else {
      setDirectGoogleUrl(
        `https://www.google.com/search?q=${encodeURIComponent(
          (safeBiz.name || 'Your Business') + ' ' + (safeBiz.city || '')
        )}`
      );
    }
  }, [safeBiz.googleReviewUrl, safeBiz.name, safeBiz.city, isOpen]);

  // Compute live dynamic slug link (/r/:id) and full payload link
  const dynamicSlugUrl = generateClientShortUrl(safeBiz, customBaseUrl, 'r');
  const webAppUrl = generateClientShareUrl(safeBiz, customBaseUrl);

  // Active URL depends on selected mode
  const activeUrl = qrMode === 'slug'
    ? dynamicSlugUrl
    : (qrMode === 'app' ? webAppUrl : (directGoogleUrl.trim() || defaultGoogleUrl));

  // Real-time dynamic QR code image URL (High resolution 420x420 for clean printing)
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(
    activeUrl
  )}&margin=15`;

  // Detect if running on localhost
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0');

  // Handle direct Google URL change
  const handleDirectUrlChange = (newVal) => {
    setDirectGoogleUrl(newVal);
    if (setBusiness && newVal.trim()) {
      setBusiness((prev) => ({
        ...prev,
        googleReviewUrl: newVal.trim()
      }));
    }
  };

  // Save custom base domain (for when user deploys to Vercel/Netlify)
  const handleSaveDomain = () => {
    let clean = (domainInput || '').trim();
    if (clean) {
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean;
      }
      setSavedBaseUrl(clean);
      setCustomBaseUrlState(clean);
      setDomainInput(clean);
      setShowDomainConfig(false);
      if (showToast) {
        showToast('Domain Updated! 🌐', 'QR Code now points to: ' + clean, 'success');
      }
    } else {
      setSavedBaseUrl('');
      const defaultUrl = getSavedBaseUrl();
      setCustomBaseUrlState(defaultUrl);
      setDomainInput(defaultUrl);
      setShowDomainConfig(false);
      if (showToast) {
        showToast('Domain Reset', 'Reverted to auto-detected address', 'info');
      }
    }
  };

  // Paste from clipboard helper
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        if (qrMode === 'direct') {
          handleDirectUrlChange(text.trim());
        } else {
          setDomainInput(text.trim());
          setShowDomainConfig(true);
        }
        if (showToast) {
          showToast('Link Pasted! 📋', 'Live QR code updated instantly', 'success');
        }
      }
    } catch (err) {
      if (showToast) {
        showToast('Clipboard Notice', 'Please paste manually into the input box', 'info');
      }
    }
  };

  // Copy active link
  const handleCopy = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    if (showToast) {
      showToast(
        'Live Link Copied! 🔗',
        qrMode === 'app'
          ? 'Web App Launcher link copied (Camera Ready)'
          : 'Google Review destination copied',
        'success'
      );
    } else if (onCopyLink) {
      onCopyLink(activeUrl);
    }
  };

  // Download QR Code image
  const handleDownloadImage = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(qrImageSrc);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const safeName = (business.name || 'Review').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `${safeName}_Standee_QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      if (showToast) {
        showToast('QR Image Downloaded! 📥', 'Ready to print for your shop counter', 'success');
      }
    } catch (e) {
      window.open(qrImageSrc, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // Print Standee helper
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <QrCode className="text-indigo" size={24} />
            <div>
              <h3>Counter QR Standee & Launcher</h3>
              <p className="modal-header-sub">
                Scan with standard Phone Camera or Google Lens • 0 App Download Required
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Mode Selector Tabs */}
          <div className="qr-mode-tabs">
            <button
              type="button"
              className={`qr-mode-tab-btn ${qrMode === 'slug' ? 'active' : ''}`}
              onClick={() => setQrMode('slug')}
            >
              <Smartphone size={16} />
              <div className="qr-tab-text">
                <span className="qr-tab-title">🚀 Dynamic Slug (/r/:id)</span>
                <span className="qr-tab-sub">Official NFC & QR Standee Target</span>
              </div>
            </button>

            <button
              type="button"
              className={`qr-mode-tab-btn ${qrMode === 'app' ? 'active' : ''}`}
              onClick={() => setQrMode('app')}
            >
              <Sparkles size={16} />
              <div className="qr-tab-text">
                <span className="qr-tab-title">⚡ Web App Payload</span>
                <span className="qr-tab-sub">Self-Contained Embedded Data</span>
              </div>
            </button>

            <button
              type="button"
              className={`qr-mode-tab-btn ${qrMode === 'direct' ? 'active' : ''}`}
              onClick={() => setQrMode('direct')}
            >
              <ExternalLink size={16} />
              <div className="qr-tab-text">
                <span className="qr-tab-title">📍 Direct Google Link</span>
                <span className="qr-tab-sub">Opens Google Maps dialog</span>
              </div>
            </button>
          </div>

          {/* Mode 1 & 2: Dynamic Slug & Web App Launcher Controls */}
          {qrMode === 'slug' || qrMode === 'app' ? (
            <div className="qr-live-input-box">
              <div className="qr-live-input-header">
                <label className="qr-live-label">
                  <Smartphone size={15} className="text-emerald" />
                  <span>Target: {qrMode === 'slug' ? 'Dynamic Standee Route (/r/:id)' : 'Web App Payload'}</span>
                </label>
                <div className="qr-live-badge">
                  <span className="live-dot pulse"></span>
                  <span>Auto-Update Active</span>
                </div>
              </div>

              <div className="qr-input-field-wrap">
                <input
                  type="text"
                  readOnly
                  value={activeUrl}
                  className="qr-live-input qr-readonly-input"
                  title="Direct scanner URL ready for NFC tag or standee QR"
                />
              </div>

              {/* Quick actions for Web App mode */}
              <div className="qr-quick-actions">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="qr-pill-btn"
                  title="Copy link to clipboard"
                >
                  <Copy size={12} />
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.open(activeUrl, '_blank')}
                  className="qr-pill-btn"
                  title="Test scanner experience in browser"
                >
                  <ExternalLink size={12} />
                  <span>Test Link ↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDomainConfig(!showDomainConfig)}
                  className={`qr-pill-btn ${showDomainConfig ? 'active-pill' : 'qr-pill-subtle'}`}
                  title="Configure base website domain or deployed URL"
                >
                  <Globe size={12} />
                  <span>{showDomainConfig ? 'Hide Domain' : 'Configure Domain'}</span>
                </button>
              </div>

              {/* Collapsible Deployed Domain Config */}
              {showDomainConfig && (
                <div className="qr-domain-config-panel">
                  <div className="qr-domain-config-header">
                    <Globe size={14} className="text-indigo" />
                    <span>Website Base Domain (Live Hosted URL):</span>
                  </div>
                  <p className="qr-domain-config-desc">
                    If you deployed this app to Vercel, Netlify, or a custom domain, enter that URL here so the printed standee QR code can be scanned globally by any smartphone camera:
                  </p>
                  <div className="qr-domain-input-row">
                    <input
                      type="url"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="e.g. https://your-reviews.vercel.app/"
                      className="qr-domain-input"
                    />
                    <button
                      type="button"
                      onClick={handleSaveDomain}
                      className="qr-domain-save-btn"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* Localhost Warning Notice with 1-Tap Wi-Fi IP Button */}
              {isLocalhost && (
                <div className="qr-localhost-notice">
                  <span className="notice-icon">📲</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                      Mobile Camera Testing (Local Wi-Fi):
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>
                      To test scanning with a phone camera locally, connect both your phone and laptop to the same Wi-Fi network. Click the button below to use the production URL for instant scanning:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const liveUrl = 'https://revgoat-business-pro.vercel.app/';
                          setSavedBaseUrl(liveUrl);
                          setCustomBaseUrlState(liveUrl);
                          setDomainInput(liveUrl);
                          if (showToast) {
                            showToast('Live Production Active! 🌐', 'QR Code updated: Ready to scan with any smartphone camera!', 'success');
                          }
                        }}
                        className="qr-pill-btn active-pill"
                        title="Activate live Vercel domain for QR code"
                      >
                        ⚡ Live Production: revgoat-business-pro.vercel.app
                      </button>

                      {customBaseUrl !== 'http://localhost:3000/' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSavedBaseUrl('');
                            setCustomBaseUrlState('http://localhost:3000/');
                            setDomainInput('http://localhost:3000/');
                            if (showToast) {
                              showToast('Reset to Localhost', 'Base URL reset to localhost', 'info');
                            }
                          }}
                          className="qr-pill-btn qr-pill-subtle"
                        >
                          Reset Localhost
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Mode 2: Direct Google Link Controls */
            <div className="qr-live-input-box">
              <div className="qr-live-input-header">
                <label htmlFor="qr-live-url-input" className="qr-live-label">
                  <Link2 size={15} className="text-indigo" />
                  <span>Google Review / Maps Destination URL:</span>
                </label>
                <div className="qr-live-badge">
                  <span className="live-dot pulse"></span>
                  <span>Direct Google</span>
                </div>
              </div>

              <div className="qr-input-field-wrap">
                <input
                  id="qr-live-url-input"
                  type="url"
                  value={directGoogleUrl}
                  onChange={(e) => handleDirectUrlChange(e.target.value)}
                  placeholder="Paste your Google Maps Review link here..."
                  className="qr-live-input"
                />
                {directGoogleUrl && (
                  <button
                    type="button"
                    onClick={() => handleDirectUrlChange('')}
                    className="qr-input-clear-btn"
                    title="Clear input"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="qr-quick-actions">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="qr-pill-btn"
                  title="Paste link from clipboard"
                >
                  <Clipboard size={12} />
                  <span>Paste Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.open(directGoogleUrl, '_blank')}
                  className="qr-pill-btn"
                  title="Open and test link in browser"
                >
                  <ExternalLink size={12} />
                  <span>Test Link ↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectUrlChange(defaultGoogleUrl)}
                  className="qr-pill-btn qr-pill-subtle"
                  title="Reset to default business search link"
                >
                  <RotateCcw size={12} />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>
          )}

          {/* Standee QR Card Preview (Ready for Physical Acrylic Counter Display) */}
          <div className="qr-preview-frame print-standee-card">
            {/* Standee Acrylic Header */}
            <div className="qr-business-header">
              <div className="qr-stars-banner">
                <span className="qr-star-glow">★</span>
                <span className="qr-star-glow">★</span>
                <span className="qr-star-glow">★</span>
                <span className="qr-star-glow">★</span>
                <span className="qr-star-glow">★</span>
              </div>
              <h4 className="qr-bname">{safeBiz.name || 'Your Business'}</h4>
              <p className="qr-bcity">
                {safeBiz.city ? `📍 ${safeBiz.city}` : 'Verified Business Profile'}
                {safeBiz.category ? ` • ${safeBiz.category}` : ''}
              </p>
              <div className="qr-no-download-badge">
                <Sparkles size={13} className="text-amber" />
                <span>0 App Download • Instant Mobile Web</span>
              </div>
            </div>

            {/* Scanning Instructions Callout */}
            <div className="qr-scan-instruction">
              <span className="qr-camera-icon">📸</span>
              <span className="qr-scan-text">Scan with Phone Camera or Google Lens</span>
            </div>

            {/* QR Code Image Container */}
            <div className="qr-img-wrapper">
              <img
                src={qrImageSrc}
                alt={`Google Review QR code for ${safeBiz.name || 'business'}`}
                className="qr-img"
              />
            </div>

            {/* 3-Step Micro Flow */}
            <div className="qr-standee-steps">
              <div className="standee-step-item">
                <span className="step-num">1</span>
                <span className="step-lbl">Scan with Camera</span>
              </div>
              <span className="step-divider">→</span>
              <div className="standee-step-item">
                <span className="step-num">2</span>
                <span className="step-lbl">Tap Keywords</span>
              </div>
              <span className="step-divider">→</span>
              <div className="standee-step-item">
                <span className="step-num">3</span>
                <span className="step-lbl">Post on Google</span>
              </div>
            </div>

            {/* Standee Branding Footer */}
            <div className="qr-standee-footer">
              <span className="qr-footer-brand">POWERED BY AMDAVAD AI STUDIO</span>
              <span className="qr-footer-tagline">10-SECOND 5★ GOOGLE REVIEWS</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="qr-action-row">
            <button
              type="button"
              onClick={handleCopy}
              className="action-btn-secondary"
            >
              {copiedLink ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Active Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="action-btn-primary"
            >
              <Download size={16} />
              <span>{isDownloading ? 'Downloading...' : 'Download Standee Image'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="action-btn-secondary print-hide-mobile"
              title="Print Acrylic Counter Standee"
            >
              <Printer size={16} />
              <span>Print Standee</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

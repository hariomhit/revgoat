import React, { useState } from 'react';
import {
  Sparkles,
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Settings,
  Smartphone,
  Share2,
  Globe,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  generateClientShareUrl,
  getSavedBaseUrl,
  setSavedBaseUrl
} from '../utils/clientProfileManager';

export default function CounterStandeeScreen({
  business = {},
  onOpenReviewApp,
  onOpenAdminModal,
  showToast
}) {
  const safeBiz = business || {};
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // QR Mode: 'app' (Universal AI Review App - 0 Download, 0 Login) vs 'direct' (Direct Google Review Link)
  const [qrMode, setQrMode] = useState('app');

  // Universal Base Domain State
  const [customBaseUrl, setCustomBaseUrlState] = useState(() => getSavedBaseUrl());
  const [showDomainConfig, setShowDomainConfig] = useState(false);
  const [domainInput, setDomainInput] = useState(() => getSavedBaseUrl());

  // Direct Google Review Link
  const directGoogleUrl =
    safeBiz.googleReviewUrl ||
    `https://www.google.com/search?q=${encodeURIComponent(
      (safeBiz.name || 'Your Business') + ' ' + (safeBiz.city || '') + ' review'
    )}`;

  // Generate the live Web App link for mobile scanning (Camera/Google Lens ready, 0 download, 0 login)
  const webAppUrl = generateClientShareUrl(safeBiz, customBaseUrl);

  // Active target scan URL
  const scanUrl = qrMode === 'app' ? webAppUrl : (directGoogleUrl || webAppUrl);

  // High-resolution QR code image for crisp mobile camera scanning
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=480x480&data=${encodeURIComponent(
    scanUrl
  )}&margin=15`;

  // Detect if running on a private local IP (localhost, 127.0.0.1, 172.x, 192.168.x, 10.x)
  const isLocalUrl =
    customBaseUrl.includes('172.') ||
    customBaseUrl.includes('localhost') ||
    customBaseUrl.includes('127.0.0.1') ||
    customBaseUrl.includes('192.168.') ||
    customBaseUrl.includes('10.');

  // Save custom base domain (for when user deploys to Vercel/Netlify/custom domain)
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
        showToast('Universal Domain Set! 🌐', `QR Code now points to: ${clean}`, 'success');
      }
    } else {
      setSavedBaseUrl('');
      const defaultUrl = getSavedBaseUrl();
      setCustomBaseUrlState(defaultUrl);
      setDomainInput(defaultUrl);
      setShowDomainConfig(false);
      if (showToast) {
        showToast('Domain Reset', 'Reverted to auto-detected local address', 'info');
      }
    }
  };

  // Copy scan link
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(scanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      if (showToast) {
        showToast('Link Copied! 🔗', 'Mobile Camera scan link copied to clipboard', 'success');
      }
    } catch (e) {}
  };

  // Download Standee Image
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(qrImageSrc);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const safeName = (safeBiz.name || 'Business').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `${safeName}_Counter_Standee_QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      if (showToast) {
        showToast('Standee Downloaded! 📥', 'Ready to print for your shop counter', 'success');
      }
    } catch (e) {
      window.open(qrImageSrc, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="standee-screen-container">
      {/* Top Banner Guide & Universal Status */}
      <div className="standee-screen-top-bar">
        <div className="standee-top-badge">
          <span className="live-dot pulse"></span>
          <span>Official Counter Display Active</span>
        </div>
        <p className="standee-top-instruction">
          Customers scan using their phone camera or Google Lens ➔ your review app opens instantly (0 app download • 0 login)!
        </p>
      </div>

      {/* Universal Scanner Cloud Status & Config (Outside Print) */}
      <div className="standee-network-indicator-bar">
        <div className="network-indicator-left">
          {isLocalUrl ? (
            <div className="network-status-chip warning" title="Local network mode">
              <span className="status-ping amber"></span>
              <span>📶 Local Wi-Fi Mode</span>
            </div>
          ) : (
            <div className="network-status-chip success" title="Universal Cloud Mode">
              <CheckCircle2 size={13} className="text-emerald" />
              <span>🌐 Universal Cloud Active (Any 4G/5G Customer & All Browsers)</span>
            </div>
          )}
          <span className="network-target-url" title={scanUrl}>
            Target: <code>{scanUrl.length > 55 ? scanUrl.slice(0, 52) + '...' : scanUrl}</code>
          </span>
        </div>

        <div className="network-indicator-right">
          <button
            type="button"
            onClick={() => setShowDomainConfig(!showDomainConfig)}
            className={`standee-pill-config-btn ${showDomainConfig ? 'active' : ''}`}
            title="Configure universal deployed domain (e.g. Vercel) for 4G/5G customers"
          >
            <Globe size={13} />
            <span>{showDomainConfig ? 'Close Domain Settings' : 'Configure Universal Domain 🌐'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Deployed Domain Config Box */}
      {showDomainConfig && (
        <div className="standee-domain-config-box">
          <div className="domain-config-header">
            <Globe size={15} className="text-indigo" />
            <strong>Universal Customer Domain (Live Website URL):</strong>
          </div>
          <p className="domain-config-desc">
            If you have hosted this app on Vercel, Netlify, or a custom domain, enter that URL here. This ensures your printed standee QR code opens instantly on any customer phone (4G/5G/Wi-Fi) in Safari and Chrome without errors:
          </p>
          <div className="domain-config-input-row">
            <input
              type="url"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="e.g. https://your-brand-reviews.vercel.app/"
              className="domain-config-input"
            />
            <button
              type="button"
              onClick={handleSaveDomain}
              className="domain-config-save-btn"
            >
              Save Universal URL
            </button>
            <button
              type="button"
              onClick={() => {
                setSavedBaseUrl('');
                const def = getSavedBaseUrl();
                setCustomBaseUrlState(def);
                setDomainInput(def);
                setShowDomainConfig(false);
              }}
              className="domain-config-reset-btn"
              title="Reset to auto-detected address"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* QR Mode Switcher (Outside Print) */}
      <div className="standee-qr-mode-switcher">
        <button
          type="button"
          onClick={() => setQrMode('app')}
          className={`qr-mode-btn ${qrMode === 'app' ? 'active' : ''}`}
        >
          <Sparkles size={14} className="text-amber" />
          <span>Review App (AI 5-Star Generator • 0 Install • 0 Login)</span>
        </button>
        <button
          type="button"
          onClick={() => setQrMode('direct')}
          className={`qr-mode-btn ${qrMode === 'direct' ? 'active' : ''}`}
        >
          <ExternalLink size={14} />
          <span>Direct Google Review Link</span>
        </button>
      </div>

      {/* Main Acrylic Counter Standee Card (Print-Optimized) */}
      <div className="main-standee-acrylic-card print-standee-card">
        {/* Standee Acrylic Header */}
        <div className="standee-card-header">
          <div className="standee-stars-row">
            <span className="standee-star">★</span>
            <span className="standee-star">★</span>
            <span className="standee-star">★</span>
            <span className="standee-star">★</span>
            <span className="standee-star">★</span>
          </div>

          <h1 className="standee-business-title">
            {safeBiz.name || 'Your Business Name'}
          </h1>

          <div className="standee-business-sub">
            <span>{safeBiz.category || 'Local Business'}</span>
            {safeBiz.city && (
              <>
                <span className="bullet-sep">•</span>
                <span>📍 {safeBiz.city}</span>
              </>
            )}
          </div>

          <div className="standee-pill-badge">
            <Sparkles size={13} className="text-amber" />
            <span>0 App Download • Instant Mobile Web • 0 Login</span>
          </div>
        </div>

        {/* Scan Callout */}
        <div className="standee-camera-callout">
          <span className="callout-icon">📸</span>
          <div className="callout-text-wrap">
            <span className="callout-heading">Scan with Phone Camera or Google Lens</span>
            <span className="callout-sub">Point camera ➔ Tap link to open</span>
          </div>
        </div>

        {/* Big High-Definition QR Code Frame */}
        <div className="standee-qr-frame">
          <div className="qr-corner top-left"></div>
          <div className="qr-corner top-right"></div>
          <div className="qr-corner bottom-left"></div>
          <div className="qr-corner bottom-right"></div>

          <img
            src={qrImageSrc}
            alt={`Scan QR Code to review ${safeBiz.name || 'business'} on Google`}
            className="standee-qr-img"
          />
        </div>

        {/* 3-Step Micro Guide for Customers */}
        <div className="standee-three-steps">
          <div className="standee-step">
            <div className="standee-step-badge">1</div>
            <div className="standee-step-txt">
              <strong>Scan QR</strong>
              <small>Using Phone Camera</small>
            </div>
          </div>

          <span className="step-arrow">➔</span>

          <div className="standee-step">
            <div className="standee-step-badge">2</div>
            <div className="standee-step-txt">
              <strong>Pick Keywords</strong>
              <small>1-Tap Services</small>
            </div>
          </div>

          <span className="step-arrow">➔</span>

          <div className="standee-step">
            <div className="standee-step-badge">3</div>
            <div className="standee-step-txt">
              <strong>Post on Google</strong>
              <small>Instant 5★ Review</small>
            </div>
          </div>
        </div>

        {/* Standee Acrylic Footer */}
        <div className="standee-card-footer">
          <span className="footer-brand-title">POWERED BY AMDAVAD AI STUDIO</span>
          <span className="footer-brand-sub">EMPOWERING AUTOMATION • REVIEWS IN 10 SECONDS</span>
        </div>
      </div>

      {/* Standee Screen Control Bar (Outside Print) */}
      <div className="standee-controls-bar">
        <button
          type="button"
          onClick={onOpenReviewApp}
          className="standee-btn-primary"
          title="Directly test review generator on this device"
        >
          <Smartphone size={16} />
          <span>Open Review App (Direct Test)</span>
          <ArrowRight size={15} />
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="standee-btn-secondary"
          title="Print Counter Standee"
        >
          <Printer size={16} />
          <span>Print Standee</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="standee-btn-secondary"
          title="Download high-res Standee PNG"
        >
          <Download size={16} />
          <span>{isDownloading ? 'Downloading...' : 'Download QR'}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="standee-btn-secondary"
          title="Copy direct scan link"
        >
          {copied ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
          <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
        </button>

        {onOpenAdminModal && (
          <button
            type="button"
            onClick={onOpenAdminModal}
            className="standee-btn-subtle"
            title="Edit business details or switch clients"
          >
            <Settings size={15} />
            <span>Owner Settings</span>
          </button>
        )}
      </div>
    </div>
  );
}

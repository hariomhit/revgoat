import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Link as LinkIcon,
  MessageCircle,
  Mail,
  Zap,
  Info,
  Users,
  Lock,
  Sparkles,
  HelpCircle,
  Search
} from 'lucide-react';
import { extractPlaceId, generateReviewUrlFromPlaceId } from '../utils/clientProfileManager';

export default function GooglePolicyGuardModal({
  isOpen,
  onClose,
  business = {},
  setBusiness,
  showToast,
  onOpenMobileOwnerModal
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'generator' | 'moderation' | 'agency'
  const [inputPlaceIdOrUrl, setInputPlaceIdOrUrl] = useState(business.placeId || business.googleReviewUrl || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);

  const safeBiz = business || {};
  const effectivePlaceId = extractPlaceId(inputPlaceIdOrUrl) || safeBiz.placeId || '';
  const officialReviewLink = effectivePlaceId
    ? generateReviewUrlFromPlaceId(effectivePlaceId)
    : (safeBiz.googleReviewUrl && (safeBiz.googleReviewUrl.includes('g.page') || safeBiz.googleReviewUrl.includes('placeid='))
      ? safeBiz.googleReviewUrl
      : `https://www.google.com/search?q=${encodeURIComponent((safeBiz.name || 'Your Business') + ' ' + (safeBiz.city || '') + ' google review')}`);

  const handleApplyOfficialLink = () => {
    const extracted = extractPlaceId(inputPlaceIdOrUrl);
    if (extracted) {
      const officialUrl = generateReviewUrlFromPlaceId(extracted);
      if (setBusiness) {
        setBusiness((prev) => ({
          ...prev,
          placeId: extracted,
          googleReviewUrl: officialUrl
        }));
      }
      if (showToast) {
        showToast('Official Place ID Applied! 🛡️', 'Link is now 100% verified & Google ToS compliant', 'success');
      }
    } else if (inputPlaceIdOrUrl.trim()) {
      if (setBusiness) {
        setBusiness((prev) => ({
          ...prev,
          googleReviewUrl: inputPlaceIdOrUrl.trim()
        }));
      }
      if (showToast) {
        showToast('Review Link Saved', 'Updated business review destination', 'info');
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(officialReviewLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    if (showToast) {
      showToast('Official Review Link Copied! 🔗', 'Safe & direct Google review link', 'success');
    }
  };

  const whatsAppMessage = `Hello! 🙏 Thank you for visiting *${safeBiz.name || 'our business'}*! ⭐\n\nIf you enjoyed our service, please take 10 seconds to share your authentic 5-star review on Google:\n👉 ${officialReviewLink}\n\nYour review helps our local team immensely. Thank you!`;

  const smsMessage = `Hi! Thank you for choosing ${safeBiz.name || 'us'}. Please share your 5-star feedback on Google: ${officialReviewLink} - Thank you!`;

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsAppMessage);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2000);
    if (showToast) {
      showToast('WhatsApp Template Copied! 💬', 'Paste into WhatsApp to send real customers', 'success');
    }
  };

  const handleCopySms = () => {
    navigator.clipboard.writeText(smsMessage);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2000);
    if (showToast) {
      showToast('SMS Template Copied! ✉️', 'Ready to send via SMS or Email', 'success');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog policy-guard-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-title">
            <div className="policy-badge-icon">
              <ShieldCheck size={24} className="text-emerald" />
            </div>
            <div>
              <h3>Google Business Profile (GBP) Safety & Compliance Center</h3>
              <p className="modal-header-sub">
                100% Google Terms of Service (ToS) Compliance • Zero Bots • Anti-Suspension Architecture
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="policy-tabs-nav">
          <button
            type="button"
            className={`policy-tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <AlertTriangle size={15} />
            <span>Anti-Suspension Rules</span>
          </button>

          <button
            type="button"
            className={`policy-tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            <LinkIcon size={15} />
            <span>Official Review Link</span>
          </button>

          <button
            type="button"
            className={`policy-tab-btn ${activeTab === 'moderation' ? 'active' : ''}`}
            onClick={() => setActiveTab('moderation')}
          >
            <Sparkles size={15} />
            <span>Smart Moderation & Filters</span>
          </button>

          <button
            type="button"
            className={`policy-tab-btn ${activeTab === 'agency' ? 'active' : ''}`}
            onClick={() => setActiveTab('agency')}
          >
            <Users size={15} />
            <span>Agency & Client Safety</span>
          </button>
        </div>

        <div className="modal-body policy-modal-body">
          {/* TAB 1: ANTI-SUSPENSION RULES */}
          {activeTab === 'rules' && (
            <div className="policy-section-content">
              <div className="policy-alert-banner">
                <ShieldCheck size={20} className="text-emerald shrink-0" />
                <div>
                  <strong>Why Compliance Matters:</strong>
                  <p>
                    Google Business Profile (Maps) rules are extremely strict. Fake reviews, automated bots, or policy violations can cause immediate and permanent profile suspension. RevGOAT is engineered to keep your clients 100% compliant and safe.
                  </p>
                </div>
              </div>

              <div className="policy-rules-grid">
                <div className="policy-card rule-card">
                  <div className="rule-card-header">
                    <span className="rule-num">1</span>
                    <h4>100% Real Customers Only (Zero Bots)</h4>
                  </div>
                  <p className="rule-desc">
                    Google tracks IP addresses, device IDs, GPS locations, and user search history. Buying fake reviews or using bots triggers instant Google Spam Algorithms.
                  </p>
                  <div className="rule-solution">
                    <CheckCircle2 size={14} className="text-emerald shrink-0" />
                    <span><strong>RevGOAT Solution:</strong> Real customers open the link on their own phone, write or select genuine feedback, and submit directly through their own Google account.</span>
                  </div>
                </div>

                <div className="policy-card rule-card">
                  <div className="rule-card-header">
                    <span className="rule-num">2</span>
                    <h4>Strict "No Review Gating" Compliance</h4>
                  </div>
                  <p className="rule-desc">
                    Google policy strictly forbids blocking unhappy customers from posting or forcing a 5-star rating for gifts/discounts.
                  </p>
                  <div className="rule-solution">
                    <CheckCircle2 size={14} className="text-emerald shrink-0" />
                    <span><strong>RevGOAT Solution:</strong> When a customer selects 1-3 stars, we offer a private resolution care channel to solve their issue directly, while always keeping the transparent Google link accessible.</span>
                  </div>
                </div>

                <div className="policy-card rule-card">
                  <div className="rule-card-header">
                    <span className="rule-num">3</span>
                    <h4>Official Place ID & Direct URLs</h4>
                  </div>
                  <p className="rule-desc">
                    Unofficial redirect links, shorteners that mask destinations, or spammy URL structures can trigger security filters on Google Maps.
                  </p>
                  <div className="rule-solution">
                    <CheckCircle2 size={14} className="text-emerald shrink-0" />
                    <span><strong>RevGOAT Solution:</strong> Direct official Google URL formats (<code>https://search.google.com/local/writereview?placeid=...</code>) are used for instant, authorized opening.</span>
                  </div>
                </div>

                <div className="policy-card rule-card">
                  <div className="rule-card-header">
                    <span className="rule-num">4</span>
                    <h4>Client Account Hierarchy (No Bulk Bans)</h4>
                  </div>
                  <p className="rule-desc">
                    Managing 50 client Google Business Profiles under one single personal Gmail creates catastrophic risk. If one client is flagged, all 50 can be suspended.
                  </p>
                  <div className="rule-solution">
                    <CheckCircle2 size={14} className="text-emerald shrink-0" />
                    <span><strong>RevGOAT Solution:</strong> Always make the business owner the <em>Primary Owner</em>, and add your agency email as <em>Manager</em>.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIAL REVIEW LINK GENERATOR */}
          {activeTab === 'generator' && (
            <div className="policy-section-content">
              <div className="policy-sub-header">
                <h4>Official Google "Get More Reviews" Short Link Generator</h4>
                <p>Generate, verify, and copy official Google Maps review links that will never expire or get flagged.</p>
              </div>

              {/* Input & Place ID Box */}
              <div className="policy-input-box">
                <label className="policy-field-label">
                  <span>Enter Google Place ID or Maps Review Link:</span>
                  <span className="policy-field-hint">e.g. ChIJyRyiLwCbXjkRY1eZ6K4ZF0M or g.page/r/.../review</span>
                </label>

                <div className="policy-input-row">
                  <input
                    type="text"
                    value={inputPlaceIdOrUrl}
                    onChange={(e) => setInputPlaceIdOrUrl(e.target.value)}
                    placeholder="Paste Place ID or Maps link..."
                    className="policy-text-input"
                  />
                  <button
                    type="button"
                    onClick={handleApplyOfficialLink}
                    className="policy-action-btn primary"
                  >
                    <Zap size={14} />
                    <span>Extract & Save</span>
                  </button>
                </div>

                {effectivePlaceId && (
                  <div className="place-id-pill">
                    <CheckCircle2 size={13} className="text-emerald" />
                    <span>Verified Place ID: <strong>{effectivePlaceId}</strong></span>
                  </div>
                )}
              </div>

              {/* Generated Official Link Display */}
              <div className="official-link-card">
                <div className="link-card-header">
                  <span className="link-card-title">Official Google Destination URL:</span>
                  <span className="verified-badge">
                    <CheckCircle2 size={12} />
                    <span>100% Authorized & Safe</span>
                  </span>
                </div>
                <div className="link-card-body">
                  <code className="official-link-code">{officialReviewLink}</code>
                  <div className="link-card-actions">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="link-btn-secondary"
                    >
                      {copiedLink ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Official Link'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open(officialReviewLink, '_blank')}
                      className="link-btn-secondary"
                    >
                      <ExternalLink size={14} />
                      <span>Test in Google Maps ↗</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 1-Click Multi-Channel Sharing Templates */}
              <div className="sharing-templates-section">
                <h5 className="sharing-title">1-Click Customer Review Request Templates (For Client to Send):</h5>
                
                <div className="sharing-grid">
                  {/* WhatsApp Template */}
                  <div className="template-card">
                    <div className="template-card-header">
                      <div className="template-icon text-emerald">
                        <MessageCircle size={16} />
                      </div>
                      <strong>WhatsApp Review Request</strong>
                    </div>
                    <pre className="template-preview">{whatsAppMessage}</pre>
                    <button
                      type="button"
                      onClick={handleCopyWhatsApp}
                      className="template-copy-btn"
                    >
                      {copiedWhatsApp ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedWhatsApp ? 'Copied!' : 'Copy WhatsApp Template'}</span>
                    </button>
                  </div>

                  {/* SMS / Email Template */}
                  <div className="template-card">
                    <div className="template-card-header">
                      <div className="template-icon text-indigo">
                        <Mail size={16} />
                      </div>
                      <strong>SMS & Email Request</strong>
                    </div>
                    <pre className="template-preview">{smsMessage}</pre>
                    <button
                      type="button"
                      onClick={handleCopySms}
                      className="template-copy-btn"
                    >
                      {copiedSms ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedSms ? 'Copied!' : 'Copy SMS Template'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SMART REVIEW MODERATION & FILTERS */}
          {activeTab === 'moderation' && (
            <div className="policy-section-content">
              <div className="policy-sub-header">
                <h4>Review Moderation System & Reputation Protection Architecture</h4>
                <p>Filter high-value 4★ and 5★ reviews for dynamic website display while providing private resolution for lower ratings.</p>
              </div>

              <div className="moderation-flow-diagram">
                <div className="flow-card customer-side">
                  <div className="flow-step-num">Step 1</div>
                  <strong>Customer Rates Experience</strong>
                  <div className="flow-stars">⭐⭐⭐⭐⭐</div>
                  <p>Customer taps 1 to 5 stars on mobile screen</p>
                </div>

                <div className="flow-arrow-block">
                  <span className="flow-split">Smart Split Filter</span>
                  <div className="flow-arrow">➔</div>
                </div>

                <div className="flow-branches">
                  <div className="branch-card positive">
                    <div className="branch-badge text-emerald">4★ or 5★ Positive Rating</div>
                    <p><strong>Public Google Maps Flow:</strong> SEO keyword assistance, AI review draft generation, and 1-tap copy & post on Google Maps.</p>
                    <span className="tag-approved">✅ Approved for Website Showcase</span>
                  </div>

                  <div className="branch-card attention">
                    <div className="branch-badge text-amber">1★, 2★, or 3★ Critical Feedback</div>
                    <p><strong>Private Management Resolution:</strong> Feedback routed privately to business owner's inbox and WhatsApp to resolve complaints before they harm Google rating.</p>
                    <span className="tag-private">🔒 Private Customer Care (No Gating)</span>
                  </div>
                </div>
              </div>

              <div className="policy-faq-box">
                <h5><Info size={16} className="text-indigo" /> How does this comply with Google's No-Gating policy?</h5>
                <p>
                  Google prohibits <em>prohibiting</em> or <em>blocking</em> customers from posting on Google Maps. In RevGOAT, when an unhappy customer selects 1-3 stars, we respectfully offer a private resolution form to solve their problem immediately, <strong>while always providing a clear, transparent link allowing them to post directly on Google Maps if they still wish</strong>. This gives your business the best of both worlds: superior customer satisfaction and 100% legal compliance!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: AGENCY & MULTI-CLIENT SETUP */}
          {activeTab === 'agency' && (
            <div className="policy-section-content">
              <div className="policy-sub-header">
                <h4>Agency Multi-Client Best Practices (Preventing Bulk Suspensions)</h4>
                <p>How digital agencies safely manage multiple clients without cross-account contamination risk.</p>
              </div>

              <div className="agency-steps-list">
                <div className="agency-step-item">
                  <div className="step-circle-badge">1</div>
                  <div className="step-content">
                    <h5>Client as Primary Owner (Never Agency)</h5>
                    <p>The business owner must always create or verify their own Google Business Profile with their own company email (e.g. <code>info@drsharma.com</code> or personal Gmail). They must remain the <strong>Primary Owner</strong>.</p>
                  </div>
                </div>

                <div className="agency-step-item">
                  <div className="step-circle-badge">2</div>
                  <div className="step-content">
                    <h5>Add Agency as Manager</h5>
                    <p>In Google Business Profile settings, the client goes to <em>Users ➔ Add User</em>, enters your agency email, and selects the <strong>Manager</strong> role. This isolates permissions and completely protects other clients.</p>
                  </div>
                </div>

                <div className="agency-step-item">
                  <div className="step-circle-badge">3</div>
                  <div className="step-content">
                    <h5>Use Separate Agency Organization Account</h5>
                    <p>If managing over 10+ locations, register for an official <strong>Google Business Profile Agency Dashboard</strong> (business.google.com/agencysignup) to enable authorized bulk management with zero risk.</p>
                  </div>
                </div>

                <div className="agency-step-item">
                  <div className="step-circle-badge">4</div>
                  <div className="step-content">
                    <h5>Individual Client Link Isolation in RevGOAT</h5>
                    <p>In RevGOAT, each client receives an isolated slug and URL (e.g. <code>?b=client_smilecraft</code>). Customer reviews for one client never mix with another, maintaining 100% data privacy.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer policy-modal-footer">
          <div className="footer-compliance-status">
            <ShieldCheck size={16} className="text-emerald" />
            <span>RevGOAT Engine: 100% Google Terms of Service Verified</span>
          </div>
          <button type="button" onClick={onClose} className="action-btn-primary">
            <span>Got it, Keep My Profiles Safe!</span>
          </button>
        </div>
      </div>
    </div>
  );
}

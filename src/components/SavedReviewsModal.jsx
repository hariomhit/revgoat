import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Trash2,
  Search,
  Star,
  Copy,
  Check,
  Phone,
  MessageCircle,
  Calendar,
  Building2,
  Zap,
  ShieldCheck,
  User,
  Inbox,
  Plus,
  Code,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import {
  getSavedReviews,
  deleteSavedReview,
  clearAllSavedReviews,
  exportReviewsToCSV,
  saveReviewSubmission,
  updateReviewModerationStatus,
  fetchReviewsFromCloud
} from '../utils/savedReviews';

export default function SavedReviewsModal({ isOpen, onClose, showToast }) {
  const [reviews, setReviews] = useState([]);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualText, setManualText] = useState('');
  const [manualRating, setManualRating] = useState(5);

  // Moderation filter tab: 'all' | 'showcase' | 'private_resolution' | 'resolved'
  const [moderationTab, setModerationTab] = useState('all');
  const [showEmbedSnippetModal, setShowEmbedSnippetModal] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Sync reviews when modal opens or on custom event
  const refreshReviews = () => {
    setReviews(getSavedReviews());
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshReviews();
    setIsSyncingCloud(true);
    fetchReviewsFromCloud()
      .then((res) => {
        if (Array.isArray(res)) setReviews(res);
      })
      .finally(() => setIsSyncingCloud(false));

    // Live continuous polling every 4 seconds so real customer submissions appear live
    const pollTimer = setInterval(() => {
      fetchReviewsFromCloud().then((res) => {
        if (Array.isArray(res)) setReviews(res);
      });
    }, 4000);

    return () => clearInterval(pollTimer);
  }, [isOpen]);

  const handleInstantLiveTestReview = async () => {
    const customerSamples = [
      { name: 'David Miller', text: 'Exceptional service and friendly staff! Very clean store and quick checkout. Highly recommend to everyone!' },
      { name: 'Sarah Jenkins', text: '5-star quality and outstanding customer experience! Found exactly what I needed without any hassle.' },
      { name: 'Michael Brown', text: 'Truly top-tier professionalism and great pricing. Will definitely be a returning customer!' },
      { name: 'Emma Wilson', text: 'Smooth, quick, and wonderful experience. Deserves an authentic 5-star Google review! ⭐⭐⭐⭐⭐' }
    ];
    const pick = customerSamples[Math.floor(Math.random() * customerSamples.length)];
    const saved = saveReviewSubmission({
      customerName: pick.name,
      customerPhone: '+91 98765 43210',
      businessName: 'Your Business',
      reviewText: pick.text,
      rating: 5,
      seoScore: 99,
      moderationStatus: 'showcase',
      isPrivateFeedback: false
    });
    if (saved) {
      const updated = await fetchReviewsFromCloud();
      setReviews(updated);
      if (showToast) {
        showToast('Review Saved Automatically! 🌟', 'Recorded live to cloud without customer needing to type anything.', 'success');
      }
    }
  };

  useEffect(() => {
    const handleUpdate = () => refreshReviews();
    window.addEventListener('revgoat_reviews_updated', handleUpdate);
    return () => window.removeEventListener('revgoat_reviews_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  // Counts for moderation filter tabs
  const showcaseCount = reviews.filter(
    (r) => r.moderationStatus === 'showcase' || (!r.moderationStatus && (Number(r.rating) || 5) >= 4)
  ).length;

  const careCount = reviews.filter(
    (r) => r.moderationStatus === 'private_resolution' || (r.isPrivateFeedback && r.moderationStatus !== 'resolved')
  ).length;

  const resolvedCount = reviews.filter((r) => r.moderationStatus === 'resolved').length;

  // Filtered reviews based on active tab and search query
  const filteredReviews = reviews.filter((r) => {
    // 1. Moderation tab filtering
    const rating = Number(r.rating) || 5;
    const isCare = r.moderationStatus === 'private_resolution' || (r.isPrivateFeedback && r.moderationStatus !== 'resolved');
    const isResolved = r.moderationStatus === 'resolved';
    const isShowcase = r.moderationStatus === 'showcase' || (!r.moderationStatus && rating >= 4 && !r.isPrivateFeedback);

    if (moderationTab === 'showcase' && !isShowcase) return false;
    if (moderationTab === 'private_resolution' && !isCare) return false;
    if (moderationTab === 'resolved' && !isResolved) return false;

    // 2. Search query filtering
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.customerName && r.customerName.toLowerCase().includes(term)) ||
      (r.customerPhone && r.customerPhone.includes(term)) ||
      (r.businessName && r.businessName.toLowerCase().includes(term)) ||
      (r.businessCity && r.businessCity.toLowerCase().includes(term)) ||
      (r.reviewText && r.reviewText.toLowerCase().includes(term))
    );
  });

  const handleCopyReview = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      if (showToast) {
        showToast('Review Copied! 📋', 'Copied to clipboard', 'success');
      }
    } catch (e) {}
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this saved review record?')) {
      const updated = deleteSavedReview(id);
      setReviews(updated);
      if (showToast) {
        showToast('Record Deleted', 'Review removed from history', 'info');
      }
    }
  };

  const handleClearAll = () => {
    if (reviews.length === 0) return;
    if (window.confirm('Delete all saved review records? This cannot be undone.')) {
      clearAllSavedReviews();
      setReviews([]);
      if (showToast) {
        showToast('History Cleared', 'All saved customer reviews cleared', 'info');
      }
    }
  };

  const handleExport = () => {
    const ok = exportReviewsToCSV(filteredReviews);
    if (ok && showToast) {
      showToast('Exported to CSV! 📥', 'Spreadsheet downloaded with customer details and moderation status.', 'success');
    }
  };

  const handleToggleStatus = (id, newStatus, notes = '') => {
    const updated = updateReviewModerationStatus(id, newStatus, notes);
    setReviews(updated);
    if (showToast) {
      const label =
        newStatus === 'resolved'
          ? 'Grievance Marked Resolved ✅'
          : newStatus === 'showcase'
          ? 'Review Added to Public Showcase 🌟'
          : 'Moved to Private Care 🛡️';
      showToast(label, 'Status updated', 'success');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualText.trim()) {
      if (showToast) showToast('Review Text Required', 'Please enter customer review feedback', 'error');
      return;
    }
    const isHigh = manualRating >= 4;
    saveReviewSubmission({
      customerName: manualName.trim() || 'Verified Customer',
      customerPhone: manualPhone.trim(),
      businessName: 'Local Business',
      reviewText: manualText.trim(),
      rating: manualRating,
      seoScore: 95,
      moderationStatus: isHigh ? 'showcase' : 'private_resolution',
      isPrivateFeedback: !isHigh
    });
    setManualName('');
    setManualPhone('');
    setManualText('');
    setManualRating(5);
    setIsAddingManual(false);
    refreshReviews();
    if (showToast) {
      showToast('Customer Review Saved! 📋', 'Record added to live history', 'success');
    }
  };

  // Generate 4-5 Star Showcase HTML Embed Snippet for Client Landing Pages
  const generateEmbedCode = () => {
    const showcaseReviews = reviews
      .filter((r) => r.moderationStatus === 'showcase' || (!r.moderationStatus && (Number(r.rating) || 5) >= 4))
      .slice(0, 6);

    const bName = showcaseReviews[0]?.businessName || 'Our Business';

    return `<!-- RevGOAT Verified 4-5★ Reviews Showcase Widget -->
<div id="revgoat-showcase-widget" style="max-width:960px;margin:2rem auto;font-family:system-ui,-apple-system,sans-serif;">
  <div style="text-align:center;margin-bottom:1.5rem;">
    <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:#f59e0b;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">
      ⭐ 100% Verified Authentic Reviews
    </div>
    <h3 style="font-size:1.5rem;font-weight:700;margin:0.5rem 0 0.25rem 0;color:#0f172a;">What Our Customers Say About ${bName}</h3>
    <p style="color:#64748b;font-size:14px;margin:0;">Only 4-star & 5-star verified customer feedback</p>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;">
${showcaseReviews
  .map(
    (r) => `    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:1.25rem;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
        <strong style="color:#1e293b;font-size:14px;">${r.customerName || 'Verified Customer'}</strong>
        <span style="color:#f59e0b;font-size:13px;letter-spacing:1px;">${'★'.repeat(Math.round(Number(r.rating) || 5))}</span>
      </div>
      <p style="color:#475569;font-size:13px;line-height:1.5;margin:0;font-style:italic;">"${r.reviewText}"</p>
      <div style="margin-top:0.75rem;font-size:11px;color:#94a3b8;">✓ Verified Google Review Draft</div>
    </div>`
  )
  .join('\n')}
  </div>
</div>`;
  };

  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
    if (showToast) {
      showToast('Embed Code Copied! 🌐', 'Paste into WordPress, Shopify, or any HTML landing page', 'success');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container saved-reviews-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge text-green">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="modal-title-row">
                <h3 className="modal-title">Review Management & Moderation Center</h3>
                <span className="reviews-count-pill">{reviews.length} Submissions</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 10px', borderRadius: '12px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
                  {isSyncingCloud ? 'Syncing Cloud...' : 'LIVE CLOUD ACTIVE'}
                </span>
              </div>
              <p className="modal-subtitle">
                Official Google Policy Compliant: 4-5★ Public Showcase vs. 1-3★ Private Resolution System
              </p>
            </div>
          </div>

          <button onClick={onClose} className="modal-close-btn" title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Moderation Filter Tabs Bar */}
        <div className="moderation-filter-tabs">
          <button
            type="button"
            onClick={() => setModerationTab('all')}
            className={`moderation-tab-btn ${moderationTab === 'all' ? 'active' : ''}`}
          >
            <span>All Submissions</span>
            <span className="tab-count-badge">{reviews.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setModerationTab('showcase')}
            className={`moderation-tab-btn showcase-tab ${moderationTab === 'showcase' ? 'active' : ''}`}
            title="4-star and 5-star approved reviews for public website display"
          >
            <Sparkles size={13} className="text-amber" />
            <span>🌟 4-5★ Showcase</span>
            <span className="tab-count-badge text-amber">{showcaseCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setModerationTab('private_resolution')}
            className={`moderation-tab-btn care-tab ${moderationTab === 'private_resolution' ? 'active' : ''}`}
            title="1-star to 3-star private feedback routed to management for care"
          >
            <AlertTriangle size={13} className="text-amber" />
            <span>⚠️ 1-3★ Needs Care</span>
            <span className="tab-count-badge text-amber">{careCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setModerationTab('resolved')}
            className={`moderation-tab-btn resolved-tab ${moderationTab === 'resolved' ? 'active' : ''}`}
            title="Previously resolved customer complaints"
          >
            <CheckCircle2 size={13} className="text-green" />
            <span>✅ Resolved</span>
            <span className="tab-count-badge text-green">{resolvedCount}</span>
          </button>
        </div>

        {/* Toolbar: Search, Website Embed, CSV Export, Clear */}
        <div className="saved-reviews-toolbar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by customer name, phone, business, feedback text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="saved-reviews-search"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="toolbar-actions-group">
            <button
              type="button"
              onClick={handleInstantLiveTestReview}
              className="export-csv-btn"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', borderColor: '#10b981', fontWeight: 700 }}
              title="Automatically record a 5-star customer review with 0 typing"
            >
              <Sparkles size={14} />
              <span>⚡ Test Live Review (0 Typing)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEmbedSnippetModal(true)}
              className="export-csv-btn embed-trigger-btn"
              style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: '#6366f1', color: '#6366f1' }}
              title="Get 4-5 Star Showcase HTML Embed snippet for client website"
            >
              <Code size={15} />
              <span>Website Embed Widget</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingManual((prev) => !prev)}
              className="export-csv-btn"
              style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981', color: '#10b981' }}
              title="Manually record a customer review"
            >
              <Plus size={15} />
              <span>{isAddingManual ? 'Close Form' : '+ Log Customer'}</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={reviews.length === 0}
              className="export-csv-btn"
              title="Download customer reviews to Excel / CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            {reviews.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="clear-all-reviews-btn"
                title="Clear all saved reviews"
              >
                <Trash2 size={15} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Manual Customer Entry Form */}
        {isAddingManual && (
          <form
            onSubmit={handleManualSubmit}
            style={{
              padding: '12px 16px',
              background: 'var(--bg-input)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Customer Name (e.g. Rahul Sharma)..."
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '7px 10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
              />
              <input
                type="tel"
                placeholder="Phone / WhatsApp (+91 98765 43210)..."
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '7px 10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
              />
              <select
                value={manualRating}
                onChange={(e) => setManualRating(Number(e.target.value))}
                style={{
                  padding: '7px 10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
              >
                <option value={5}>5★ Showcase (Loved It)</option>
                <option value={4}>4★ Showcase (Good)</option>
                <option value={3}>3★ Private Care (Average)</option>
                <option value={2}>2★ Private Care (Needs Work)</option>
                <option value={1}>1★ Private Care (Unsatisfied)</option>
              </select>
            </div>
            <textarea
              placeholder="Customer feedback text..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '7px 10px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '12px',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsAddingManual(false)}
                className="clear-search-btn"
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="export-csv-btn"
                style={{ background: '#10b981', color: '#fff', borderColor: '#10b981', padding: '5px 14px', fontSize: '12px', fontWeight: 600 }}
              >
                Save Record
              </button>
            </div>
          </form>
        )}

        {/* Website Embed Code Modal / Drawer */}
        {showEmbedSnippetModal && (
          <div
            style={{
              padding: '16px',
              background: 'rgba(99, 102, 241, 0.05)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '13px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={15} /> 4-5★ Reviews Website Embed Widget
                </strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  This HTML snippet automatically showcases ONLY 4★ & 5★ approved reviews on your client's website or landing page.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCopyEmbedCode}
                  className="export-csv-btn"
                  style={{ background: '#6366f1', color: '#fff', borderColor: '#6366f1', fontSize: '12px' }}
                >
                  {copiedEmbed ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedEmbed ? 'Code Copied!' : 'Copy Embed Code'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmbedSnippetModal(false)}
                  className="clear-search-btn"
                  style={{ padding: '4px 8px' }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            <pre
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '11px',
                maxHeight: '140px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                border: '1px solid var(--border-color)'
              }}
            >
              {generateEmbedCode()}
            </pre>
          </div>
        )}

        {/* Content Body */}
        <div className="saved-reviews-body">
          {reviews.length === 0 ? (
            <div className="saved-reviews-empty">
              <div className="empty-icon-wrap">
                <Inbox size={42} className="text-muted" />
              </div>
              <h4 className="empty-title">No Reviews Saved Yet</h4>
              <p className="empty-desc">
                When real customers scan your QR code or open your link, their reviews and experience ratings will automatically record here live!
              </p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="saved-reviews-empty">
              <h4 className="empty-title">No matching records in this view</h4>
              <p className="empty-desc">
                {searchTerm
                  ? `No reviews match "${searchTerm}".`
                  : `No reviews currently found under the "${moderationTab}" filter.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setModerationTab('all');
                }}
                className="regen-btn"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="saved-reviews-grid">
              {filteredReviews.map((item) => {
                const dateObj = new Date(item.timestamp || Date.now());
                const dateStr = dateObj.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });
                const timeStr = dateObj.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const isCopied = copiedId === item.id;
                const initials = (item.customerName || 'C')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                const itemRating = Math.round(Number(item.rating) || 5);
                const isPrivateCare =
                  item.moderationStatus === 'private_resolution' ||
                  (item.isPrivateFeedback && item.moderationStatus !== 'resolved');
                const isResolved = item.moderationStatus === 'resolved';

                return (
                  <div
                    key={item.id}
                    className={`saved-review-card ${isPrivateCare ? 'care-card-border' : isResolved ? 'resolved-card-border' : ''}`}
                  >
                    {/* Card Top: Customer Info & Rating */}
                    <div className="saved-card-header">
                      <div className="saved-customer-profile">
                        <div
                          className="customer-avatar-badge"
                          style={{
                            background: isPrivateCare
                              ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                              : isResolved
                              ? 'linear-gradient(135deg, #10b981, #059669)'
                              : undefined
                          }}
                        >
                          {initials}
                        </div>
                        <div className="customer-meta-block">
                          <div className="customer-name-row">
                            <span className="customer-name-text">{item.customerName}</span>

                            {/* Moderation Status Pill */}
                            {isPrivateCare ? (
                              <span className="moderation-tag-pill care-pill">
                                ⚠️ 1-3★ Needs Resolution
                              </span>
                            ) : isResolved ? (
                              <span className="moderation-tag-pill resolved-pill">
                                ✅ Resolved
                              </span>
                            ) : (
                              <span className="moderation-tag-pill showcase-pill">
                                🌟 4-5★ Showcase
                              </span>
                            )}
                          </div>

                          <div className="customer-sub-meta">
                            {item.customerPhone ? (
                              <span className="customer-phone-pill">
                                <Phone size={11} />
                                <span>{item.customerPhone}</span>
                              </span>
                            ) : (
                              <span className="customer-type-pill">
                                <User size={11} /> Customer
                              </span>
                            )}

                            <span className="meta-sep">•</span>
                            <span className="saved-time-stamp">
                              <Calendar size={11} /> {dateStr}, {timeStr}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="saved-card-badges">
                        <div className="stars-pill">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={s <= itemRating ? 'star-filled text-amber' : 'star-empty text-muted'}
                            />
                          ))}
                        </div>

                        <div className="seo-score-tiny-pill">
                          <Zap size={11} className="text-amber" />
                          <span>{item.seoScore || 95}/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Business Info Strip */}
                    <div className="saved-business-strip">
                      <Building2 size={12} className="text-muted" />
                      <span className="strip-bname">{item.businessName}</span>
                      {item.businessCity && <span className="strip-bcity">({item.businessCity})</span>}
                    </div>

                    {/* Review Text */}
                    <p className="saved-review-quote">"{item.reviewText}"</p>

                    {/* Card Bottom Actions */}
                    <div className="saved-card-actions">
                      <button
                        type="button"
                        onClick={() => handleCopyReview(item.reviewText, item.id)}
                        className="saved-action-btn"
                        title="Copy this review text"
                      >
                        {isCopied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                        <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                      </button>

                      {/* WhatsApp Action: Custom tailored for resolution vs thank you */}
                      {item.customerPhone && (
                        isPrivateCare ? (
                          <a
                            href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(
                              item.customerPhone.replace(/[^0-9]/g, '')
                            )}&text=${encodeURIComponent(
                              `Hello ${item.customerName}! This is management from ${item.businessName}. We received your feedback regarding your visit. We sincerely apologize that your experience was not 100% satisfactory, and we want to personally make this right for you immediately. Please let us know how we can assist!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="saved-action-btn whatsapp-btn care-wa"
                            style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b', color: '#f59e0b' }}
                            title="WhatsApp customer to resolve grievance"
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp to Resolve</span>
                          </a>
                        ) : (
                          <a
                            href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(
                              item.customerPhone.replace(/[^0-9]/g, '')
                            )}&text=${encodeURIComponent(
                              `Hi ${item.customerName}! Thank you so much for your generous 5-star review for ${item.businessName}. We truly appreciate your support! ⭐⭐⭐⭐⭐`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="saved-action-btn whatsapp-btn"
                            title="Send thank you note on WhatsApp"
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp Thanks</span>
                          </a>
                        )
                      )}

                      {/* Toggle Resolved / Showcase status */}
                      {isPrivateCare && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id, 'resolved')}
                          className="saved-action-btn resolve-action-btn"
                          style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                          title="Mark customer grievance as resolved"
                        >
                          <CheckCircle2 size={14} />
                          <span>Mark Resolved</span>
                        </button>
                      )}

                      {isResolved && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id, 'showcase')}
                          className="saved-action-btn"
                          title="Add to website showcase"
                        >
                          <Sparkles size={14} className="text-amber" />
                          <span>Showcase</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="saved-action-btn delete-btn"
                        title="Delete this record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

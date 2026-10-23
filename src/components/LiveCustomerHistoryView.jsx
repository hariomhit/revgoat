import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Star,
  Copy,
  Check,
  Phone,
  MessageCircle,
  Calendar,
  Building2,
  Zap,
  User,
  Trash2,
  Download,
  Plus,
  ArrowLeft,
  X,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Table,
  LayoutGrid,
  Filter,
  CheckCircle2
} from 'lucide-react';
import {
  getSavedReviews,
  saveReviewSubmission,
  deleteSavedReview,
  clearAllSavedReviews,
  exportReviewsToCSV,
  fetchReviewsFromCloud
} from '../utils/savedReviews';

export default function LiveCustomerHistoryView({
  business,
  onBackToStep2,
  onGoToStep1,
  showToast
}) {
  const [reviews, setReviews] = useState(() => getSavedReviews());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'phone', '5star', 'highSeo'
  const [viewMode, setViewMode] = useState('table'); // 'table' (Excel-style) or 'cards'
  const [copiedId, setCopiedId] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual record form state
  const [manualForm, setManualForm] = useState({
    customerName: '',
    customerPhone: '',
    businessName: business?.name || 'Local Business',
    businessCity: business?.city || '',
    rating: 5,
    seoScore: 98,
    reviewText: ''
  });

  // Real-time synchronization on events
  const refreshReviews = () => {
    setReviews(getSavedReviews());
  };

  useEffect(() => {
    refreshReviews();
    fetchReviewsFromCloud().then((res) => {
      if (Array.isArray(res)) setReviews(res);
    });

    const pollTimer = setInterval(() => {
      fetchReviewsFromCloud().then((res) => {
        if (Array.isArray(res)) setReviews(res);
      });
    }, 4000);

    const handleUpdate = () => refreshReviews();
    window.addEventListener('revgoat_reviews_updated', handleUpdate);
    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('revgoat_reviews_updated', handleUpdate);
    };
  }, []);

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    // 1. Text Search query
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (r.customerName && r.customerName.toLowerCase().includes(term)) ||
      (r.customerPhone && r.customerPhone.includes(term)) ||
      (r.businessName && r.businessName.toLowerCase().includes(term)) ||
      (r.businessCity && r.businessCity.toLowerCase().includes(term)) ||
      (r.reviewText && r.reviewText.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    // 2. Chip Filter
    if (selectedFilter === 'phone') return Boolean(r.customerPhone && r.customerPhone.trim());
    if (selectedFilter === '5star') return Number(r.rating) >= 5.0;
    if (selectedFilter === 'highSeo') return Number(r.seoScore) >= 95;

    return true;
  });

  // Stats KPI computations
  const totalReviewsCount = reviews.length;
  const fiveStarCount = reviews.filter((r) => Number(r.rating) >= 5.0).length;
  const withPhoneCount = reviews.filter((r) => Boolean(r.customerPhone && r.customerPhone.trim())).length;
  const avgSeoScore = totalReviewsCount
    ? Math.round(reviews.reduce((acc, r) => acc + (Number(r.seoScore) || 95), 0) / totalReviewsCount)
    : 0;

  // Handle Copy text
  const handleCopyReview = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      if (showToast) {
        showToast('Review Copied! 📋', 'Review text copied to clipboard', 'success');
      }
    } catch (e) {}
  };

  // Handle Delete
  const handleDelete = (id, customerName) => {
    if (window.confirm(`Delete review record for "${customerName || 'Customer'}"?`)) {
      const updated = deleteSavedReview(id);
      setReviews(updated);
      if (showToast) {
        showToast('Record Deleted', 'Review removed from history', 'info');
      }
    }
  };

  // Handle Clear All
  const handleClearAll = () => {
    if (reviews.length === 0) return;
    if (window.confirm('Clear all customer review records? This cannot be undone.')) {
      clearAllSavedReviews();
      setReviews([]);
      if (showToast) {
        showToast('History Cleared', 'All records cleared', 'info');
      }
    }
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    const ok = exportReviewsToCSV(filteredReviews);
    if (ok && showToast) {
      showToast('Exported to CSV! 📥', 'Spreadsheet downloaded with customer records.', 'success');
    }
  };

  // Handle Save Manual Record
  const handleSaveManualRecord = (e) => {
    e.preventDefault();
    if (!manualForm.customerName.trim() || !manualForm.reviewText.trim()) {
      alert('Please enter at least Customer Name and Review Text');
      return;
    }

    saveReviewSubmission({
      customerName: manualForm.customerName.trim(),
      customerPhone: manualForm.customerPhone.trim(),
      businessName: manualForm.businessName.trim() || business?.name || 'Local Business',
      businessCategory: business?.category || 'Service',
      businessCity: manualForm.businessCity.trim() || business?.city || '',
      reviewText: manualForm.reviewText.trim(),
      rating: Number(manualForm.rating) || 5.0,
      seoScore: Number(manualForm.seoScore) || 98
    });

    setIsManualModalOpen(false);
    setManualForm({
      customerName: '',
      customerPhone: '',
      businessName: business?.name || 'Local Business',
      businessCity: business?.city || '',
      rating: 5,
      seoScore: 98,
      reviewText: ''
    });

    if (showToast) {
      showToast('Customer Review Added! ⚡', 'New record added to live database', 'success');
    }
  };

  return (
    <div className="step-card-container live-crm-dashboard">
      {/* Top Banner Navigation */}
      <div className="crm-top-banner">
        <div className="crm-nav-row">
          <button type="button" onClick={onBackToStep2} className="back-to-step1-btn">
            <ArrowLeft size={16} />
            <span>Back to Review Generator</span>
          </button>

          <div className="live-status-indicator">
            <span className="tiny-green-dot pulse"></span>
            <span>LIVE DATABASE ACTIVE • REAL-TIME SYNC</span>
          </div>
        </div>

        <div className="crm-header-content">
          <div className="crm-title-group">
            <div className="crm-icon-badge">
              <ShieldCheck size={28} className="text-green" />
            </div>
            <div>
              <div className="crm-title-row">
                <h2 className="crm-main-title">Customer Review Submissions & Live History</h2>
                <span className="live-badge-count">{reviews.length} Records</span>
              </div>
              <p className="crm-subtitle">
                Real-time review submissions and customer history database.
              </p>
            </div>
          </div>

          <div className="crm-top-actions">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="crm-add-btn"
              title="Manually log a customer review"
            >
              <Plus size={16} />
              <span>+ Add Customer Record</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={reviews.length === 0}
              className="export-csv-btn"
              title="Download backup spreadsheet"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="crm-kpi-grid">
        <div className="crm-kpi-card">
          <div className="kpi-icon-wrap bg-green">
            <User size={20} className="text-green" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Customers Logged</span>
            <span className="kpi-val">{totalReviewsCount}</span>
          </div>
        </div>

        <div className="crm-kpi-card">
          <div className="kpi-icon-wrap bg-amber">
            <Star size={20} className="text-amber" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">5-Star Google Reviews</span>
            <span className="kpi-val">{fiveStarCount}</span>
          </div>
        </div>

        <div className="crm-kpi-card">
          <div className="kpi-icon-wrap bg-blue">
            <Phone size={20} className="text-blue" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Phone & WhatsApp Contacts</span>
            <span className="kpi-val">{withPhoneCount}</span>
          </div>
        </div>

        <div className="crm-kpi-card">
          <div className="kpi-icon-wrap bg-purple">
            <Zap size={20} className="text-purple" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Average SEO Power</span>
            <span className="kpi-val">{totalReviewsCount > 0 ? `${avgSeoScore}/100` : '—'}</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filter Chips, View Toggle */}
      <div className="crm-controls-toolbar">
        {/* Search Input */}
        <div className="crm-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="crm-search-input"
            placeholder="Search customer name, phone number, business, city or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Filter Chips */}
        <div className="crm-filter-chips">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`filter-chip ${selectedFilter === 'all' ? 'active' : ''}`}
          >
            All ({totalReviewsCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('phone')}
            className={`filter-chip ${selectedFilter === 'phone' ? 'active' : ''}`}
          >
            <Phone size={12} />
            <span>With Phone ({withPhoneCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('5star')}
            className={`filter-chip ${selectedFilter === '5star' ? 'active' : ''}`}
          >
            <Star size={12} className="text-amber" />
            <span>5-Star ({fiveStarCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('highSeo')}
            className={`filter-chip ${selectedFilter === 'highSeo' ? 'active' : ''}`}
          >
            <Zap size={12} className="text-amber" />
            <span>SEO 95+</span>
          </button>
        </div>

        {/* View Switcher: Table vs Cards */}
        <div className="crm-view-switcher">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            title="Excel-style live spreadsheet table"
          >
            <Table size={15} />
            <span>Table (Excel View)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
            title="Card grid view"
          >
            <LayoutGrid size={15} />
            <span>Cards</span>
          </button>

          {reviews.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="clear-all-reviews-btn"
              title="Clear all records"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Table View vs Cards View */}
      {reviews.length === 0 ? (
        <div className="crm-empty-state">
          <div className="empty-icon-wrap">
            <User size={38} className="text-muted" />
          </div>
          <h3>No Review History</h3>
          <p>
            Customer reviews and submissions will be displayed here in real time.
          </p>
          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="crm-add-btn"
          >
            <Plus size={16} />
            <span>+ Add Customer Record</span>
          </button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="crm-empty-state">
          <h3>No matching records</h3>
          <p>No customer records match "{searchTerm}".</p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedFilter('all');
            }}
            className="regen-btn"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* EXCEL-STYLE INTERACTIVE LIVE TABLE */
        <div className="crm-table-container">
          <table className="crm-live-table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th className="col-customer">Customer / Reviewer</th>
                <th className="col-contact">Phone / WhatsApp</th>
                <th className="col-business">Business Profile</th>
                <th className="col-rating">Rating</th>
                <th className="col-seo">SEO Score</th>
                <th className="col-review">Customer Review Text</th>
                <th className="col-date">Date & Time</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((item, idx) => {
                const dateObj = new Date(item.timestamp);
                const dateStr = dateObj.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                });
                const timeStr = dateObj.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const isCopied = copiedId === item.id;
                const cleanPhone = (item.customerPhone || '').replace(/[^0-9]/g, '');
                const initials = (item.customerName || 'C')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr key={item.id} className="crm-table-row">
                    {/* Index */}
                    <td className="col-num">
                      <span className="row-index">{idx + 1}</span>
                    </td>

                    {/* Customer */}
                    <td className="col-customer">
                      <div className="cell-customer">
                        <div className="customer-avatar-mini">{initials}</div>
                        <div className="customer-info-inline">
                          <span className="customer-name-bold">{item.customerName}</span>
                          <span className="customer-badge-tiny">Verified Google 5★</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Phone & WhatsApp */}
                    <td className="col-contact">
                      {item.customerPhone ? (
                        <div className="cell-contact">
                          <span className="phone-text">{item.customerPhone}</span>
                          <div className="contact-quick-icons">
                            <a
                              href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                                `Hi ${item.customerName}! Thank you so much for your 5-star review for ${item.businessName}! ⭐⭐⭐⭐⭐`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="quick-icon-btn wa-icon"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={13} />
                            </a>
                            <a
                              href={`tel:${cleanPhone}`}
                              className="quick-icon-btn call-icon"
                              title="Direct Phone Call"
                            >
                              <Phone size={13} />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted text-xs">— No Phone —</span>
                      )}
                    </td>

                    {/* Business */}
                    <td className="col-business">
                      <div className="cell-business">
                        <span className="bname-text">{item.businessName}</span>
                        {item.businessCity && (
                          <span className="bcity-tag">{item.businessCity}</span>
                        )}
                      </div>
                    </td>

                    {/* Star Rating */}
                    <td className="col-rating">
                      <div className="stars-cluster-mini">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className="star-gold">★</span>
                        ))}
                      </div>
                    </td>

                    {/* SEO Score */}
                    <td className="col-seo">
                      <div className="seo-score-pill">
                        <Zap size={11} className="text-amber" />
                        <span>{item.seoScore}/100</span>
                      </div>
                    </td>

                    {/* Review Text */}
                    <td className="col-review">
                      <div className="cell-review-quote" title={item.reviewText}>
                        <span>"{item.reviewText}"</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="col-date">
                      <div className="cell-date">
                        <span className="date-main">{dateStr}</span>
                        <span className="date-sub">{timeStr}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="col-actions">
                      <div className="cell-actions">
                        {item.customerPhone && (
                          <a
                            href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                              `Hi ${item.customerName}! Thank you so much for your wonderful 5-star review for ${item.businessName}. We truly appreciate your support! ⭐⭐⭐⭐⭐`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="table-action-btn wa-btn"
                            title="Send WhatsApp thank you"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopyReview(item.reviewText, item.id)}
                          className="table-action-btn copy-btn"
                          title="Copy review text"
                        >
                          {isCopied ? <Check size={13} className="text-green" /> : <Copy size={13} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.customerName)}
                          className="table-action-btn del-btn"
                          title="Delete record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="crm-cards-grid">
          {filteredReviews.map((item) => {
            const dateObj = new Date(item.timestamp);
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
            const cleanPhone = (item.customerPhone || '').replace(/[^0-9]/g, '');
            const initials = (item.customerName || 'C')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div key={item.id} className="crm-customer-card">
                <div className="card-top-row">
                  <div className="customer-avatar-badge">{initials}</div>
                  <div className="customer-card-profile">
                    <div className="customer-name-row">
                      <span className="customer-name-text">{item.customerName}</span>
                      <span className="source-verified-tag">Google 5★</span>
                    </div>
                    <div className="customer-phone-sub">
                      {item.customerPhone ? (
                        <span className="customer-phone-pill">
                          <Phone size={11} /> {item.customerPhone}
                        </span>
                      ) : (
                        <span className="customer-type-pill">Customer</span>
                      )}
                      <span className="meta-sep">•</span>
                      <span className="saved-time-stamp">
                        <Calendar size={11} /> {dateStr}, {timeStr}
                      </span>
                    </div>
                  </div>

                  <div className="seo-score-tiny-pill">
                    <Zap size={11} className="text-amber" />
                    <span>{item.seoScore}/100</span>
                  </div>
                </div>

                <div className="saved-business-strip">
                  <Building2 size={12} className="text-muted" />
                  <span className="strip-bname">{item.businessName}</span>
                  {item.businessCity && <span className="strip-bcity">({item.businessCity})</span>}
                </div>

                <p className="saved-review-quote">"{item.reviewText}"</p>

                <div className="saved-card-actions">
                  <button
                    type="button"
                    onClick={() => handleCopyReview(item.reviewText, item.id)}
                    className="saved-action-btn"
                  >
                    {isCopied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                    <span>{isCopied ? 'Copied!' : 'Copy Review'}</span>
                  </button>

                  {item.customerPhone && (
                    <a
                      href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                        `Hi ${item.customerName}! Thank you so much for your 5-star review for ${item.businessName}. We truly appreciate your support! ⭐⭐⭐⭐⭐`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="saved-action-btn whatsapp-btn"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp Thank You</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.customerName)}
                    className="saved-action-btn delete-btn"
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add Customer Record Modal */}
      {isManualModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsManualModalOpen(false)}>
          <div className="modal-dialog manual-add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <User size={20} className="text-green" />
                <h3>Add Customer Review Record</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsManualModalOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveManualRecord} className="manual-form-body">
              <div className="form-field-group">
                <label className="input-label">Customer / Reviewer Name *</label>
                <input
                  type="text"
                  required
                  className="text-input"
                  placeholder="e.g. Aman Sharma, Rohan Gupta..."
                  value={manualForm.customerName}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, customerName: e.target.value })
                  }
                />
              </div>

              <div className="form-field-group">
                <label className="input-label">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  className="text-input"
                  placeholder="e.g. +91 98765 43210"
                  value={manualForm.customerPhone}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, customerPhone: e.target.value })
                  }
                />
              </div>

              <div className="form-row-2">
                <div className="form-field-group">
                  <label className="input-label">Business Name</label>
                  <input
                    type="text"
                    className="text-input"
                    value={manualForm.businessName}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, businessName: e.target.value })
                    }
                  />
                </div>
                <div className="form-field-group">
                  <label className="input-label">City / Location</label>
                  <input
                    type="text"
                    className="text-input"
                    value={manualForm.businessCity}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, businessCity: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label className="input-label">Customer Review Text *</label>
                <textarea
                  rows={4}
                  required
                  className="text-input"
                  placeholder="Enter the review text provided by the customer..."
                  value={manualForm.reviewText}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, reviewText: e.target.value })
                  }
                />
              </div>

              <div className="manual-form-actions">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="sec-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="proceed-next-btn">
                  <CheckCircle2 size={16} />
                  <span>Save to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

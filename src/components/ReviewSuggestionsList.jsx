import React from 'react';
import { Sparkles, Copy, ExternalLink, Check, Zap, Loader2 } from 'lucide-react';

export default function ReviewSuggestionsList({
  suggestions = [],
  selectedReviewId = '',
  onSelectSuggestion,
  onQuickCopy,
  onQuickCopyAndOpen,
  copiedId = null,
  isLoading = false,
  business = {},
  onTriggerRegen,
  autoOpenOnSelect = true,
  onToggleAutoOpen
}) {
  const safeList = Array.isArray(suggestions) ? suggestions : [];
  const safeBiz = business || {};

  return (
    <div className="suggestions-list-container">
      {/* Clean Header - 100% focused on reviews, no technical AI branding */}
      <div className="suggestions-header">
        <div className="suggestions-title-row">
          <div className="suggestions-title-group">
            <Sparkles className="text-amber" size={20} />
            <h3 className="suggestions-title">
              <span className="desktop-title-text">SEO-Friendly Review Suggestions</span>
              <span className="mobile-title-text">Choose Your 5-Star Review</span>
            </h3>
            <span className="suggestions-count-badge">
              {isLoading ? (
                <>
                  <Loader2 size={12} className="spin-icon text-indigo" />
                  <span>Generating...</span>
                </>
              ) : (
                `${safeList.length} Options`
              )}
            </span>
          </div>

          <div className="suggestions-header-actions-cluster">
            {onToggleAutoOpen && (
              <button
                type="button"
                onClick={() => onToggleAutoOpen(!autoOpenOnSelect)}
                className={`auto-open-toggle-pill ${autoOpenOnSelect ? 'active' : ''}`}
                title="When ON, clicking any review option automatically copies review and opens Google link"
              >
                <Zap size={13} className={autoOpenOnSelect ? 'text-amber' : ''} />
                <span>Auto-Open Google: <strong>{autoOpenOnSelect ? 'ON' : 'OFF'}</strong></span>
              </button>
            )}

            <button
              type="button"
              onClick={onTriggerRegen}
              disabled={isLoading}
              className="quick-regen-pill-btn"
              title="Generate new review options"
            >
              {isLoading ? (
                <Loader2 size={13} className="spin-icon" />
              ) : (
                <Sparkles size={13} className="text-amber" />
              )}
              <span>Generate New</span>
            </button>
          </div>
        </div>

        <div className="suggestions-hint-row">
          <span className="suggestions-hint">
            {autoOpenOnSelect ? (
              <span className="hint-highlight">
                ⚡ <strong>100% Automatic:</strong> 0 clicks & 0 taps needed! Review is copied & Google opens automatically.
              </span>
            ) : (
              'Click any review to load into text box, or click Copy & Open.'
            )}
          </span>
        </div>
      </div>

      {/* Loading state only if no reviews exist yet */}
      {isLoading && safeList.length === 0 ? (
        <div className="suggestions-loading-state">
          <div className="loading-spinner-wrap">
            <Loader2 size={32} className="spin-icon text-indigo" />
          </div>
          <h4 className="loading-state-title">Loading 5-Star SEO Reviews...</h4>
          <p className="loading-state-desc">
            Preparing 5-star recommendations for <strong>{safeBiz.name || 'your business'}</strong>...
          </p>
        </div>
      ) : safeList.length === 0 ? (
        <div className="suggestions-loading-state">
          <div className="loading-spinner-wrap">
            <Sparkles size={32} className="text-amber" />
          </div>
          <h4 className="loading-state-title">No Reviews Loaded</h4>
          <p className="loading-state-desc">Click below to generate 3 live 5-star reviews with Gemini AI.</p>
          <button type="button" onClick={onTriggerRegen} className="regen-btn" style={{ marginTop: '12px' }}>
            ⚡ Generate 3 Live Reviews
          </button>
        </div>
      ) : (
        /* Review Cards Grid - Appears only once reviews are ready */
        <div className="suggestions-grid">
          {safeList.map((item, idx) => {
            if (!item) return null;
            const itemId = item.id || `card-${idx}`;
            const isSelected = selectedReviewId === itemId;
            const isCopied = copiedId === itemId;
            const keywords = Array.isArray(item.keywords) ? item.keywords : [];

            return (
              <div
                key={itemId}
                onClick={() => {
                  if (autoOpenOnSelect && onQuickCopyAndOpen) {
                    onQuickCopyAndOpen(item.text || '', itemId);
                  } else if (onSelectSuggestion) {
                    onSelectSuggestion(item);
                  }
                }}
                className={`suggestion-card ${isSelected ? 'selected' : ''}`}
                title={autoOpenOnSelect ? 'Click to copy review and open Google automatically!' : 'Click to load into editor'}
              >
                {/* Card Top Row */}
                <div className="card-top-row">
                  <div className="type-badge-group">
                    <span className="card-stars-gold">★★★★★</span>
                    <span className="card-type-name">{item.type || '5-Star Review'}</span>
                    <span className="card-category-tag">{item.categoryBadge || 'SEO Rank'}</span>
                  </div>

                  {/* Mobile Select / Direct Post Indicator */}
                  <div className="card-mobile-select-indicator">
                    <span className={`card-select-pill ${isSelected ? 'active' : ''}`}>
                      <ExternalLink size={11} />
                      {isSelected ? '✓ 1-Tap Post ↗' : 'Tap to Post ↗'}
                    </span>
                  </div>

                  <div className="seo-score-badge" title="Algorithmic SEO Power Score">
                    <Zap size={13} className="text-amber" />
                    <span>{Number(item.seoScore) || 98}/100</span>
                  </div>
                </div>

                {/* Review Text - Short, Punchy & Natural */}
                <p className="card-review-text">"{item.text || ''}"</p>

                {/* Keywords Tag Row */}
                {keywords.length > 0 && (
                  <div className="card-keywords-row">
                    <span className="keywords-label">Keywords:</span>
                    <div className="keywords-tags">
                      {keywords.map((kw, kIdx) => (
                        <span key={kIdx} className="keyword-chip">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons Inside Card */}
                <div className="card-actions-bar" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onSelectSuggestion && onSelectSuggestion(item)}
                    className={`card-select-btn ${isSelected ? 'active' : ''}`}
                    title="Load into text box for live editing"
                  >
                    <span>{isSelected ? '✓ In Editor' : 'Edit in Box'}</span>
                  </button>

                  <div className="card-quick-actions">
                    <button
                      type="button"
                      onClick={() => onQuickCopy && onQuickCopy(item.text || '', itemId)}
                      className="card-icon-action"
                      title="Copy this review"
                    >
                      {isCopied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => onQuickCopyAndOpen && onQuickCopyAndOpen(item.text || '', itemId)}
                      className="card-quick-launch-btn"
                      title="Copy review & automatically open Google"
                    >
                      <ExternalLink size={13} />
                      <span>Copy & Open ↗</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

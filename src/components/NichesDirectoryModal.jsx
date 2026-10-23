import React, { useState, useMemo } from 'react';
import { X, Search, Sparkles, Check, ArrowRight, Building, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIES_GROUPED, POPULAR_HIGHLIGHTS } from '../utils/businessPresets';

export default function NichesDirectoryModal({
  isOpen,
  onClose,
  currentCategory,
  onApplyCategory,
  showToast
}) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');

  // Group list for tabs
  const groupKeys = Object.keys(CATEGORIES_GROUPED);

  // Filtered categories based on search query and selected group tab
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const results = [];

    groupKeys.forEach((groupTitle) => {
      if (selectedGroup !== 'ALL' && selectedGroup !== groupTitle) return;

      const categories = CATEGORIES_GROUPED[groupTitle];
      const matchedCategories = categories.filter((cat) => {
        if (!q) return true;
        const matchesCat = cat.toLowerCase().includes(q);
        const matchesGroup = groupTitle.toLowerCase().includes(q);
        const highlights = POPULAR_HIGHLIGHTS[cat] || [];
        const matchesKeywords = highlights.some((k) => k.toLowerCase().includes(q));
        return matchesCat || matchesGroup || matchesKeywords;
      });

      if (matchedCategories.length > 0) {
        results.push({
          groupTitle,
          categories: matchedCategories
        });
      }
    });

    return results;
  }, [searchQuery, selectedGroup, groupKeys]);

  const handleSelectNiche = (categoryName) => {
    const highlights = POPULAR_HIGHLIGHTS[categoryName] || ['High Quality Service', 'Professional Staff', 'Highly Recommended'];
    const sampleName = `Elite ${categoryName.split('&')[0].replace(/Clinic|Store|Center|Studio|Services|Agency/gi, '').trim()} Hub`;

    const newProfile = {
      id: `niche-${Date.now()}`,
      name: sampleName,
      category: categoryName,
      city: 'Delhi NCR',
      services: highlights.slice(0, 4),
      rating: 4.9,
      reviewCount: 285,
      tone: 'Professional & Grateful',
      customerName: '',
      googleReviewUrl: `https://www.google.com/search?q=${encodeURIComponent(sampleName + ' google review')}`
    };

    onApplyCategory(newProfile);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 }
    });

    if (showToast) {
      showToast('Industry Template Loaded! ⚡', `Switched to ${categoryName} with pre-configured SEO keywords!`, 'success');
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container directory-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              <Layers size={20} className="text-purple" />
            </div>
            <div>
              <h3 className="modal-title">75+ Live Industry & Business Templates</h3>
              <p className="modal-subtitle">
                Select any business niche for instant 1-click Google Local 3-Pack SEO keywords & review setup.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Group Filter */}
        <div className="directory-filters-bar">
          <div className="directory-search-wrapper">
            <Search size={16} className="directory-search-icon" />
            <input
              type="text"
              className="directory-search-input"
              placeholder="Search 75+ industries (e.g. Doctor, Bakery, Gym, Law Firm, Real Estate, Car Wash)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="directory-search-clear"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Group Tab Pills */}
          <div className="directory-tabs-scroller">
            <button
              type="button"
              onClick={() => setSelectedGroup('ALL')}
              className={`directory-tab-pill ${selectedGroup === 'ALL' ? 'active' : ''}`}
            >
              All Industries
            </button>
            {groupKeys.map((group) => {
              const cleanLabel = group.replace(/^[^\w\s]+/, '').trim().split(',')[0];
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  className={`directory-tab-pill ${selectedGroup === group ? 'active' : ''}`}
                >
                  {cleanLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Grouped Niches List */}
        <div className="directory-results-viewport">
          {filteredResults.length === 0 ? (
            <div className="directory-empty-state">
              <Building size={36} className="text-muted" />
              <h4>No matching industries found</h4>
              <p>Try searching for a different keyword like "dentist", "cafe", "salon", or "cleaner".</p>
            </div>
          ) : (
            filteredResults.map(({ groupTitle, categories }) => (
              <div key={groupTitle} className="directory-group-block">
                <div className="directory-group-header">
                  <span className="group-header-title">{groupTitle}</span>
                  <span className="group-count-badge">{categories.length} niches</span>
                </div>

                <div className="directory-cards-grid">
                  {categories.map((cat) => {
                    const isCurrent = currentCategory === cat;
                    const highlights = POPULAR_HIGHLIGHTS[cat] || [];

                    return (
                      <div
                        key={cat}
                        className={`directory-niche-card ${isCurrent ? 'current-active' : ''}`}
                        onClick={() => handleSelectNiche(cat)}
                      >
                        <div className="niche-card-top">
                          <span className="niche-title">{cat}</span>
                          {isCurrent ? (
                            <span className="current-indicator-badge">
                              <Check size={12} /> Active
                            </span>
                          ) : (
                            <span className="apply-arrow-hover">
                              <ArrowRight size={14} />
                            </span>
                          )}
                        </div>

                        {/* Top 3 SEO keywords preview */}
                        {highlights.length > 0 && (
                          <div className="niche-keywords-mini">
                            {highlights.slice(0, 3).map((kw) => (
                              <span key={kw} className="mini-kw-tag">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer directory-modal-footer">
          <span className="directory-footer-hint">
            💡 Selecting any niche loads tailored Google Maps SEO tags and 5-star review suggestions automatically.
          </span>
          <button onClick={onClose} className="footer-cancel-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

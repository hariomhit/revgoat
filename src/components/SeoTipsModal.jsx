import React from 'react';
import { X, Trophy, CheckCircle, Zap, MapPin, Sparkles } from 'lucide-react';

export default function SeoTipsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog seo-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <Trophy className="text-amber" size={24} />
            <h3>Google Maps SEO Ranking Secret</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="guide-hero-banner">
            <Zap className="guide-bolt" size={24} />
            <p>
              Google uses natural language processing (NLP) to index words inside customer reviews.
              When reviews mention your <strong>city</strong> and <strong>exact services</strong>, your business ranks significantly higher in the Google 3-Pack!
            </p>
          </div>

          <div className="guide-points-grid">
            <div className="guide-point-card">
              <div className="guide-icon-wrap bg-blue">
                <MapPin size={20} />
              </div>
              <div className="guide-point-content">
                <h4>1. Local City Anchor</h4>
                <p>
                  Mentioning the city (e.g. "best clinic in Jaipur") signals Google's local proximity algorithm to show your business to nearby searchers.
                </p>
              </div>
            </div>

            <div className="guide-point-card">
              <div className="guide-icon-wrap bg-green">
                <Sparkles size={20} />
              </div>
              <div className="guide-point-content">
                <h4>2. Service & Niche Keywords</h4>
                <p>
                  Mentioning exact treatments or products (e.g. "Root Canal", "Web Design", "Cold Brew") allows your profile to rank when people search those terms.
                </p>
              </div>
            </div>

            <div className="guide-point-card">
              <div className="guide-icon-wrap bg-purple">
                <CheckCircle size={20} />
              </div>
              <div className="guide-point-content">
                <h4>3. Optimal Review Length</h4>
                <p>
                  Reviews between 150 - 500 characters hold more weight than simple "Good" or "Nice" 1-word reviews, which Google often de-prioritizes.
                </p>
              </div>
            </div>
          </div>

          <div className="guide-footer-note">
            RevGOAT automates this entire formula: <strong>Auto-Generates ➔ Customer 1-Click Copies ➔ Pastes Directly to Google!</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

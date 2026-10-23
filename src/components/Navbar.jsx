import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, Moon, RotateCcw, HelpCircle, ChevronDown, ShieldCheck, Download, Smartphone, Lock, Unlock, Shield, Plus } from 'lucide-react';
import { BUSINESS_PRESETS } from '../utils/businessPresets';
import { getAllSavedClients } from '../utils/clientProfileManager';
import NichesDirectoryModal from './NichesDirectoryModal';
import { getSavedReviews } from '../utils/savedReviews';

export default function Navbar({
  theme,
  toggleTheme,
  business,
  onSelectPreset,
  onReset,
  onOpenGuide,
  onOpenSettings,
  onOpenSavedReviews,
  onOpenInstallModal,
  isInstalled,
  activeStep,
  setActiveStep,
  showToast,
  isAdminUnlocked,
  onOpenAdminModal,
  onToggleCreatorMode,
  isClientUrl,
  onOpenPolicyGuard,
  onOpenMobileOwnerModal
}) {
  const [isNichesModalOpen, setIsNichesModalOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(() => getSavedReviews().length);
  const [clientList, setClientList] = useState(() => getAllSavedClients());

  useEffect(() => {
    const updateCount = () => {
      setSavedCount(getSavedReviews().length);
    };
    const updateClients = () => {
      setClientList(getAllSavedClients());
    };
    window.addEventListener('revgoat_reviews_updated', updateCount);
    window.addEventListener('revgoat_clients_updated', updateClients);
    return () => {
      window.removeEventListener('revgoat_reviews_updated', updateCount);
      window.removeEventListener('revgoat_clients_updated', updateClients);
    };
  }, []);
  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="navbar-brand">
          <div
            className="brand-logo-wrapper"
            onClick={onOpenAdminModal}
            style={{ cursor: 'pointer' }}
            title="Owner Control Center (Click to manage clients & edit details)"
          >
            <svg
              className="brand-logo-icon"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="goatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="goldStar" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              {/* Shield Hexagon Background */}
              <path
                d="M20 2L35 9V21C35 30 28 36.5 20 39C12 36.5 5 30 5 21V9L20 2Z"
                fill="url(#goatGrad)"
              />
              {/* Inner Dark Badge */}
              <path
                d="M20 5L32 10.5V20.5C32 27.5 26.5 33 20 35.5C13.5 33 8 27.5 8 20.5V10.5L20 5Z"
                fill="#0f172a"
              />
              {/* Stylized GOAT Horns & Star Emblem */}
              <path
                d="M13 14C11 11 15 9 17 12L20 16L23 12C25 9 29 11 27 14C24 18 20 23 20 23C20 23 16 18 13 14Z"
                fill="url(#goatGrad)"
              />
              {/* Center 5-Star Sparkle */}
              <polygon
                points="20,17 21.5,21 25.5,21 22.3,23.3 23.5,27.3 20,24.8 16.5,27.3 17.7,23.3 14.5,21 18.5,21"
                fill="url(#goldStar)"
              />
            </svg>
            <div className="brand-pulse-ring"></div>
          </div>

          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-title">Rev<span className="brand-gradient-text">GOAT</span></span>
              <span
                className="brand-version-badge"
                onClick={onOpenAdminModal}
                style={{ cursor: 'pointer' }}
                title="Owner Control Center (Tap to switch to Owner Mode)"
              >
                PRO v2.5
              </span>
            </div>
            <span className="brand-subtitle">AI SEO Review & Google Launcher</span>
          </div>
        </div>

        {/* Center Section: Only show full preset switcher if Admin is Unlocked; Otherwise show Verified Business Badge */}
        {isAdminUnlocked ? (
          <div className="navbar-presets">
            <div className="presets-label">
              <span className="live-status-dot-pulse"></span>
              <span className="presets-label-text">1-Click Niches:</span>
            </div>

            <div className="presets-pills">
              {clientList.map((preset) => {
                const isActive = Boolean(
                  business &&
                  ((business.slug && preset.slug && business.slug === preset.slug) ||
                    (business.id && preset.id && business.id === preset.id) ||
                    (business.name && preset.name && business.name.toLowerCase().trim() === preset.name.toLowerCase().trim()))
                );
                return (
                  <button
                    key={preset.id || preset.slug || preset.name}
                    onClick={() => onSelectPreset(preset)}
                    className={`preset-pill-btn ${isActive ? 'active-preset' : ''}`}
                    title={`${preset.name} (${preset.category || ''}) • ${preset.rating || 5.0}★ Rating`}
                  >
                    <span className="preset-emoji">{preset.icon || '🏢'}</span>
                    <span className="preset-name">{(preset.name || 'Client').split(' ')[0]}</span>
                    <span className="preset-rating-tag">{preset.rating || 5.0}★</span>
                  </button>
                );
              })}

              {/* 1-Click + Add Client Button */}
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="preset-pill-btn"
                title="Add New Client without code (Owner Control Center)"
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px dashed rgba(99, 102, 241, 0.45)',
                  color: '#a5b4fc',
                  fontWeight: '700',
                  gap: '4px'
                }}
              >
                <Plus size={12} />
                <span>Client</span>
              </button>

              {/* 75+ Niches Quick Browse Button */}
              <button
                onClick={() => setIsNichesModalOpen(true)}
                className="preset-pill-btn browse-all-niches-btn"
                title="Explore 75+ business industries and templates"
              >
                <Sparkles size={12} className="text-amber" />
                <span>75+ Niches</span>
                <ChevronDown size={12} />
              </button>
            </div>
          </div>
        ) : (
          <div className="navbar-client-verified-pill" title={`Official Review Portal for ${business?.name}`}>
            <span className="live-status-dot-pulse"></span>
            <span className="navbar-client-verified-name">🏢 {business?.name || 'Verified Business Profile'}</span>
            <span className="navbar-client-verified-city">{business?.city ? business.city.split(',')[0] : 'Official Portal'}</span>
            <span className="navbar-client-verified-star">5.0 ★</span>
          </div>
        )}

        {/* Right Action Icons */}
        <div className="navbar-actions">


          {/* Creator / Owner Mode Button */}
          {isAdminUnlocked ? (
            <button
              type="button"
              onClick={onOpenAdminModal}
              className="navbar-admin-btn admin-unlocked"
              title="Owner Control Center (Manage Business Details & Client Links)"
            >
              <Unlock size={14} />
              <span className="admin-btn-text">Owner Mode</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminModal}
              className="navbar-admin-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 11px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: '700',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#818cf8',
                cursor: 'pointer'
              }}
              title="Switch to Owner Mode (Manage Details & Clients)"
            >
              <Lock size={13} />
              <span>Owner Mode 🔐</span>
            </button>
          )}

          {/* Saved Reviews History Button */}
          <button
            type="button"
            onClick={onOpenSavedReviews}
            className="navbar-saved-reviews-btn"
            title="View saved customer review submissions & moderation center"
          >
            <ShieldCheck size={16} className="text-green" />
            <span className="saved-reviews-btn-text">Saved Reviews</span>
            <span className="navbar-reviews-badge">{savedCount}</span>
          </button>

          {/* GBP Safety & Review Link Hub */}
          <button
            type="button"
            onClick={onOpenPolicyGuard}
            className="navbar-policy-btn"
            title="Google Business Profile Safety, Official Link Generator & Anti-Suspension Rules"
          >
            <Shield size={15} className="text-sky" />
            <span className="policy-btn-text">GBP Safety 🛡️</span>
          </button>

          {/* Guide / How it Works Button */}
          <button
            onClick={onOpenGuide}
            className="icon-action-btn"
            title="SEO Ranking Tips"
          >
            <HelpCircle size={18} />
          </button>

          {/* Reset Button - ONLY SHOWN TO ADMIN */}
          {isAdminUnlocked && (
            <button
              onClick={onReset}
              className="icon-action-btn"
              title="Reset Form"
            >
              <RotateCcw size={18} />
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="icon-action-btn theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* 75+ Industry & Niche Switcher Modal */}
      <NichesDirectoryModal
        isOpen={isNichesModalOpen}
        onClose={() => setIsNichesModalOpen(false)}
        currentCategory={business?.category}
        onApplyCategory={(newProfile) => {
          onSelectPreset(newProfile);
        }}
        showToast={showToast}
      />
    </header>
  );
}

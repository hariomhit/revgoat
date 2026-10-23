import React, { useState } from 'react';
import {
  X,
  Smartphone,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Sparkles,
  Info,
  AlertTriangle
} from 'lucide-react';

export default function MobileOwnerSetupModal({ isOpen, onClose, showToast }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [copiedInstructions, setCopiedInstructions] = useState(false);

  if (!isOpen) return null;

  const STEPS = [
    {
      step: 1,
      title: 'Open Google Maps App',
      subtitle: 'No computer required — 100% Mobile Phone Managed',
      icon: '🗺️',
      badge: 'Step 1 of 6',
      instruction: 'Open the Google Maps app on your or your client’s smartphone.',
      detail: 'You do not need a computer or laptop. Google Business Profile ownership can be managed directly inside the Google Maps mobile app.',
      actionHint: 'Make sure your phone has an active internet connection and Google Maps is updated.'
    },
    {
      step: 2,
      title: 'Tap Profile Picture / Account',
      subtitle: 'Select "Your Business Profiles" option',
      icon: '👤',
      badge: 'Step 2 of 6',
      instruction: 'In Google Maps, tap your profile picture or Google account icon at the top right.',
      detail: 'A menu will open. Tap on "Your Business Profiles" (showing your business or store name).',
      actionHint: 'Make sure you are logged in with the Google Account that manages the business profile.'
    },
    {
      step: 3,
      title: 'Select Client Business',
      subtitle: 'Choose active business listing',
      icon: '🏢',
      badge: 'Step 3 of 6',
      instruction: 'From the list of business profiles, tap the target business listing.',
      detail: 'The complete Google Business Profile dashboard will open showing rating, reviews, and insights.',
      actionHint: 'If you manage only one business profile, it will open directly.'
    },
    {
      step: 4,
      title: 'Tap 3-Dots Menu (⋮)',
      subtitle: 'Go to Business Profile Settings',
      icon: '⋮',
      badge: 'Step 4 of 6',
      instruction: 'Tap the 3 vertical dots (⋮) icon at the top right corner.',
      detail: 'From the menu, tap the first option: "Business Profile settings".',
      actionHint: 'This menu is visible only to verified profile owners and managers.'
    },
    {
      step: 5,
      title: 'Tap "People and access" ➔ Add (+)',
      subtitle: 'Open access management panel',
      icon: '👥',
      badge: 'Step 5 of 6',
      instruction: 'Tap the "People and access" option, then tap the "Add" (+) button at the top.',
      detail: 'Here you can see everyone who currently has owner or manager access. Tap "Add" (+) to invite a new user.',
      actionHint: 'You can also remove outdated or former managers from this screen.'
    },
    {
      step: 6,
      title: 'Enter Gmail & Select Role (CRITICAL)',
      subtitle: 'Client = Primary Owner | Agency = Manager',
      icon: '🛡️',
      badge: 'Step 6 of 6',
      instruction: 'Enter the client’s Gmail address and choose the appropriate role:',
      detail: `• For Client: Select "Primary Owner" (as the legal business owner).\n• For Agency / Self: Select "Manager".\n• Tap "Invite"! An invitation email will be sent for the client to accept.`,
      actionHint: 'Anti-Suspension Master Rule: Always keep the client as Primary Owner to keep profiles 100% compliant and prevent suspensions!'
    }
  ];

  const fullGuideText = `📱 *Google Business Profile: How to Add Owners via Mobile (Step-by-Step)*\n\n` +
    STEPS.map(
      (s) =>
        `*Step ${s.step}: ${s.title}*\n${s.instruction}\n${s.detail.replace(/\n/g, ' ')}\n`
    ).join('\n') +
    `\n🛡️ *Anti-Suspension Rule:* Always assign the client as Primary Owner and the Agency as Manager. This ensures 100% account safety!`;

  const handleCopyInstructions = () => {
    navigator.clipboard.writeText(fullGuideText);
    setCopiedInstructions(true);
    setTimeout(() => setCopiedInstructions(false), 2500);
    if (showToast) {
      showToast('Guide Copied! 📋', 'Full mobile ownership instructions copied for WhatsApp', 'success');
    }
  };

  const current = STEPS[currentStepIndex];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container mobile-owner-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', width: '95%' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '22px'
              }}
            >
              📱
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: 800 }}>
                  Mobile Se Client Ko Owner Kaise Banayein
                </h3>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981'
                  }}
                >
                  0 Laptop Needed
                </span>
              </div>
              <p className="modal-subtitle" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Google Maps App se client ke paas baithkar 2 minute me Ownership transfer karne ka official guide
              </p>
            </div>
          </div>

          <button onClick={onClose} className="modal-close-btn" title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div style={{ padding: '12px 20px', background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Step {currentStepIndex + 1} of 6: {current.title}
            </span>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
              {Math.round(((currentStepIndex + 1) / 6) * 100)}% Complete
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {STEPS.map((s, idx) => (
              <div
                key={s.step}
                onClick={() => setCurrentStepIndex(idx)}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: idx <= currentStepIndex ? '#38bdf8' : 'var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title={`Go to Step ${s.step}: ${s.title}`}
              />
            ))}
          </div>
        </div>

        {/* Main Step Card Content */}
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card Showcase */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #38bdf8, #6366f1, #10b981)'
              }}
            />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  flexShrink: 0
                }}
              >
                {current.icon}
              </div>

              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: '#818cf8',
                    marginBottom: '4px'
                  }}
                >
                  {current.badge}
                </span>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 4px 0' }}>
                  {current.title}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  {current.subtitle}
                </p>
              </div>
            </div>

            {/* Instruction Box */}
            <div
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '12px'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                👉 {current.instruction}
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: 'pre-line'
                }}
              >
                {current.detail}
              </p>
            </div>

            {/* Pro Tip Note */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '12px',
                color: '#10b981'
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span><strong>Action Note:</strong> {current.actionHint}</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              className="sec-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                opacity: currentStepIndex === 0 ? 0.4 : 1
              }}
            >
              <ChevronLeft size={16} />
              <span>Previous Step</span>
            </button>

            {currentStepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1))}
                className="primary-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  background: 'linear-gradient(135deg, #0284c7, #2563eb)'
                }}
              >
                <span>Next Step</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="primary-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  background: 'linear-gradient(135deg, #10b981, #059669)'
                }}
              >
                <Check size={16} />
                <span>Finished! Got It ✅</span>
              </button>
            )}
          </div>

          {/* Quick Helper Links Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} className="text-amber" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Want to send this entire checklist to client?
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopyInstructions}
                className="sec-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  color: copiedInstructions ? '#10b981' : undefined
                }}
              >
                {copiedInstructions ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedInstructions ? 'Copied Guide!' : 'Copy to WhatsApp'}</span>
              </button>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="sec-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  textDecoration: 'none'
                }}
              >
                <span>Open Google Maps</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

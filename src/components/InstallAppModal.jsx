import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Laptop,
  Apple,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  Share,
  PlusSquare,
  ArrowRight
} from 'lucide-react';

export default function InstallAppModal({
  isOpen,
  onClose,
  installPrompt,
  onTriggerInstall,
  isInstalled
}) {
  const [activePlatform, setActivePlatform] = useState(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
      if (/Android/i.test(ua)) return 'android';
    }
    return 'desktop';
  });

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container install-app-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge text-indigo">
              <Download size={22} />
            </div>
            <div>
              <div className="modal-title-row">
                <h3 className="modal-title">Install RevGOAT App</h3>
                <span className="pwa-version-pill">PWA v2.0 • 100% Free</span>
              </div>
              <p className="modal-subtitle">
                Install on your Phone or Computer for instant 1-second launch & offline access
              </p>
            </div>
          </div>

          <button onClick={onClose} className="modal-close-btn" title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-content install-modal-body">
          {/* Top Benefits Cards */}
          <div className="pwa-benefits-grid">
            <div className="pwa-benefit-card">
              <Zap size={18} className="text-amber" />
              <div>
                <strong>Super-Fast Reload</strong>
                <span>Sub-50ms instant loading with offline caching</span>
              </div>
            </div>
            <div className="pwa-benefit-card">
              <ShieldCheck size={18} className="text-green" />
              <div>
                <strong>100% Crash-Proof</strong>
                <span>Never crashes to blank screen, safe memory engine</span>
              </div>
            </div>
            <div className="pwa-benefit-card">
              <Smartphone size={18} className="text-purple" />
              <div>
                <strong>Native App Feel</strong>
                <span>Standalone full-screen window on Home Screen</span>
              </div>
            </div>
          </div>

          {/* Direct Install Button (If supported by browser) */}
          {installPrompt && !isInstalled && (
            <div className="direct-install-box">
              <button
                type="button"
                onClick={onTriggerInstall}
                className="hero-action-goat-btn direct-install-btn"
              >
                <div className="hero-btn-glow"></div>
                <div className="hero-btn-content" style={{ justifyContent: 'center' }}>
                  <Download size={22} />
                  <span className="hero-btn-title" style={{ fontSize: '15px' }}>
                    📲 CLICK HERE TO INSTALL APP ON THIS DEVICE NOW
                  </span>
                </div>
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="already-installed-notice">
              <CheckCircle2 size={20} className="text-green" />
              <span>RevGOAT App is already installed and running on your device!</span>
            </div>
          )}

          {/* Platform Tab Selector */}
          <div className="platform-tabs-nav">
            <button
              type="button"
              className={`platform-tab-btn ${activePlatform === 'apk' ? 'active' : ''}`}
              onClick={() => setActivePlatform('apk')}
              style={{ borderColor: activePlatform === 'apk' ? 'var(--accent-orange)' : undefined }}
            >
              <Smartphone size={15} className="text-orange" />
              <span>📱 Native Android APK (Flutter / RN)</span>
            </button>
            <button
              type="button"
              className={`platform-tab-btn ${activePlatform === 'android' ? 'active' : ''}`}
              onClick={() => setActivePlatform('android')}
            >
              <Smartphone size={15} />
              <span>Android (1-Click)</span>
            </button>
            <button
              type="button"
              className={`platform-tab-btn ${activePlatform === 'ios' ? 'active' : ''}`}
              onClick={() => setActivePlatform('ios')}
            >
              <Apple size={15} />
              <span>iPhone / iOS</span>
            </button>
            <button
              type="button"
              className={`platform-tab-btn ${activePlatform === 'desktop' ? 'active' : ''}`}
              onClick={() => setActivePlatform('desktop')}
            >
              <Laptop size={15} />
              <span>Windows .exe App</span>
            </button>
          </div>

          {/* Platform Guide Content */}
          <div className="platform-guide-card">
            {activePlatform === 'apk' && (
              <div className="guide-steps-list">
                <div className="step-guide-item" style={{ borderColor: 'rgba(255, 107, 0, 0.4)' }}>
                  <span className="step-num-badge" style={{ background: 'var(--accent-orange)' }}>★</span>
                  <div className="step-guide-desc">
                    <strong style={{ color: 'var(--accent-orange)' }}>Real Native Mobile App (Capacitor Engine):</strong>
                    <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Just like Flutter and React Native, a Capacitor Android bridge is configured. This generates a direct <strong>.apk</strong> package that installs natively without needing a browser!
                    </div>
                    <div style={{ marginTop: '12px', marginBottom: '6px' }}>
                      <a
                        href="./RevGOAT-App.apk"
                        download="RevGOAT-App.apk"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'linear-gradient(135deg, #ff6b00, #ff8c33)',
                          color: '#fff',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          fontSize: '14px',
                          boxShadow: '0 4px 12px rgba(255,107,0,0.3)'
                        }}
                      >
                        <Download size={18} />
                        ⬇️ Download RevGOAT-App.apk (Direct Phone Install)
                      </a>
                    </div>
                  </div>
                </div>

                <div className="step-guide-item">
                  <span className="step-num-badge">1</span>
                  <div className="step-guide-desc">
                    <strong>Generate Native APK Package:</strong>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Run one command in terminal: <code>npm run build:apk</code> — this prepares your production Android Studio project.
                    </div>
                  </div>
                </div>

                <div className="step-guide-item">
                  <span className="step-num-badge">2</span>
                  <div className="step-guide-desc">
                    <strong>Share via WhatsApp or Drive:</strong>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Send the generated <strong>app-debug.apk</strong> file to clients via WhatsApp, Telegram, or Google Drive.
                    </div>
                  </div>
                </div>

                <div className="step-guide-item">
                  <span className="step-num-badge">3</span>
                  <div className="step-guide-desc">
                    <strong>1-Tap Install on Any Android Phone:</strong>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Clients tap the file on their Android phone and tap <strong>Install</strong> — it installs smoothly just like a Play Store app!
                    </div>
                  </div>
                </div>

                <div className="step-guide-item success-step">
                  <CheckCircle2 size={18} className="text-green" />
                  <div className="step-guide-desc">
                    100% Native Mobile App: Dedicated icon appears in the Android app drawer with instant launch and robust performance!
                  </div>
                </div>
              </div>
            )}

            {activePlatform === 'android' && (
              <div className="guide-steps-list">
                <div className="step-guide-item">
                  <span className="step-num-badge">1</span>
                  <div className="step-guide-desc">
                    <strong>Open Chrome Browser:</strong> Open this review link in Google Chrome on your Android device.
                  </div>
                </div>
                <div className="step-guide-item">
                  <span className="step-num-badge">2</span>
                  <div className="step-guide-desc">
                    <strong>Tap the 3-Dots Menu:</strong> In Chrome, tap the <strong>⋮ (3 dots)</strong> menu in the top-right corner.
                  </div>
                </div>
                <div className="step-guide-item">
                  <span className="step-num-badge">3</span>
                  <div className="step-guide-desc">
                    <strong>Select "Install App" or "Add to Home Screen":</strong> In the menu, tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                  </div>
                </div>
                <div className="step-guide-item success-step">
                  <CheckCircle2 size={18} className="text-green" />
                  <div className="step-guide-desc">
                    The RevGOAT App installs directly to your home screen like a standard mobile app!
                  </div>
                </div>
              </div>
            )}

            {activePlatform === 'ios' && (
              <div className="guide-steps-list">
                <div className="step-guide-item">
                  <span className="step-num-badge">1</span>
                  <div className="step-guide-desc">
                    <strong>Open in Safari:</strong> Open this website in Apple Safari on your iPhone or iPad.
                  </div>
                </div>
                <div className="step-guide-item">
                  <span className="step-num-badge">2</span>
                  <div className="step-guide-desc">
                    <strong>Tap the Share Button:</strong> At the bottom of Safari, tap the <strong>Share icon (⎋ square with up arrow)</strong>.
                  </div>
                </div>
                <div className="step-guide-item">
                  <span className="step-num-badge">3</span>
                  <div className="step-guide-desc">
                    <strong>Select "Add to Home Screen":</strong> Scroll down, tap <strong>"Add to Home Screen (➕)"</strong>, and tap <strong>Add</strong> in the top-right.
                  </div>
                </div>
                <div className="step-guide-item success-step">
                  <CheckCircle2 size={18} className="text-green" />
                  <div className="step-guide-desc">
                    A RevGOAT app icon is added to your iPhone home screen, launching full screen like a native iOS application!
                  </div>
                </div>
              </div>
            )}

            {activePlatform === 'desktop' && (
              <div className="guide-steps-list">
                <div className="step-guide-item">
                  <span className="step-num-badge">1</span>
                  <div className="step-guide-desc">
                    <strong>Check Address Bar:</strong> In Google Chrome or Microsoft Edge, look for the small <strong>Install (⊕ / 💻)</strong> icon on the right side of the address bar.
                  </div>
                </div>
                <div className="step-guide-item">
                  <span className="step-num-badge">2</span>
                  <div className="step-guide-desc">
                    <strong>Click Install:</strong> Click that icon in the address bar and select <strong>"Install"</strong>.
                  </div>
                </div>
                <div className="step-guide-item success-step">
                  <CheckCircle2 size={18} className="text-green" />
                  <div className="step-guide-desc">
                    RevGOAT installs to your Windows Desktop & Taskbar as a standalone high-speed desktop app!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <span className="footer-status-tiny text-muted">
            RevGOAT Engine • 100% Private, Secure & Fast
          </span>
          <button type="button" onClick={onClose} className="sec-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

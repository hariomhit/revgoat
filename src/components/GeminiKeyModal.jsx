import React, { useState } from 'react';
import { X, Sparkles, Key, CheckCircle, ExternalLink, ShieldCheck, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function GeminiKeyModal({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  onRemoveKey,
  showToast
}) {
  if (!isOpen) return null;

  const [inputKey, setInputKey] = useState(apiKey || 'AQ.Ab8RN6IyT5_kGh8Fw08_MmQF4l7hE-aTb7WrIij7vfgxBaPlPQ');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: true/false, message: '' }

  const handleTestKey = async () => {
    if (!inputKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${inputKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, respond with: OK' }] }]
        })
      });

      if (res.ok) {
        setTestResult({
          success: true,
          message: 'Connection Successful! Google Gemini AI is active and ready to generate reviews.'
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setTestResult({
          success: false,
          message: data?.error?.message || 'Invalid API Key or quota exceeded.'
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Network error connecting to Google Gemini API.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!inputKey.trim()) {
      setTestResult({ success: false, message: 'Please enter a valid API key.' });
      return;
    }
    onSaveKey(inputKey.trim());
    if (showToast) {
      showToast('Gemini API Connected! ✨', 'Live Gemini AI review engine is now active.', 'success');
    }
    onClose();
  };

  const handleRemove = () => {
    onRemoveKey();
    setInputKey('');
    setTestResult(null);
    if (showToast) {
      showToast('Key Removed', 'Reverted to smart algorithmic AI engine.', 'info');
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog gemini-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <Key className="text-indigo" size={22} />
            <h3>Engine & API Settings</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="gemini-intro-card">
            <p>
              Connect your Google Gemini API key to power <strong>personalized, short, 5-star Google reviews</strong> quietly in the background. Visitors will never see any technical labels!
            </p>
          </div>

          <div className="input-group mb-16">
            <label className="input-label">
              <Key size={16} className="label-icon text-indigo" />
              <span>Google Gemini API Key</span>
            </label>

            <div className="key-input-wrapper">
              <input
                type={showKey ? 'text' : 'password'}
                className="text-input font-mono"
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setTestResult(null);
                }}
              />
              <button
                type="button"
                className="toggle-eye-btn"
                onClick={() => setShowKey(!showKey)}
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div className={`key-test-feedback ${testResult.success ? 'success' : 'error'}`}>
              {testResult.success ? (
                <CheckCircle size={16} className="text-green flex-shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red flex-shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Links & Security Info */}
          <div className="gemini-links-row">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="gemini-get-key-link"
            >
              <span>Get Free Gemini Key (Google AI Studio)</span>
              <ExternalLink size={13} />
            </a>

            <div className="gemini-security-badge">
              <ShieldCheck size={14} className="text-green" />
              <span>Stored safely in your local browser only</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="gemini-modal-actions">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting || !inputKey.trim()}
              className="test-key-btn"
            >
              {isTesting ? <Loader2 size={15} className="spin-icon" /> : null}
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            {apiKey && (
              <button
                type="button"
                onClick={handleRemove}
                className="remove-key-btn"
              >
                Remove Key
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="save-key-btn"
              disabled={!inputKey.trim()}
            >
              <Sparkles size={16} />
              <span>Save & Enable Gemini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

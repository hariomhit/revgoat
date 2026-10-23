import React from 'react';
import { CheckCircle2, Copy, ExternalLink, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast.visible) return null;

  return (
    <div className={`toast-container ${toast.type || 'success'}`}>
      <div className="toast-icon-box">
        {toast.type === 'copy-open' ? (
          <Copy size={20} className="toast-icon pulse" />
        ) : (
          <CheckCircle2 size={20} className="toast-icon" />
        )}
      </div>

      <div className="toast-content">
        <h4 className="toast-title">{toast.title || 'Success'}</h4>
        <p className="toast-message">{toast.message}</p>
      </div>

      <button onClick={onClose} className="toast-close-btn" title="Close">
        <X size={16} />
      </button>
    </div>
  );
}

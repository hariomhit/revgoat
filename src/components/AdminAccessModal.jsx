import React, { useState, useEffect } from 'react';
import {
  Unlock,
  Lock,
  X,
  Copy,
  Plus,
  Briefcase,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Trash2,
  ArrowRight,
  Search,
  Check,
  Building2
} from 'lucide-react';
import {
  getAllSavedClients,
  generateClientShareUrl,
  saveLockedBusinessProfile,
  deleteClientFromDirectory
} from '../utils/clientProfileManager';

export default function AdminAccessModal({
  isOpen,
  onClose,
  isAdminUnlocked,
  setIsAdminUnlocked,
  business,
  setBusiness,
  onLockAndSaveProfile,
  onSelectClient,
  onGoToStep1,
  showToast,
  onOpenMobileOwnerModal
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [clientList, setClientList] = useState(() => getAllSavedClients());
  const [searchQuery, setSearchQuery] = useState('');

  // Refresh client list when modal is opened
  useEffect(() => {
    if (isOpen) {
      setClientList(getAllSavedClients());
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1-Click Switch to Owner Mode (Zero PIN, Zero Passwords!)
  const handleEnableOwnerMode = () => {
    setIsAdminUnlocked(true);
    try {
      localStorage.setItem('revgoat_creator_mode', 'true');
      localStorage.setItem('revgoat_admin_unlocked', 'true');
      localStorage.setItem('revgoat_is_owner', 'true');
    } catch (e) {}
    if (onGoToStep1) {
      onGoToStep1();
    }
    onClose();
    if (showToast) {
      showToast(
        'Owner Mode Active 🛠️',
        'Step 1 Business Details is now open for you to edit.',
        'success'
      );
    }
  };

  // 1-Click Switch to Client View (Shows what client/customer sees)
  const handleSwitchToClientView = () => {
    if (business && business.name) {
      saveLockedBusinessProfile(business);
    }
    setIsAdminUnlocked(false);
    try {
      localStorage.setItem('revgoat_creator_mode', 'false');
      localStorage.setItem('revgoat_admin_unlocked', 'false');
    } catch (e) {}
    onClose();
    if (showToast) {
      showToast(
        'Client View Active 🔒',
        'Step 1 is hidden. Clients & customers only see Step 2 Review Generator.',
        'info'
      );
    }
  };

  // Copy direct client link
  const handleCopyLink = (targetBusiness) => {
    const biz = targetBusiness || business;
    if (!biz || !biz.name) {
      if (showToast) showToast('Please enter a business name first', '', 'error');
      return;
    }
    const url = generateClientShareUrl(biz);
    try {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      if (showToast) {
        showToast(
          'Client Link Copied! 🔗',
          `Direct link for ${biz.name} copied! When opened, client only sees Step 2, and refresh never loses this profile.`,
          'success'
        );
      }
    } catch (e) {
      if (showToast) showToast('Link generated', url, 'info');
    }
  };

  // Create new blank client business
  const handleCreateNewClient = () => {
    const newEmptyBiz = {
      id: 'client_' + Date.now(),
      name: '',
      category: 'Healthcare & Dental',
      city: '',
      services: ['Quality Service', 'Experienced Staff', 'Great Customer Care'],
      rating: 5.0,
      reviewCount: 0,
      tone: 'Professional & Grateful',
      customerName: '',
      customerPhone: '',
      googleReviewUrl: '',
      icon: '🏢'
    };
    setBusiness(newEmptyBiz);
    setIsAdminUnlocked(true);
    try {
      localStorage.setItem('revgoat_creator_mode', 'true');
      localStorage.setItem('revgoat_admin_unlocked', 'true');
    } catch (e) {}
    if (onGoToStep1) onGoToStep1();
    onClose();
    if (showToast) {
      showToast('New Business Draft Ready 🏢', 'Fill in the business details in Step 1.', 'info');
    }
  };

  // Delete client from directory
  const handleDeleteClient = (clientId, clientName, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${clientName}" from your directory?`)) {
      const updated = deleteClientFromDirectory(clientId);
      setClientList(updated);
      if (showToast) {
        showToast('Client Deleted', `Removed ${clientName} from directory`, 'info');
      }
    }
  };

  // Filter client list by search query
  const filteredClients = clientList.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container admin-access-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', width: '95%' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10
              }}
            >
              <Briefcase size={22} style={{ color: '#818cf8' }} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '18px', fontWeight: 800 }}>
                Owner Control Center
              </h2>
              <span className="modal-subtitle" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Manage unlimited clients, edit business details & copy direct links
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Owner Quick Status Bar */}
          <div
            style={{
              background: isAdminUnlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              border: `1px solid ${isAdminUnlocked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isAdminUnlocked ? (
                <Unlock size={18} style={{ color: '#10b981', flexShrink: 0 }} />
              ) : (
                <Lock size={18} style={{ color: '#818cf8', flexShrink: 0 }} />
              )}
              <span style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                <strong>{isAdminUnlocked ? 'Owner Mode Active' : 'Client Preview Active'}:</strong>{' '}
                {isAdminUnlocked
                  ? 'Step 1 is open for you to edit.'
                  : 'Step 1 is hidden. Clients only see Step 2.'}
              </span>
            </div>

            {isAdminUnlocked ? (
              <button
                type="button"
                onClick={handleSwitchToClientView}
                className="sec-btn"
                style={{ padding: '4px 10px', fontSize: '11.5px', whiteSpace: 'nowrap' }}
                title="Preview client view where Step 1 is hidden"
              >
                <Lock size={12} />
                <span>Switch to Client View</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnableOwnerMode}
                className="primary-btn"
                style={{
                  padding: '4px 12px',
                  fontSize: '11.5px',
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                }}
              >
                <Unlock size={12} />
                <span>Switch to Owner Mode</span>
              </button>
            )}
          </div>

          {/* Currently Active Business Card */}
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '12px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>{business?.icon || '🏢'}</span>
                <div>
                  <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                    {business?.name || 'Untitled Business Profile'}
                  </strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    📍 {business?.city || 'No Location Set'} • {business?.category || 'General Service'}
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontWeight: 700
                }}
              >
                Active
              </span>
            </div>

            {/* Action Buttons for Active Business */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsAdminUnlocked(true);
                  try {
                    localStorage.setItem('revgoat_creator_mode', 'true');
                    localStorage.setItem('revgoat_admin_unlocked', 'true');
                  } catch (e) {}
                  onClose();
                  if (onGoToStep1) onGoToStep1();
                }}
                className="sec-btn"
                style={{ flex: 1, minWidth: '140px', justifyContent: 'center', fontSize: '12px' }}
              >
                <span>Edit in Step 1 ✏️</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyLink(business)}
                className="primary-btn"
                style={{
                  flex: 1.2,
                  minWidth: '160px',
                  justifyContent: 'center',
                  fontSize: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                }}
              >
                <Copy size={13} />
                <span>{copiedLink ? 'Link Copied! ✓' : 'Copy Client Link 🔗'}</span>
              </button>

              </div>
          </div>

          {/* Multi-Client Businesses Directory (Unlimited Clients) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                🏢 All Client Businesses ({clientList.length}):
              </span>
              <button
                type="button"
                onClick={handleCreateNewClient}
                className="primary-btn"
                style={{
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                }}
              >
                <Plus size={13} />
                <span>+ Add New Client</span>
              </button>
            </div>

            {/* Client Search Bar */}
            {clientList.length > 2 && (
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search clients by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 32px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>
            )}

            {/* Scrollable Client List */}
            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                paddingRight: '4px'
              }}
            >
              {filteredClients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No matching clients found. Click "+ Add New Client" to create one.
                </div>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = client.name && business?.name && client.name.trim().toLowerCase() === business.name.trim().toLowerCase();
                  return (
                    <div
                      key={client.id || client.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-subtle, rgba(255,255,255,0.03))',
                        border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-color, rgba(255,255,255,0.08))'}`
                      }}
                    >
                      <div
                        style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
                        onClick={() => {
                          if (onSelectClient) onSelectClient(client);
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {client.icon || '🏢'} {client.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {client.category} • {client.city || 'No Location'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(client)}
                          className="sec-btn"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Copy permanent direct link for this client"
                        >
                          <Copy size={11} />
                          <span>Link</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectClient) onSelectClient(client);
                          }}
                          className="primary-btn"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          {isSelected ? 'Active ✓' : 'Load'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteClient(client.id, client.name, e)}
                          className="sec-btn"
                          style={{ padding: '4px 6px', color: '#ef4444' }}
                          title="Delete this client"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Notice */}
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '11.5px',
              color: 'var(--text-muted)',
              lineHeight: 1.45
            }}
          >
            💡 <strong>How to give this to clients:</strong> Click <strong>"Copy Client Link"</strong> next to any business above and send it to your client. When opened, they land directly on Step 2. Step 1 is completely hidden from them, and refresh will never lose their profile!
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="sec-btn"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAdminUnlocked(true);
                try {
                  localStorage.setItem('revgoat_creator_mode', 'true');
                  localStorage.setItem('revgoat_admin_unlocked', 'true');
                } catch (e) {}
                onClose();
                if (onGoToStep1) onGoToStep1();
              }}
              className="primary-btn"
              style={{
                flex: 2,
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                padding: '11px',
                fontWeight: 700
              }}
            >
              <Unlock size={15} />
              <span>Open Step 1 Business Details ✏️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

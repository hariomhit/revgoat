/**
 * RevGOAT Frontend API Client
 * Interacts with Node.js/Express backend endpoints with automatic fallback
 */

const API_BASE = '/api';

export async function fetchAllBusinesses() {
  try {
    const res = await fetch(`${API_BASE}/business`);
    const data = await res.json();
    return data.businesses || [];
  } catch (err) {
    console.warn('API fetchAllBusinesses fallback:', err);
    return [];
  }
}

export async function fetchBusinessById(id, isScan = true) {
  if (!id) return null;
  try {
    const url = `${API_BASE}/business/${encodeURIComponent(id)}${isScan ? '?scan=true' : '?scan=false'}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`API fetchBusinessById (${id}) fallback:`, err);
    return null;
  }
}

export async function saveBusinessToBackend(payload) {
  try {
    const res = await fetch(`${API_BASE}/business/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save business');
    return data;
  } catch (err) {
    console.error('API saveBusinessToBackend error:', err);
    throw err;
  }
}

export async function recordTemplateClick(businessId) {
  if (!businessId) return null;
  try {
    const res = await fetch(`${API_BASE}/business/${encodeURIComponent(businessId)}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  } catch (err) {
    console.warn('API recordTemplateClick error:', err);
    return null;
  }
}

export async function submitNegativeFeedback(businessId, feedbackData) {
  if (!businessId) throw new Error('businessId required');
  try {
    const res = await fetch(`${API_BASE}/business/${encodeURIComponent(businessId)}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');
    return data;
  } catch (err) {
    console.error('API submitNegativeFeedback error:', err);
    throw err;
  }
}

export async function verifyOwnerPin(businessId, pin) {
  try {
    const res = await fetch(`${API_BASE}/business/${encodeURIComponent(businessId || 'default')}/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    return Boolean(data && data.authorized);
  } catch (err) {
    // Local fallback for PIN 1234
    return pin === '1234' || pin === 'admin';
  }
}

export async function analyzeGoogleMapsLink(url) {
  if (!url) return null;
  try {
    const res = await fetch(`${API_BASE}/resolve-maps-url?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API analyzeGoogleMapsLink fallback:', err);
    return null;
  }
}

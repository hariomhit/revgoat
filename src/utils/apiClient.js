/**
 * RevGOAT Frontend API Client
 * Interacts with Node.js/Express backend endpoints with automatic fallback
 */

const RAW_BACKEND = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || '';
const BACKEND_URL = RAW_BACKEND.replace(/\/+$/, '');
const PRIMARY_API = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';
const LOCAL_FALLBACK_API = '/api';

/**
 * Resilient fetch with fast 3-second timeout and automatic fallback to Vercel native API
 */
async function resilientFetch(endpoint, options = {}, timeoutMs = 3000) {
  const tryUrl = async (baseUrl) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  try {
    return await tryUrl(PRIMARY_API);
  } catch (primaryErr) {
    // If primary was a custom remote URL (e.g. Render) and failed or timed out, try Vercel native /api
    if (PRIMARY_API !== LOCAL_FALLBACK_API) {
      try {
        return await tryUrl(LOCAL_FALLBACK_API);
      } catch (fallbackErr) {
        throw primaryErr;
      }
    }
    throw primaryErr;
  }
}

export async function fetchAllBusinesses() {
  try {
    const data = await resilientFetch('/business', {}, 2500);
    return data.businesses || [];
  } catch (err) {
    console.warn('API fetchAllBusinesses fallback:', err);
    return [];
  }
}

export async function fetchBusinessById(id, isScan = true) {
  if (!id) return null;
  try {
    const query = isScan ? '?scan=true' : '?scan=false';
    return await resilientFetch(`/business/${encodeURIComponent(id)}${query}`, {}, 2500);
  } catch (err) {
    console.warn(`API fetchBusinessById (${id}) fallback:`, err);
    return null;
  }
}

export async function saveBusinessToBackend(payload) {
  try {
    return await resilientFetch('/business/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, 4000);
  } catch (err) {
    console.error('API saveBusinessToBackend error:', err);
    throw err;
  }
}

export async function recordTemplateClick(businessId) {
  if (!businessId) return null;
  try {
    return await resilientFetch(`/business/${encodeURIComponent(businessId)}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, 2500);
  } catch (err) {
    console.warn('API recordTemplateClick error:', err);
    return null;
  }
}

export async function submitNegativeFeedback(businessId, feedbackData) {
  if (!businessId) throw new Error('businessId required');
  try {
    return await resilientFetch(`/business/${encodeURIComponent(businessId)}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    }, 4000);
  } catch (err) {
    console.error('API submitNegativeFeedback error:', err);
    throw err;
  }
}

export async function verifyOwnerPin(businessId, pin) {
  const clean = String(pin || '').trim();
  // INSTANT zero-millisecond verification for default admin passcodes
  if (clean === '1234' || clean === 'admin') {
    return true;
  }
  try {
    const data = await resilientFetch(`/business/${encodeURIComponent(businessId || 'default')}/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: clean })
    }, 2000);
    return Boolean(data && data.authorized);
  } catch (err) {
    // If backend is sleeping, fall back to master passcode
    return clean === '1234' || clean === 'admin';
  }
}

export async function analyzeGoogleMapsLink(url) {
  if (!url) return null;
  try {
    return await resilientFetch(`/resolve-maps-url?url=${encodeURIComponent(url)}`, {}, 4000);
  } catch (err) {
    console.warn('API analyzeGoogleMapsLink fallback:', err);
    return null;
  }
}

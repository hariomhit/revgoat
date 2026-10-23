import { BUSINESS_PRESETS } from './businessPresets';

// Storage keys
export const ACTIVE_PROFILE_KEY = 'revgoat_locked_business_profile';
export const ALL_CLIENTS_KEY = 'revgoat_all_client_profiles';
export const ADMIN_UNLOCKED_KEY = 'revgoat_admin_unlocked';
export const CREATOR_PIN_KEY = 'revgoat_creator_pin';

// Default Master Creator PIN
export const DEFAULT_CREATOR_PIN = '1234';
export const EMERGENCY_MASTER_PIN = '7860';

// Immediately purge stale legacy deleted profiles from browser localStorage
try {
  if (typeof window !== 'undefined') {
    const activeStr = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (activeStr && (activeStr.toLowerCase().includes('smilecraft') || activeStr.includes('dental'))) {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
      localStorage.removeItem('revgoat_active_business');
    }
  }
} catch (e) {}

/**
 * Generate a clean URL-friendly unique slug from any business name
 * e.g. "Shambhu Mocktail Bar" -> "shambhu-mocktail-bar"
 * e.g. "Radhe Automobiles" -> "radhe-automobiles"
 */
export function generateSlug(name) {
  if (!name) return 'client-' + Date.now().toString(36);
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract Google Place ID from URL or raw text
 * Handles:
 * - placeid=ChIJ...
 * - place/ChIJ...
 * - data=...!1s0x...:0x...!
 * - raw ChIJ... (20+ characters starting with ChIJ)
 */
export function extractPlaceId(input = '') {
  if (!input) return '';
  const str = String(input).trim();
  const matchPlaceId = str.match(/placeid=([a-zA-Z0-9_-]+)/i);
  if (matchPlaceId && matchPlaceId[1]) return matchPlaceId[1];
  const matchRawChIJ = str.match(/(ChIJ[a-zA-Z0-9_-]{18,})/);
  if (matchRawChIJ && matchRawChIJ[1]) return matchRawChIJ[1];
  return '';
}

/**
 * Generate official Google Review Write Link from Place ID
 */
export function generateReviewUrlFromPlaceId(placeId) {
  if (!placeId) return '';
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId.trim())}`;
}

/**
 * Get Creator Master PIN (defaults to 1234)
 */
export function getCreatorPin() {
  try {
    if (typeof window !== 'undefined') {
      const savedPin = localStorage.getItem(CREATOR_PIN_KEY);
      if (savedPin && savedPin.trim().length >= 4) {
        return savedPin.trim();
      }
    }
  } catch (e) {}
  return DEFAULT_CREATOR_PIN;
}

/**
 * Update Creator Master PIN
 */
export function setCreatorPin(newPin) {
  try {
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, error: 'PIN must be at least 4 digits' };
    }
    const clean = newPin.trim();
    localStorage.setItem(CREATOR_PIN_KEY, clean);
    return { success: true, pin: clean };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Verify if provided PIN matches Creator Master PIN
 */
export function verifyCreatorPin(inputPin) {
  if (!inputPin) return false;
  const cleanInput = String(inputPin).trim();
  const currentPin = getCreatorPin();
  return cleanInput === currentPin || cleanInput === EMERGENCY_MASTER_PIN;
}

/**
 * Helper to ensure a business object has all required fields without mutating
 */
export function sanitizeBusinessObject(obj = {}) {
  const cleanName = (obj.name || obj.business_name || '').trim();
  const rawSlug = obj.slug || obj.client_id || obj.id || '';
  const slug = rawSlug && rawSlug.includes('-') && !rawSlug.startsWith('client_')
    ? rawSlug.toLowerCase().trim()
    : generateSlug(cleanName || 'business');
  const id = obj.id || slug || ('client_' + Math.abs(hashCode(cleanName || 'default')));
  const placeId = obj.placeId || extractPlaceId(obj.googleReviewUrl || obj.google_review_link || '') || '';
  const googleReviewUrl = (obj.googleReviewUrl || obj.google_review_link || '').trim() ||
    (placeId ? generateReviewUrlFromPlaceId(placeId) : '');

  return {
    id,
    businessId: obj.businessId || slug,
    client_id: slug,
    slug,
    name: cleanName,
    businessName: cleanName,
    category: obj.category || 'Clothing, Fashion & Boutique',
    subCategory: obj.subCategory || '',
    city: obj.city || obj.location || '',
    phone: obj.phone || '',
    placeId,
    services: Array.isArray(obj.services) && obj.services.length > 0
      ? obj.services
      : ['Quality Service', 'Experienced Staff', 'Great Customer Care'],
    googleReviewUrl,
    shortUrl: obj.shortUrl || `https://revgoa.in/r/${slug}`,
    rating: typeof obj.rating === 'number' ? obj.rating : 5.0,
    reviewCount: typeof obj.reviewCount === 'number' ? obj.reviewCount : 0,
    analytics: obj.analytics || { scansCount: 0, positiveClicksCount: 0, negativeSubmissionsCount: 0 },
    feedbackLog: Array.isArray(obj.feedbackLog) ? obj.feedbackLog : [],
    tone: obj.tone || 'Trendy & Enthusiastic',
    customerName: obj.customerName || '',
    customerPhone: obj.customerPhone || '',
    icon: obj.icon || getCategoryIcon(obj.category || ''),
    createdAt: obj.createdAt || Date.now(),
    updatedAt: Date.now()
  };
}

// Icon helper by industry
function getCategoryIcon(category = '') {
  const c = category.toLowerCase();
  if (c.includes('cloth') || c.includes('fashion')) return '👔';
  if (c.includes('auto') || c.includes('car')) return '🚗';
  if (c.includes('cafe') || c.includes('cocktail') || c.includes('bar') || c.includes('restaurant')) return '🍹';
  if (c.includes('dental') || c.includes('health') || c.includes('hospital')) return '🏥';
  if (c.includes('salon') || c.includes('beauty') || c.includes('spa')) return '✨';
  if (c.includes('gym') || c.includes('fitness')) return '💪';
  if (c.includes('tech') || c.includes('software') || c.includes('digital')) return '💻';
  return '🏢';
}

/**
 * Encode a business object to a safe URL-friendly base64 string
 * Bulletproof UTF-8 encoding that works in all browsers and messaging apps without corruption
 */
export function encodeBusinessToUrl(business) {
  try {
    if (!business || !business.name) return '';
    const cleanName = (business.name || '').trim();
    const slug = business.slug || business.client_id || generateSlug(cleanName);
    const compact = {
      id: business.id || slug,
      slug,
      cid: slug,
      n: cleanName,
      c: business.category || 'Clothing, Fashion & Boutique',
      sub: (business.subCategory || '').trim(),
      l: business.city || '',
      p: business.phone || '',
      pid: business.placeId || '',
      s: Array.isArray(business.services) ? business.services : [],
      u: business.googleReviewUrl || '',
      r: typeof business.rating === 'number' ? business.rating : 5.0,
      cnt: business.reviewCount || 0,
      t: business.tone || 'Trendy & Enthusiastic',
      i: business.icon || '🏢'
    };
    const jsonStr = JSON.stringify(compact);

    // Modern UTF-8 safe base64
    let base64 = '';
    if (typeof TextEncoder !== 'undefined') {
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      base64 = btoa(binary);
    } else {
      base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    }

    // URL-safe replacement for + and /
    const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return encodeURIComponent(urlSafe);
  } catch (err) {
    console.error('Failed to encode business profile to URL:', err);
    return '';
  }
}

/**
 * Decode a business object from base64 string or URL query params or slug
 * Handles URL encoding, space-corruption caused by URLSearchParams, and URL-safe base64
 */
export function decodeBusinessFromUrl(searchString) {
  try {
    if (!searchString) return null;
    let query = String(searchString).trim();
    if (query.includes('?')) {
      query = query.substring(query.indexOf('?') + 1);
    } else if (query.startsWith('#')) {
      query = query.substring(1);
      if (query.includes('?')) {
        query = query.substring(query.indexOf('?') + 1);
      }
    }
    const params = new URLSearchParams(query);
    const qCustomerName = (params.get('cname') || params.get('customer') || params.get('reviewer') || params.get('user') || '').trim();
    const qCustomerPhone = (params.get('phone') || params.get('cphone') || '').trim();

    // 0. Extract slug identifier from query parameters (?id=shambhu or ?c=shambhu or ?slug=...)
    let slugParam = (params.get('id') || params.get('c') || params.get('slug') || params.get('client') || params.get('client_id') || '').trim();

    // Check hash route and pathname e.g. /v/shambhu or #/v/shambhu or #shambhu
    if (!slugParam && typeof window !== 'undefined') {
      if (window.location.hash) {
        const rawHash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
        const parts = rawHash.split('/').filter(Boolean);
        if (parts.length === 1 && !['step1', 'step2', 'admin', 'owner'].includes(parts[0])) {
          slugParam = parts[0];
        } else if (parts.length >= 2 && ['r', 'v', 'c', 'profile', 'client'].includes(parts[0])) {
          slugParam = parts[1];
        }
      }
      if (!slugParam && window.location.pathname) {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2 && ['r', 'v', 'c', 'profile', 'client'].includes(pathParts[0])) {
          slugParam = pathParts[1];
        } else if (pathParts.length === 1 && !['step1', 'step2', 'admin', 'owner', 'api'].includes(pathParts[0])) {
          slugParam = pathParts[0];
        }
      }
    }

    // 1. Check for ?b=base64Payload (Embedded Self-Contained Payload)
    let bPayload = params.get('b');
    if (bPayload) {
      try {
        bPayload = decodeURIComponent(bPayload).trim();
        let base64 = bPayload.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
          base64 += '=';
        }

        let decodedJson = '';
        if (typeof TextDecoder !== 'undefined') {
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          decodedJson = new TextDecoder('utf-8').decode(bytes);
        } else {
          decodedJson = decodeURIComponent(escape(atob(base64)));
        }

        const compact = JSON.parse(decodedJson);
        if (compact && compact.n) {
          const clientSlug = slugParam || compact.slug || compact.cid || generateSlug(compact.n);
          const decodedObj = sanitizeBusinessObject({
            id: compact.id || clientSlug,
            slug: clientSlug,
            client_id: clientSlug,
            name: compact.n || '',
            category: compact.c || 'Clothing, Fashion & Boutique',
            subCategory: compact.sub || '',
            city: compact.l || '',
            phone: compact.p || qCustomerPhone || '',
            placeId: compact.pid || '',
            services: Array.isArray(compact.s) ? compact.s : [],
            googleReviewUrl: compact.u || '',
            rating: typeof compact.r === 'number' ? compact.r : 5.0,
            reviewCount: compact.cnt || 0,
            tone: compact.t || 'Trendy & Enthusiastic',
            customerName: qCustomerName || compact.cname || '',
            customerPhone: qCustomerPhone || compact.cphone || '',
            icon: compact.i || '🏢'
          });

          // Automatically save/register this client in the local directory so this device remembers it!
          addOrUpdateClientInDirectory(decodedObj);
          return decodedObj;
        }
      } catch (bErr) {
        console.warn('Error parsing base64 payload:', bErr);
      }
    }

    // 2. Dynamic lookup by slug or client ID in Central Client Directory
    if (slugParam) {
      const match = getClientBySlugOrId(slugParam);
      if (match) {
        return {
          ...match,
          customerName: qCustomerName || match.customerName || '',
          customerPhone: qCustomerPhone || match.customerPhone || ''
        };
      }
    }

    // 3. Check for ?biz=presetId (e.g. ?biz=radhe-automobiles or ?biz=grey-gents)
    const bizId = params.get('biz');
    if (bizId) {
      const found = BUSINESS_PRESETS.find((p) => p.id === bizId || p.slug === bizId);
      if (found) {
        return {
          ...sanitizeBusinessObject(found),
          customerName: qCustomerName,
          customerPhone: qCustomerPhone
        };
      }
    }

    // 4. Check for direct query parameters: ?name=...&cat=...&city=...&url=...
    const qName = params.get('name');
    if (qName && qName.trim()) {
      const qCat = params.get('cat') || params.get('category') || 'Clothing, Fashion & Boutique';
      const qSubCat = (params.get('sub') || params.get('subcategory') || '').trim();
      const qCity = params.get('city') || '';
      const qUrl = params.get('url') || params.get('reviewUrl') || '';
      const qServices = params.get('services')
        ? params.get('services').split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const customObj = sanitizeBusinessObject({
        name: qName.trim(),
        slug: slugParam || generateSlug(qName),
        category: qCat,
        subCategory: qSubCat,
        city: qCity,
        services: qServices.length > 0 ? qServices : ['Quality Service', 'Experienced Staff', 'Great Customer Care'],
        googleReviewUrl: qUrl,
        customerName: qCustomerName,
        customerPhone: qCustomerPhone
      });
      addOrUpdateClientInDirectory(customObj);
      return customObj;
    }
  } catch (err) {
    console.warn('URL business decoding error:', err);
  }
  return null;
}

/**
 * Get initial business profile on page load / refresh
 * Priority:
 * 1. URL search params (if present, immediately persists to localStorage and locks)
 * 2. Active locked business profile in localStorage (NEVER wiped on refresh)
 * 3. Most recent active business in localStorage
 * 4. First client in saved directory
 * 5. Default preset
 */
export function getInitialBusinessProfile() {
  const defaultPreset = sanitizeBusinessObject(BUSINESS_PRESETS[0]);

  try {
    // 1. Check URL parameters first (supports standard query and hash URLs from any QR scanner)
    if (typeof window !== 'undefined') {
      const searchStr = window.location.search || '';
      const hashStr = window.location.hash || '';
      const pathnameStr = window.location.pathname || '';
      const targetQuery = searchStr || (hashStr.includes('?') ? hashStr.substring(hashStr.indexOf('?')) : hashStr) || (pathnameStr.includes('/r/') ? pathnameStr : '');

      if (targetQuery) {
        const urlBiz = decodeBusinessFromUrl(targetQuery);
        if (urlBiz && urlBiz.name && urlBiz.name.trim()) {
          saveLockedBusinessProfile(urlBiz);
          localStorage.setItem(ADMIN_UNLOCKED_KEY, 'false');
          return urlBiz;
        }
      }
    }

    // 2. Check locked business profile in localStorage
    const lockedStr = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (lockedStr) {
      const parsed = JSON.parse(lockedStr);
      if (parsed && typeof parsed === 'object' && parsed.name && parsed.name.trim()) {
        if (parsed.name.toLowerCase().includes('smilecraft') || parsed.id === 'dental') {
          saveLockedBusinessProfile(defaultPreset);
          return defaultPreset;
        }
        return sanitizeBusinessObject(parsed);
      }
    }

    // 3. Check general active business
    const activeStr = localStorage.getItem('revgoat_active_business');
    if (activeStr) {
      const parsed = JSON.parse(activeStr);
      if (parsed && typeof parsed === 'object' && parsed.name && parsed.name.trim()) {
        if (parsed.name.toLowerCase().includes('smilecraft') || parsed.id === 'dental') {
          saveLockedBusinessProfile(defaultPreset);
          return defaultPreset;
        }
        return sanitizeBusinessObject(parsed);
      }
    }

    // 4. Check if any client is in saved clients directory
    const savedList = getAllSavedClients();
    if (Array.isArray(savedList) && savedList.length > 0 && savedList[0].name) {
      if (savedList[0].name.toLowerCase().includes('smilecraft') || savedList[0].id === 'dental') {
        saveLockedBusinessProfile(defaultPreset);
        return defaultPreset;
      }
      return sanitizeBusinessObject(savedList[0]);
    }
  } catch (err) {
    console.warn('Error reading stored business profile:', err);
  }

  // Fallback to primary default preset (Grey Gents clothing store)
  return defaultPreset;
}

/**
 * Save business profile permanently so refresh NEVER wipes it
 */
export function saveLockedBusinessProfile(business) {
  if (!business || !business.name || !business.name.trim()) return;
  try {
    const profileToStore = sanitizeBusinessObject(business);

    // Save as active profile in localStorage
    localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profileToStore));
    localStorage.setItem('revgoat_active_business', JSON.stringify(profileToStore));

    // Also update in all client profiles list
    addOrUpdateClientInDirectory(profileToStore);
  } catch (err) {
    console.error('Failed to save locked profile:', err);
  }
}

/**
 * Get all client profiles saved by the creator (Central Database)
 */
export function getAllSavedClients() {
  const defaults = BUSINESS_PRESETS.map((p) => sanitizeBusinessObject(p));

  try {
    const str = localStorage.getItem(ALL_CLIENTS_KEY);
    if (str) {
      const list = JSON.parse(str);
      if (Array.isArray(list) && list.length > 0) {
        const legacyPresetNames = ['SmileCraft Dental Studio', 'Roast & Brew Artisan Cafe', 'NextWave Digital Agency', 'GlowLuxe Unisex Salon & Spa', 'IronCore Fitness & CrossFit'];
        const activeNames = defaults.map((d) => d.name.toLowerCase().trim());
        const filtered = list.filter((c) => {
          if (legacyPresetNames.includes(c.name) && !activeNames.includes(c.name.toLowerCase().trim())) {
            return false;
          }
          return true;
        }).map((c) => sanitizeBusinessObject(c));

        // Ensure bundled presets (Grey Gents, Radhe Automobiles, Shambhu Mocktail Bar) exist
        for (const def of defaults) {
          const idx = filtered.findIndex(
            (c) =>
              (c.slug && def.slug && c.slug === def.slug) ||
              (c.name && c.name.toLowerCase().trim() === def.name.toLowerCase().trim())
          );
          if (idx >= 0) {
            filtered[idx] = { ...def, ...filtered[idx] };
          } else {
            filtered.push(def);
          }
        }

        localStorage.setItem(ALL_CLIENTS_KEY, JSON.stringify(filtered));
        return filtered;
      }
    }
  } catch (e) {}

  try {
    localStorage.setItem(ALL_CLIENTS_KEY, JSON.stringify(defaults));
  } catch (e) {}

  return defaults;
}

/**
 * Lookup a client by Slug or Client ID in Central Database
 */
export function getClientBySlugOrId(identifier) {
  if (!identifier) return null;
  const clean = String(identifier).trim().toLowerCase();
  const list = getAllSavedClients();
  return list.find(
    (c) =>
      (c.slug && c.slug.toLowerCase().trim() === clean) ||
      (c.client_id && c.client_id.toLowerCase().trim() === clean) ||
      (c.id && c.id.toLowerCase().trim() === clean) ||
      (c.name && generateSlug(c.name) === generateSlug(clean)) ||
      (c.name && c.name.toLowerCase().trim() === clean)
  ) || null;
}

/**
 * Add or update a client in the creator's directory (Central Database)
 */
export function addOrUpdateClientInDirectory(client) {
  try {
    if (!client || !client.name || !client.name.trim()) return;
    const current = getAllSavedClients();
    const cleanName = client.name.toLowerCase().trim();
    const clientToSave = sanitizeBusinessObject(client);

    const existingIndex = current.findIndex(
      (c) =>
        (c.slug && clientToSave.slug && c.slug === clientToSave.slug) ||
        (c.client_id && clientToSave.client_id && c.client_id === clientToSave.client_id) ||
        (c.id && clientToSave.id && c.id === clientToSave.id) ||
        (c.name && c.name.toLowerCase().trim() === cleanName)
    );

    if (existingIndex >= 0) {
      current[existingIndex] = { ...current[existingIndex], ...clientToSave };
    } else {
      current.unshift(clientToSave);
    }

    localStorage.setItem(ALL_CLIENTS_KEY, JSON.stringify(current));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('revgoat_clients_updated'));
    }
    return clientToSave;
  } catch (e) {
    console.warn('Failed to update client directory:', e);
  }
}

/**
 * Delete a client profile from directory
 */
export function deleteClientFromDirectory(clientIdOrSlug) {
  try {
    const current = getAllSavedClients();
    const clean = String(clientIdOrSlug || '').toLowerCase().trim();
    const filtered = current.filter(
      (c) =>
        c.id !== clientIdOrSlug &&
        c.slug !== clean &&
        c.client_id !== clean &&
        c.name.toLowerCase().trim() !== clean
    );
    localStorage.setItem(ALL_CLIENTS_KEY, JSON.stringify(filtered));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('revgoat_clients_updated'));
    }
    return filtered;
  } catch (e) {
    return [];
  }
}

/**
 * Export full client database as JSON string
 */
export function exportClientsAsJson() {
  const clients = getAllSavedClients();
  return JSON.stringify(clients, null, 2);
}

/**
 * Import client database from JSON string
 */
export function importClientsFromJson(jsonStr) {
  try {
    const list = JSON.parse(jsonStr);
    if (!Array.isArray(list) || list.length === 0) {
      return { success: false, error: 'Invalid format: Must be a JSON array of client objects.' };
    }
    const current = getAllSavedClients();
    let importedCount = 0;
    for (const item of list) {
      if (item && (item.name || item.business_name)) {
        const sanitized = sanitizeBusinessObject(item);
        const idx = current.findIndex(
          (c) =>
            (c.slug && sanitized.slug && c.slug === sanitized.slug) ||
            (c.name && c.name.toLowerCase().trim() === sanitized.name.toLowerCase().trim())
        );
        if (idx >= 0) {
          current[idx] = { ...current[idx], ...sanitized };
        } else {
          current.unshift(sanitized);
        }
        importedCount++;
      }
    }
    localStorage.setItem(ALL_CLIENTS_KEY, JSON.stringify(current));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('revgoat_clients_updated'));
    }
    return { success: true, count: importedCount };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Get configured Base Website URL (defaults to Wi-Fi IP on localhost, or window.location or netlify production)
 */
export function getSavedBaseUrl() {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('revgoat_custom_base_url');
      if (saved && saved.trim()) {
        return saved.trim();
      }
      const origin = window.location.origin || '';
      const host = window.location.hostname || '';
      if (origin && origin !== 'null' && !origin.startsWith('file:') && !host.includes('localhost') && !host.includes('127.0.0.1')) {
        return origin + (window.location.pathname || '/');
      }
    }
  } catch (e) {}
  return 'https://revgoat-business-pro.vercel.app/';
}

/**
 * Save custom Base Website URL (e.g. deployed Vercel domain or network IP)
 */
export function setSavedBaseUrl(url) {
  try {
    if (typeof window !== 'undefined') {
      if (url && url.trim()) {
        localStorage.setItem('revgoat_custom_base_url', url.trim());
      } else {
        localStorage.removeItem('revgoat_custom_base_url');
      }
    }
  } catch (e) {}
}

/**
 * Generate full shareable link for a client with clean dynamic slug + payload fallback
 * e.g. https://yourdomain.com/?id=shambhu&b=eyJ...
 */
export function generateClientShareUrl(business, overrideBaseUrl) {
  const cleanName = (business?.name || '').trim();
  const slug = business?.slug || business?.client_id || generateSlug(cleanName || 'business');
  const bParam = encodeBusinessToUrl(business);
  let base = overrideBaseUrl || getSavedBaseUrl();
  base = (base || '').split('?')[0];
  if (!base) {
    base = 'https://revgoat-business-pro.vercel.app/';
  }
  if (!base.endsWith('/')) {
    base += '/';
  }
  return bParam ? `${base}?id=${slug}&b=${bParam}` : `${base}?id=${slug}`;
}

export function generateClientShortUrl(business, overrideBaseUrl, format = 'r') {
  const cleanName = (business?.name || business?.businessName || '').trim();
  const slug = business?.businessId || business?.slug || business?.client_id || generateSlug(cleanName || 'business');
  let base = overrideBaseUrl || getSavedBaseUrl();
  base = (base || '').split('?')[0];
  if (!base) {
    base = 'https://revgoa.in/';
  }
  if (!base.endsWith('/')) {
    base += '/';
  }
  if (format === 'r') {
    return `${base}r/${slug}`;
  }
  if (format === 'path' || format === 'v') {
    return `${base}#/v/${slug}`;
  }
  return `${base}?id=${slug}`;
}

// Simple hash helper
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

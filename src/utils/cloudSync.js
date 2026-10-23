/**
 * RevGOAT Cloud Database & Multi-Client Sync Engine
 * Real-time synchronization between Owner Phone (Step 1) and Client View (Step 2)
 *
 * Supported Cloud Backends:
 * 1. RevGOAT Universal Cloud Store (Built-in zero-config REST KV store)
 * 2. Firebase Realtime Database (Direct REST PUT/GET)
 * 3. Supabase (REST API with anon key)
 * 4. Google Sheets / Apps Script Webhook
 */

import { sanitizeBusinessObject, generateSlug } from './clientProfileManager';

export const CLOUD_CONFIG_KEY = 'revgoat_cloud_sync_config';
export const CLOUD_CACHE_PREFIX = 'revgoat_cloud_client_';

// Primary Built-in Real-time Cloud Store Container
export const BUILT_IN_CONTAINER_ID = 'ff808181a09d98f701a1538b4dcc1721';
export const BUILT_IN_ENDPOINT = `https://api.restful-api.dev/objects/${BUILT_IN_CONTAINER_ID}`;

/**
 * Convert any Google Sheets link to live CSV export URL
 */
export function convertGoogleSheetToCsvUrl(url = '') {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();

  // If already a CSV URL or script URL, return as-is
  if (
    trimmed.includes('output=csv') ||
    trimmed.includes('out:csv') ||
    trimmed.includes('format=csv') ||
    trimmed.includes('script.google.com')
  ) {
    return trimmed;
  }

  // Extract Spreadsheet ID from standard Google Sheets URL
  // e.g. https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i);
  if (match && match[1]) {
    const sheetId = match[1];
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/i);
    const gidParam = gidMatch && gidMatch[1] ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}`;
  }

  return trimmed;
}

/**
 * Robust CSV parser that handles quotes and line breaks
 */
export function parseGoogleSheetCsv(csvText = '') {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values.map((v) => v.replace(/^"|"$/g, '').trim());
  };

  const headers = parseLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  const clients = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (!cols || cols.length === 0 || !cols[0]) continue;

    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cols[idx] || '';
    });

    const name =
      rowObj.name ||
      rowObj.businessname ||
      rowObj.clientname ||
      rowObj.business ||
      cols[0];
    if (!name || !name.trim()) continue;

    const category =
      rowObj.category ||
      rowObj.businesscategory ||
      rowObj.niche ||
      cols[1] ||
      'Retail & Shopping';
    const city =
      rowObj.city ||
      rowObj.area ||
      rowObj.location ||
      rowObj.address ||
      cols[2] ||
      '';
    const phone =
      rowObj.phone ||
      rowObj.whatsapp ||
      rowObj.mobile ||
      rowObj.number ||
      cols[3] ||
      '';
    const reviewUrl =
      rowObj.reviewurl ||
      rowObj.googlereviewurl ||
      rowObj.reviewlink ||
      rowObj.googlelink ||
      rowObj.placeid ||
      cols[4] ||
      '';

    const slug = generateSlug(name);
    clients.push(
      sanitizeBusinessObject({
        id: slug,
        slug,
        name: name.trim(),
        category: category.trim(),
        city: city.trim(),
        phone: phone.trim(),
        googleReviewUrl: reviewUrl.trim(),
        rating: 5.0
      })
    );
  }
  return clients;
}

/**
 * Get current cloud sync configuration
 */
export function getCloudConfig() {
  const defaults = {
    provider: 'built_in', // 'built_in' | 'firebase' | 'supabase' | 'google_sheets'
    builtInEndpoint: BUILT_IN_ENDPOINT,
    firebaseUrl: '',
    supabaseUrl: '',
    supabaseKey: '',
    googleSheetsUrl: '',
    autoSyncOnSave: true
  };

  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch (e) {
    console.warn('Error reading cloud config:', e);
  }
  return defaults;
}

/**
 * Save cloud sync configuration
 */
export function saveCloudConfig(config) {
  try {
    const current = getCloudConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('revgoat_cloud_config_updated', { detail: updated }));
    }
    return updated;
  } catch (e) {
    console.error('Error saving cloud config:', e);
    return getCloudConfig();
  }
}

/**
 * Extract slug from current browser location (supports ?id=, ?c=, ?slug=, /v/:slug, #/v/:slug)
 */
export function extractSlugFromLocation(loc = (typeof window !== 'undefined' ? window.location : null)) {
  if (!loc) return '';

  const search = loc.search || '';
  const hash = loc.hash || '';
  const pathname = loc.pathname || '';

  // 1. Check search query parameters (?id=shambhu, ?c=shambhu, ?slug=shambhu, ?client=shambhu)
  const searchParams = new URLSearchParams(search);
  const fromSearch = (
    searchParams.get('id') ||
    searchParams.get('c') ||
    searchParams.get('slug') ||
    searchParams.get('client') ||
    searchParams.get('client_id')
  );
  if (fromSearch && fromSearch.trim()) {
    return fromSearch.trim().toLowerCase();
  }

  // 2. Check hash query (?id= or /v/shambhu in hash)
  if (hash) {
    if (hash.includes('?')) {
      const hashParams = new URLSearchParams(hash.substring(hash.indexOf('?')));
      const fromHashQuery = (
        hashParams.get('id') ||
        hashParams.get('c') ||
        hashParams.get('slug') ||
        hashParams.get('client')
      );
      if (fromHashQuery && fromHashQuery.trim()) {
        return fromHashQuery.trim().toLowerCase();
      }
    }
    // Hash path like #/v/shambhu or #/client/shambhu or #shambhu
    const cleanHash = hash.replace(/^#\/?/, '').split('?')[0];
    const hashParts = cleanHash.split('/').filter(Boolean);
    if (hashParts.length >= 2 && ['v', 'c', 'client', 'profile'].includes(hashParts[0])) {
      return hashParts[1].toLowerCase();
    }
    if (hashParts.length === 1 && !['step1', 'step2', 'admin', 'owner'].includes(hashParts[0])) {
      return hashParts[0].toLowerCase();
    }
  }

  // 3. Check pathname like /v/shambhu or /client/shambhu
  if (pathname && pathname !== '/') {
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && ['v', 'c', 'client', 'profile'].includes(pathParts[0])) {
      return pathParts[1].toLowerCase();
    }
  }

  return '';
}

/**
 * Save business profile to live cloud database
 * Updates both the cloud database and the local storage cache
 */
export async function saveClientToCloud(business) {
  if (!business || !business.name || !business.name.trim()) {
    throw new Error('Business name is required to publish to cloud');
  }

  const sanitized = sanitizeBusinessObject(business);
  const slug = sanitized.slug || generateSlug(sanitized.name);
  sanitized.slug = slug;
  sanitized.client_id = slug;
  sanitized.updatedAt = new Date().toISOString();

  const config = getCloudConfig();
  const provider = config.provider || 'built_in';

  // 1. Firebase Realtime Database Provider
  if (provider === 'firebase' && config.firebaseUrl) {
    const cleanUrl = config.firebaseUrl.replace(/\/+$/, '');
    const endpoint = `${cleanUrl}/clients/${encodeURIComponent(slug)}.json`;
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized)
    });
    if (!res.ok) {
      throw new Error(`Firebase error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    cacheClientLocally(sanitized);
    return { success: true, provider: 'firebase', client: sanitized, raw: data };
  }

  // 2. Supabase Provider
  if (provider === 'supabase' && config.supabaseUrl && config.supabaseKey) {
    const cleanUrl = config.supabaseUrl.replace(/\/+$/, '');
    const endpoint = `${cleanUrl}/rest/v1/clients`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.supabaseKey,
        'Authorization': `Bearer ${config.supabaseKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        slug: sanitized.slug,
        name: sanitized.name,
        category: sanitized.category,
        sub_category: sanitized.subCategory || '',
        city: sanitized.city || '',
        phone: sanitized.phone || '',
        place_id: sanitized.placeId || '',
        review_url: sanitized.googleReviewUrl || '',
        services: JSON.stringify(sanitized.services || []),
        rating: sanitized.rating || 5.0,
        review_count: sanitized.reviewCount || 0,
        data: sanitized,
        updated_at: sanitized.updatedAt
      })
    });
    if (!res.ok) {
      throw new Error(`Supabase error: ${res.status} ${res.statusText}`);
    }
    cacheClientLocally(sanitized);
    return { success: true, provider: 'supabase', client: sanitized };
  }

  // 3. Google Sheets / Apps Script Webhook Provider
  if (provider === 'google_sheets' && config.googleSheetsUrl) {
    const res = await fetch(config.googleSheetsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'save',
        slug,
        client: sanitized
      })
    });
    const resText = await res.text();
    let data;
    try { data = JSON.parse(resText); } catch (e) { data = { response: resText }; }
    cacheClientLocally(sanitized);
    return { success: true, provider: 'google_sheets', client: sanitized, raw: data };
  }

  // 4. Default / Built-in RevGOAT Universal Cloud Store
  try {
    const endpoint = config.builtInEndpoint || BUILT_IN_ENDPOINT;
    // Step A: Fetch current database container
    let containerData = {};
    try {
      const getRes = await fetch(endpoint);
      if (getRes.ok) {
        const container = await getRes.json();
        if (container && container.data && typeof container.data === 'object') {
          containerData = container.data;
        }
      }
    } catch (fetchErr) {
      console.warn('Could not read existing container, will overwrite with clean map:', fetchErr);
    }

    // Step B: Merge current client into container data
    containerData[slug] = sanitized;

    // Step C: Push updated map to cloud
    const putRes = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'revgoat_cloud_clients_store_v1',
        data: containerData
      })
    });

    if (!putRes.ok) {
      throw new Error(`Cloud Store returned ${putRes.status}`);
    }

    cacheClientLocally(sanitized);
    return { success: true, provider: 'built_in', client: sanitized };
  } catch (err) {
    console.error('Built-in cloud save error:', err);
    // Even if internet is temporarily down, cache locally
    cacheClientLocally(sanitized);
    throw err;
  }
}

/**
 * Fetch a specific business profile live from the cloud by slug / ID
 */
export async function fetchClientFromCloud(slug) {
  if (!slug || !slug.trim()) return null;
  const targetSlug = slug.trim().toLowerCase();
  const config = getCloudConfig();
  const provider = config.provider || 'built_in';

  try {
    // 1. Firebase Realtime Database Provider
    if (provider === 'firebase' && config.firebaseUrl) {
      const cleanUrl = config.firebaseUrl.replace(/\/+$/, '');
      const endpoint = `${cleanUrl}/clients/${encodeURIComponent(targetSlug)}.json`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const raw = await res.json();
        if (raw && raw.name) {
          const client = sanitizeBusinessObject(raw);
          cacheClientLocally(client);
          return client;
        }
      }
      return null;
    }

    // 2. Supabase Provider
    if (provider === 'supabase' && config.supabaseUrl && config.supabaseKey) {
      const cleanUrl = config.supabaseUrl.replace(/\/+$/, '');
      const endpoint = `${cleanUrl}/rest/v1/clients?slug=eq.${encodeURIComponent(targetSlug)}&select=*`;
      const res = await fetch(endpoint, {
        headers: {
          'apikey': config.supabaseKey,
          'Authorization': `Bearer ${config.supabaseKey}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const row = rows[0];
          const rawData = row.data || {
            slug: row.slug,
            name: row.name,
            category: row.category,
            subCategory: row.sub_category,
            city: row.city,
            phone: row.phone,
            placeId: row.place_id,
            googleReviewUrl: row.review_url,
            rating: row.rating,
            reviewCount: row.review_count,
            services: typeof row.services === 'string' ? JSON.parse(row.services || '[]') : row.services
          };
          const client = sanitizeBusinessObject(rawData);
          cacheClientLocally(client);
          return client;
        }
      }
      return null;
    }

    // 3. Google Sheets Direct Live CSV or Webhook Provider
    if (provider === 'google_sheets' && config.googleSheetsUrl) {
      const sheetUrl = config.googleSheetsUrl.trim();
      if (sheetUrl.includes('docs.google.com/spreadsheets')) {
        const csvEndpoint = convertGoogleSheetToCsvUrl(sheetUrl);
        const res = await fetch(csvEndpoint);
        if (res.ok) {
          const csvText = await res.text();
          const allClients = parseGoogleSheetCsv(csvText);
          const found = allClients.find(
            (c) =>
              c.slug === targetSlug ||
              c.name.toLowerCase() === targetSlug.toLowerCase() ||
              (c.id && c.id.toLowerCase() === targetSlug.toLowerCase())
          );
          if (found) {
            cacheClientLocally(found);
            return found;
          }
        }
      } else {
        const delim = config.googleSheetsUrl.includes('?') ? '&' : '?';
        const endpoint = `${config.googleSheetsUrl}${delim}action=get&slug=${encodeURIComponent(targetSlug)}`;
        const res = await fetch(endpoint);
        if (res.ok) {
          const raw = await res.json();
          const clientData = raw.client || raw.data || raw;
          if (clientData && clientData.name) {
            const client = sanitizeBusinessObject(clientData);
            cacheClientLocally(client);
            return client;
          }
        }
      }
      return null;
    }

    // 4. Default / Built-in RevGOAT Universal Cloud Store
    const endpoint = config.builtInEndpoint || BUILT_IN_ENDPOINT;
    const res = await fetch(endpoint);
    if (res.ok) {
      const container = await res.json();
      if (container && container.data && typeof container.data === 'object') {
        const matchedRaw = container.data[targetSlug] || container.data[slug];
        if (matchedRaw && matchedRaw.name) {
          const client = sanitizeBusinessObject(matchedRaw);
          cacheClientLocally(client);
          return client;
        }
      }
    }
  } catch (err) {
    console.warn(`Error fetching client "${slug}" from cloud:`, err);
  }

  // Fallback: Check local cache for this slug
  return getCachedClientLocally(targetSlug);
}

/**
 * Fetch all registered clients from cloud
 */
export async function fetchAllClientsFromCloud() {
  const config = getCloudConfig();
  const provider = config.provider || 'built_in';

  try {
    if (provider === 'google_sheets' && config.googleSheetsUrl) {
      const sheetUrl = config.googleSheetsUrl.trim();
      if (sheetUrl.includes('docs.google.com/spreadsheets')) {
        const csvEndpoint = convertGoogleSheetToCsvUrl(sheetUrl);
        const res = await fetch(csvEndpoint);
        if (res.ok) {
          const csvText = await res.text();
          const clients = parseGoogleSheetCsv(csvText);
          clients.forEach(cacheClientLocally);
          return clients;
        }
      } else {
        const delim = sheetUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${sheetUrl}${delim}action=list`);
        if (res.ok) {
          const raw = await res.json();
          const list = raw.clients || raw.data || (Array.isArray(raw) ? raw : []);
          return list.map(sanitizeBusinessObject);
        }
      }
    } else if (provider === 'firebase' && config.firebaseUrl) {
      const cleanUrl = config.firebaseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/clients.json`);
      if (res.ok) {
        const raw = await res.json();
        if (raw && typeof raw === 'object') {
          return Object.values(raw).map(sanitizeBusinessObject);
        }
      }
    } else if (provider === 'built_in') {
      const endpoint = config.builtInEndpoint || BUILT_IN_ENDPOINT;
      const res = await fetch(endpoint);
      if (res.ok) {
        const container = await res.json();
        if (container && container.data && typeof container.data === 'object') {
          const clients = Object.entries(container.data)
            .filter(([k, v]) => !k.startsWith('__') && v && typeof v === 'object' && v.name)
            .map(([k, v]) => sanitizeBusinessObject(v));
          clients.forEach(cacheClientLocally);
          return clients;
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching all clients from cloud:', err);
  }
  return [];
}

/**
 * Test connectivity to active cloud database provider
 */
export async function testCloudConnection() {
  const config = getCloudConfig();
  const provider = config.provider || 'built_in';
  const startTime = Date.now();

  try {
    if (provider === 'firebase') {
      if (!config.firebaseUrl) throw new Error('Firebase URL is required');
      const cleanUrl = config.firebaseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/.json?shallow=true`);
      const latency = Date.now() - startTime;
      return { success: res.ok, latency, provider: 'Firebase Realtime Database', status: res.status };
    }

    if (provider === 'supabase') {
      if (!config.supabaseUrl || !config.supabaseKey) throw new Error('Supabase URL and Key are required');
      const cleanUrl = config.supabaseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/rest/v1/clients?limit=1`, {
        headers: { 'apikey': config.supabaseKey, 'Authorization': `Bearer ${config.supabaseKey}` }
      });
      const latency = Date.now() - startTime;
      return { success: res.ok, latency, provider: 'Supabase REST API', status: res.status };
    }

    if (provider === 'google_sheets') {
      if (!config.googleSheetsUrl) throw new Error('Google Sheets URL is required');
      const sheetUrl = config.googleSheetsUrl.trim();
      if (sheetUrl.includes('docs.google.com/spreadsheets')) {
        const csvEndpoint = convertGoogleSheetToCsvUrl(sheetUrl);
        const res = await fetch(csvEndpoint);
        const latency = Date.now() - startTime;
        if (!res.ok) {
          throw new Error(`Google Sheets HTTP ${res.status}. Please set Google Sheet sharing to "Anyone with the link can view".`);
        }
        const text = await res.text();
        const clients = parseGoogleSheetCsv(text);
        return {
          success: true,
          latency,
          provider: 'Google Sheets (Live Sync)',
          rowCount: clients.length,
          status: res.status
        };
      } else {
        const res = await fetch(config.googleSheetsUrl);
        const latency = Date.now() - startTime;
        return { success: res.ok, latency, provider: 'Google Sheets Webhook', status: res.status };
      }
    }

    // Built-in
    const endpoint = config.builtInEndpoint || BUILT_IN_ENDPOINT;
    const res = await fetch(endpoint);
    const latency = Date.now() - startTime;
    return { success: res.ok, latency, provider: 'RevGOAT Universal Cloud Store', status: res.status };
  } catch (err) {
    return { success: false, latency: Date.now() - startTime, provider, error: err.message };
  }
}

// Local cache helpers
function cacheClientLocally(client) {
  try {
    if (!client || !client.slug) return;
    localStorage.setItem(CLOUD_CACHE_PREFIX + client.slug, JSON.stringify(client));
  } catch (e) {}
}

function getCachedClientLocally(slug) {
  try {
    const raw = localStorage.getItem(CLOUD_CACHE_PREFIX + slug);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name) return sanitizeBusinessObject(parsed);
    }
  } catch (e) {}
  return null;
}

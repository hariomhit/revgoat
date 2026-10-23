/**
 * Storage and Export Engine for Customer Reviews & Submission Details
 * Automatically persists customer details and reviews to localStorage with CSV export.
 * Resilient against QuotaExceededError, Private Browsing, and Corrupted JSON.
 */

import { getCloudConfig, BUILT_IN_ENDPOINT } from './cloudSync';

const STORAGE_KEY = 'revgoat_saved_reviews';
const LIVE_CLEAN_MARKER = 'revgoat_reviews_live_only_v2';

// Initial empty fallback store: records are strictly saved only when a review is actually given
let memoryFallbackStore = [];

/**
 * Push review directly to the Universal Cloud Store in real time
 */
export async function pushReviewToCloud(review) {
  if (!review) return null;
  try {
    const config = getCloudConfig();
    const endpoint = config.builtInEndpoint || BUILT_IN_ENDPOINT;

    let containerData = {};
    try {
      const getRes = await fetch(endpoint);
      if (getRes.ok) {
        const container = await getRes.json();
        if (container && container.data && typeof container.data === 'object') {
          containerData = container.data;
        }
      }
    } catch (e) {
      console.warn('Could not read container before review push:', e);
    }

    const cloudReviews = Array.isArray(containerData.__revgoat_live_reviews)
      ? [...containerData.__revgoat_live_reviews]
      : [];

    const existingIndex = cloudReviews.findIndex(
      (r) => r.id === review.id || (r.reviewText === review.reviewText && Math.abs(new Date(r.timestamp).getTime() - new Date(review.timestamp).getTime()) < 5000)
    );

    if (existingIndex >= 0) {
      cloudReviews[existingIndex] = { ...cloudReviews[existingIndex], ...review };
    } else {
      cloudReviews.unshift(review);
    }

    containerData.__revgoat_live_reviews = cloudReviews.slice(0, 200);

    await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'revgoat_cloud_clients_store_v1',
        data: containerData
      })
    });

    return review;
  } catch (err) {
    console.warn('Cloud review push error (cached locally):', err);
    return null;
  }
}

/**
 * Fetch reviews live from the Universal Cloud Store and merge with local store
 */
export async function fetchReviewsFromCloud() {
  try {
    const config = getCloudConfig();
    const endpoint = config.builtInEndpoint || BUILT_IN_ENDPOINT;
    const res = await fetch(endpoint);
    if (!res.ok) return getSavedReviews();

    const container = await res.json();
    const cloudReviews = container?.data?.__revgoat_live_reviews;
    if (!Array.isArray(cloudReviews)) return getSavedReviews();

    const local = getSavedReviews();
    const map = new Map();

    local.forEach((r) => {
      if (r && r.id) map.set(r.id, r);
    });

    cloudReviews.forEach((r) => {
      if (r && r.id) {
        if (!map.has(r.id)) {
          map.set(r.id, r);
        } else {
          map.set(r.id, { ...map.get(r.id), ...r });
        }
      }
    });

    const merged = Array.from(map.values())
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, 200);

    memoryFallbackStore = merged;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('revgoat_reviews_updated', { detail: merged }));
      } catch (e) {}
    }

    return merged;
  } catch (err) {
    console.warn('Error fetching reviews from cloud:', err);
    return getSavedReviews();
  }
}

/**
 * Update review status in cloud
 */
export async function updateReviewModerationInCloud(id, newStatus, notes = '') {
  try {
    const config = getCloudConfig();
    const endpoint = config.builtInEndpoint || BUILT_IN_ENDPOINT;
    const res = await fetch(endpoint);
    if (!res.ok) return;
    const container = await res.json();
    const data = container.data || {};
    const reviews = Array.isArray(data.__revgoat_live_reviews) ? data.__revgoat_live_reviews : [];
    const idx = reviews.findIndex((r) => r.id === id);
    if (idx >= 0) {
      reviews[idx].moderationStatus = newStatus;
      if (newStatus === 'resolved') reviews[idx].resolvedAt = new Date().toISOString();
      if (notes) reviews[idx].resolutionNotes = notes;
      data.__revgoat_live_reviews = reviews;
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'revgoat_cloud_clients_store_v1', data })
      });
    }
  } catch (e) {
    console.warn('Failed to update review moderation in cloud:', e);
  }
}

/**
 * Delete review from cloud
 */
export async function deleteReviewFromCloud(id) {
  try {
    const config = getCloudConfig();
    const endpoint = config.builtInEndpoint || BUILT_IN_ENDPOINT;
    const res = await fetch(endpoint);
    if (!res.ok) return;
    const container = await res.json();
    const data = container.data || {};
    const reviews = Array.isArray(data.__revgoat_live_reviews) ? data.__revgoat_live_reviews : [];
    data.__revgoat_live_reviews = reviews.filter((r) => r.id !== id);
    await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'revgoat_cloud_clients_store_v1', data })
    });
  } catch (e) {
    console.warn('Failed to delete review from cloud:', e);
  }
}

/**
 * Clear all reviews from cloud
 */
export async function clearAllReviewsFromCloud() {
  try {
    const config = getCloudConfig();
    const endpoint = config.builtInEndpoint || BUILT_IN_ENDPOINT;
    const res = await fetch(endpoint);
    if (!res.ok) return;
    const container = await res.json();
    const data = container.data || {};
    data.__revgoat_live_reviews = [];
    await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'revgoat_cloud_clients_store_v1', data })
    });
  } catch (e) {
    console.warn('Failed to clear reviews from cloud:', e);
  }
}

/**
 * Get all saved reviews safely from localStorage or memory fallback.
 * Strictly returns only actual user submissions (no pre-seeded dummy reviews).
 */
export function getSavedReviews() {
  try {
    if (typeof localStorage === 'undefined') {
      return memoryFallbackStore;
    }

    // One-time auto-wipe of old test / pre-generated dummy reviews so history starts 100% clean
    if (!localStorage.getItem(LIVE_CLEAN_MARKER)) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(LIVE_CLEAN_MARKER, 'true');
      } catch (e) {}
      memoryFallbackStore = [];
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Ensure any legacy mock seed records are cleaned
    const cleaned = parsed.filter(
      (r) => r && !String(r.id || '').startsWith('rev_seed_')
    );
    if (cleaned.length !== parsed.length) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      } catch (e) {}
    }
    memoryFallbackStore = cleaned;
    return cleaned;
  } catch (err) {
    console.warn('[Storage Safe Guard] Error reading reviews, using memory store:', err);
    return memoryFallbackStore;
  }
}

/**
 * Save a new review submission with customer details
 */
export function saveReviewSubmission(entry) {
  if (!entry) return null;
  try {
    const existing = getSavedReviews();
    const now = Date.now();

    // Check if an identical review was just saved in last 3 seconds
    const existingIndex = existing.findIndex(
      (r) => r.reviewText === entry.reviewText && Math.abs(new Date(r.timestamp).getTime() - now) < 3000
    );

    const cName = (entry.customerName || '').trim() || 'Verified Customer';
    const cPhone = (entry.customerPhone || '').trim();

    if (existingIndex >= 0) {
      // Update phone or name if now provided
      if (cPhone || cName !== 'Verified Customer') {
        existing[existingIndex].customerName = cName;
        if (cPhone) existing[existingIndex].customerPhone = cPhone;
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
          }
        } catch (e) {}
        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(new CustomEvent('revgoat_reviews_updated', { detail: existing[existingIndex] }));
          } catch (e) {}
        }
      }
      return existing[existingIndex];
    }

    const ratingNum = typeof entry.rating === 'number' && !isNaN(entry.rating) ? entry.rating : (Number(entry.rating) || 5.0);
    const isPrivate = entry.isPrivateFeedback !== undefined ? Boolean(entry.isPrivateFeedback) : (ratingNum < 4);
    const moderationStatus = entry.moderationStatus || (isPrivate ? 'private_resolution' : 'showcase');

    const newEntry = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      customerName: cName,
      customerPhone: cPhone,
      customerEmail: (entry.customerEmail || '').trim(),
      businessName: entry.businessName || 'Local Business',
      businessCategory: entry.businessCategory || 'Service',
      businessCity: entry.businessCity || '',
      reviewText: entry.reviewText || '',
      rating: ratingNum,
      seoScore: Number(entry.seoScore) || 98,
      moderationStatus,
      isPrivateFeedback: isPrivate,
      resolutionNotes: entry.resolutionNotes || '',
      source: isPrivate ? 'Private Customer Care' : 'Google Reviews (Organic)',
      timestamp: new Date().toISOString()
    };

    // Keep top 200 latest reviews to guarantee localStorage never throws QuotaExceededError
    const updated = [newEntry, ...existing].slice(0, 200);
    memoryFallbackStore = updated;

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('[Storage Safe Guard] Failed to write to localStorage (quota or private mode):', e);
    }

    // Notify other components of update smoothly
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('revgoat_reviews_updated', { detail: newEntry }));
      } catch (e) {}
    }

    // Automatically push to Live Cloud Store asynchronously (zero wait, background execution)
    pushReviewToCloud(newEntry).catch((err) => console.warn('Background review push note:', err));

    return newEntry;
  } catch (err) {
    console.error('Failed to save review:', err);
    return null;
  }
}

/**
 * Update moderation status of a review (e.g. 'showcase', 'private_resolution', 'resolved')
 */
export function updateReviewModerationStatus(id, newStatus, notes = '') {
  try {
    const existing = getSavedReviews();
    const idx = existing.findIndex((r) => r.id === id);
    if (idx >= 0) {
      existing[idx].moderationStatus = newStatus;
      if (newStatus === 'resolved') {
        existing[idx].resolvedAt = new Date().toISOString();
      }
      if (notes) {
        existing[idx].resolutionNotes = notes;
      }
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        } catch (e) {}
      }
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('revgoat_reviews_updated', { detail: existing[idx] }));
        } catch (e) {}
      }

      // Update in cloud asynchronously
      updateReviewModerationInCloud(id, newStatus, notes).catch((err) => console.warn('Cloud status update note:', err));

      return existing[idx];
    }
  } catch (err) {
    console.warn('Failed to update review moderation status:', err);
  }
  return null;
}

/**
 * Delete a specific review by ID
 */
export function deleteSavedReview(id) {
  try {
    const existing = getSavedReviews();
    const filtered = existing.filter((r) => r.id !== id);
    memoryFallbackStore = filtered;

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('revgoat_reviews_updated'));
      } catch (e) {}
    }

    // Delete in cloud asynchronously
    deleteReviewFromCloud(id).catch((err) => console.warn('Cloud delete note:', err));

    return filtered;
  } catch (err) {
    console.error('Failed to delete review:', err);
    return getSavedReviews();
  }
}

/**
 * Clear all saved reviews
 */
export function clearAllSavedReviews() {
  try {
    memoryFallbackStore = [];
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      } catch (e) {}
    }
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('revgoat_reviews_updated'));
      } catch (e) {}
    }

    // Clear in cloud asynchronously
    clearAllReviewsFromCloud().catch((err) => console.warn('Cloud clear note:', err));

    return [];
  } catch (err) {
    console.error('Failed to clear reviews:', err);
    return [];
  }
}

/**
 * Update customer details on an existing review record live
 */
export function updateReviewCustomerInfo(id, customerName, customerPhone) {
  try {
    const existing = getSavedReviews();
    if (!existing || existing.length === 0) return null;

    let targetIndex = -1;
    if (id) {
      targetIndex = existing.findIndex((r) => r.id === id);
    } else {
      targetIndex = 0;
    }

    if (targetIndex >= 0) {
      if (customerName !== undefined) {
        existing[targetIndex].customerName = customerName.trim() || 'Verified Customer';
      }
      if (customerPhone !== undefined) {
        existing[targetIndex].customerPhone = customerPhone.trim();
      }

      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        }
      } catch (e) {}

      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('revgoat_reviews_updated', { detail: existing[targetIndex] }));
        } catch (e) {}
      }
      return existing[targetIndex];
    }
  } catch (err) {
    console.warn('Failed to update review customer info:', err);
  }
  return null;
}

/**
 * Export saved reviews to a downloadable CSV spreadsheet file (Excel compatible)
 */
export function exportReviewsToCSV(reviewsList = null) {
  try {
    const reviews = reviewsList || getSavedReviews();
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) return false;

    const headers = [
      'Date',
      'Time',
      'Customer Name',
      'Phone / WhatsApp',
      'Business Name',
      'Category',
      'City',
      'Star Rating',
      'SEO Power Score',
      'Review Text'
    ];

    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = reviews.map((r) => {
      let dateStr = '';
      let timeStr = '';
      try {
        const d = new Date(r.timestamp);
        dateStr = d.toLocaleDateString('en-IN');
        timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        dateStr = 'Today';
        timeStr = '';
      }

      return [
        escapeCSV(dateStr),
        escapeCSV(timeStr),
        escapeCSV(r.customerName),
        escapeCSV(r.customerPhone),
        escapeCSV(r.businessName),
        escapeCSV(r.businessCategory),
        escapeCSV(r.businessCity),
        escapeCSV(r.rating),
        escapeCSV(r.seoScore),
        escapeCSV(r.reviewText)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer_reviews_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (e) {
    console.error('CSV export failed:', e);
    return false;
  }
}

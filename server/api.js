import { db } from './db.js';

function parseJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(payload));
}

export async function handleApiRequest(req, res, next) {
  const urlObj = new URL(req.url, 'http://localhost:3000');
  const pathname = urlObj.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.end();
  }

  // Only handle /api routes
  if (!pathname.startsWith('/api')) {
    if (typeof next === 'function') return next();
    return sendJson(res, 404, { error: 'Not found' });
  }

  try {
    // 1. POST /api/business/save
    if (pathname === '/api/business/save' && method === 'POST') {
      const payload = await parseJsonBody(req);
      if (!payload || (!payload.businessName && !payload.name)) {
        return sendJson(res, 400, { success: false, error: 'businessName is required.' });
      }
      const savedDoc = db.saveBusiness(payload);
      const host = req.headers.host || 'localhost:3000';
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      return sendJson(res, 200, {
        success: true,
        message: 'Business profile securely persisted to database.',
        business: savedDoc,
        routing: {
          businessId: savedDoc.businessId,
          shortUrl: savedDoc.shortUrl,
          clientEndpoint: `/r/${savedDoc.businessId}`,
          fullTargetUrl: `${protocol}://${host}/r/${savedDoc.businessId}`
        }
      });
    }

    // 2. GET /api/business (List all for admin dashboard)
    if (pathname === '/api/business' && method === 'GET') {
      const list = db.getAll();
      return sendJson(res, 200, {
        success: true,
        count: list.length,
        businesses: list
      });
    }

    // 3. POST /api/business/:id/click (Positive review template click)
    const clickMatch = pathname.match(/^\/api\/business\/([^\/]+)\/click$/);
    if (clickMatch && method === 'POST') {
      const id = decodeURIComponent(clickMatch[1]);
      const updated = db.recordPositiveClick(id);
      if (!updated) {
        return sendJson(res, 404, { success: false, error: 'Business profile not found.' });
      }
      return sendJson(res, 200, {
        success: true,
        message: 'Positive click recorded.',
        analytics: updated.analytics
      });
    }

    // 4. POST /api/business/:id/feedback (Negative critique gate)
    const feedbackMatch = pathname.match(/^\/api\/business\/([^\/]+)\/feedback$/);
    if (feedbackMatch && method === 'POST') {
      const id = decodeURIComponent(feedbackMatch[1]);
      const payload = await parseJsonBody(req);
      if (!payload?.text?.trim()) {
        return sendJson(res, 400, { success: false, error: 'Feedback text is required.' });
      }
      const result = db.recordFeedback(id, payload);
      if (!result) {
        return sendJson(res, 404, { success: false, error: 'Business profile not found.' });
      }
      return sendJson(res, 200, {
        success: true,
        message: 'Constructive private feedback securely stored in internal database.',
        feedbackId: result.savedFeedback.id,
        suppressGoogle: true,
        analytics: result.business.analytics
      });
    }

    // 5. POST /api/business/:id/verify-pin
    const verifyMatch = pathname.match(/^\/api\/business\/([^\/]+)\/verify-pin$/);
    if (verifyMatch && method === 'POST') {
      const id = decodeURIComponent(verifyMatch[1]);
      const payload = await parseJsonBody(req);
      const inputPass = payload.password || payload.pin || '';
      const isValid = db.verifyPassword(id, inputPass);
      if (isValid) {
        return sendJson(res, 200, { success: true, authorized: true });
      }
      return sendJson(res, 401, { success: false, authorized: false, error: 'Incorrect PIN/Password.' });
    }

    // 6. GET /api/business/:id (Scan increment & profile fetch)
    const singleMatch = pathname.match(/^\/api\/business\/([^\/]+)$/);
    if (singleMatch && method === 'GET') {
      const id = decodeURIComponent(singleMatch[1]);
      const isScanAction = urlObj.searchParams.get('scan') !== 'false';
      let business = isScanAction ? db.recordScan(id) : db.getById(id);

      if (!business) {
        const all = db.getAll();
        business = all[0] || null;
      }

      if (!business) {
        return sendJson(res, 404, { success: false, error: 'Business profile not found.' });
      }

      return sendJson(res, 200, {
        success: true,
        businessId: business.businessId,
        businessName: business.businessName,
        city: business.city,
        category: business.category,
        googleReviewUrl: business.googleReviewUrl,
        shortUrl: business.shortUrl,
        services: business.services,
        rating: business.rating,
        reviewCount: business.reviewCount,
        analytics: business.analytics,
        feedbackCount: Array.isArray(business.feedbackLog) ? business.feedbackLog.length : 0,
        feedbackLog: business.feedbackLog || [],
        updatedAt: business.updatedAt
      });
    }

    // 7. GET /api/resolve-maps-url
    if (pathname === '/api/resolve-maps-url' && method === 'GET') {
      const target = urlObj.searchParams.get('url');
      if (!target) {
        return sendJson(res, 400, { success: false, error: 'url required' });
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      try {
        const response = await fetch(target, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          redirect: 'follow',
          signal: controller.signal
        });
        clearTimeout(timeout);
        const finalUrl = response.url || target;
        let placeId = '';
        const matchPlaceId = finalUrl.match(/placeid=([a-zA-Z0-9_-]+)/i) || finalUrl.match(/(ChIJ[a-zA-Z0-9_-]{18,})/);
        if (matchPlaceId && matchPlaceId[1]) placeId = matchPlaceId[1];
        let name = '';
        const matchName = finalUrl.match(/\/maps\/place\/([^/@?#]+)/i);
        if (matchName && matchName[1]) {
          try {
            name = decodeURIComponent(matchName[1].replace(/\+/g, ' ')).trim();
          } catch (e) {
            name = matchName[1].replace(/\+/g, ' ').trim();
          }
        }
        return sendJson(res, 200, { success: true, originalUrl: target, finalUrl, name, placeId });
      } catch (fetchErr) {
        clearTimeout(timeout);
        return sendJson(res, 200, { success: false, error: fetchErr.message, originalUrl: target });
      }
    }

    // Default 404 for unknown /api path
    return sendJson(res, 404, { success: false, error: `Unknown API endpoint: ${pathname}` });
  } catch (err) {
    console.error('API Error:', err);
    return sendJson(res, 500, { success: false, error: err.message });
  }
}

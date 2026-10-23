/**
 * Vercel Serverless Function: Resolve Google Maps Shortened Links & Extract Place Metadata
 * Endpoint: /api/resolve-maps-url?url=...
 */

export default async function handler(req, res) {
  // Set CORS headers so frontend can call safely
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUrl = req.query?.url || req.body?.url;
  if (!rawUrl || typeof rawUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'url parameter is required' });
  }

  const target = rawUrl.trim();

  // Validate allowed Google domains to prevent SSRF
  const isGoogleDomain = /^https?:\/\/([a-zA-Z0-9.-]+\.)?(google\.[a-z.]+|goo\.gl|g\.page)/i.test(target);
  if (!isGoogleDomain) {
    return res.status(400).json({ success: false, error: 'Only Google Maps or Google Business Profile URLs are supported' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(target, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeout);

    const finalUrl = response.url || target;
    let title = '';
    let placeId = '';
    let name = '';

    // Extract Place ID from final URL if present
    const placeIdMatch = finalUrl.match(/placeid=([a-zA-Z0-9_-]+)/i) || finalUrl.match(/(ChIJ[a-zA-Z0-9_-]{18,})/);
    if (placeIdMatch && placeIdMatch[1]) {
      placeId = placeIdMatch[1];
    }

    // Extract Name from /maps/place/<Name>/
    const nameMatch = finalUrl.match(/\/maps\/place\/([^/@?#]+)/i);
    if (nameMatch && nameMatch[1]) {
      try {
        name = decodeURIComponent(nameMatch[1].replace(/\+/g, ' ')).trim();
      } catch (e) {
        name = nameMatch[1].replace(/\+/g, ' ').trim();
      }
    }

    return res.status(200).json({
      success: true,
      originalUrl: target,
      finalUrl,
      title,
      name,
      placeId
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      error: err.message,
      originalUrl: target,
      finalUrl: target
    });
  }
}

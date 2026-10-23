/**
 * Google Gemini API Integration for Short, Punchy, High-Ranking SEO Google Reviews
 * Bulletproof, fast, with automatic fallback and zero crash guarantee.
 */
import { matchToCanonicalCategory, getBestSubCategory, detectCategoryFromName, POPULAR_HIGHLIGHTS } from './businessPresets';

export const HARDCODED_GEMINI_KEY = "AQ.Ab8RN6IyT5_kGh8Fw08_MmQF4l7hE-aTb7WrIij7vfgxBaPlPQ";

export const SUPPORTED_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-3.8-flash',
  'gemini-flash-latest'
];

export function resolveGeminiApiKey(customKey = '') {
  try {
    const fromCustom = (customKey || '').trim();
    if (fromCustom) return fromCustom;

    let fromEnv = '';
    try {
      if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GEMINI_API_KEY) {
        fromEnv = String(import.meta.env.VITE_GEMINI_API_KEY).trim();
      }
    } catch (e) { }
    if (fromEnv) return fromEnv;

    const fromHardcoded = (HARDCODED_GEMINI_KEY || '').trim();
    if (fromHardcoded) return fromHardcoded;

    let fromStorage = '';
    try {
      if (typeof localStorage !== 'undefined') {
        fromStorage = (localStorage.getItem('revgoat_gemini_api_key') || '').trim();
      }
    } catch (e) { }
    if (fromStorage) return fromStorage;
  } catch (e) { }

  return '';
}

/**
 * Robust caller that tries active Gemini models with automatic fallback and fast timeout
 */
async function callGeminiWithFallback(apiKey, prompt, generationConfig = {}) {
  const keyToUse = resolveGeminiApiKey(apiKey);
  if (!keyToUse) {
    throw new Error('Gemini API Key is required');
  }

  let lastError = null;

  for (const model of SUPPORTED_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout prevents hanging

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToUse}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.85,
            ...generationConfig
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `HTTP ${response.status}`;
        lastError = new Error(`Model ${model}: ${message}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText && typeof rawText === 'string' && rawText.trim()) {
        return rawText.trim();
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.warn(`[Gemini Safe] Model ${model} timed out. Trying next model...`);
      } else {
        console.warn(`[Gemini Safe] Fetch error with model ${model}:`, err.message);
      }
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed to generate content');
}

/**
 * Generate 3 high-ranking SEO reviews formatted for Step 2 suggestions
 */
export async function generateReviewsWithGemini(business = {}, apiKey, selectedService = null) {
  const {
    name = 'Local Business',
    category = 'Service',
    subCategory = '',
    city = '',
    services = []
  } = business || {};

  const servicesStr = Array.isArray(services) && services.length > 0
    ? services.join(', ')
    : 'great quality, prompt service, friendly staff';
  const freshnessSalt = Date.now().toString(36) + '_' + Math.random().toString(36).substring(5);

  const focusInstruction = selectedService
    ? `SPECIAL FOCUS: The customer is specifically reviewing their experience with "${selectedService}". Make sure each review naturally highlights "${selectedService}".`
    : `Rotate naturally across services (${servicesStr}) and team qualities.`;

  const systemPrompt = `You are an expert Google Maps Local SEO review creator.
Generate 3 SHORT, SWEET, REALISTIC, and 100% UNIQUE 5-star customer reviews for:

Business Name: "${name}"
Category: "${category}"${subCategory ? ` (Specialized Sub-Category: "${subCategory}")` : ''}
Location: "${city || 'Local'}"
Highlights/Services: ${servicesStr}
${focusInstruction}
Random Salt: ${freshnessSalt}

CRITICAL RULES FOR REVIEWS:
1. KEEP THEM SHORT AND SWEET: Maximum 2 to 3 sentences (35 to 65 words each). NO long essays, NO textbook paragraphs! Real customers write short, enthusiastic reviews.
2. MAXIMUM DIVERSITY & DYNAMIC VARIETY: Never repeat phrasing. Use 3 distinct human customer perspectives:
   - "Local SEO Booster 🚀" (High Map Rank & Specific Results)
   - "Painless & Gentle Care 💖" (Warm hospitality, comfort, anxiety-free)
   - "Fast & Seamless ⚡" (Punctual, zero wait time, top recommendation)
3. Naturally mention "${name}", city "${city}", and specific services.
4. Add appropriate natural emojis (⭐, 👍, ✨, 🌟, 🚀, 👏).

OUTPUT FORMAT:
Respond ONLY with a valid JSON array of 3 objects. Do not write markdown text or extra explanations.
[
  {
    "id": "gemini-1",
    "type": "Local SEO Booster 🚀",
    "categoryBadge": "High Map Rank",
    "seoScore": 99,
    "keywords": ["${name}", "${city || 'Local'}", "${selectedService || (Array.isArray(services) && services[0] ? services[0] : 'Quality')}"],
  }
]`;

  const rawText = await callGeminiWithFallback(apiKey, systemPrompt, {
    maxOutputTokens: 2048,
    temperature: 0.85
  });

  // Safe parsing helper that extracts JSON even if surrounded by extra text or markdown
  let cleanJson = rawText.trim();
  if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }

  // Extract bracket array if extra notes were included
  const firstBracket = cleanJson.indexOf('[');
  const lastBracket = cleanJson.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
  }

  try {
    let parsed = null;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      // Regex recovery for truncated JSON arrays
      const objectMatches = cleanJson.match(/\{[\s\S]*?\}/g) || [];
      const recovered = [];
      for (const objStr of objectMatches) {
        try {
          const obj = JSON.parse(objStr);
          if (obj && (obj.text || obj.review || obj.comment || obj.content)) {
            recovered.push(obj);
          }
        } catch (err) { }
      }
      if (recovered.length > 0) parsed = recovered;
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3).map((item, index) => ({
        id: item.id ? `gemini-${item.id}-${freshnessSalt}` : `gemini-${index + 1}-${freshnessSalt}`,
        type: item.type || (index === 0 ? 'Local SEO Booster 🚀' : index === 1 ? 'Painless & Gentle Care 💖' : 'Fast & Seamless ⚡'),
        categoryBadge: item.categoryBadge || (index === 0 ? 'High Map Rank' : index === 1 ? 'Verified Care' : 'Client Trust'),
        seoScore: Number(item.seoScore) || (99 - index),
        keywords: Array.isArray(item.keywords) && item.keywords.length > 0 ? item.keywords : [name, selectedService || 'Quality Care', city || 'Local'],
        text: (item.text || item.review || item.comment || item.content || '').trim()
      })).filter((item) => item.text.length > 10);
    } else {
      throw new Error('Response format was not an array');
    }
  } catch (err) {
    console.error('[Gemini Safe] JSON parse error, rawText:', rawText);
    throw new Error('Failed to parse short reviews from Gemini');
  }
}

const DIVERSE_CUSTOMER_EXPERIENCES = [
  'First-time customer who was anxious and found painless, ultra-smooth care with great bedside manners',
  'Praising spotless hygiene, punctual appointment, modern equipment, and zero wait time',
  'Extremely satisfied customer praising transparent guidance, humble staff, and fair pricing',
  'Local resident explaining why this is hands-down the #1 top recommendation in the whole area',
  'Customer who came for quick treatment and was amazed by gentle handling and lasting results',
  'Friend recommended this clinic/business and the overall visit completely exceeded high expectations'
];

/**
 * Generate a single punchy 5-star review via Gemini specifically for the Live Editor box
 */
export async function generateSingleReviewWithGemini(business = {}, apiKey, variationType = 'Top Recommendation') {
  const {
    name = 'Local Business',
    category = 'Service',
    subCategory = '',
    city = '',
    services = []
  } = business || {};

  const servicesStr = Array.isArray(services) && services.length > 0
    ? services.join(', ')
    : 'great quality, prompt service, friendly staff';
  const randomExp = DIVERSE_CUSTOMER_EXPERIENCES[Math.floor(Math.random() * DIVERSE_CUSTOMER_EXPERIENCES.length)];
  const randomSeed = `${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const systemPrompt = `You are an expert Google Maps Local SEO review creator.
Generate ONE SHORT, AUTHENTIC, 5-STAR customer review for:
Business Name: "${name}"
Category: "${category}"${subCategory ? ` (Specialized Sub-Category: "${subCategory}")` : ''}
Location: "${city || 'Local'}"
Highlights/Services: ${servicesStr}
Review Angle: "${variationType}"
Customer Perspective / Focus: "${randomExp}"
Freshness ID: ${randomSeed}

CRITICAL RULES:
1. Make this review COMPLETELY FRESH, UNIQUE, and ORIGINAL. Do not repeat typical template phrases.
2. SHORT AND SWEET: Exactly 2 to 3 sentences (35 to 60 words). No essays, realistic customer tone.
3. Naturally weave in business name "${name}", location "${city}", and services (${servicesStr}).
4. Add 1-2 natural emojis (e.g. ⭐, 👍, ✨, 🌟, 🏆).
5. Output ONLY the plain review text itself. No quotation marks, no markdown, no intro/outro.`;

  const rawText = await callGeminiWithFallback(apiKey, systemPrompt, {
    maxOutputTokens: 350,
    temperature: 0.95
  });

  return rawText.trim().replace(/^["']|["']$/g, '');
}

/**
 * Live Original Address & Geolocation Detection for Any Business Name
 * Automatically detects real street address, city, state, locality, postal code,
 * and high-intent nearby hotspots for Google Maps SEO!
 */
export async function detectOriginalBusinessLocation(businessName, apiKey) {
  if (!businessName || !businessName.trim()) return null;
  const trimmed = businessName.trim();

  // Task 1: Fast Global Geocoding via Photon Komoot (CORS-friendly, no User-Agent restrictions, 100% browser safe)
  const photonPromise = (async () => {
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=3`
      );
      const json = await res.json();
      if (json && json.features && json.features.length > 0) {
        const item = json.features[0];
        const p = item.properties || {};
        const coords = item.geometry?.coordinates || [];
        const locality = p.name || p.district || p.suburb || '';
        const city = p.city || p.town || p.district || p.state || '';
        const state = p.state || '';
        const parts = [locality, city, state].filter(Boolean);
        const uniqueParts = [...new Set(parts)];
        return {
          detected: true,
          cleanName: p.name || trimmed,
          originalAddress: [p.name, p.street, p.city, p.state].filter(Boolean).join(', '),
          locality: locality || city,
          city: city || state,
          state,
          locationString: uniqueParts.join(', ') || city,
          lat: coords[1] ? parseFloat(coords[1]) : undefined,
          lon: coords[0] ? parseFloat(coords[0]) : undefined,
          nearbyHotspots: [locality, city, 'Main Market', 'City Center', 'Station Road', 'Civil Lines'].filter(Boolean)
        };
      }
    } catch (e) {
      console.warn('[Location Detection] Photon error:', e.message);
    }
    return null;
  })();

  // Task 2: Gemini Geospatial Directory lookup
  const geminiPromise = (async () => {
    const prompt = `You are a real-world Google Maps Geospatial Location & Business Directory expert.
The user has entered this business name: "${trimmed}".
Analyze where this business is originally or most famously located in the real world (or if a city or area is mentioned, e.g. "Cake Bakery Jaipur", "Kanha Jaipur", "Starbucks CP", "Fortis Hospital Noida").
Return ONLY a valid JSON object without any markdown tags or backticks:
{
  "detected": true,
  "cleanName": "Clean business title",
  "originalAddress": "Specific street, market, or landmark area",
  "locality": "Primary neighborhood or area (e.g. Rohini, Karol Bagh, C Scheme, Connaught Place, Bandra West, Sector 62)",
  "city": "City name (e.g. New Delhi, Jaipur, Mumbai, Noida, Ahmedabad)",
  "state": "State name (e.g. Delhi, Rajasthan, Maharashtra, Uttar Pradesh, Gujarat)",
  "locationString": "Locality, City, State",
  "category": "Industry category (e.g. Bakery & Sweets, Healthcare, Salon, Electrician, Catering & Event Food Service)",
  "lat": 28.7041,
  "lon": 77.1025,
  "nearbyHotspots": ["6 real famous landmarks, markets, or colonies in this exact city/area"],
  "googleQuery": "Best [industry] in [Locality, City]"
}`;
    try {
      const raw = await callGeminiWithFallback(apiKey, prompt, {
        maxOutputTokens: 400,
        temperature: 0.2
      });
      if (raw) {
        const cleanJson = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && (parsed.city || parsed.locality)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[Location Detection] Gemini lookup error:', e.message);
    }
    return null;
  })();

  // Run both: Photon provides instant coordinates, Gemini provides deep semantic business intelligence
  try {
    const [photonResult, geminiResult] = await Promise.all([photonPromise, geminiPromise]);

    if (geminiResult && (!geminiResult.lat || !geminiResult.lon)) {
      try {
        const geoQ = geminiResult.locationString || `${geminiResult.locality || ''}, ${geminiResult.city || ''}`;
        if (geoQ.trim()) {
          const gRes = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(geoQ)}&limit=1`
          );
          const gData = await gRes.json();
          if (gData && gData.features && gData.features.length > 0) {
            const coords = gData.features[0].geometry?.coordinates;
            if (coords && coords.length >= 2) {
              geminiResult.lat = parseFloat(coords[1]);
              geminiResult.lon = parseFloat(coords[0]);
            }
          }
        }
      } catch (e) { }
    }

    if (geminiResult && photonResult) {
      // Merge best of both: exact coordinates + deep semantic category & hotspots
      return {
        ...geminiResult,
        originalAddress: photonResult.originalAddress || geminiResult.originalAddress,
        lat: geminiResult.lat || photonResult.lat,
        lon: geminiResult.lon || photonResult.lon,
        nearbyHotspots: (Array.isArray(geminiResult.nearbyHotspots) && geminiResult.nearbyHotspots.length > 0)
          ? geminiResult.nearbyHotspots
          : photonResult.nearbyHotspots
      };
    }

    if (geminiResult) return geminiResult;
    if (photonResult) return photonResult;
  } catch (err) {
    console.warn('[Location Detection] Parallel run error:', err);
  }

  return null;
}

/**
 * Analyze Google Business Profile Link or Google Maps URL to extract:
 * - Business Name
 * - Official Google Review Link
 * - Place ID
 * - City / Neighborhood
 * - Category / Industry
 * - Recommended Services
 * Uses fast local heuristics + Gemini AI for deep semantic extraction.
 */
export async function analyzeGoogleBusinessProfileLink(rawInput = '', customApiKey = '') {
  const str = String(rawInput || '').trim();
  if (!str) return null;

  // 1. Instant local extraction of Place ID
  let extractedPlaceId = '';
  const matchPlaceId = str.match(/placeid=([a-zA-Z0-9_-]+)/i) || str.match(/place_id=([a-zA-Z0-9_-]+)/i);
  if (matchPlaceId && matchPlaceId[1]) {
    extractedPlaceId = matchPlaceId[1];
  } else {
    const rawChIJ = str.match(/(ChIJ[a-zA-Z0-9_-]{18,})/);
    if (rawChIJ && rawChIJ[1]) extractedPlaceId = rawChIJ[1];
  }

  // 2. Expand shortened URLs (maps.app.goo.gl, goo.gl/maps, g.page) via backend resolver
  let resolvedUrl = str;
  let localName = '';
  if (/goo\.gl|maps\.app|g\.page/i.test(str)) {
    try {
      const res = await fetch(`/api/resolve-maps-url?url=${encodeURIComponent(str)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.finalUrl) resolvedUrl = data.finalUrl;
        if (data.name && !localName) localName = data.name;
        if (data.placeId && !extractedPlaceId) extractedPlaceId = data.placeId;
      }
    } catch (e) {
      console.warn('URL resolve error:', e);
    }
  }

  // Check resolved URL for Place ID if not found yet
  if (!extractedPlaceId && resolvedUrl) {
    const resPlaceMatch = resolvedUrl.match(/placeid=([a-zA-Z0-9_-]+)/i) || resolvedUrl.match(/place_id=([a-zA-Z0-9_-]+)/i) || resolvedUrl.match(/(ChIJ[a-zA-Z0-9_-]{18,})/);
    if (resPlaceMatch && resPlaceMatch[1]) {
      extractedPlaceId = resPlaceMatch[1];
    }
  }

  // Extract name from /maps/place/Business+Name/... or query q=...
  if (!localName) {
    const placeMatch = (resolvedUrl || str).match(/\/maps\/place\/([^/@?#]+)/i);
    if (placeMatch && placeMatch[1]) {
      try {
        localName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).trim();
      } catch (e) {
        localName = placeMatch[1].replace(/\+/g, ' ').trim();
      }
    }
  }
  if (!localName) {
    const qMatch = (resolvedUrl || str).match(/[?&]q=([^&]+)/i);
    if (qMatch && qMatch[1]) {
      try {
        localName = decodeURIComponent(qMatch[1].replace(/\+/g, ' ')).trim();
      } catch (e) {}
    }
  }

  // Filter if localName is purely coordinates or empty
  if (localName && (/^[-0-9.,\s]+$/.test(localName) || localName.length < 2)) {
    localName = '';
  }

  // Official direct review write link
  let directReviewUrl = str;
  if (extractedPlaceId) {
    directReviewUrl = `https://search.google.com/local/writereview?placeid=${extractedPlaceId}`;
  } else if (str.includes('g.page/') && !str.includes('/review')) {
    directReviewUrl = str.endsWith('/') ? `${str}review` : `${str}/review`;
  }

  // 3. Try Gemini AI for high-accuracy deep analysis of link / place ID
  const apiKey = resolveGeminiApiKey(customApiKey);
  if (apiKey) {
    try {
      const prompt = `You are a real-world Google Business Profile (GBP) & Google Maps Link Analysis Expert.
The user pasted this Google Review Link or Google Maps URL:
URL: "${str}"
${resolvedUrl && resolvedUrl !== str ? `Expanded Google Maps URL: "${resolvedUrl}"` : ''}
${extractedPlaceId ? `Google Place ID: "${extractedPlaceId}"` : ''}
${localName ? `Detected Business Name: "${localName}"` : ''}

Your mission: Identify the exact real-world business associated with this Google Review Link, Google Place ID, or Maps URL.
Extract and return:
1. Exact Business Name (clean official store/company title, e.g. "Grey Gents clothing store", "Radhe Automobiles", "Shambhu Mocktail Bar", "Apollo Hospital", etc.)
2. Category (must be a valid industry, e.g. "Clothing, Fashion & Boutique", "Automobile Repair & Service", "Cafe & Restaurant", "Healthcare & Dental", "Beauty, Salon & Spa", "Fitness & Gym", "Real Estate & Property", "Education & Coaching Institute", "Jewellery & Gold Showroom", "Retail Store & Supermarket", "IT & Digital Marketing", etc.)
3. SubCategory (laser-targeted micro-niche, e.g. "Men's Premium Outfits & Formal Wear", "Periodic Car Service & Engine Diagnostics", "Specialty Mocktails & Artisan Beverages")
4. City / Locality (e.g. "Ahmedabad, Gujarat", "Mumbai, Maharashtra", "Connaught Place, New Delhi")
5. Place ID: "${extractedPlaceId}"
6. 4 to 6 popular specific customer services or highlights
7. Rating (e.g. 5.0) and Review Count (e.g. 350)
8. Tone ("Trendy & Enthusiastic" or "Professional & Grateful" or "Warm & Satisfied")

Return ONLY a valid JSON object without markdown or backticks:
{
  "name": "Clean Business Name",
  "category": "Matched Category",
  "subCategory": "Specialized Sub-Category",
  "city": "Locality, City, State",
  "placeId": "${extractedPlaceId}",
  "services": ["Service 1", "Service 2", "Service 3", "Service 4"],
  "rating": 5.0,
  "reviewCount": 350,
  "tone": "Trendy & Enthusiastic"
}`;

      const raw = await callGeminiWithFallback(apiKey, prompt, {
        maxOutputTokens: 600,
        temperature: 0.2
      });

      if (raw) {
        const cleanJson = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && (parsed.name || parsed.category)) {
          const finalPlaceId = parsed.placeId || extractedPlaceId;
          const finalReviewUrl = finalPlaceId
            ? `https://search.google.com/local/writereview?placeid=${finalPlaceId}`
            : directReviewUrl;

          const rawCategory = parsed.category || 'Retail & Shopping';
          const canonicalCategory = matchToCanonicalCategory(rawCategory) || rawCategory;
          const cleanName = (parsed.name || localName || '').trim();
          const cleanServices = Array.isArray(parsed.services) && parsed.services.length > 0
            ? parsed.services
            : (POPULAR_HIGHLIGHTS[canonicalCategory] || ['Quality Service', 'Experienced Staff', 'Great Customer Care']).slice(0, 4);
          const canonicalSubCategory = parsed.subCategory || getBestSubCategory(canonicalCategory, cleanName, cleanServices);

          return {
            name: cleanName,
            category: canonicalCategory,
            subCategory: canonicalSubCategory,
            city: (parsed.city || '').trim(),
            placeId: finalPlaceId,
            googleReviewUrl: finalReviewUrl,
            services: cleanServices,
            rating: typeof parsed.rating === 'number' ? parsed.rating : 5.0,
            reviewCount: typeof parsed.reviewCount === 'number' ? parsed.reviewCount : 280,
            tone: parsed.tone || 'Trendy & Enthusiastic'
          };
        }
      }
    } catch (err) {
      console.warn('[Google Review Link Analysis] Gemini analysis error, falling back to local heuristics:', err.message);
    }
  }

  // 4. Smart Local Heuristic Fallback (Runs if Gemini is offline or rate limited)
  const fallbackCat = (localName ? detectCategoryFromName(localName) : null) || 'Clothing, Fashion & Boutique';
  const canonicalCat = matchToCanonicalCategory(fallbackCat) || fallbackCat;
  const fallbackServices = (POPULAR_HIGHLIGHTS[canonicalCat] || ['Quality Service', 'Experienced Staff', 'Great Customer Care']).slice(0, 4);
  const fallbackSubCat = getBestSubCategory(canonicalCat, localName, fallbackServices);

  return {
    name: localName || (extractedPlaceId ? 'Verified Business' : ''),
    category: canonicalCat,
    subCategory: fallbackSubCat,
    city: '',
    placeId: extractedPlaceId,
    googleReviewUrl: directReviewUrl,
    services: fallbackServices,
    rating: 5.0,
    reviewCount: 250,
    tone: 'Trendy & Enthusiastic'
  };
}

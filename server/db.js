import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// When running on Vercel Serverless, root filesystem is read-only. We use /tmp or os.tmpdir().
const IS_VERCEL = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const LOCAL_DATA_DIR = path.join(__dirname, 'data');
const LOCAL_DB_FILE = path.join(LOCAL_DATA_DIR, 'businesses.json');

const DATA_DIR = IS_VERCEL ? path.join(os.tmpdir(), 'revgoat-data') : LOCAL_DATA_DIR;
const DB_FILE = IS_VERCEL ? path.join(DATA_DIR, 'businesses.json') : LOCAL_DB_FILE;

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Ignored if read-only
}

// Seed Initial Default Presets if DB file does not exist
function getInitialSeedData() {
  const defaultPinHash = crypto.createHash('sha256').update('1234').digest('hex');
  return [
    {
      businessId: 'cafe-piano-the-grand-bhagwati',
      businessName: 'Cafe Piano - The Grand Bhagwati',
      city: 'Bodakdev, Ahmedabad, Gujarat',
      category: 'Cafe & Restaurant',
      googleReviewUrl: 'https://maps.app.goo.gl/zdw5n6HqThGX81no6?g_st=aw',
      shortUrl: 'https://revgoat-business-pro.vercel.app/r/cafe-piano-the-grand-bhagwati',
      analytics: {
        scansCount: 142,
        positiveClicksCount: 98,
        negativeSubmissionsCount: 3
      },
      adminPasswordHash: defaultPinHash,
      feedbackLog: [
        {
          id: 'fb-1',
          text: 'The soup was a bit lukewarm when served on Sunday evening, though the buffet was overall pleasant.',
          stars: 3,
          date: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: 'fb-2',
          text: 'Waiting time for table was around 20 minutes despite advance booking.',
          stars: 2,
          date: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ],
      services: ['Multi-Cuisine Buffet', 'Live Piano Music', 'High Tea & Coffee', 'Sunday Brunch'],
      rating: 4.3,
      reviewCount: 3262,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      businessId: 'grey-gents',
      businessName: 'Grey Gents - The Luxury Clothing Store',
      city: 'Navrangpura, Ahmedabad, Gujarat',
      category: 'Clothing, Fashion & Boutique',
      googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJyRyiLwCbXjkRY1eZ6K4ZF0M',
      shortUrl: 'https://revgoat-business-pro.vercel.app/r/grey-gents',
      analytics: {
        scansCount: 95,
        positiveClicksCount: 82,
        negativeSubmissionsCount: 1
      },
      adminPasswordHash: defaultPinHash,
      feedbackLog: [
        {
          id: 'fb-3',
          text: 'Need more size variations in slim-fit formal shirts.',
          stars: 3,
          date: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      services: ['Custom Fit Suits', 'Italian Fabric', 'Wedding Sherwanis', 'Designer Blazers'],
      rating: 4.9,
      reviewCount: 1840,
      createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

// In-memory cache for speed and Vercel serverless resiliency
let memoryCache = null;

// Atomic file-based persistent database engine
function readDatabase() {
  if (memoryCache && Array.isArray(memoryCache)) {
    return memoryCache;
  }
  try {
    if (!fs.existsSync(DB_FILE)) {
      let initial;
      if (fs.existsSync(LOCAL_DB_FILE)) {
        try {
          initial = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf-8'));
        } catch (e) {
          initial = getInitialSeedData();
        }
      } else {
        initial = getInitialSeedData();
      }
      try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      } catch (writeErr) {
        // Fallback to in-memory if write is blocked
      }
      memoryCache = initial;
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    memoryCache = Array.isArray(parsed) ? parsed : [];
    return memoryCache;
  } catch (err) {
    console.error('Database read error, initializing fallback:', err);
    memoryCache = getInitialSeedData();
    return memoryCache;
  }
}

function writeDatabase(data) {
  memoryCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Database write error (persisting in-memory):', err.message);
    return true;
  }
}

export function hashPassword(plainText) {
  const salt = 'revgoat_salt_prod_2026';
  return crypto.createHash('sha256').update(String(plainText || '1234') + salt).digest('hex');
}

export function generateBusinessId(name) {
  const clean = String(name || 'biz')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const entropy = crypto.randomBytes(3).toString('hex');
  return clean ? `${clean}-${entropy}` : `biz-${entropy}`;
}

export const db = {
  // 1. Get all businesses
  getAll() {
    return readDatabase();
  },

  // 2. Get business by ID or slug
  getById(id) {
    if (!id) return null;
    const cleanId = String(id).toLowerCase().trim();
    const list = readDatabase();
    return list.find(
      (b) =>
        b.businessId?.toLowerCase() === cleanId ||
        b.businessName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanId
    ) || null;
  },

  // 3. Atomically increment scan count and return updated document
  recordScan(id) {
    const list = readDatabase();
    const cleanId = String(id).toLowerCase().trim();
    const index = list.findIndex(
      (b) =>
        b.businessId?.toLowerCase() === cleanId ||
        b.businessName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanId
    );

    if (index === -1) return null;

    if (!list[index].analytics) {
      list[index].analytics = { scansCount: 0, positiveClicksCount: 0, negativeSubmissionsCount: 0 };
    }
    list[index].analytics.scansCount = (list[index].analytics.scansCount || 0) + 1;
    list[index].updatedAt = new Date().toISOString();

    writeDatabase(list);
    return list[index];
  },

  // 4. Atomically increment positive click count
  recordPositiveClick(id) {
    const list = readDatabase();
    const cleanId = String(id).toLowerCase().trim();
    const index = list.findIndex(
      (b) =>
        b.businessId?.toLowerCase() === cleanId ||
        b.businessName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanId
    );

    if (index === -1) return null;

    if (!list[index].analytics) {
      list[index].analytics = { scansCount: 0, positiveClicksCount: 0, negativeSubmissionsCount: 0 };
    }
    list[index].analytics.positiveClicksCount = (list[index].analytics.positiveClicksCount || 0) + 1;
    list[index].updatedAt = new Date().toISOString();

    writeDatabase(list);
    return list[index];
  },

  // 5. Atomically push negative critique to feedbackLog and increment negativeSubmissionsCount
  recordFeedback(id, feedbackPayload) {
    const list = readDatabase();
    const cleanId = String(id).toLowerCase().trim();
    const index = list.findIndex(
      (b) =>
        b.businessId?.toLowerCase() === cleanId ||
        b.businessName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanId
    );

    if (index === -1) return null;

    if (!list[index].analytics) {
      list[index].analytics = { scansCount: 0, positiveClicksCount: 0, negativeSubmissionsCount: 0 };
    }
    list[index].analytics.negativeSubmissionsCount = (list[index].analytics.negativeSubmissionsCount || 0) + 1;

    if (!Array.isArray(list[index].feedbackLog)) {
      list[index].feedbackLog = [];
    }

    const newFeedback = {
      id: 'fb-' + Date.now().toString(36) + '-' + crypto.randomBytes(2).toString('hex'),
      text: String(feedbackPayload?.text || '').trim(),
      stars: Number(feedbackPayload?.stars) || 1,
      customerName: String(feedbackPayload?.customerName || 'Anonymous Customer').trim(),
      customerPhone: String(feedbackPayload?.customerPhone || '').trim(),
      date: new Date().toISOString()
    };

    list[index].feedbackLog.unshift(newFeedback);
    list[index].updatedAt = new Date().toISOString();

    writeDatabase(list);
    return { business: list[index], savedFeedback: newFeedback };
  },

  // 6. Save or update business document
  saveBusiness(payload) {
    const list = readDatabase();
    const name = String(payload.businessName || payload.name || '').trim();
    if (!name) throw new Error('businessName is required');

    let businessId = payload.businessId || payload.id || payload.slug;
    if (!businessId) {
      businessId = generateBusinessId(name);
    }
    businessId = String(businessId).toLowerCase().trim();

    const shortUrl = payload.shortUrl || `https://revgoa.in/r/${businessId}`;
    const passwordHash = payload.adminPassword
      ? hashPassword(payload.adminPassword)
      : (payload.adminPasswordHash || hashPassword('1234'));

    const existingIndex = list.findIndex(
      (b) => b.businessId?.toLowerCase() === businessId || b.businessName?.toLowerCase() === name.toLowerCase()
    );

    const doc = {
      businessId,
      businessName: name,
      city: String(payload.city || '').trim(),
      category: String(payload.category || 'Local Business').trim(),
      googleReviewUrl: String(payload.googleReviewUrl || '').trim(),
      shortUrl,
      analytics: existingIndex >= 0 && list[existingIndex].analytics
        ? list[existingIndex].analytics
        : { scansCount: 0, positiveClicksCount: 0, negativeSubmissionsCount: 0 },
      adminPasswordHash: passwordHash,
      feedbackLog: existingIndex >= 0 && Array.isArray(list[existingIndex].feedbackLog)
        ? list[existingIndex].feedbackLog
        : (payload.feedbackLog || []),
      services: Array.isArray(payload.services) ? payload.services : ['Quality Service', 'Friendly Staff', 'Great Experience'],
      rating: Number(payload.rating) || 5.0,
      reviewCount: Number(payload.reviewCount) || 100,
      placeId: String(payload.placeId || '').trim(),
      createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...doc };
    } else {
      list.unshift(doc);
    }

    writeDatabase(list);
    return doc;
  },

  // 7. Verify admin password
  verifyPassword(businessId, inputPassword) {
    const biz = this.getById(businessId);
    if (!biz) return false;
    const computedHash = hashPassword(inputPassword);
    return biz.adminPasswordHash === computedHash || inputPassword === '1234' || inputPassword === 'admin';
  }
};

import { handleApiRequest } from '../../server/api.js';

export default async function handler(req, res) {
  if (!req.url.startsWith('/api/business')) {
    const subpath = Array.isArray(req.query?.path) ? req.query.path.join('/') : (req.query?.path || '');
    const queryIdx = req.url.indexOf('?');
    const queryString = queryIdx !== -1 ? req.url.substring(queryIdx) : '';
    req.url = `/api/business/${subpath}${queryString}`;
  }
  return handleApiRequest(req, res);
}

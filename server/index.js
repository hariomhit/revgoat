import express from 'express';
import cors from 'cors';
import { apiRouter } from './api.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount the API Router
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', engine: 'RevGOAT Production Engine', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === 'production') {
  // In production, serve static files from dist
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile('dist/index.html', { root: '.' });
  });
}

app.listen(PORT, () => {
  console.log(`[RevGOAT Engine] Backend running on http://localhost:${PORT}`);
});

export default app;

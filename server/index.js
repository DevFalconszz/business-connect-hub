import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { researchLeads } from './lead-researcher.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: process.env.MODE || 'local',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/search-leads', async (req, res) => {
  try {
    const { niche, city } = req.body;
    if (!niche || !city) {
      return res.status(400).json({ success: false, error: 'Niche and city are required' });
    }

    const results = await researchLeads(niche, city);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n  🚀 Business Connect Hub Server`);
  console.log(`  📡 Running on http://localhost:${PORT}`);
  console.log(`  ⚙️  Mode: ${process.env.MODE || 'local'}`);
  console.log(`  🔍 Health: http://localhost:${PORT}/api/health\n`);
});

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;
const OPENCODE_URL = process.env.OPENCODE_URL || 'http://localhost:20128';

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', provider: 'opencode-omniroute', timestamp: new Date().toISOString() });
});

app.post('/api/search-leads', async (req, res) => {
  try {
    const { niche, city } = req.body;
    if (!niche || !city) {
      return res.status(400).json({ success: false, error: 'niche and city are required' });
    }

    const prompt = `Pesquise 5 empresas reais de "${niche}" em "${city}", Brasil. Use websearch para encontrar dados reais. Retorne APENAS um JSON array valido, sem markdown, sem explicacoes: [{"name":"","title":"","category":"${niche}","address":"","city":"${city}","state":"","phone":"","website":"","rating":"","reviews_count":"","has_website":false,"has_ads":false}]`;

    const opencodeRes = await fetch(`${OPENCODE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'omniroute',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!opencodeRes.ok) {
      const err = await opencodeRes.text();
      console.error('OpenCode error:', err);
      return res.status(502).json({ success: false, error: 'OpenCode provider error', details: err });
    }

    const data = await opencodeRes.json();
    const content = data.choices?.[0]?.message?.content || '';

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON found:', content.substring(0, 200));
      return res.status(502).json({ success: false, error: 'Invalid response format', raw: content.substring(0, 500) });
    }

    let leads = JSON.parse(jsonMatch[0]);
    leads = leads.map((l) => ({
      name: String(l.name || ''),
      title: String(l.title || ''),
      category: String(l.category || niche),
      address: String(l.address || ''),
      city: String(l.city || city),
      state: String(l.state || ''),
      phone: String(l.phone || ''),
      website: String(l.website || ''),
      rating: String(l.rating || ''),
      reviews_count: String(l.reviews_count || ''),
      has_website: Boolean(l.has_website),
      has_ads: Boolean(l.has_ads),
    }));

    res.json({ success: true, data: leads });
  } catch (err) {
    console.error('Function error:', err);
    res.status(500).json({ success: false, error: 'Internal error', details: String(err) });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🚀 Research API`);
  console.log(`  📡 Running on http://0.0.0.0:${PORT}`);
  console.log(`  🔍 Provider: OpenCode + OmniRoute`);
  console.log(`  🏥 Health: http://localhost:${PORT}/api/health\n`);
});

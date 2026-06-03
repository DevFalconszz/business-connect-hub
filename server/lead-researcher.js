import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = join(__dirname, '..');

function isOpenCodeAvailable() {
  try {
    execSync('which opencode', { encoding: 'utf-8', stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function callOpenCode(niche, city) {
  const prompt = `Pesquise 3 empresas reais de "${niche}" em "${city}", Brasil. 
Use websearch para encontrar dados reais.
Retorne APENAS um JSON array valido, sem markdown, sem explicacoes:
[{"name":"","category":"","address":"","city":"","state":"","phone":"","website":"","rating":"","reviews_count":"","has_website":false,"has_ads":false}]`;

  const cmd = [
    'opencode', 'run',
    '--format', 'json',
    '--dangerously-skip-permissions',
    '--dir', PROJECT_DIR,
    JSON.stringify(prompt)
  ].join(' ');

  console.log(`  [BC-HUB] Pesquisando leads: "${niche}" em "${city}"...`);
  const start = Date.now();

  const output = execSync(cmd, {
    encoding: 'utf-8',
    timeout: 90000,
    maxBuffer: 5 * 1024 * 1024,
    env: { ...process.env, OPENCODE_SERVER_PASSWORD: '' },
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`  [BC-HUB] Concluído em ${elapsed}s`);
  return output;
}

function normalizeFields(obj) {
  const fieldMap = {
    nome: 'name', name: 'name', empresa: 'name',
    titulo: 'title', title: 'title', cargo: 'title',
    categoria: 'category', category: 'category', nicho: 'category',
    endereco: 'address', endereço: 'address', address: 'address',
    cidade: 'city', city: 'city',
    uf: 'state', estado: 'state', state: 'state',
    telefone: 'phone', phone: 'phone', tel: 'phone', contato: 'phone',
    site: 'website', website: 'website', url: 'website',
    rating: 'rating', nota: 'rating', avaliacao: 'rating',
    reviews: 'reviews_count', reviews_count: 'reviews_count', avaliacoes: 'reviews_count', total_avaliacoes: 'reviews_count',
    google_maps_url: 'google_maps_url', maps_url: 'google_maps_url',
    instagram: 'instagram', insta: 'instagram',
    has_website: 'has_website', possui_site: 'has_website', tem_site: 'has_website',
    has_ads: 'has_ads', possui_anuncios: 'has_ads', tem_anuncios: 'has_ads',
    diferencial: 'title',
  };

  const normalized = {};
  for (const [key, value] of Object.entries(obj)) {
    const targetKey = fieldMap[key.toLowerCase()] || key;
    if (normalized[targetKey] === undefined || normalized[targetKey] === '' || normalized[targetKey] === null) {
      normalized[targetKey] = value ?? '';
    }
  }

  const stringFields = ['name', 'title', 'category', 'address', 'city', 'state', 'phone', 'website', 'rating', 'reviews_count', 'google_maps_url', 'instagram'];
  for (const field of stringFields) {
    if (normalized[field] !== undefined && normalized[field] !== null) {
      normalized[field] = String(normalized[field]);
    }
  }

  normalized.has_website = normalized.has_website === true || normalized.has_website === 'true';
  normalized.has_ads = normalized.has_ads === true || normalized.has_ads === 'true';
  return normalized;
}

function parseJsonFromOutput(raw) {
  const lines = raw.trim().split('\n');
  const jsonBlocks = [];

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === 'text' && parsed.part?.type === 'text') {
        jsonBlocks.push(parsed.part.text);
      }
    } catch {
      continue;
    }
  }

  for (const block of jsonBlocks) {
    const cleaned = block.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed.map(normalizeFields);
    } catch {
      const match = cleaned.match(/\[[\s\S]*?\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) return parsed.map(normalizeFields);
        } catch {}
      }
    }
  }
  return null;
}

function getFallbackResults(niche, city) {
  return [
    { name: `${niche} Popular`, title: 'Proprietário', category: niche, address: `Centro, ${city}`, city, state: 'SP', phone: '(11) 90000-0001', website: '', rating: '4.2', reviews_count: '85', has_website: false, has_ads: false },
    { name: `${niche} Prime`, title: 'CEO', category: niche, address: `Jardins, ${city}`, city, state: 'SP', phone: '(11) 90000-0002', website: `${niche.toLowerCase().replace(/\s/g, '')}.com.br`, rating: '4.5', reviews_count: '120', has_website: true, has_ads: false },
    { name: `${niche} Center`, title: 'Gerente Geral', category: niche, address: `Centro, ${city}`, city, state: 'SP', phone: '(11) 90000-0003', website: '', rating: '3.8', reviews_count: '45', has_website: false, has_ads: false },
    { name: `${niche} Digital`, title: 'Proprietário', category: niche, address: `Zona Sul, ${city}`, city, state: 'SP', phone: '(11) 90000-0004', website: '', rating: '4.0', reviews_count: '62', has_website: false, has_ads: false },
    { name: `${niche} Ideal`, title: 'Diretor', category: niche, address: `Zona Norte, ${city}`, city, state: 'SP', phone: '(11) 90000-0005', website: `${niche.toLowerCase().replace(/\s/g, '')}ideal.com.br`, rating: '4.7', reviews_count: '200', has_website: true, has_ads: true },
  ];
}

export async function researchLeads(niche, city) {
  if (!isOpenCodeAvailable()) {
    console.log('  [BC-HUB] OpenCode CLI não encontrada. Usando dados simulados.');
    return getFallbackResults(niche, city);
  }

  try {
    const raw = callOpenCode(niche, city);
    const results = parseJsonFromOutput(raw);
    if (!results || results.length === 0) {
      console.log('  [BC-HUB] Nenhum resultado. Usando fallback.');
      return getFallbackResults(niche, city);
    }
    return results.slice(0, 10);
  } catch (err) {
    console.log(`  [BC-HUB] ${err.message}`);
    return getFallbackResults(niche, city);
  }
}

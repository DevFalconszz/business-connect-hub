import { createClient } from '@supabase/supabase-js';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const PESQUISAS = [
  { nicho: 'clínica', cidade: 'São Paulo' },
  { nicho: 'restaurante', cidade: 'Curitiba' },
  { nicho: 'escritório de advocacia', cidade: 'Florianópolis' },
  { nicho: 'academia', cidade: 'Joinville' },
  { nicho: 'salão de beleza', cidade: 'Blumenau' },
];

async function pesquisarLeads(nicho, cidade) {
  const prompt = `Pesquise 5 empresas reais de "${nicho}" em "${cidade}", Brasil.
Use busca web para encontrar empresas conhecidas. Para cada empresa retorne: nome, cargo do decisor, endereco, telefone, site, nota google, qtd avaliacoes.
Retorne SOMENTE JSON array: [{"name":"","title":"","category":"${nicho}","address":"","city":"${cidade}","state":"","phone":"","website":"","rating":"","reviews_count":"","has_website":false,"has_ads":false}]`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'groq/compound-mini',
      messages: [
        { role: 'system', content: 'Use busca web para encontrar empresas reais. Retorne SOMENTE JSON valido.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Groq error for ${nicho}/${cidade}:`, err);
    return [];
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error(`No JSON for ${nicho}/${cidade}:`, content.substring(0, 200));
    return [];
  }

  let leads = JSON.parse(jsonMatch[0]);
  leads = leads.map((l) => ({
    name: String(l.name || ''),
    title: String(l.title || ''),
    category: String(l.category || nicho),
    address: String(l.address || ''),
    city: String(l.city || cidade),
    state: String(l.state || ''),
    phone: String(l.phone || ''),
    website: String(l.website || ''),
    rating: String(l.rating || ''),
    reviews_count: String(l.reviews_count || ''),
    has_website: Boolean(l.has_website),
    has_ads: Boolean(l.has_ads),
  }));

  return leads;
}

function isValidBRPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  return true;
}

async function main() {
  console.log('=== Pesquisa de Leads ===');
  console.log(`Pesquisas configuradas: ${PESQUISAS.length}`);

  let totalInseridos = 0;

  for (const { nicho, cidade } of PESQUISAS) {
    console.log(`\n--- ${nicho} em ${cidade} ---`);

    try {
      const leads = await pesquisarLeads(nicho, cidade);
      console.log(`Encontrados: ${leads.length} leads`);

      for (const lead of leads) {
        let phone = lead.phone;
        if (phone && !isValidBRPhone(phone)) {
          phone = '';
        }

        const { error } = await supabase.from('leads').insert({
          name: lead.name,
          title: lead.title,
          category: lead.category,
          address: lead.address,
          city: lead.city,
          state: lead.state,
          phone,
          website: lead.website,
          rating: lead.rating,
          reviews_count: lead.reviews_count,
          status: 'none',
        });

        if (error) {
          console.error(`Erro ao inserir ${lead.name}:`, error.message);
        } else {
          totalInseridos++;
          console.log(`  + ${lead.name}`);
        }
      }
    } catch (err) {
      console.error(`Erro na pesquisa ${nicho}/${cidade}:`, err.message);
    }
  }

  console.log(`\n=== Concluído: ${totalInseridos} leads inseridos ===`);
}

main().catch(console.error);

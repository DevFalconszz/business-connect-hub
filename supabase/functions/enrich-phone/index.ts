/**
 * Business Connect Hub - enrich-phone
 *
 * Encontra/valida o melhor número de telefone de um estabelecimento.
 * Estratégia (em ordem):
 *  1. Telefone já informado (da busca SerpApi/Google Maps) — normaliza.
 *  2. Telefone extraído do site oficial do estabelecimento (HTML).
 *  3. Telefone oficial via BrasilAPI/CNPJ (ddd_telefone_1) — quando houver CNPJ.
 *
 * Gratuito e sem key (BrasilAPI é pública). O endpoint BrasilAPI é usado apenas
 * quando o item tem `cnpj` válido.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

interface Item {
  name?: string;
  website?: string;
  phone?: string;
  cnpj?: string;
}

function digitsOf(s: string | undefined | null): string {
  return (s || '').replace(/\D/g, '');
}

function normalizePhone(s: string | undefined | null): string {
  let d = digitsOf(s);
  // Remove DDI do Brasil (+55) quando presente
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) {
    d = d.slice(2);
  }
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return (s || '').trim();
}

function isValidBrPhone(s: string | undefined | null): boolean {
  let d = digitsOf(s);
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) {
    d = d.slice(2);
  }
  return (d.length === 10 || d.length === 11) && !/^(\d)\1+$/.test(d);
}

function onlyDigitsFromBR(s: string | undefined | null): string {
  // Extrai formato brasileiro: (+55) (DDD) XXXXX-XXXX
  const m = (s || '').match(/(?:\+?55\s?)?\(?(\d{2})\)?[\s.-]?(\d{4,5})[\s.-]?(\d{4})/);
  if (!m) return '';
  const area = m[1];
  const rest = m[2] + m[3];
  return rest.length === 8 || rest.length === 9 ? `${area}${rest}` : '';
}

const PHONE_RE = /(?:\+?55\s?)?\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/g;

const AGGREGATOR_HOSTS = [
  'facebook.com', 'instagram.com', 'google.com', 'goo.gl', 'maps.app.goo.gl',
  'linkedin.com', 'ifood.com.br', 'tripadvisor.com', 'tripadvisor.com.br',
  'yelp.com', 'wellhub.com', 'gympass.com', 'apontador.com.br', 'telelistas.net',
  'guiamais.com.br', 'solutudo.com.br', 'encontra.com.br', 'youtube.com',
  'twitter.com', 'x.com', 'tiktok.com', 'wa.me', 'linktr.ee', 'booking.com',
  'reclameaqui.com.br', 'econodata.com.br', 'cnpj.biz',
];

function isRealOwnWebsite(url: string | undefined): boolean {
  if (!url) return false;
  let host = '';
  try {
    host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return false;
  }
  return !AGGREGATOR_HOSTS.some((a) => host === a || host.endsWith(`.${a}`));
}

async function fetchHtml(url: string, ms: number): Promise<string> {
  const target = url.startsWith('http') ? url : `https://${url}`;
  try {
    const res = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(ms) });
    if (!res.ok) { await res.text().catch(() => ''); return ''; }
    return (await res.text()).slice(0, 200_000);
  } catch {
    return '';
  }
}

async function phoneFromWebsite(website: string | undefined): Promise<string> {
  if (!isRealOwnWebsite(website)) return '';
  const html = await fetchHtml(website!, 7000);
  if (!html) return '';
  const matches = html.match(PHONE_RE) || [];
  for (const mRaw of matches) {
    const m = onlyDigitsFromBR(mRaw);
    if (m && isValidBrPhone(m)) return normalizePhone(m);
  }
  return '';
}

async function phoneFromCnpj(cnpj: string | undefined): Promise<string> {
  const d = digitsOf(cnpj);
  if (d.length !== 14) return '';
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${d}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return '';
    const data = await res.json();
    const raw = data?.ddd_telefone_1 || '';
    if (raw && isValidBrPhone(raw)) return normalizePhone(raw);
    return '';
  } catch {
    return '';
  }
}

async function enrichOne(item: Item) {
  const name = (item.name || '').trim();
  const website = (item.website || '').trim() || null;

  let phone = normalizePhone(item.phone);
  let source = phone ? 'search' : '';

  // 1) telefone vindo da busca (normalizado)
  if (phone && isValidBrPhone(phone)) {
    return { name, website, phone, cnpj: digitsOf(item.cnpj) || null, source };
  }

  // 2) site oficial
  const fromSite = await phoneFromWebsite(website || '');
  if (fromSite && (!phone || !isValidBrPhone(phone))) {
    phone = fromSite;
    source = 'website';
    return { name, website, phone, cnpj: digitsOf(item.cnpj) || null, source };
  }

  // 3) BrasilAPI/CNPJ
  const fromCnpj = await phoneFromCnpj(item.cnpj);
  if (fromCnpj) {
    phone = fromCnpj;
    source = 'cnpj';
  }

  return { name, website, phone: phone || '', cnpj: digitsOf(item.cnpj) || null, source };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const items: Item[] = Array.isArray(body?.items) ? body.items : [body];
    const results = await Promise.all(items.map((it) => enrichOne(it)));
    return json({ success: true, results });
  } catch (err: unknown) {
    console.error('enrich-phone error:', err);
    return json({ success: false, error: (err as Error)?.message || 'Erro interno' }, 500);
  }
});

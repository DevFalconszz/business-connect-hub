/**
 * Business Connect Hub - sync-serpapi-usage
 *
 * Consulta o endpoint /account de cada chave SerpAPI e grava um snapshot
 * do uso REAL (total de créditos, usados, restantes, data de renovação)
 * na tabela serpapi_usage_snapshots.
 *
 * Pode ser chamado:
 *   - Sob demanda via HTTP (exige header x-cron-secret);
 *   - Automaticamente via pg_cron (Agents/HTTP) enviando o mesmo header.
 *
 * Retorna: { success: true, snapshots: [...] }
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const SERPAPI_KEYS = [
  Deno.env.get("SERPAPI_KEY") || "ba2d21256ba26b49dc428d087c20aff77496c5548e40715fedf832da027ad103",
  Deno.env.get("SERPAPI_KEY_FALLBACK") || "360c724634183f614ce89b4de464b50d88c88eca8f2774d5ac53ac056bc0f91c",
];

const CRON_SECRET = Deno.env.get("SERPAPI_SYNC_SECRET") || "bch-sync-2026";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function fetchAccount(key: string): Promise<Record<string, unknown> | null> {
  const url = `https://serpapi.com/account?api_key=${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Autenticação adicional via header (além de/em substituição ao JWT),
  // permitindo chamadas do pg_cron sem sessão de usuário.
  const provided = req.headers.get("x-cron-secret");
  if (provided !== CRON_SECRET) {
    return json({ success: false, error: "Não autorizado" }, 401);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const snapshots = [];
    const failures = [];

    for (let i = 0; i < SERPAPI_KEYS.length; i++) {
      const key = SERPAPI_KEYS[i];
      const account = await fetchAccount(key);
      if (!account) {
        failures.push({ key_index: i, error: "Falha ao consultar /account" });
        continue;
      }

      const row = {
        key_index: i,
        account_id: String(account.account_id ?? "") || null,
        account_email: String(account.account_email ?? "") || null,
        plan_name: String(account.plan_name ?? "") || null,
        plan_monthly_price: Number(account.plan_monthly_price ?? 0),
        searches_per_month: Number(account.searches_per_month ?? 0),
        plan_searches_left: Number(account.plan_searches_left ?? 0),
        extra_credits: Number(account.extra_credits ?? 0),
        total_searches_left: Number(account.total_searches_left ?? 0),
        this_month_usage: Number(account.this_month_usage ?? 0),
        plan_renewal_date: account.plan_renewal_date ? String(account.plan_renewal_date) : null,
      };

      const { error } = await supabase.from("serpapi_usage_snapshots").insert(row);
      if (error) {
        failures.push({ key_index: i, error: error.message });
      } else {
        snapshots.push({ key_index: i, ...row });
      }
    }

    return json({ success: true, snapshots, failures });
  } catch (err) {
    console.error("sync-serpapi-usage error:", (err as Error)?.message || err);
    return json({ success: false, error: (err as Error)?.message || "Erro interno" }, 500);
  }
});

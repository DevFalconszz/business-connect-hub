import { supabase } from '@/integrations/supabase/client';
import { AdminLead, ApiUsageStats, ApiUsageSummary, SerpapiAccountUsage, SerpapiUsagePoint } from './types';

export async function fetchAdminLeads(): Promise<AdminLead[]> {
  const { data, error } = await (supabase.rpc as any)('admin_dashboard_leads');
  if (error) {
    console.error('Erro ao buscar leads para o dashboard:', error);
    throw error;
  }
  return (data || []) as AdminLead[];
}

export async function fetchApiUsageStats(days: number = 7): Promise<ApiUsageStats[]> {
  const { data, error } = await (supabase.rpc as any)('get_api_usage_stats', {
    p_days: days,
  });
  if (error) {
    console.error('Erro ao buscar estatísticas de API:', error);
    throw error;
  }
  return (data || []) as ApiUsageStats[];
}

export async function fetchApiUsageSummary(days: number = 7): Promise<ApiUsageSummary | null> {
  const { data, error } = await (supabase.rpc as any)('get_api_usage_summary', {
    p_days: days,
  });
  if (error) {
    console.error('Erro ao buscar resumo de API:', error);
    throw error;
  }
  return (data && data.length > 0) ? (data[0] as ApiUsageSummary) : null;
}

export async function fetchSerpapiUsage(): Promise<SerpapiAccountUsage[]> {
  const { data, error } = await (supabase.rpc as any)('get_serpapi_usage');
  if (error) {
    console.error('Erro ao buscar uso das chaves SerpAPI:', error);
    throw error;
  }
  return (data || []) as SerpapiAccountUsage[];
}

export async function fetchSerpapiUsageHistory(keyIndex: number = 0): Promise<SerpapiUsagePoint[]> {
  const { data, error } = await (supabase.rpc as any)('get_serpapi_usage_history', {
    p_key_index: keyIndex,
    p_days: 30,
  });
  if (error) {
    console.error('Erro ao buscar histórico de uso SerpAPI:', error);
    throw error;
  }
  return (data || []) as SerpapiUsagePoint[];
}

export async function triggerSerpapiSync(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const { error } = await supabase.functions.invoke('sync-serpapi-usage', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (error) {
    console.error('Erro ao executar sync do SerpAPI:', error);
    return false;
  }
  return true;
}

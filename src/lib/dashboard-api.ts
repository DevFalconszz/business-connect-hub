import { supabase } from '@/integrations/supabase/client';
import { AdminLead, ApiUsageStats, ApiUsageSummary } from './types';

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

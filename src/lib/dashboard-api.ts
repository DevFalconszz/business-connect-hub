import { supabase } from '@/integrations/supabase/client';
import { AdminLead, AdminUser, ApiUsageStats, ApiUsageSummary, SerpapiAccountUsage, SerpapiUsagePoint } from './types';

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

// User management functions
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await (supabase.rpc as any)('admin_list_users');
  if (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
  return (data || []) as AdminUser[];
}

export async function createAdminUser(
  email: string,
  password: string,
  name: string,
  role: string = 'sdr'
): Promise<{ id: string; email: string; name: string; role: string; password: string }> {
  const { data, error } = await (supabase.rpc as any)('admin_create_user', {
    p_email: email,
    p_password: password,
    p_name: name,
    p_role: role,
  });
  if (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
  return data;
}

export async function updateAdminUser(
  userId: string,
  updates: { name?: string; role?: string }
): Promise<{ id: string; email: string; name: string; role: string; success: boolean }> {
  const { data, error } = await (supabase.rpc as any)('admin_update_user', {
    p_user_id: userId,
    p_name: updates.name || null,
    p_role: updates.role || null,
  });
  if (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
  return data;
}

export async function deleteAdminUser(userId: string): Promise<boolean> {
  const { data, error } = await (supabase.rpc as any)('admin_delete_user', {
    p_user_id: userId,
  });
  if (error) {
    console.error('Erro ao excluir usuário:', error);
    throw error;
  }
  return data?.success === true;
}

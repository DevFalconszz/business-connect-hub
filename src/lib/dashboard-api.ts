import { supabase } from '@/integrations/supabase/client';
import { AdminLead } from './types';

export async function fetchAdminLeads(): Promise<AdminLead[]> {
  const { data, error } = await (supabase.rpc as any)('admin_dashboard_leads');
  if (error) {
    console.error('Erro ao buscar leads para o dashboard:', error);
    throw error;
  }
  return (data || []) as AdminLead[];
}

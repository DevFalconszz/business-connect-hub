export type LeadStatus = 'analise_pendente' | 'em_analise' | 'follow_up' | 'reuniao_agendada' | 'recusado' | 'venda_fechada';

export const STATUS_LABELS: Record<LeadStatus, string> = {
  analise_pendente: 'Análise Pendente',
  em_analise: 'Em Análise',
  follow_up: 'Follow Up',
  reuniao_agendada: 'Reunião Agendada',
  recusado: 'Recusado',
  venda_fechada: 'Venda Fechada',
};

export interface Lead {
  id: string;
  name: string;
  title: string;
  category: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  google_maps_url: string;
  rating: string;
  reviews_count: string;
  instagram: string;
  responsavel: string;
  descricao: string;
  status: LeadStatus;
  whatsapp_group: string;
  meeting_dates: string[];
  nome_decisor: string;
  numero_decisor: string;
}

export interface AdminLead extends Lead {
  user_id: string | null;
  owner_email: string | null;
  owner_name: string | null;
  created_at: string;
}

export type DashboardView =
  | 'geral'
  | 'por_usuario'
  | 'por_status'
  | 'por_nicho'
  | 'por_estado'
  | 'api_usage'
  | 'usuarios';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  deleted_at: string | null;
  lead_count: number;
}

export interface ApiUsageStats {
  endpoint: string;
  key_index: number;
  total_calls: number;
  success_count: number;
  error_count: number;
  rate_limited_count: number;
  success_rate: number;
  last_used: string;
}

export interface ApiUsageSummary {
  total_calls: number;
  success_count: number;
  error_count: number;
  rate_limited_count: number;
  success_rate: number;
  primary_key_usage: number;
  fallback_key_usage: number;
}

export interface SerpapiAccountUsage {
  key_index: number;
  account_email: string;
  plan_name: string;
  searches_per_month: number;
  plan_searches_left: number;
  total_searches_left: number;
  this_month_usage: number;
  plan_renewal_date: string;
  fetched_at: string;
}

export interface SerpapiUsagePoint {
  fetched_at: string;
  this_month_usage: number;
  total_searches_left: number;
}

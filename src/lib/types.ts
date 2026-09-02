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
  | 'por_estado';

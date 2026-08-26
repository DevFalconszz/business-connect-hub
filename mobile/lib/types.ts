export type LeadStatus = 'none' | 'analise_pendente' | 'em_analise' | 'follow_up' | 'reuniao_agendada' | 'recusado' | 'venda_fechada';

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
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  none: 'Sem status',
  analise_pendente: 'Análise Pendente',
  em_analise: 'Em Análise',
  follow_up: 'Follow Up',
  reuniao_agendada: 'Reunião Agendada',
  recusado: 'Recusado',
  venda_fechada: 'Venda Fechada',
};

export const STATUS_COLORS: Record<LeadStatus, { bg: string; text: string }> = {
  none: { bg: '#F3F4F6', text: '#6B7280' },
  analise_pendente: { bg: '#FEF3C7', text: '#92400E' },
  em_analise: { bg: '#FEF3C7', text: '#92400E' },
  follow_up: { bg: '#DBEAFE', text: '#1E40AF' },
  reuniao_agendada: { bg: '#D1FAE5', text: '#065F46' },
  recusado: { bg: '#FEE2E2', text: '#991B1B' },
  venda_fechada: { bg: '#D1FAE5', text: '#065F46' },
};

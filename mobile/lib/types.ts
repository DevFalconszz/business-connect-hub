export type LeadStatus = 'analise_pendente' | 'em_analise' | 'follow_up' | 'reuniao_agendada' | 'recusado' | 'venda_fechada';

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
  analise_pendente: 'Análise Pendente',
  em_analise: 'Em Análise',
  follow_up: 'Follow Up',
  reuniao_agendada: 'Reunião Agendada',
  recusado: 'Recusado',
  venda_fechada: 'Venda Fechada',
};

export const STATUS_COLORS: Record<LeadStatus, { bg: string; text: string }> = {
  analise_pendente: { bg: '#FEF3C7', text: '#B45309' },
  em_analise: { bg: '#FFEDD5', text: '#C2410C' },
  follow_up: { bg: '#E0F2FE', text: '#0369A1' },
  reuniao_agendada: { bg: '#EDE9FE', text: '#6D28D9' },
  recusado: { bg: '#FEE2E2', text: '#B91C1C' },
  venda_fechada: { bg: '#D1FAE5', text: '#047857' },
};

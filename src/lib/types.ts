export type LeadStatus = 'none' | 'avaliando' | 'conversando' | 'reuniao_marcada';

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
  meeting_dates: string[]; // ISO date strings
}

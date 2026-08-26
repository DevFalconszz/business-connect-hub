import { supabase } from './supabase';
import { Lead } from './types';

function rowToLead(row: any): Lead {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    category: row.category,
    address: row.address,
    city: row.city,
    state: row.state,
    phone: row.phone,
    website: row.website,
    google_maps_url: row.google_maps_url,
    rating: row.rating,
    reviews_count: row.reviews_count,
    instagram: row.instagram,
    responsavel: row.responsavel,
    descricao: row.descricao,
    status: row.status as Lead['status'],
    whatsapp_group: row.whatsapp_group,
    meeting_dates: row.meeting_dates || [],
    nome_decisor: row.nome_decisor || '',
    numero_decisor: row.numero_decisor || '',
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function loadLeads(): Promise<Lead[]> {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('[Leads] Current user:', user?.id || 'none');

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Leads] Error loading:', error.message, error.code, error.details);
    return [];
  }
  console.log('[Leads] Loaded:', data?.length || 0, 'leads');
  return (data || []).map(rowToLead);
}

export async function insertLead(lead: Omit<Lead, 'id'>): Promise<Lead | null> {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('[Leads] Inserting as user:', user?.id || 'none');

  const { data, error } = await supabase
    .from('leads')
    .insert({
      name: lead.name,
      title: lead.title,
      category: lead.category,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      phone: lead.phone,
      website: lead.website,
      google_maps_url: lead.google_maps_url,
      rating: lead.rating,
      reviews_count: lead.reviews_count,
      instagram: lead.instagram,
      responsavel: lead.responsavel,
      descricao: lead.descricao,
      status: lead.status,
      whatsapp_group: lead.whatsapp_group,
      meeting_dates: lead.meeting_dates,
      nome_decisor: lead.nome_decisor,
      numero_decisor: lead.numero_decisor,
      user_id: user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('[Leads] Error inserting:', error.message, error.code, error.details);
    return null;
  }
  console.log('[Leads] Inserted:', data.name, 'id:', data.id);
  return rowToLead(data);
}

export async function updateLead(lead: Lead): Promise<boolean> {
  const { error } = await supabase
    .from('leads')
    .update({
      name: lead.name,
      title: lead.title,
      category: lead.category,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      phone: lead.phone,
      website: lead.website,
      google_maps_url: lead.google_maps_url,
      rating: lead.rating,
      reviews_count: lead.reviews_count,
      instagram: lead.instagram,
      responsavel: lead.responsavel,
      descricao: lead.descricao,
      status: lead.status,
      whatsapp_group: lead.whatsapp_group,
      meeting_dates: lead.meeting_dates,
      nome_decisor: lead.nome_decisor,
      numero_decisor: lead.numero_decisor,
    })
    .eq('id', lead.id);

  if (error) {
    console.error('Error updating lead:', error);
    return false;
  }
  return true;
}

export async function deleteLead(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lead:', error);
    return false;
  }
  return true;
}

import { supabase } from '@/integrations/supabase/client';
import { Lead } from './types';

export async function loadLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading leads:', error);
    return [];
  }

  return (data || []).map(row => ({
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
  }));
}

export async function insertLead(lead: Omit<Lead, 'id'>): Promise<Lead | null> {
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
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting lead:', error);
    return null;
  }

  return {
    ...data,
    status: data.status as Lead['status'],
    meeting_dates: data.meeting_dates || [],
  };
}

export async function insertLeads(leads: Omit<Lead, 'id'>[]): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .insert(leads.map(l => ({
      name: l.name,
      title: l.title,
      category: l.category,
      address: l.address,
      city: l.city,
      state: l.state,
      phone: l.phone,
      website: l.website,
      google_maps_url: l.google_maps_url,
      rating: l.rating,
      reviews_count: l.reviews_count,
      instagram: l.instagram,
      responsavel: l.responsavel,
      descricao: l.descricao,
      status: l.status,
      whatsapp_group: l.whatsapp_group,
      meeting_dates: l.meeting_dates,
    })))
    .select();

  if (error) {
    console.error('Error inserting leads:', error);
    return [];
  }

  return (data || []).map(row => ({
    ...row,
    status: row.status as Lead['status'],
    meeting_dates: row.meeting_dates || [],
  }));
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

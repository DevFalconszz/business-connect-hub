-- Migration: Create leads table for CRM (projeto pgqwjooucborcdqwsoui)
-- Execute this in the Supabase dashboard SQL editor for the CRM project

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  google_maps_url TEXT NOT NULL DEFAULT '',
  rating TEXT NOT NULL DEFAULT '',
  reviews_count TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  responsavel TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'none',
  whatsapp_group TEXT NOT NULL DEFAULT '',
  meeting_dates TEXT[] NOT NULL DEFAULT '{}',
  nome_decisor TEXT NOT NULL DEFAULT '',
  numero_decisor TEXT NOT NULL DEFAULT '',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create index for user_id queries
CREATE INDEX idx_leads_user_id ON public.leads(user_id);

-- RLS policies: All authenticated users can view all leads (shared CRM)
CREATE POLICY "Authenticated users can view all leads" ON public.leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can insert leads
CREATE POLICY "Authenticated users can insert leads" ON public.leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update leads
CREATE POLICY "Authenticated users can update leads" ON public.leads
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete leads
CREATE POLICY "Authenticated users can delete leads" ON public.leads
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant access to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

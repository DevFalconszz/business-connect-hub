
-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Add user_id column to leads table (nullable for existing data)
ALTER TABLE public.leads ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create index for user_id queries
CREATE INDEX idx_leads_user_id ON public.leads(user_id);

-- Drop the old open RLS policies on leads
DROP POLICY IF EXISTS "Anyone can view leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can update leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can delete leads" ON public.leads;

-- New RLS policies for leads:
-- Everyone can read all leads (admin mode - shared CRM)
CREATE POLICY "Authenticated users can view all leads" ON public.leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can insert leads (must set their own user_id)
CREATE POLICY "Authenticated users can insert leads" ON public.leads
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
  );

-- Users can update their own leads
CREATE POLICY "Users can update own leads" ON public.leads
  FOR UPDATE USING (
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    auth.role() = 'authenticated'
  );

-- Users can delete their own leads
CREATE POLICY "Users can delete own leads" ON public.leads
  FOR DELETE USING (
    auth.role() = 'authenticated'
  );

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update profiles timestamp trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant access to profiles table
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

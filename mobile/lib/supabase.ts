import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pgqwjooucborcdqwsoui.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CcT-bKZpAAU-sSCkc7w6QA_MMF8kJDQ';

const MemoryStorage = {
  data: {} as Record<string, string>,
  getItem: async (key: string) => MemoryStorage.data[key] ?? null,
  setItem: async (key: string, value: string) => { MemoryStorage.data[key] = value; },
  removeItem: async (key: string) => { delete MemoryStorage.data[key]; },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: MemoryStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl.includes('your-project')) {
  console.error('🚨 Missing or invalid VITE_SUPABASE_URL. Please set your actual Supabase URL in .env.local.');
}

export const supabase = createClient(
  supabaseUrl.includes('your-project') ? 'https://placeholder.supabase.co' : supabaseUrl,
  supabaseAnonKey.includes('your-anon-key') ? 'placeholder-key' : supabaseAnonKey
);


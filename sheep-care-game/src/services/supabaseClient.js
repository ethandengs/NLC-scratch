import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Try both potential variable names
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

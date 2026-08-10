import { createClient } from '@supabase/supabase-js';

// Ключи берутся из .env локально и из Vercel → Settings → Environment Variables на проде.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Запасные значения позволяют показать понятную подсказку в интерфейсе вместо белого экрана.
export const supabase = createClient(
  url ?? 'https://not-configured.supabase.co',
  anonKey ?? 'not-configured',
);

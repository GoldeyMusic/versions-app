import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uyeswtjisbzfyribnywt.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4n0FfejTu9-3kWXjALYNow_6gAZ814r';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Flow PKCE : le code OAuth revient en query string (`?code=...`) au lieu
    // du fragment d'URL (`#access_token=...`). Indispensable maintenant qu'on
    // est passé en URLs propres sans hash router (Supabase parse `?code` sur
    // la callback page et signe l'utilisateur sans laisser de tokens visibles
    // dans la barre d'adresse).
    flowType: 'pkce',
  },
});

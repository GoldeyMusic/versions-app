import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({ user: null, loading: true });

// Lit la locale courante pour la transmettre à Supabase Auth.
// Stockée dans `versions_lang` (cf. App.jsx) — fallback navigator.language → 'fr'.
// Utilisée pour i18n des emails Supabase via Go template `{{ .Data.locale }}`
// (cf. dashboard Authentication → Email Templates).
function readLocale() {
  try {
    const stored = localStorage.getItem('versions_lang');
    if (stored === 'en' || stored === 'fr') return stored;
  } catch {}
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en')) return 'en';
  return 'fr';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUpWithEmail = async (email, password) => {
    // `options.data.locale` est persisté dans auth.users.raw_user_meta_data
    // et exposé aux email templates Supabase via `{{ .Data.locale }}`.
    // Permet de servir les emails (confirmation, reset password, etc.) en FR ou EN
    // selon la langue active dans l'app.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { locale: readLocale() } },
    });
    return { data, error };
  };

  const signInWithOAuth = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      // En PKCE, Supabase pose le `?code=...` sur cette URL puis on l'échange
      // contre une session via `exchangeCodeForSession`. La page /auth/callback
      // gère cet échange et renvoie l'utilisateur vers le dashboard (cf. App.jsx).
      // `queryParams.locale` est lu côté Supabase et stocké dans le user meta
      // pour les emails ultérieurs (reset password, etc.).
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { locale: readLocale() },
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signInWithOAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

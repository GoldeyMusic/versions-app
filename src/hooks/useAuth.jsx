import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { trackPixelSignup } from '../lib/pixel';

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
      // Meta Pixel : CompleteRegistration au signup. Idempotent par user.id
      // (cf. trackPixelSignup) — un user qui se déconnecte/reconnecte ne
      // re-tire pas l'event. Couvre les 2 chemins : signup email (event
      // SIGNED_IN tiré juste après signUp réussi) ET OAuth (SIGNED_IN tiré
      // après échange du code dans /auth/callback).
      if (_event === 'SIGNED_IN' && session?.user?.id) {
        trackPixelSignup(session.user.id);
      }
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

  // Mot de passe oublié : envoie un mail avec un lien magique vers /update-password.
  // Le user clique le lien, Supabase pose la session, puis updateUserPassword() peut être appelé.
  // Locale persistée dans user_metadata pour que le mail soit servi en FR/EN.
  const resetPasswordForEmail = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
      data: { locale: readLocale() },
    });
    return { data, error };
  };

  // Mise à jour du mot de passe (appelé depuis /update-password après clic sur le lien).
  // Le user est déjà authentifié à ce moment (Supabase a validé le token du lien).
  const updateUserPassword = async (password) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signInWithOAuth, signOut, resetPasswordForEmail, updateUserPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

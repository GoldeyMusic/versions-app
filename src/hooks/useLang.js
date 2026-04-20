import { createContext, useContext } from "react";
import STRINGS, { pick } from "../constants/strings";

/* ───────────────────────────────────────────────────────────
 * LangContext — { lang, s, setLang, t(path, vars) }
 *  - lang : 'fr' | 'en'
 *  - s    : dictionnaire complet de la locale active (accès direct)
 *  - t    : helper de traduction avec chemin pointé et variables
 *           (ex: t('home.greetingWithName', { name: 'David' }))
 *  - setLang(l) : change la langue (géré par App.jsx — persiste dans
 *                 localStorage et synchronise le profil Supabase).
 * ─────────────────────────────────────────────────────────── */
const defaultLang = "fr";
const LangContext = createContext({
  lang: defaultLang,
  s: STRINGS[defaultLang],
  setLang: () => {},
  t: (path, vars) => pick(defaultLang, path, vars),
});

const useLang = () => useContext(LangContext);

export { LangContext };
export default useLang;

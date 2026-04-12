import { useState, useEffect, createContext, useContext, useRef } from "react";

const API = "https://decode-571nt33pm-goldeymusics-projects.vercel.app";

/* ── TRANSLATIONS ────────────────────────────────────────── */
const STRINGS = {
  fr: {
    // Nav
    nav_analyse:"Analyser", nav_historique:"Historique", nav_reglages:"Réglages", nav_profil:"Profil",
    nav_back:"Retour",
    // Login
    login_title:"SE CONNECTER", signup_title:"CRÉER MON COMPTE",
    login_tab:"Se connecter", signup_tab:"Créer un compte",
    google:"Continuer avec Google", apple:"Continuer avec Apple", facebook:"Continuer avec Facebook",
    or_email:"ou par email", email:"Email", password:"Mot de passe",
    forgot:"Mot de passe oublié ?", cgu:"En continuant, tu acceptes les", cgu2:"Conditions d'utilisation", cgu3:"et la", cgu4:"Politique de confidentialité",
    // Home
    tagline:"Décodeur de productions audio",
    mode_ref_label:"TITRE DE RÉFÉRENCE", mode_ref_sub:"Upload un titre qui t'inspire",
    mode_ref_desc:"Décode une production existante — éléments sonores, chaîne de traitement, plugins probables.",
    mode_perso_label:"MA PROD MUSICALE", mode_perso_sub:"Upload ton propre mix",
    mode_perso_desc:"Analyse ta propre prod pour un diagnostic complet — points forts, lacunes, plan d'action.",
    mode_ask_label:"POSER UNE QUESTION", mode_ask_sub:"L'IA Decode te répond",
    mode_ask_desc:"Pose directement une question sur la prod, le mixage, un plugin ou une technique.",
    // Input
    source_ref:"SOURCE À DÉCODER", source_perso:"TA PRODUCTION",
    source_ref_sub:"Colle le lien de la prod qui t'inspire, ou uploade le fichier audio.",
    source_perso_sub:"Uploade ton mix ou colle un lien de partage privé.",
    tab_link:"Lien", tab_upload:"Upload",
    url_placeholder:"Colle un lien Spotify, YouTube, SoundCloud…",
    daw_label:"Ton DAW", daw_placeholder:"Sélectionne ton DAW",
    analyze_btn:"ANALYSER", analyze_btn_perso:"DIAGNOSTIQUER",
    complete_fields:"Compléter les champs", source_audio:"SOURCE AUDIO", ton_daw:"TON DAW", mode_ref_badge:"MODE RÉFÉRENCE", mode_perso_badge:"MODE PERSONNEL",
    // Fiche tabs
    tab_elements:"ANALYSE", tab_elements_perso:"DIAGNOSTIC",
    tab_ecoute:"ÉCOUTE", tab_ecoute_perso:"RESSENTI",
    tab_chain:"CHAÎNE PROBABLE", tab_chain_perso:"PROBLÈMES IDENTIFIÉS",
    tab_plugins:"PLUGINS IDENTIFIÉS", tab_plugins_perso:"OUTILS RECOMMANDÉS",
    tab_tips:"REPRODUIRE", tab_tips_perso:"PLAN D'ACTION",
    generating:"Génération…", kb_active:"Base de connaissance active",
    click_to_dig:"Cliquer sur un élément pour approfondir",
    // Ask modal
    ask_title:"POSER UNE QUESTION", ask_sub:"Expert production musicale · Tous DAWs",
    ask_placeholder:"Ta question…",
    // Historique
    historique_title:"HISTORIQUE", historique_sub:"Tes analyses précédentes",
    search_placeholder:"Rechercher un titre, un artiste, un DAW…",
    filter_all:"Toutes", filter_ref:"Référence", filter_perso:"Personnel",
    no_results:"Aucun résultat", no_results_sub:"Essaie un autre terme ou réinitialise les filtres",
    reset:"Réinitialiser",
    // Réglages
    reglages_title:"RÉGLAGES",
    section_profil:"Profil", section_abonnement:"Abonnement", section_paiement:"Paiement",
    section_preferences:"Préférences", section_securite:"Sécurité", section_donnees:"Données",
    plan_current:"PLAN ACTUEL", upgrade_btn:"PASSER EN PRO",
    save_btn:"ENREGISTRER", modify_btn:"MODIFIER",
    free_plan:"5 analyses / mois", pro_features:"Analyses illimitées · Export PDF · Assistant enrichi · Historique complet",
    daw_default:"DAW PAR DÉFAUT", lang_label:"LANGUE",
    notif_news:"Notifications — Nouveautés",
    danger_zone:"Zone de danger", delete_account:"Supprimer mon compte",
    export_analyses:"Exporter mes analyses", export_analyses_desc:"Télécharger toutes tes fiches en PDF",
    export_data:"Exporter mes données", export_data_desc:"Archive complète au format JSON",
    delete_data:"Supprimer toutes mes données",
    // Menu
    username_label:"Nom d'utilisateur", change_photo:"Changer la photo", no_card:"Aucune carte enregistrée", card_required:"Requis pour le plan Pro",
    add_card:"Ajouter une carte",
    irrev:"{ls.irrev}",
    menu_account:"Mon compte", menu_premium:"Passer en Premium", menu_settings:"Réglages",
    menu_help:"Aide & support", menu_logout:"Se déconnecter",
    // Confidence
    conf_measured:"MESURÉ", conf_identified:"IDENTIFIÉ", conf_suggested:"SUGGÉRÉ",
  },
  en: {
    // Nav
    nav_analyse:"Analyse", nav_historique:"History", nav_reglages:"Settings", nav_profil:"Profile",
    nav_back:"Back",
    // Login
    login_title:"SIGN IN", signup_title:"SIGN UP",
    login_tab:"Sign in", signup_tab:"Sign up",
    google:"Continue with Google", apple:"Continue with Apple", facebook:"Continue with Facebook",
    or_email:"or with email", email:"Email", password:"Password",
    forgot:"Forgot password?", cgu:"By continuing, you agree to our", cgu2:"Terms of Service", cgu3:"and", cgu4:"Privacy Policy",
    // Home
    tagline:"Audio production decoder",
    mode_ref_label:"REFERENCE TRACK", mode_ref_sub:"Upload a track that inspires you",
    mode_ref_desc:"Decode an existing production — sonic elements, processing chain, probable plugins.",
    mode_perso_label:"MY PRODUCTION", mode_perso_sub:"Upload your own mix",
    mode_perso_desc:"Analyse your own track for a full diagnostic — strengths, weaknesses, action plan.",
    mode_ask_label:"ASK A QUESTION", mode_ask_sub:"Decode AI answers you",
    mode_ask_desc:"Ask directly about production, mixing, a plugin or a technique.",
    // Input
    source_ref:"SOURCE TO DECODE", source_perso:"YOUR PRODUCTION",
    source_ref_sub:"Paste a link to the track that inspires you, or upload the audio file.",
    source_perso_sub:"Upload your mix or paste a private share link.",
    tab_link:"Link", tab_upload:"Upload",
    url_placeholder:"Paste a Spotify, YouTube, SoundCloud link…",
    daw_label:"Your DAW", daw_placeholder:"Select your DAW",
    analyze_btn:"ANALYSE", analyze_btn_perso:"DIAGNOSE",
    complete_fields:"Complete the fields", source_audio:"SOURCE AUDIO", ton_daw:"YOUR DAW", mode_ref_badge:"REFERENCE MODE", mode_perso_badge:"PERSONAL MODE",
    // Fiche tabs
    tab_elements:"ANALYSIS", tab_elements_perso:"DIAGNOSTIC",
    tab_ecoute:"LISTENING", tab_ecoute_perso:"FEELING",
    tab_chain:"PROBABLE CHAIN", tab_chain_perso:"ISSUES FOUND",
    tab_plugins:"PLUGINS IDENTIFIED", tab_plugins_perso:"RECOMMENDED TOOLS",
    tab_tips:"REPRODUCE", tab_tips_perso:"ACTION PLAN",
    generating:"Generating…", kb_active:"Knowledge base active",
    click_to_dig:"Click an element to dig deeper",
    // Ask modal
    ask_title:"ASK ANY QUESTION", ask_sub:"Music production expert · All DAWs",
    ask_placeholder:"Your question…",
    // Historique
    historique_title:"HISTORY", historique_sub:"Your previous analyses",
    search_placeholder:"Search by title, artist, DAW…",
    filter_all:"All", filter_ref:"Reference", filter_perso:"Personal",
    no_results:"No results", no_results_sub:"Try different terms or reset filters",
    reset:"Reset",
    // Réglages
    reglages_title:"SETTINGS",
    section_profil:"Profile", section_abonnement:"Subscription", section_paiement:"Payment",
    section_preferences:"Preferences", section_securite:"Security", section_donnees:"Data",
    plan_current:"CURRENT PLAN", upgrade_btn:"GO PRO",
    save_btn:"SAVE", modify_btn:"UPDATE",
    free_plan:"5 analyses / month", pro_features:"Unlimited analyses · PDF export · Enhanced assistant · Full history",
    daw_default:"DEFAULT DAW", lang_label:"LANGUAGE",
    notif_news:"Notifications — News & updates",
    danger_zone:"Danger zone", delete_account:"Delete my account",
    export_analyses:"Export my analyses", export_analyses_desc:"Download all your reports as PDF",
    export_data:"Export my data", export_data_desc:"Full archive in JSON format",
    delete_data:"Delete all my data",
    // Menu
    username_label:"Username", change_photo:"Change photo", no_card:"No card on file", card_required:"Required for Pro plan",
    add_card:"Add a card",
    irrev:"This action is irreversible. All your analyses and preferences will be deleted.",
    menu_account:"My account", menu_premium:"Go Premium", menu_settings:"Settings",
    menu_help:"Help & support", menu_logout:"Sign out",
    // Confidence
    conf_measured:"MEASURED", conf_identified:"IDENTIFIED", conf_suggested:"SUGGESTED",
  },
};

const LangContext = createContext({ lang:"fr", s: STRINGS.fr, setLang:()=>{} });
const useLang = () => useContext(LangContext);

const FontLink = () => (
  <style>{`@import url('https://fontls.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');`}</style>
);

const T = {
  black:"#070707", s1:"#101010", s2:"#181818", s3:"#242424",
  border:"#2c2c2c", text:"#F0EDE8", muted:"#666", muted2:"#3a3a3a",
  amber:"#F5A000", amberDim:"#a36d00", amberGlow:"rgba(245,160,0,0.12)", orange:"#E85D04",
  teal:"#1ECFB0", green:"#57CC99", cyan:"#48CAE4", red:"#E63946",
  mono:"'IBM Plex Mono', monospace", display:"'Bebas Neue', sans-serif", body:"'IBM Plex Sans', sans-serif",
};

const G = () => (
  <style>{`
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:${T.black}}
    /* iOS zoom prevention — inputs only (selects don't trigger zoom) */
    @media(max-width:767px){input,textarea{font-size:16px!important;}}
    /* Réglages inputs — override 16px, pas de risque de zoom car champ court */
    @media(max-width:767px){.reglages-input{font-size:13px!important;}}
    /* Desktop inputs — force font */
    @media(min-width:768px){input,textarea{font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1;-webkit-appearance:none;appearance:none;}}
    /* Placeholder — IBM Plex Mono 11px partout */
    input::placeholder,textarea::placeholder{font-family:'IBM Plex Mono',monospace;font-size:11px;color:${T.muted};opacity:1;}
    ::-webkit-input-placeholder{font-family:'IBM Plex Mono',monospace;font-size:11px;color:${T.muted};}
    :-ms-input-placeholder{font-family:'IBM Plex Mono',monospace;font-size:11px;color:${T.muted};}
    .dapp{min-height:100vh;background:${T.black};color:${T.text};font-family:${T.body};position:relative}
    .dapp::after{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");pointer-events:none;z-index:9999;opacity:0.6}
    /* App shell desktop */
    @media(min-width:768px){
      body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#030303;}
      .dapp{width:430px;height:920px;min-height:unset;border-radius:32px;overflow:hidden;position:relative;box-shadow:0 32px 80px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,0.06);flex-shrink:0;}
      .dapp::after{border-radius:32px;}
    }
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${T.s1}}::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
    @keyframes apulse{0%,100%{box-shadow:0 0 0 0 rgba(245,160,0,.3)}50%{box-shadow:0 0 0 8px rgba(245,160,0,0)}}
    @keyframes fadeup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes barrise{from{transform:scaleY(0.1)}to{transform:scaleY(1)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes slidedown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scan{0%{opacity:0.6;left:0}100%{opacity:0;left:100%}}
    /* Mobile overrides */
    @media(max-width:767px){
      .fiche-tabs button{padding:10px 14px!important;font-size:10px!important;}
      .fiche-tabs{-webkit-overflow-scrolling:touch;scrollbar-width:none;}
      .fiche-tabs::-webkit-scrollbar{display:none;}
      .mode-grid{grid-template-columns:1fr!important;}
      .el-item-row{flex-wrap:wrap;}
    }
  `}</style>
);

/* ── LOGO ───────────────────────────────────────────────── */
const DecodeLogo = ({ sz = 1 }) => (
  <svg width={28*sz} height={28*sz} viewBox="0 0 28 28" fill="none">
    <path d="M3 2 L3 26 L12 26 Q25 26 25 14 Q25 2 12 2 Z" stroke={T.amber} strokeWidth="1.8" fill="none"/>
    <rect x="7.5" y="18" width="2.2" height="4.5" fill={T.amber} opacity="0.9"/>
    <rect x="11"  y="14" width="2.2" height="8.5" fill={T.amber} opacity="0.7"/>
    <rect x="14.5" y="10" width="2.2" height="12.5" fill={T.amber} opacity="0.5"/>
    <rect x="18"  y="16" width="2.2" height="6.5"  fill={T.amber} opacity="0.28"/>
  </svg>
);

/* ── HEADER ─────────────────────────────────────────────── */
/* ── LOGIN SCREEN ───────────────────────────────────────── */
const LoginScreen = ({ onLogin, onLegal }) => {
  const { s: ls } = useLang();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    onLogin({ name: email.split("@")[0], email, avatar: email[0].toUpperCase() });
    setLoading(false);
  };

  const handleSocial = async (provider) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    onLogin({ name: provider, email: `user@${provider.toLowerCase()}.com`, avatar: provider[0] });
    setLoading(false);
  };

  const socials = [
    {
      label:"Continuer avec Google", provider:"Google",
      bg:"#fff", color:"#333",
      icon:<svg width="16" height="16" viewBox="0 0 16 16"><path d="M15.4 8.17c0-.57-.05-1.11-.14-1.64H8v3.1h4.15a3.54 3.54 0 0 1-1.54 2.33v1.93h2.5c1.46-1.34 2.3-3.32 2.3-5.72Z" fill="#4285F4"/><path d="M8 16c2.08 0 3.83-.69 5.1-1.87l-2.49-1.93c-.69.46-1.57.73-2.61.73-2 0-3.7-1.36-4.3-3.18H1.12v1.99A7.99 7.99 0 0 0 8 16Z" fill="#34A853"/><path d="M3.7 9.75A4.8 4.8 0 0 1 3.45 8c0-.6.1-1.19.25-1.75V4.26H1.12A8 8 0 0 0 0 8c0 1.29.31 2.51.85 3.59l2.6-2Z" fill="#FBBC05"/><path d="M8 3.18c1.13 0 2.14.39 2.93 1.15l2.2-2.2C11.83.79 10.08 0 8 0A8 8 0 0 0 1.12 4.26l2.58 2.08c.6-1.82 2.3-3.16 4.3-3.16Z" fill="#EA4335"/></svg>
    },
    {
      label:"Continuer avec Apple", provider:"Apple",
      bg:"#000", color:"#fff",
      icon:<svg width="14" height="16" viewBox="0 0 14 17" fill="white"><path d="M11.7 8.5c0-2.4 1.96-3.54 2.05-3.6-1.11-1.63-2.84-1.85-3.47-1.88-1.48-.15-2.9.88-3.65.88-.75 0-1.9-.86-3.13-.84C1.68 3.08 0 4.5 0 7.3c0 3.42 3.01 8.7 2.14 8.7.86 0 1.19-.56 2.23-.56 1.04 0 1.33.56 2.24.54.92-.02 1.49-.87 2.04-1.73a9.4 9.4 0 0 0 .94-2.04A3.69 3.69 0 0 1 11.7 8.5ZM9.52 2.1C10.18 1.3 10.64.2 10.52-.01c-.99.04-2.18.66-2.87 1.46-.63.72-1.18 1.86-1.03 2.96 1.1.08 2.23-.56 2.9-1.31Z"/></svg>
    },
    {
      label:"Continuer avec Facebook", provider:"Facebook",
      bg:"#1877F2", color:"#fff",
      icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M16 8A8 8 0 1 0 6.75 15.9V10.3H4.72V8h2.03V6.24c0-2 1.19-3.1 3.01-3.1.87 0 1.78.16 1.78.16V5.3h-1c-.99 0-1.3.61-1.3 1.24V8h2.21l-.35 2.3H9.24v5.6A8 8 0 0 0 16 8Z"/></svg>
    },
  ];

  return (
    <div style={{
      minHeight:"100vh", background:T.black,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24, position:"relative", overflow:"hidden",
    }}>
      <WaveBg/>
      <div style={{ width:"100%", maxWidth:360, animation:"fadeup .4s ease" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", marginBottom:32 }}>
          <DecodeLogo sz={1}/>
          <span style={{ fontFamily:T.display, fontSize:24, letterSpacing:6, color:T.amber }}>DECODE</span>
        </div>

        {/* Toggle login / signup */}
        <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", borderRadius:10, padding:3, marginBottom:24, border:`1px solid ${T.border}` }}>
          {[["login",ls.login_tab],["signup",ls.signup_tab]].map(([m,l]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex:1, padding:"8px 0", borderRadius:8, cursor:"pointer",
              background: mode===m ? T.amberGlow : "transparent",
              border: mode===m ? `1px solid ${T.amber}44` : "1px solid transparent",
              color: mode===m ? T.amber : T.muted,
              fontFamily:T.mono, fontSize:11, letterSpacing:.5,
              transition:"all .2s",
            }}>{l}</button>
          ))}
        </div>

        {/* Social buttons */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
          {socials.map(soc => (
            <button key={soc.provider} onClick={() => handleSocial(soc.provider)} style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              padding:"12px 16px", borderRadius:10, cursor:"pointer",
              background: soc.bg, color: soc.color,
              border:`1px solid ${T.border}`,
              fontFamily:T.body, fontSize:13, fontWeight:500,
              transition:"opacity .15s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              {soc.icon} {soc.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:T.border }}/>
          <span style={{ fontFamily:T.mono, fontSize:10, color:T.muted }}>ou par email</span>
          <div style={{ flex:1, height:1, background:T.border }}/>
        </div>

        {/* Email / password */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder={ls.email} type="email"
            style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:8, padding:"11px 14px", fontFamily:T.mono, fontSize:11, color:T.text, outline:"none" }}
            onFocus={e => e.target.style.borderColor = T.amber}
            onBlur={e => e.target.style.borderColor = T.border}
          />
          <input value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleSubmit()}
            placeholder={ls.password} type="password"
            style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:8, padding:"11px 14px", fontFamily:T.mono, fontSize:11, color:T.text, outline:"none" }}
            onFocus={e => e.target.style.borderColor = T.amber}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        </div>

        {mode === "login" && (
          <div style={{ fontFamily:T.mono, fontSize:10, color:T.amberDim, textAlign:"right", marginBottom:14, cursor:"pointer" }}>
            {ls.forgot}
          </div>
        )}

        <button onClick={handleSubmit} disabled={!email || !password || loading} style={{
          width:"100%", padding:"14px",
          background: email && password ? `linear-gradient(135deg, ${T.amber}, ${T.orange})` : T.s2,
          border:`1px solid ${email && password ? T.amber : T.border}`,
          borderRadius:10, cursor: email && password ? "pointer":"not-allowed",
          fontFamily:T.display, fontSize:20, letterSpacing:4,
          color: email && password ? T.black : T.muted,
          transition:"all .2s",
          boxShadow: email && password ? `0 4px 20px rgba(245,160,0,.25)` : "none",
        }}>{loading ? "…" : mode === "login" ? ls.login_title : ls.signup_title}</button>

        <div style={{ fontFamily:T.mono, fontSize:9, color:T.muted2, textAlign:"center", marginTop:20, lineHeight:1.7 }}>
          {ls.cgu} <span onClick={() => onLegal("cgu")} style={{ color:T.muted, cursor:"pointer", textDecoration:"underline" }}>{ls.cgu2}</span>
          {" "}{ls.cgu3} <span onClick={() => onLegal("privacy")} style={{ color:T.muted, cursor:"pointer", textDecoration:"underline" }}>{ls.cgu4}</span>
        </div>
      </div>
    </div>
  );
};

const Header = ({ step, onStep, user, onLogout, avatarPhoto, onSection }) => {
  const { s: ls } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label:"Passer en Premium", color:"#F9E04B", icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1 L8 5 L12 5 L9 8 L10 12 L6.5 9.5 L3 12 L4 8 L1 5 L5 5 Z" stroke="#F9E04B" strokeWidth="1.2" strokeLinejoin="round"/></svg> },
    { label:"Réglages", color:T.text, action:() => onSection("reglages"), icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.6 2.6l.85.85M9.55 9.55l.85.85M2.6 10.4l.85-.85M9.55 3.45l.85-.85" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
    { label:"Aide & support", color:T.text, icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5c0-1 .7-1.5 1.5-1.5S8 4 8 5c0 .8-.5 1.2-1 1.5C6.5 7 6.5 7.5 6.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="6.5" cy="10" r=".7" fill="currentColor"/></svg> },
    { label:"Se déconnecter", color:T.red, action: onLogout, icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 4.5 L11.5 6.5 L8.5 8.5" stroke="#E63946" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M11.5 6.5H5" stroke="#E63946" strokeWidth="1.3" strokeLinecap="round"/><path d="M5 2H2.5C1.7 2 1 2.7 1 3.5v6C1 10.3 1.7 11 2.5 11H5" stroke="#E63946" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  ];

  return (
    <header style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 28px", height:58, borderBottom:`1px solid ${T.border}`,
      background:"rgba(7,7,7,0.96)", backdropFilter:"blur(16px)",
      position:"sticky", top:0, zIndex:100,
    }}>
      {/* Logo — clic → home */}
      <div onClick={() => onStep(0)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
        <DecodeLogo sz={0.9}/>
        <span style={{ fontFamily:T.display, fontSize:22, letterSpacing:5, color:T.amber }}>DECODE</span>
        <div style={{ width:6, height:6, borderRadius:"50%", background:T.amber, animation:"apulse 2.5s infinite", marginLeft:4 }}/>
      </div>

      {/* Breadcrumb + avatar */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          {["MODE","SOURCE","FICHE"].map((st,i) => (
            <div key={st} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div
                onClick={() => i < step && onStep(i)}
                style={{
                  fontFamily:T.mono, fontSize:10, letterSpacing:1, padding:"4px 12px", borderRadius:20,
                  border:`1px solid ${step===i ? T.amber : step>i ? T.amberDim : T.border}`,
                  color: step===i ? T.black : step>i ? T.amberDim : T.muted,
                  background: step===i ? T.amber : "transparent",
                  cursor: i < step ? "pointer" : "default",
                  transition:"all .2s", fontWeight: step===i ? 600 : 400,
                }}
              >{st}</div>
              {i < 2 && <div style={{ width:12, height:1, background: step>i ? T.amberDim : T.border }}/>}
            </div>
          ))}
        </div>

        {/* Avatar + dropdown */}
        {user && (
          <div style={{ position:"relative" }}>
            <div
              onClick={() => setMenuOpen(o => !o)}
              style={{
                width:32, height:32, borderRadius:"50%", overflow:"hidden",
                background:`linear-gradient(135deg, ${T.amber}, ${T.orange})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:T.display, fontSize:14, color:T.black,
                cursor:"pointer", flexShrink:0,
                boxShadow: menuOpen ? `0 0 0 2px ${T.amber}` : `0 0 0 1px ${T.amber}44`,
                transition:"box-shadow .2s",
              }}
            >{avatarPhoto ? <img src={avatarPhoto} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : user.avatar}</div>

            {menuOpen && (
              <>
                {/* Overlay */}
                <div onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:200 }}/>
                {/* Dropdown */}
                <div style={{
                  position:"absolute", top:40, right:0, zIndex:201,
                  background:T.s1, border:`1px solid ${T.border}`,
                  borderRadius:14, overflow:"hidden", width:210,
                  boxShadow:"0 16px 48px rgba(0,0,0,0.7)",
                  animation:"fadeup .15s ease",
                }}>
                  {/* User info */}
                  <div style={{ padding:"14px 16px 12px", borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ fontFamily:T.body, fontSize:13, fontWeight:600, color:T.text }}>{user.name}</div>
                    <div style={{ fontFamily:T.mono, fontSize:10, color:T.muted, marginTop:2 }}>{user.email}</div>
                    <div style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:5,
                      background:T.amberGlow, border:`1px solid ${T.amber}33`,
                      borderRadius:6, padding:"2px 8px" }}>
                      <div style={{ width:5, height:5, borderRadius:"50%", background:T.amber }}/>
                      <span style={{ fontFamily:T.mono, fontSize:9, color:T.amber, letterSpacing:.5 }}>FREE</span>
                    </div>
                  </div>
                  {/* Items */}
                  {menuItems.map((item, i) => (
                    <button key={i} onClick={() => { setMenuOpen(false); item.action && item.action(); }} style={{
                      display:"flex", alignItems:"center", gap:10, width:"100%",
                      padding:"11px 16px", background:"transparent", border:"none",
                      borderBottom: i < menuItems.length-1 ? `1px solid ${T.border2}` : "none",
                      cursor:"pointer", textAlign:"left", transition:"background .1s",
                      fontFamily:T.body, fontSize:13, color: item.color || T.text,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = T.s2}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ color: item.color || T.muted, opacity:.8, flexShrink:0 }}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

/* ── WAVEFORM BG ────────────────────────────────────────── */
const WaveBg = () => {
  const bars = Array.from({length:90},(_,i) => Math.max(0.05, Math.abs(Math.sin(i*.19)*.5+Math.sin(i*.07)*.3)));
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:90, display:"flex", alignItems:"flex-end", gap:2, opacity:.055, pointerEvents:"none" }}>
      {bars.map((h,i) => <div key={i} style={{ flex:1, height:`${h*100}%`, background:T.amber, borderRadius:"2px 2px 0 0" }}/>)}
    </div>
  );
};

/* ── SCREEN 1 : MODE ────────────────────────────────────── */
const ModeScreen = ({ onSelect }) => {
  const [hov, setHov] = useState(null);
  const { s: ls } = useLang();
  const modes = [
    { id:"perso", label:ls.mode_perso_label, sublabel:ls.mode_perso_sub, icon:<IconScope/>,  color:T.green,
      bg:"rgba(87,204,153,0.08)", desc:ls.mode_perso_desc,
      tags:["Diagnostic","Plan d'action","Mix review"] },
    { id:"ref",   label:ls.mode_ref_label,   sublabel:ls.mode_ref_sub,   icon:<IconTarget/>, color:T.cyan,
      bg:"rgba(72,202,228,0.08)", desc:ls.mode_ref_desc,
      tags:["Inspiration","Reverse engineering","Plugin ID"] },
    { id:"ask",   label:ls.mode_ask_label,   sublabel:ls.mode_ask_sub,   icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={T.amber} strokeWidth="1.4"/><path d="M7.5 8c0-1.4 1-2.2 2.5-2.2S12.5 7 12.5 8.5c0 1-.7 1.8-1.5 2.1-.5.2-.5.7-.5 1" stroke={T.amber} strokeWidth="1.4" strokeLinecap="round"/><circle cx="10" cy="13.5" r=".8" fill={T.amber}/></svg>, color:T.amber,
      bg:"rgba(245,160,0,0.08)", desc:ls.mode_ask_desc,
      tags:["Conseils","Techniques","Plugins"] },
  ];
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      height:"calc(100vh - 58px)", padding:"20px 24px",
      position:"relative", overflow:"hidden", animation:"fadeup .4s ease",
    }}>
      <WaveBg/>

      {/* Hero — compact */}
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <h1 style={{ fontFamily:T.display, fontSize:"clamp(48px,7vw,80px)", letterSpacing:10, lineHeight:1, color:T.text, marginBottom:8 }}>
          DE<span style={{ color:T.amber }}>CO</span>DE
        </h1>
        <div style={{ fontFamily:T.body, fontWeight:300, fontSize:11, letterSpacing:4, color:T.muted, textTransform:"uppercase" }}>
          {ls.tagline}
        </div>
      </div>

      {/* Mode cards — 3 colonnes */}
      <div className="mode-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, width:"100%", maxWidth:900 }}>
        {modes.map(m => (
          <div key={m.id}
            onClick={() => onSelect(m.id)}
            onMouseEnter={() => setHov(m.id)}
            onMouseLeave={() => setHov(null)}
            style={{
              background: hov===m.id ? m.bg : T.s1,
              border:`1px solid ${hov===m.id ? m.color : T.border}`,
              borderRadius:14, padding:"22px 20px", cursor:"pointer", transition:"all .22s",
              transform: hov===m.id ? "translateY(-2px)" : "none",
              boxShadow: hov===m.id ? `0 8px 32px rgba(0,0,0,.4), 0 0 0 1px ${m.color}22` : "none",
              position:"relative", overflow:"hidden",
            }}
          >
            <div style={{ position:"absolute", top:0, right:0, width:80, height:80, background:`radial-gradient(circle at top right, ${m.color}14, transparent 70%)` }}/>

            {/* Icon + label inline */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:m.bg, border:`1px solid ${m.color}22`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {m.icon}
              </div>
              <div>
                <div style={{ fontFamily:T.body, fontWeight:600, fontSize:13, letterSpacing:.3, color:m.color, marginBottom:3 }}>{m.label}</div>
                <div style={{ fontFamily:T.body, fontWeight:300, fontSize:11, color:m.color, opacity:.6 }}>{m.sublabel}</div>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontFamily:T.body, fontWeight:300, fontSize:12, color:T.muted, lineHeight:1.6, marginBottom:16 }}>{m.desc}</p>

            {/* Tags */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {m.tags.map(t => <span key={t} style={{ fontFamily:T.mono, fontSize:9, padding:"2px 8px", borderRadius:4, background:`${m.color}10`, border:`1px solid ${m.color}30`, color:m.color, opacity:.7, letterSpacing:.3 }}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── SCREEN 2 : INPUT ───────────────────────────────────── */
const DAWS = [
  "Logic Pro","Ableton Live","FL Studio","Pro Tools","Cubase",
  "Studio One","LUNA","Reaper","Reason","Bitwig Studio","GarageBand","Nuendo",
];

const InputScreen = ({ mode, onAnalyze }) => {
  const { s: ls } = useLang();
  const [tab, setTab] = useState("link");
  const [url, setUrl] = useState("");
  const [daw, setDaw] = useState(null);
  const [file, setFile] = useState(null);       // File object
  const [fileName, setFileName] = useState(""); // Display name
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const existing = document.querySelector("meta[name=viewport]");
    if (existing) {
      const orig = existing.content;
      existing.content = "width=device-width, initial-scale=1, maximum-scale=1";
      return () => { existing.content = orig; };
    }
    const m = document.createElement("meta");
    m.name = "viewport";
    m.content = "width=device-width, initial-scale=1, maximum-scale=1";
    document.head.appendChild(m);
    return () => document.head.removeChild(m);
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setFileName(f.name);
  };

  const handleAnalyze = async () => {
    if (!ok || uploading) return;
    setUploading(true);
    try {
      if (tab === "link") {
        onAnalyze({ mode, url, daw, title: "", artist: "" });
      } else if (file) {
        // Read file as base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result.split(",")[1];
          onAnalyze({
            mode, daw,
            fileData: base64,
            fileName: file.name,
            fileMime: file.type || "audio/mpeg",
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "",
          });
        };
        reader.readAsDataURL(file);
        return;
      }
    } finally {
      setUploading(false);
    }
  };

  const isRef = mode === "ref";
  const accent = isRef ? T.cyan : T.green;
  const ok = (tab==="link" ? url.length > 8 : !!file) && !!daw;

  return (
    <div style={{ maxWidth:620, margin:"0 auto", padding:"44px 24px", display:"flex", flexDirection:"column", gap:24, animation:"fadeup .35s ease" }}>
      {/* Title */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <span style={{ fontFamily:T.mono, fontSize:10, padding:"4px 12px", borderRadius:20, fontWeight:600, letterSpacing:1,
            background:isRef?"rgba(72,202,228,0.12)":"rgba(87,204,153,0.12)", color:accent, border:`1px solid ${accent}44` }}>
            {isRef ? ls.mode_ref_badge : ls.mode_perso_badge}
          </span>
        </div>
        <h2 style={{ fontFamily:T.body, fontWeight:600, fontSize:24, letterSpacing:.3, color:T.text }}>{isRef ? ls.source_ref : ls.source_perso}</h2>
        <p style={{ fontFamily:T.body, fontWeight:300, fontSize:13, color:T.muted, marginTop:6, lineHeight:1.6 }}>
          {isRef ? ls.source_ref_sub : ls.source_perso_sub}
        </p>
      </div>

      {/* Tab toggle */}
      <div style={{ display:"flex", background:T.s1, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
        {[["link","LIEN",<IconLink/>],["upload","FICHIER",<IconUpload/>]].map(([t,l,ic]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex:1, padding:"11px 0", background:tab===t?T.s3:"transparent",
            border:"none", borderRight:t==="link"?`1px solid ${T.border}`:"none",
            cursor:"pointer", fontFamily:T.mono, fontSize:11, letterSpacing:1,
            color:tab===t?T.text:T.muted, transition:"all .15s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}>
            {ic} {l}
          </button>
        ))}
      </div>

      {/* Source */}
      <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:12, padding:22 }}>
        <div style={{ fontFamily:T.mono, fontSize:10, letterSpacing:2, color:T.amber, marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
          {ls.source_audio} <div style={{ flex:1, height:1, background:T.border }}/>
        </div>
        {tab==="link" ? (
          <div>
            <input value={url} onChange={e=>setUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/…"
              style={{ width:"100%", background:T.s2, border:`1px solid ${url?accent+"66":T.border}`, borderRadius:8, padding:"11px 14px", fontFamily:T.mono, fontSize:11, color:T.text, outline:"none", transition:"border-color .2s" }}/>
            <div style={{ display:"flex", gap:8, marginTop:10 }}>
              {[
                { name:"Spotify",    color:"#1DB954" },
                { name:"YouTube",    color:"#FF0000" },
                { name:"SoundCloud", color:"#FF5500" },
                { name:"Deezer",     color:"#A238FF" },
              ].map(p => (
                <span key={p.name} onClick={() => setUrl(`https://${p.name.toLowerCase()}.com/`)}
                  style={{ fontFamily:T.mono, fontSize:10, padding:"3px 9px", borderRadius:4,
                  background:`${p.color}12`, border:`1px solid ${p.color}40`,
                  color:T.muted, cursor:"pointer", transition:"all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${p.color}22`; e.currentTarget.style.color = T.text; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${p.color}12`; e.currentTarget.style.color = T.muted; }}
                >{p.name}</span>
              ))}
            </div>
          </div>
        ) : (
          <div
            onDragOver={e=>{e.preventDefault();setDrag(true)}}
            onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);if(e.dataTransfer.files[0])handleFile(e.dataTransfer.files[0])}}
            onClick={()=>fileInputRef.current?.click()}
            style={{ border:`1px dashed ${drag?T.amber:file?accent:T.border}`, borderRadius:10, padding:"14px 16px",
              display:"flex", alignItems:"center", gap:12, cursor:"pointer",
              transition:"all .2s", background:drag?T.amberGlow:"transparent" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.aiff,.aif,.flac,.m4a,.ogg"
              style={{ display:"none" }}
              onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
            />
            <IconWaveUpload c={file?accent:T.muted} s={20}/>
            {file
              ? <><div style={{fontFamily:T.body,fontWeight:400,fontSize:13,color:accent,flex:1}}>{fileName}</div><IconCheckCircle c={accent} s={18}/></>
              : <><div style={{flex:1}}><div style={{fontFamily:T.body,fontWeight:400,fontSize:13,color:T.muted}}>Glisser le fichier ici ou cliquer</div><div style={{fontFamily:T.mono,fontSize:10,color:T.muted2,marginTop:2}}>WAV · AIFF · MP3 · FLAC — 50 MB max</div></div></>
            }
          </div>
        )}
      </div>

      {/* DAW */}
      <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:12, padding:22 }}>
        <div style={{ fontFamily:T.mono, fontSize:10, letterSpacing:2, color:T.amber, marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
          {ls.ton_daw} <div style={{ flex:1, height:1, background:T.border }}/>
        </div>
        <div style={{ position:"relative" }}>
          <select
            value={daw || ""}
            onChange={e => setDaw(e.target.value || null)}
            style={{
              width:"100%", background:T.s2,
              border:`1px solid ${daw ? T.amber : T.border}`,
              borderRadius:8, padding:"11px 40px 11px 14px",
              fontFamily:T.mono, fontSize:11, color: daw ? T.text : T.muted,
              outline:"none", cursor:"pointer", appearance:"none",
              transition:"border-color .2s",
            }}
          >
            <option value="" style={{ background:T.s2, color:T.muted }}>Choisir un DAW…</option>
            {DAWS.map(d => (
              <option key={d} value={d} style={{ background:T.s1, color:T.text }}>{d}</option>
            ))}
          </select>
          {/* Custom chevron */}
          <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4 L6 8 L10 4" stroke={daw ? T.amber : T.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button onClick={handleAnalyze} disabled={!ok || uploading} style={{
        width:"100%", padding:"14px 16px",
        background:ok?`linear-gradient(135deg, ${T.amber}, ${T.orange})`:T.s2,
        border:`1px solid ${ok?T.amber:T.border}`, borderRadius:10,
        cursor:ok?"pointer":"not-allowed",
        fontFamily:T.body, fontWeight:600, fontSize:13, letterSpacing:1.5,
        textTransform:"uppercase",
        color:ok?T.black:T.muted, transition:"all .2s",
        boxShadow:ok?`0 4px 24px rgba(245,160,0,.3)`:"none",
      }}>{uploading ? "Préparation…" : ok ? (isRef ? ls.analyze_btn : ls.analyze_btn_perso) : (ls.complete_fields || "Compléter les champs")}</button>
    </div>
  );
};

/* ── LOADING ─────────────────────────────────────────────── */
const LoadingScreen = ({ onDone }) => {
  const [phase, setPhase] = useState(0);
  const steps = ["Analyse spectrale…","Identification des éléments…","Reconstruction chaîne de traitement…","Matching des plugins…","Génération de la fiche…"];
  useEffect(() => {
    const id = setInterval(() => setPhase(p => {
      if (p >= steps.length - 1) { clearInterval(id); setTimeout(onDone, 500); return p; }
      return p + 1;
    }), 720);
    return () => clearInterval(id);
  }, []);
  const bars = Array.from({length:32},()=>Math.random());
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 58px)", gap:34 }}>
      <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:70, width:180 }}>
        {bars.map((h,i) => <div key={i} style={{ flex:1, background:`linear-gradient(to top, ${T.amber}, ${T.orange}44)`, borderRadius:"2px 2px 0 0",
          animation:`barrise ${.3+h*.4}s ease ${i*.025}s alternate infinite`, transformOrigin:"bottom", height:`${20+h*80}%` }}/>)}
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:T.display, fontSize:42, letterSpacing:6, color:T.amber, marginBottom:10 }}>ANALYSE</div>
        <div style={{ fontFamily:T.mono, fontSize:13, color:T.muted }}>{steps[phase]}<span style={{animation:"blink 1s infinite"}}>_</span></div>
      </div>
      <div style={{ display:"flex", gap:7 }}>
        {steps.map((_,i) => <div key={i} style={{ width:i<=phase?20:6, height:6, borderRadius:3, background:i<=phase?T.amber:T.border, transition:"all .3s" }}/>)}
      </div>
    </div>
  );
};

/* ── CATEGORY ICONS ─────────────────────────────────────── */
const IconBass = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 14 Q2 4 9 4 Q16 4 16 9 Q16 14 9 14" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <circle cx="5" cy="14" r="1.5" fill={T.amber}/>
    <line x1="2" y1="14" x2="2" y2="16" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconDrums = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <ellipse cx="9" cy="7" rx="6" ry="2.5" stroke={T.amber} strokeWidth="1.4" fill="none"/>
    <line x1="3" y1="7" x2="3" y2="13" stroke={T.amber} strokeWidth="1.4"/>
    <line x1="15" y1="7" x2="15" y2="13" stroke={T.amber} strokeWidth="1.4"/>
    <ellipse cx="9" cy="13" rx="6" ry="2.5" stroke={T.amber} strokeWidth="1.4" fill="none"/>
    <line x1="6" y1="3" x2="8" y2="7" stroke={T.amber} strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
    <line x1="12" y1="3" x2="10" y2="7" stroke={T.amber} strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
  </svg>
);
const IconSynth = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="6" width="14" height="8" rx="1.5" stroke={T.amber} strokeWidth="1.4" fill="none"/>
    {[4,6,8,10,12,14].map((x,i) => <line key={i} x1={x} y1="6" x2={x} y2="14" stroke={T.amber} strokeWidth="0.8" opacity="0.35"/>)}
    {[5,8,11].map((x,i) => <rect key={i} x={x} y="6" width="1.8" height="5" rx="0.5" fill={T.amber} opacity="0.7"/>)}
  </svg>
);
const IconFX = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 11 Q5 4 9 9 Q13 14 16 7" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <circle cx="9" cy="9" r="1.2" fill={T.amber}/>
    <path d="M2 14 Q5 11 9 13 Q13 15 16 12" stroke={T.amber} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35"/>
  </svg>
);
const IconLevel = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    {[2,5,8,11,14].map((x,i) => {
      const h = [6,10,14,8,4][i];
      return <rect key={i} x={x} y={16-h} width="2.5" height={h} rx="1" fill={T.amber} opacity={0.3+i*0.15}/>;
    })}
    <line x1="2" y1="7" x2="16" y2="7" stroke={T.red} strokeWidth="1" strokeDasharray="2 2" opacity="0.7"/>
  </svg>
);
const IconMids = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 9 Q5 9 6 5 Q7 1 9 9 Q11 17 12 13 Q13 9 16 9" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <circle cx="9" cy="9" r="1.5" fill={T.amber} opacity="0.4"/>
  </svg>
);
const IconStereo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <line x1="9" y1="2" x2="9" y2="16" stroke={T.amber} strokeWidth="1" opacity="0.3" strokeDasharray="2 2"/>
    <path d="M2 9 Q5 5 9 9" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M16 9 Q13 5 9 9" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M2 9 Q5 13 9 9" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
    <path d="M16 9 Q13 13 9 9" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
  </svg>
);

const CAT_ICONS = { bass:<IconBass/>, drums:<IconDrums/>, synths:<IconSynth/>, fx:<IconFX/>, lufs:<IconLevel/>, mids:<IconMids/>, stereo:<IconStereo/> };

const IconLink = ({c=T.muted,sz=14}) => (
  <svg width={sz} height={sz} viewBox="0 0 14 14" fill="none">
    <path d="M5.5 8.5 Q3 8.5 3 6 Q3 3.5 5.5 3.5 L7 3.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M8.5 5.5 Q11 5.5 11 8 Q11 10.5 8.5 10.5 L7 10.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="5" y1="7" x2="9" y2="7" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconUpload = ({c=T.muted,sz=14}) => (
  <svg width={sz} height={sz} viewBox="0 0 14 14" fill="none">
    <path d="M7 9 L7 2 M4.5 4.5 L7 2 L9.5 4.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 10 L2 12 L12 12 L12 10" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── UI ICONS ───────────────────────────────────────────── */
const IconTarget = ({c=T.cyan,sz=20}) => (
  <svg width={sz} height={sz} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.4"/>
    <circle cx="10" cy="10" r="4.5" stroke={c} strokeWidth="1.4"/>
    <circle cx="10" cy="10" r="1.5" fill={c}/>
    <line x1="10" y1="1" x2="10" y2="4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="10" y1="16" x2="10" y2="19" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="1" y1="10" x2="4" y2="10" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="16" y1="10" x2="19" y2="10" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconScope = ({c=T.green,sz=20}) => (
  <svg width={sz} height={sz} viewBox="0 0 20 20" fill="none">
    <circle cx="8.5" cy="8.5" r="5.5" stroke={c} strokeWidth="1.4"/>
    <line x1="12.5" y1="12.5" x2="18" y2="18" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="6" y1="8.5" x2="11" y2="8.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
    <line x1="8.5" y1="6" x2="8.5" y2="11" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
  </svg>
);
const IconCheckCircle = ({c=T.green,sz=24}) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.5"/>
    <polyline points="7,12 10.5,15.5 17,9" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconWaveUpload = ({c=T.muted,sz=28}) => (
  <svg width={sz} height={sz} viewBox="0 0 28 28" fill="none">
    <path d="M14 20 L14 10 M10 14 L14 10 L18 14" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 18 Q6 12 8 16 Q10 20 12 14 Q14 8 16 14 Q18 20 20 16 Q22 12 24 18" stroke={c} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/>
  </svg>
);
const IconPlug = ({c=T.amber,sz=16}) => (
  <svg width={sz} height={sz} viewBox="0 0 16 16" fill="none">
    <rect x="5" y="8" width="6" height="5" rx="1.5" stroke={c} strokeWidth="1.3"/>
    <line x1="7" y1="3" x2="7" y2="8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="9" y1="3" x2="9" y2="8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="8" y1="13" x2="8" y2="15" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const IconBulb = ({c=T.amber,sz=14}) => (
  <svg width={sz} height={sz} viewBox="0 0 14 14" fill="none">
    <path d="M7 2 Q10.5 2 10.5 6 Q10.5 8.5 8.5 9.5 L8.5 11 L5.5 11 L5.5 9.5 Q3.5 8.5 3.5 6 Q3.5 2 7 2 Z" stroke={c} strokeWidth="1.2" fill="none"/>
    <line x1="5.5" y1="11" x2="8.5" y2="11" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="6" y1="12.5" x2="8" y2="12.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const IconPin = ({c=T.amber,sz=13}) => (
  <svg width={sz} height={sz} viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1 Q9.5 1 9.5 4.5 Q9.5 7 6.5 12 Q3.5 7 3.5 4.5 Q3.5 1 6.5 1 Z" stroke={c} strokeWidth="1.3" fill={`${c}22`}/>
    <circle cx="6.5" cy="4.5" r="1.5" fill={c}/>
  </svg>
);
const CONF = {
  measured: { label:"MESURÉ",    color:"#57CC99", desc:"Donnée objective mesurée sur le signal" },
  identified:{ label:"IDENTIFIÉ", color:"#48CAE4", desc:"Classification probable basée sur l'empreinte spectrale" },
  suggested: { label:"SUGGÉRÉ",   color:"#F5A000", desc:"Interprétation — une approche possible parmi d'autres" },
};

const REF_DATA = {
  title:"After Hours — The Weeknd", bpm:108, key:"La min", lufs:-8.2,
  elements:[
    { id:"bass", cat:"BASSES", icon:"bass",
      items:[
        { conf:"identified", label:"Type détecté : sub basse avec harmoniques basses", detail:"Empreinte spectrale centrée sous 60Hz avec transitoires longs. Cohérent avec une 808 ou sine wave synthétisée. L'attaque est quasi-nulle, le release long (700–900ms). Une légère saturation harmonique est détectée sur le bus.", tools:["Serum","Massive X","ES2"] },
        { conf:"identified", label:"Basse de liant filtrée — synthèse probable", detail:"Signal entre 60 et 120Hz, filtrage basse passe détecté. Résonance modérée. Pourrait être synthétisée ou samplée — impossible de trancher avec certitude. Compression détectée (ratio modéré).", tools:["Omnisphere","ES2","Analog Lab"] },
        { conf:"suggested", label:"Compression rythmique sur la basse — side-chain probable", detail:"Une réduction de niveau rythmique synchronisée avec le kick est perceptible. Cohérent avec un side-chain. Les paramètres exacts (ratio, temps) sont une estimation : attack ~5ms, release ~100–150ms.", tools:["FabFilter Pro-C 2","Logic Compressor"] },
      ]},
    { id:"drums", cat:"DRUMS", icon:"drums",
      items:[
        { conf:"measured", label:"Kick transient court, énergie concentrée entre 55–80Hz", detail:"Le kick est mesurable : fréquence fondamentale ~60Hz, transitoire sous 10ms, déclin rapide. Il s'agit vraisemblablement d'un sample — les irrégularités d'harmoniques excluent une synthèse pure.", tools:["Battery 4","Arcade","SP-404"] },
        { conf:"identified", label:"Hi-hats 16ème avec humanisation détectée", detail:"Vélocités variables mesurées — pas de répétition parfaite. Réverbe courte présente (~0.8s). L'origine exacte (sample, synthèse, live) ne peut pas être déterminée à l'écoute.", tools:["XO","Logic Drum Machine Designer"] },
        { conf:"suggested", label:"Réverbe courte sur bus drums — room probable", detail:"Un tail de réverbe court est perceptible sur l'ensemble du kit. Decay estimé à 1–1.5s. Une room ou une plate courte produiraient un effet similaire.", tools:["Valhalla Room","Space Designer","Seventh Heaven"] },
      ]},
    { id:"synths", cat:"SYNTHS", icon:"synths",
      items:[
        { conf:"identified", label:"Pad large avec détunage stéréo détecté", detail:"Spectre large, mouvement de chorus lent, légère modulation de pitch. Cohérent avec deux oscillateurs détunés de ±5–10 cents, panned L/R. Nombreux synthés peuvent produire cet effet — il s'agit d'une technique, pas d'un preset.", tools:["Omnisphere","Diva","Pigments","Vital"] },
        { conf:"suggested", label:"Lead arpégé — dent de scie filtrée probable", detail:"Timbre brillant avec harmoniques riches, pattern rythmique en 16ème. Une dent de scie avec filtre LP est une approche cohérente. Chorus + delay ping-pong détectés en FX. La synthèse exacte reste une hypothèse.", tools:["Serum","Pigments","Phase Plant"] },
        { conf:"suggested", label:"Harmonisation vocale — pitch shifting détecté", detail:"Des doublures vocales à la tierce et la quinte sont perceptibles. Un léger offset temporel (~15–25ms) crée l'épaisseur. Outil de pitch shifting probable — le modèle exact est indéterminable.", tools:["Melodyne","Harmony Engine","Waves Tune"] },
      ]},
    { id:"fx", cat:"FX & ESPACE", icon:"fx",
      items:[
        { conf:"measured", label:"Réverbe longue détectée sur la voix — decay ~4–5s", detail:"Le temps de réverbération est mesurable sur le signal vocal : decay entre 4 et 5 secondes, pre-delay estimé à 25–30ms. Filtrage haute-passe détecté sur le tail (énergie basse absente dans la réverbe).", tools:["Valhalla VintageVerb","Blackhole","Relab LX480"] },
        { conf:"measured", label:"Delay ping-pong synchronisé — ~139ms (1/8 @ 108 BPM)", detail:"Le delay est mesurable et synchronisé au tempo. Temps calculé : 1/8 note à 108 BPM = 138.9ms. Feedback estimé à 25–35%. Filtrage du signal retardé détecté.", tools:["Echoboy","H-Delay","Valhalla Delay"] },
        { conf:"suggested", label:"Saturation harmonique sur le bus — tape probable", detail:"Une légère distorsion harmonique paire est perceptible sur l'ensemble du mix. Cohérent avec une saturation tape légère. Cela peut aussi être le résultat d'une conversion analogique ou d'une compression agressive.", tools:["RC-20 Retro Color","Decapitator","Softube Tape"] },
      ]},
  ],
  chain:[
    {step:"INPUT",  label:"Source audio",          c:T.muted},
    {step:"GATE",   label:"Noise Gate probable",    c:T.cyan},
    {step:"EQ",     label:"HP ~40Hz + dip 400Hz",   c:T.amber},
    {step:"COMP",   label:"Compression ~4:1",        c:T.orange},
    {step:"SAT",    label:"Saturation harmonique",   c:"#E8A0F5"},
    {step:"REV",    label:"Hall ~4.5s",              c:T.cyan},
    {step:"OUT",    label:"Bus limiter",             c:T.green},
  ],
  plugins:[
    {name:"FabFilter Pro-Q 3",   role:"EQ — cohérent avec la courbe détectée", free:false, conf:"suggested"},
    {name:"Valhalla VintageVerb", role:"Réverbe hall — decay mesuré compatible",free:false, conf:"identified"},
    {name:"RC-20 Retro Color",   role:"Saturation tape — hypothèse probable",  free:false, conf:"suggested"},
    {name:"Serum / Vital",       role:"Synthèse lead — une approche possible",  free:false, conf:"suggested"},
    {name:"Native TDR Nova",     role:"EQ alternatif gratuit",                 free:true,  conf:"suggested"},
  ],
  tips:[
    "Poser le sub basse et le kick en premier — leur relation fréquentielle (side-chain) conditionne tout le groove. Ce point est mesuré, pas interprété.",
    "Pour approcher le pad : deux instances de synthé détunées de ±8 cents, panned L/R 70%, réverbe plate courte. C'est une direction, pas une recette exacte.",
    "Delay ping-pong sur le lead : 139ms à 108 BPM (mesure). Feedback ~30%, filtre HP — à ajuster à l'oreille.",
    "Master bus : limiter à -1dBTP, target LUFS -8 pour le streaming. Ce sont des mesures, pas des suppositions.",
  ],
};

const PERSO_DATA = {
  title:"Mon Mix V3 — Analyse personnelle", bpm:95, key:"Ré maj", lufs:-12.1,
  score:{MIX:68, BALANCE:74, FREQ:61, DYN:55},
  elements:[
    { id:"lufs", cat:"NIVEAU GLOBAL", icon:"lufs",
      items:[{ label:"LUFS trop bas — -12.1 mesuré", detail:"Sur Spotify, Apple Music et YouTube, la normalisation va monter ta prod automatiquement et introduire des artefacts. Target idéale : -9 à -10 LUFS intégré.", tools:["Youlean Loudness Meter","Pro-L 2"] }]},
    { id:"mids", cat:"FRÉQUENCES MIDS", icon:"mids",
      items:[{ label:"Accumulation 400–800Hz", detail:"Plusieurs éléments se superposent dans cette zone sans être différenciés. Résultat : manque d'air, sensation de boîte ou de voile sur le mix.", tools:["Pro-Q 3","Nova GE"] }]},
    { id:"bass", cat:"BASSE / KICK", icon:"bass",
      items:[{ label:"Conflit basse-kick non résolu", detail:"Les deux occupent la même zone fréquentielle sans side-chain ni séparation. Le kick disparaît dans le mix dès que la basse joue.", tools:["FabFilter Pro-C 2","Logic Compressor"] }]},
    { id:"stereo", cat:"ESPACE STÉRÉO", icon:"stereo",
      items:[{ label:"✓ Bonne largeur sur les éléments secondaires", detail:"Le champ stéréo est bien exploité — les éléments d'arrangement ont de la présence L/R sans écraser le centre.", tools:[] }]},
  ],
  plan:[
    {p:"HIGH", task:"Dip EQ -3dB @500Hz sur tous les éléments mid-range", daw:"Logic : Channel EQ → Bande 4 → Bell -3dB @500Hz"},
    {p:"HIGH", task:"Side-chain kick → basse : -6dB à chaque frappe", daw:"Logic : Compressor sur basse → External Side-Chain → Bus Kick"},
    {p:"MED",  task:"Remonter le niveau global — target -9 LUFS pour streaming", daw:"Logic : Limiter sur Master Bus → Output Ceiling -1dBTP"},
    {p:"MED",  task:"Pre-delay 20ms sur reverb vocale", daw:"Logic : Space Designer → Pre-Delay slider → 20ms"},
  ],
};

/* ── WAVEFORM + ZONE SELECTOR ───────────────────────────── */
const WAVE_BARS = [.3,.45,.6,.5,.8,.7,.95,.65,.4,.7,.85,.5,.3,.6,.9,.75,.8,.55,.4,.65,.7,.9,.8,.6,.5,.4,.7,.85,.6,.92,.7,.5,.4,.6,.82,.7,.9,.5,.3,.5,.72,.88,.6,.4,.35,.55,.75,.95,.85,.62,.5,.42,.35,.62,.82,.72,.9,.62,.44,.52,.74,.86,.64,.52,.42,.35,.64,.72,.85,.92,.74,.52,.42,.64,.84,.72,.52,.42,.33,.52];

const SECTIONS = [
  { id:"full",    label:"Tout",     start:0,   end:100, color:T.muted },
  { id:"intro",   label:"Intro",    start:0,   end:14,  color:"#48CAE4" },
  { id:"verse1",  label:"Couplet",  start:14,  end:38,  color:"#9B72CF" },
  { id:"chorus",  label:"Refrain",  start:38,  end:62,  color:T.amber   },
  { id:"bridge",  label:"Pont",     start:62,  end:76,  color:T.green   },
  { id:"outro",   label:"Outro",    start:76,  end:100, color:"#E8A0F5" },
];

// Zone-specific content variations (simulated per section)
const ZONE_OVERRIDES = {
  full:   { note:null },
  intro:  { note:"Intro — arrangement épuré : pad seul + basse sub. Drums absents. Reverb très longue pour l'espace.", highlight:["bass","fx"] },
  verse1: { note:"Couplet — entrée du kick et des hi-hats. Voix sèche au centre, harmonies légères.", highlight:["drums","synths"] },
  chorus: { note:"Refrain — densité maximale. Tous les éléments actifs, saturation tape poussée, compression plus agressive.", highlight:["bass","drums","synths","fx"] },
  bridge: { note:"Pont — réduction soudaine. Voix + piano seuls, reverb hall très longue, silence du kick.", highlight:["synths","fx"] },
  outro:  { note:"Outro — fade out progressif. Éléments qui disparaissent un par un. Sub basse en dernier.", highlight:["bass"] },
};

const pctToTime = (pct, totalSec=215) => {
  const s = Math.round((pct/100)*totalSec);
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
};

const WaveformZone = ({ zone, onZoneChange }) => {
  const [dragging, setDragging] = useState(false);
  const [dragAnchor, setDragAnchor] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0); // 0–100 pct

  const TOTAL = 215; // 3:35 simulated

  // Playback tick
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead(p => {
        if (p >= 100) { setPlaying(false); return 100; }
        return p + (100 / TOTAL / 10); // advance ~0.1s per tick
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing]);

  const getX = (e, clientX) => {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
  };

  const onDown = (e) => {
    const x = getX(e, e.touches ? e.touches[0].clientX : e.clientX);
    setDragging(true);
    setDragAnchor(x);
    onZoneChange({ start: Math.round(x), end: Math.round(x), id:"custom", label:"Zone personnalisée", color:T.amber });
  };
  const onMove = (e) => {
    if (!dragging) return;
    const x = getX(e, e.touches ? e.touches[0].clientX : e.clientX);
    const a = Math.min(dragAnchor, x), b = Math.max(dragAnchor, x);
    onZoneChange({ start: Math.round(a), end: Math.round(b), id:"custom", label:"Zone personnalisée", color:T.amber });
  };
  const onUp = () => setDragging(false);

  const seek = (e) => {
    const x = getX(e, e.clientX);
    setPlayhead(x);
  };

  const fmt = (pct) => {
    const s = Math.round((pct / 100) * TOTAL);
    return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  };

  const selW = zone.end - zone.start;

  // Transport icon SVGs
  const IconPlay  = () => <svg width="16" height="16" viewBox="0 0 16 16" fill={T.black}><polygon points="3,1 15,8 3,15"/></svg>;
  const IconPause = () => <svg width="16" height="16" viewBox="0 0 16 16" fill={T.black}><rect x="2" y="1" width="4" height="14" rx="1"/><rect x="10" y="1" width="4" height="14" rx="1"/></svg>;
  const IconRew   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill={T.muted}><polygon points="13,1 6,7 13,13"/><rect x="1" y="1" width="2" height="12" rx="1"/></svg>;
  const IconFwd   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill={T.muted}><polygon points="1,1 8,7 1,13"/><rect x="11" y="1" width="2" height="12" rx="1"/></svg>;
  const IconSkipB = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"><polyline points="9,2 3,7 9,12"/><polyline points="13,2 7,7 13,12"/></svg>;
  const IconSkipF = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"><polyline points="5,2 11,7 5,12"/><polyline points="1,2 7,7 1,12"/></svg>;

  return (
    <div style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:12, padding:20, userSelect:"none" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ fontFamily:T.mono, fontSize:10, letterSpacing:2, color:T.amber }}>ZONE D'ANALYSE</div>
        <div style={{ fontFamily:T.mono, fontSize:11, color: zone.id==="full" ? T.muted : T.amber }}>
          {zone.id==="full" ? "Morceau complet — 3:35" : `${fmt(zone.start)} → ${fmt(zone.end)}  ·  ${zone.label}`}
        </div>
      </div>

      {/* Section preset chips */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
        {SECTIONS.map(sec => (
          <button key={sec.id} onClick={() => onZoneChange(sec)} style={{
            fontFamily:T.mono, fontSize:10, padding:"4px 11px", borderRadius:20,
            border:`1px solid ${zone.id===sec.id ? sec.color : T.border}`,
            background: zone.id===sec.id ? `${sec.color}18` : T.s2,
            color: zone.id===sec.id ? sec.color : T.muted,
            cursor:"pointer", transition:"all .15s",
          }}>{sec.label}</button>
        ))}
      </div>

      {/* Waveform */}
      <div
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        style={{ position:"relative", height:64, cursor:"crosshair", borderRadius:8, overflow:"hidden", background:T.s2 }}
      >
        {/* Bars */}
        <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", alignItems:"flex-end", gap:1, padding:"4px 4px" }}>
          {WAVE_BARS.map((h,i) => {
            const pct = (i / WAVE_BARS.length) * 100;
            const inSel = zone.id !== "full" && pct >= zone.start && pct <= zone.end;
            const played = pct <= playhead;
            let bg;
            if (inSel && played)       bg = zone.color || T.amber;
            else if (inSel && !played) bg = `${zone.color || T.amber}99`;
            else if (!inSel && played) bg = "rgba(255,255,255,0.4)";
            else                       bg = "rgba(255,255,255,0.18)";
            return (
              <div key={i} style={{
                flex:1,
                height: Math.max(3, h * 52),
                background: bg,
                borderRadius:2,
                transition:"background .15s",
              }}/>
            );
          })}
        </div>

        {/* Zone selection handles */}
        {selW > 1 && (
          <>
            <div style={{ position:"absolute", top:0, bottom:0, left:`${zone.start}%`, width:2, background:zone.color||T.amber, borderRadius:1 }}/>
            <div style={{ position:"absolute", top:0, bottom:0, left:`${zone.end}%`, width:2, background:zone.color||T.amber, borderRadius:1 }}/>
            <div style={{ position:"absolute", top:0, bottom:0, left:`${zone.start}%`, right:`${100-zone.end}%`, background:`${zone.color||T.amber}18`, pointerEvents:"none" }}/>
          </>
        )}

        {/* Playhead — discrete white line */}
        <div style={{
          position:"absolute", top:0, bottom:0, left:`${playhead}%`,
          width:1.5, background:"rgba(255,255,255,0.75)",
          boxShadow:"0 0 6px rgba(255,255,255,0.4)",
          pointerEvents:"none", transition:"left .1s linear",
        }}>
          {/* Playhead handle */}
          <div style={{
            position:"absolute", top:-4, left:"50%", transform:"translateX(-50%)",
            width:8, height:8, borderRadius:"50%",
            background:"white", boxShadow:"0 0 6px rgba(255,255,255,0.6)",
          }}/>
        </div>

        {/* Clickable seek overlay — separate from drag zone */}
        <div
          onClick={seek}
          style={{ position:"absolute", top:0, left:0, right:0, bottom:0, cursor:"pointer" }}
          onMouseDown={e => e.stopPropagation()}
        />

        {/* Section label markers */}
        {SECTIONS.filter(sec=>sec.id!=="full").map(sec => (
          <div key={sec.id} style={{
            position:"absolute", top:3, left:`${sec.start}%`,
            fontFamily:T.mono, fontSize:7.5, color:`${sec.color}77`, letterSpacing:.5,
            pointerEvents:"none", paddingLeft:3,
          }}>{sec.label.toUpperCase()}</div>
        ))}
      </div>

      {/* ── TRANSPORT BAR ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        marginTop:14, gap:12,
      }}>
        {/* Time display */}
        <div style={{ fontFamily:T.mono, fontSize:11, color:T.muted, minWidth:72 }}>
          {fmt(playhead)} <span style={{color:T.muted2}}>/ {fmt(100)}</span>
        </div>

        {/* Controls */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Rewind to start */}
          <button onClick={() => { setPlayhead(0); setPlaying(false); }} style={{ background:"transparent", border:"none", cursor:"pointer", padding:6, borderRadius:6, display:"flex", alignItems:"center" }}>
            <IconRew/>
          </button>

          {/* -10s */}
          <button onClick={() => setPlayhead(p => Math.max(0, p - (10/TOTAL*100)))} style={{ background:"transparent", border:"none", cursor:"pointer", padding:6, borderRadius:6, display:"flex", alignItems:"center" }}>
            <IconSkipB/>
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => { if (playhead >= 100) setPlayhead(0); setPlaying(p => !p); }}
            style={{
              width:38, height:38, borderRadius:"50%",
              background:`linear-gradient(135deg, ${T.amber}, ${T.orange})`,
              border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:`0 2px 12px rgba(245,160,0,.35)`,
              flexShrink:0,
            }}
          >
            {playing ? <IconPause/> : <IconPlay/>}
          </button>

          {/* +10s */}
          <button onClick={() => setPlayhead(p => Math.min(100, p + (10/TOTAL*100)))} style={{ background:"transparent", border:"none", cursor:"pointer", padding:6, borderRadius:6, display:"flex", alignItems:"center" }}>
            <IconSkipF/>
          </button>

          {/* Forward to end */}
          <button onClick={() => { setPlayhead(100); setPlaying(false); }} style={{ background:"transparent", border:"none", cursor:"pointer", padding:6, borderRadius:6, display:"flex", alignItems:"center" }}>
            <IconFwd/>
          </button>
        </div>

        {/* Drag hint */}
        <div style={{ fontFamily:T.mono, fontSize:9, color:T.muted2, textAlign:"right", minWidth:72 }}>
          Glisser pour<br/>sélectionner
        </div>
      </div>

    </div>
  );
};

/* ── ELEMENT DETAIL DRAWER ──────────────────────────────── */
/* ── ELEMENT DETAIL MODAL (centré, marges tout autour) ─── */
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <line x1="1" y1="1" x2="13" y2="13" stroke={T.muted} strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="13" y1="1" x2="1" y2="13" stroke={T.muted} strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

// Knowledge base extraite de Puremix — injectée selon la catégorie de l'élément
const LEVELS = [
  { id:"beginner",     label:"Je débute",     desc:"Explications pas à pas, sans suppositions" },
  { id:"intermediate", label:"Intermédiaire", desc:"Je connais les bases, guide-moi" },
  { id:"advanced",     label:"Avancé",        desc:"Chemin le plus court, vocabulaire technique" },
];

const KNOWLEDGE_BASE = {
  compression: [
    {
      title: "Compression Fundamentals",
      summary: "Compression is an automatic gain-riding device that reduces peaks dynamically. Beyond level control, it shapes tone and character. Understanding it requires developing taste through comparative listening.",
      techniques: ["Automatic Gain Riding — threshold, ratio, attack, release", "Peak Management — tuck peaks to raise quieter details", "Tonal Shaping — gentle preserves dynamics, heavy reshapes tone", "Vision-First — establish desired character before touching controls", "A/B Assessment — bypass to evaluate impact on transients and sustain"]
    },
    {
      title: "Advanced Compressor Controls",
      summary: "Soft Knee, Look Ahead, sidechain EQ, and dry/wet ratio are powerful tools for precise dynamic control. Understanding them goes beyond default settings.",
      techniques: ["Soft Knee — gradual compression onset for transparent control", "Look Ahead — prevents transient distortion by anticipating peaks", "Sidechain EQ — filter the detection signal to ignore low-end pumping", "Dry/Wet Parallel — blend compressed and dry for New York compression"]
    },
    {
      title: "Compression Topology",
      summary: "Build a personal library of familiar compressors whose sonic characteristics you understand deeply. Cross-source testing reveals each compressor's true character.",
      techniques: ["Reference Library — master 3-4 compressors deeply rather than collecting many", "Cross-Source Testing — same compressor on different sources reveals true character"]
    },
  ],
  eq: [
    {
      title: "EQ Strategy and Philosophy",
      summary: "EQ is corrective and creative. Subtractive EQ first removes problematic frequencies before additive EQ enhances. Every cut or boost affects phase and tone character.",
      techniques: ["Subtractive First — cut problems before boosting", "High-pass filtering — remove low-end buildup on non-bass elements", "Frequency relationships — cutting one element creates space for another", "Dynamic EQ — frequency-specific compression for context-sensitive control"]
    },
  ],
  reverb: [
    {
      title: "Creating Space with Reverbs",
      summary: "Reverb creates depth and dimension. Pre-delay separates the source from its room, preserving clarity while adding space. Different reverb types serve different spatial purposes.",
      techniques: ["Pre-delay — 15-30ms separates source from tail, preserves intelligibility", "Room reverb — short decay for cohesion without washing out", "Hall reverb — long decay for grandeur, filter lows to avoid mud", "Reverb as mix glue — same space on multiple elements creates cohesion"]
    },
  ],
  dynamics: [
    {
      title: "Parallel Compression on Drums",
      summary: "Parallel compression blends a heavily compressed signal with the dry signal to add punch and density while preserving transient attack.",
      techniques: ["New York compression — send drums to aux, compress aggressively, blend back", "Attack fast on parallel — lets transients through on dry, adds body on compressed", "Ratio 10:1+ on parallel bus — crush it, the dry signal preserves the feel"]
    },
    {
      title: "Advanced Parallel Compression",
      summary: "Multiple parallel processing layers can address different aspects of the sound simultaneously — transient enhancement, density, and harmonic saturation.",
      techniques: ["Transient shaper in parallel — enhance attack without affecting sustain", "Saturation in parallel — add harmonics without committing to full saturation"]
    },
  ],
  routing: [
    {
      title: "Mix Bus Processing",
      summary: "Mix bus compression and processing should be applied early to make mix decisions with the glue in place. Light touch — the mix bus enhances, not corrects.",
      techniques: ["Low ratio on bus — 1.5:1 to 2:1 maximum for transparency", "Slow attack — lets transients through before compressing", "Bus glue early — reference against bus compression throughout mixing"]
    },
  ],
  mix: [
    {
      title: "Balancing Techniques",
      summary: "Balance is the foundation of all mixing. Relative levels between elements determine clarity and emotional impact more than any processing.",
      techniques: ["Start in mono — forces balance decisions without stereo masking", "Volume before processing — get the balance right before adding EQ or compression", "Reference constantly — compare against commercial tracks at matched levels"]
    },
  ],
};

/* ── PLUGINS DATABASE ────────────────────────────────────── */
const PLUGINS_DB = {
  eq: {
    label: "EQ",
    paid: [
      { name:"FabFilter Pro-Q 4",      brand:"FabFilter",  desc:"EQ de référence — dynamic EQ, linear phase, zero latency. Standard de l'industrie.", price:"~179€" },
      { name:"FabFilter Pro-Q 3",      brand:"FabFilter",  desc:"Version précédente, toujours standard. Même qualité sonore.", price:"~179€" },
      { name:"Waves Q10",              brand:"Waves",       desc:"EQ paramétrique classique, large adoption en studio.", price:"~30€" },
      { name:"Waves SSL E-Channel",    brand:"Waves",       desc:"Émulation console SSL 4000E — chaleur analogique, coloration.", price:"~30€" },
      { name:"Waves API 550A/550B",    brand:"Waves",       desc:"Émulation console API — punch et caractère sur les bus.", price:"~30€" },
      { name:"UAD Neve 1073",          brand:"Universal Audio", desc:"Émulation préamp/EQ Neve légendaire. Coloration vintage.", price:"~150€" },
      { name:"UAD API 560",            brand:"Universal Audio", desc:"EQ graphique 10 bandes API, couleur musicale.", price:"~150€" },
      { name:"iZotope Ozone EQ",       brand:"iZotope",    desc:"EQ avec matching spectral IA et analyse comparative.", price:"inclus Ozone" },
      { name:"Kirchhoff EQ",           brand:"Three-Body Technology", desc:"EQ moderne ultra-précis avec émulations analogiques.", price:"~129€" },
      { name:"Pultec EQP-1A",          brand:"Universal Audio", desc:"EQ à tubes vintage — boost/cut simultané pour la magie Pultec.", price:"~150€" },
      { name:"Sonnox Oxford EQ",       brand:"Sonnox",     desc:"EQ haute précision, favoris broadcast et mastering.", price:"~250€" },
    ],
    free: [
      { name:"TDR Nova",               brand:"Tokyo Dawn",  desc:"EQ dynamique professionnel gratuit — qualité studio." },
      { name:"ReaEQ",                  brand:"Cockos (Reaper)", desc:"EQ paramétrique solide, inclus dans Reaper, utilisable partout." },
      { name:"Voxengo Marvel GEQ",     brand:"Voxengo",    desc:"EQ graphique 16 bandes de qualité professionnelle." },
      { name:"MEqualizer",             brand:"MeldaProduction", desc:"EQ paramétrique 6 bandes clean et précis." },
      { name:"Blue Cat's Triple EQ",   brand:"Blue Cat Audio", desc:"EQ 3 bandes simple et efficace, zéro latence." },
    ],
  },
  compression: {
    label: "Compression",
    paid: [
      { name:"FabFilter Pro-C 2",      brand:"FabFilter",  desc:"Compresseur de référence — 8 modes (Clean, Classic, Opto, Vocal…), sidechain EQ intégré.", price:"~179€" },
      { name:"Waves CLA-76",           brand:"Waves",       desc:"Émulation 1176 FET — attaque ultrarapide, punch sur drums/basse.", price:"~30€" },
      { name:"Waves CLA-2A",           brand:"Waves",       desc:"Émulation LA-2A opto — douceur sur voix et basse.", price:"~30€" },
      { name:"Waves SSL G-Master Buss",brand:"Waves",       desc:"Compresseur de bus SSL G — glue légendaire sur le mix bus.", price:"~30€" },
      { name:"Waves API 2500",         brand:"Waves",       desc:"Compresseur API — ton agressif et punchy, drums/bus.", price:"~30€" },
      { name:"UAD 1176 Classic",       brand:"Universal Audio", desc:"Émulation 1176 Rev A — le compresseur FET de référence.", price:"~150€" },
      { name:"UAD LA-2A",              brand:"Universal Audio", desc:"Compresseur opto vintage, transparent et musical sur voix.", price:"~150€" },
      { name:"UAD Neve 33609",         brand:"Universal Audio", desc:"Compresseur/limiteur Neve broadcast — glue analogique.", price:"~150€" },
      { name:"UAD SSL G-Bus",          brand:"Universal Audio", desc:"Bus compressor SSL en émulation UAD — référence absolue.", price:"~150€" },
      { name:"iZotope Neutron Compressor", brand:"iZotope", desc:"Compresseur avec assistant IA — analyse spectrale et suggestions.", price:"inclus Neutron" },
      { name:"Klanghelm MJUC",         brand:"Klanghelm",  desc:"Compresseur à tubes vintage — chaleur exceptionnelle.", price:"~40€" },
      { name:"Softube Tube-Tech CL 1B",brand:"Softube",    desc:"Émulation compresseur opto Tube-Tech — voix et instruments.", price:"~199€" },
      { name:"Eventide Omnipressor",   brand:"Eventide",   desc:"Compresseur/gate/expander créatif — expansion dynamique unique.", price:"~99€" },
    ],
    free: [
      { name:"TDR Kotelnikov",         brand:"Tokyo Dawn",  desc:"Compresseur de mastering transparent — qualité commerciale gratuite." },
      { name:"Variety of Sound BootEQ/Density",brand:"VoS", desc:"Suite vintage analogique gratuite — compresseurs colorés." },
      { name:"DC1A",                   brand:"Klanghelm",  desc:"Compresseur 2 boutons, son musical immédiat." },
      { name:"MCompressor",            brand:"MeldaProduction", desc:"Compresseur transparent et précis avec visualisation." },
      { name:"OldSkoolVerb/MJUC Jr",   brand:"Klanghelm",  desc:"Version lite de MJUC — chaleur analogique gratuite." },
    ],
  },
  reverb: {
    label: "Réverbe & Delay",
    paid: [
      { name:"Valhalla Room",          brand:"Valhalla DSP", desc:"Réverbe room algorithmique de référence — dense, musicale, pas chère.", price:"~50€" },
      { name:"Valhalla Vintage Verb",  brand:"Valhalla DSP", desc:"Émulation réverbes hardware vintage (EMT, AMS) — son des années 80/90.", price:"~50€" },
      { name:"Valhalla Plate",         brand:"Valhalla DSP", desc:"Émulation plates analogiques — chaud, dense, vocal.", price:"~50€" },
      { name:"Valhalla Delay",         brand:"Valhalla DSP", desc:"Delay multi-mode (tape, BBD, digital) — très musical.", price:"~50€" },
      { name:"Valhalla Shimmer",       brand:"Valhalla DSP", desc:"Réverbe avec pitch-shift — ambiances cinématiques et textures.", price:"~50€" },
      { name:"FabFilter Pro-R 2",      brand:"FabFilter",  desc:"Réverbe paramétrique — contrôle précis du spectre, decay par fréquence.", price:"~199€" },
      { name:"Waves H-Reverb",         brand:"Waves",       desc:"Réverbe hybride IR+algo — flexibilité maximale.", price:"~30€" },
      { name:"Waves Manny Marroquin Reverb", brand:"Waves", desc:"Réverbe de Manny Marroquin — pré-configurée pro.", price:"~30€" },
      { name:"Lexicon PCM Native Reverb Bundle", brand:"Lexicon", desc:"Sons de reverb légendaires — standard broadcast et cinéma.", price:"~200€" },
      { name:"UAD AMS RMX16",          brand:"Universal Audio", desc:"Émulation réverbe digital AMS des années 80 — son iconique.", price:"~150€" },
      { name:"EchoBoy",                brand:"SoundToys",  desc:"Delay premium — 30+ types, saturation tape intégrée.", price:"~199€" },
      { name:"Little AlterBoy",        brand:"SoundToys",  desc:"Formant et pitch shift voix — transformations créatives.", price:"~99€" },
      { name:"Eventide H3000",         brand:"Eventide",   desc:"Modulation/delay/pitch — effets signature Eventide.", price:"~199€" },
    ],
    free: [
      { name:"Valhalla Supermassive",  brand:"Valhalla DSP", desc:"Réverbe/delay massif — Valhalla gratuit, qualité professionnelle." },
      { name:"Valhalla Space Modulator",brand:"Valhalla DSP",desc:"Flanger/chorus/réverbe — modulations créatives gratuites." },
      { name:"OrilRiver",              brand:"Denis Tihanov", desc:"Réverbe algorithmique gratuite de qualité surprenante." },
      { name:"Dragonfly Reverb",       brand:"Michael Willis", desc:"Suite de 4 réverbes gratuites (Room, Hall, Plate, Vintage)." },
      { name:"TAL-Reverb-4",           brand:"TAL Software", desc:"Réverbe vintage de qualité — son analogique gratuit." },
    ],
  },
  saturation: {
    label: "Saturation & Distorsion",
    paid: [
      { name:"FabFilter Saturn 2",     brand:"FabFilter",  desc:"Saturation multiband — 28 modes, saturation fréquence par fréquence.", price:"~179€" },
      { name:"Waves Abbey Road Saturator", brand:"Waves",  desc:"Saturation analogique Abbey Road — chaleur tape vintage.", price:"~30€" },
      { name:"Waves J37 Tape",         brand:"Waves",       desc:"Émulation magnétophone J37 — saturation tape EMI vintage.", price:"~30€" },
      { name:"SoundToys Decapitator",  brand:"SoundToys",  desc:"Saturation analogique 5 modes (A, E, N, T, Brit) — distorsion musicale.", price:"~199€" },
      { name:"SoundToys Devil-Loc",    brand:"SoundToys",  desc:"Compression/saturation destructive — drums agressifs.", price:"~99€" },
      { name:"UAD Studer A800",        brand:"Universal Audio", desc:"Émulation magnétophone multi-piste Studer — saturation tape pro.", price:"~300€" },
      { name:"UAD Ampex ATR-102",      brand:"Universal Audio", desc:"Émulation machine à bande mastering — douceur et chaleur.", price:"~150€" },
      { name:"iZotope Trash 2",        brand:"iZotope",    desc:"Distorsion creative multiband — de subtil à extrême.", price:"~99€" },
      { name:"Softube Tape",           brand:"Softube",    desc:"Saturation tape haut de gamme — émulation mécanique réaliste.", price:"~99€" },
    ],
    free: [
      { name:"Klanghelm IVGI",         brand:"Klanghelm",  desc:"Saturation analogique subtile — idéale sur chaque piste." },
      { name:"Softube Saturation Knob",brand:"Softube",    desc:"1 knob, 3 modes — saturation instantanée professionnelle." },
      { name:"TAL-DAC",                brand:"TAL Software", desc:"Bit crusher/saturation vintage — lo-fi créatif." },
      { name:"Vinyl Distortion",       brand:"iZotope (gratuit)", desc:"Émulation vinyle avec crackle et saturation." },
    ],
  },
  dynamics: {
    label: "Dynamique & Transients",
    paid: [
      { name:"FabFilter Pro-MB",       brand:"FabFilter",  desc:"Compresseur/expander multibande — précision fréquentielle totale.", price:"~179€" },
      { name:"FabFilter Pro-G",        brand:"FabFilter",  desc:"Gate/expander de référence — visualisation claire, formes variées.", price:"~179€" },
      { name:"Waves Transient Master", brand:"Waves",       desc:"Contrôle attaque/sustain en temps réel — drums et percussions.", price:"~30€" },
      { name:"Waves C6 Multiband",     brand:"Waves",       desc:"Compresseur multibande 6 bandes — maîtrise spectrale totale.", price:"~30€" },
      { name:"iZotope RX",             brand:"iZotope",    desc:"Suite de restauration audio — débruitage, décraquage, dialogue.", price:"~400€" },
      { name:"Sonnox Oxford Dynamics", brand:"Sonnox",      desc:"Compresseur/gate/limiter/expander — tout en un pro.", price:"~300€" },
      { name:"SPL Transient Designer", brand:"SPL",         desc:"Façonnage transient original — attaque/sustain indépendants.", price:"~150€" },
    ],
    free: [
      { name:"TDR Limiter 6 GE (free version)", brand:"Tokyo Dawn", desc:"Limiteur multistage de mastering — qualité commerciale." },
      { name:"Frontier",               brand:"D16 Group",  desc:"Limiteur brickwall transparent — protection crêtes gratuite." },
      { name:"MTransient",             brand:"MeldaProduction", desc:"Transient shaper précis — attaque/sustain par bande de fréquence." },
    ],
  },
  mastering: {
    label: "Mastering",
    paid: [
      { name:"iZotope Ozone 11",       brand:"iZotope",    desc:"Suite mastering tout-en-un avec IA — référence du mastering moderne.", price:"~350€" },
      { name:"FabFilter Pro-L 2",      brand:"FabFilter",  desc:"Limiteur de mastering de référence — transparent, modes multiples.", price:"~179€" },
      { name:"Waves L2 Ultramaximizer",brand:"Waves",       desc:"Limiteur légendaire — standard de l'industrie depuis 25 ans.", price:"~30€" },
      { name:"Waves MaxxVolume",       brand:"Waves",       desc:"Contrôle dynamique intelligent pour le bus master.", price:"~30€" },
      { name:"Sonnox Oxford Limiter",  brand:"Sonnox",      desc:"Limiteur mastering haute fidélité — transparent et précis.", price:"~250€" },
      { name:"Weiss DS1-MK3",          brand:"Weiss",       desc:"Compresseur/de-esser hardware mastering — référence absolue.", price:"~500€" },
      { name:"T-RackS 5 Suite",        brand:"IK Multimedia", desc:"Suite mastering complète — émulations hardware analogiques.", price:"~300€" },
    ],
    free: [
      { name:"TDR Limiter 6",          brand:"Tokyo Dawn",  desc:"Limiteur mastering multistage — qualité commerciale, 100% gratuit." },
      { name:"Youlean Loudness Meter", brand:"Youlean",    desc:"Analyse LUFS temps réel — indispensable pour le mastering streaming." },
      { name:"SPAN",                   brand:"Voxengo",    desc:"Analyseur spectral de référence — utilisé par tous les pros." },
    ],
  },
  stereo: {
    label: "Stéréo & Imaging",
    paid: [
      { name:"iZotope Imager",         brand:"iZotope",    desc:"Largeur stéréo multibande — imagerie précise par fréquence.", price:"inclus Ozone" },
      { name:"Waves S1 Stereo Imager", brand:"Waves",       desc:"Élargisseur stéréo classique — contrôle simple et efficace.", price:"~30€" },
      { name:"Waves Center",           brand:"Waves",       desc:"Séparation centre/côtés — contrôle M/S intuitif.", price:"~30€" },
      { name:"FabFilter Pro-Q 4 (M/S mode)", brand:"FabFilter", desc:"EQ en mode M/S — traitement indépendant mid et sides.", price:"~179€" },
      { name:"Brauer Motion",          brand:"Waves",       desc:"Auto-pan créatif de Michael Brauer — mouvement stéréo organique.", price:"~30€" },
    ],
    free: [
      { name:"MSED",                   brand:"Voxengo",    desc:"Encodeur/décodeur M/S — Mid-Side processing gratuit." },
      { name:"MSpectralAnalyzer",      brand:"MeldaProduction", desc:"Analyse stéréo et corrélation de phase gratuite." },
    ],
  },
  creative: {
    label: "Effets créatifs",
    paid: [
      { name:"SoundToys 5 Bundle",     brand:"SoundToys",  desc:"Suite effets créatifs complète — FilterFreak, PanMan, Tremolator, Crystallizer…", price:"~399€" },
      { name:"Waves Enigma",           brand:"Waves",       desc:"Modulateur/résonateur — textures créatives uniques.", price:"~30€" },
      { name:"Eventide H9",            brand:"Eventide",   desc:"Multi-effet signature Eventide — pitch, delay, reverb, distorsion.", price:"~399€" },
      { name:"Output Portal",          brand:"Output",     desc:"Granulaire temps réel — transformations sonores spectaculaires.", price:"~99€" },
      { name:"Arturia FX Collection",  brand:"Arturia",    desc:"Suite effets vintage hardware émulés — Bucket Brigade, Spring…", price:"~250€" },
    ],
    free: [
      { name:"TAL-Chorus-LX",          brand:"TAL Software", desc:"Émulation chorus Juno-60 — vintage analogique gratuit." },
      { name:"Valhalla Freq Echo",     brand:"Valhalla DSP", desc:"Delay fréquentiel psychédélique — effets espace créatifs." },
      { name:"MFreqShifter",           brand:"MeldaProduction", desc:"Frequency shifter créatif — effets uniques sur sons et voix." },
    ],
  },
};

const INSTRUMENTS_DB = {
  synth_subtractive: {
    label: "Synthèse soustractive",
    paid: [
      { name:"Serum",                  brand:"Xfer Records",    desc:"Standard wavetable moderne — son de référence EDM/pop.", price:"~200€" },
      { name:"Vital",                  brand:"Matt Tytel",      desc:"Alternative Serum — wavetable de haute qualité, version gratuite disponible.", price:"Freemium" },
      { name:"Sylenth1",               brand:"LennarDigital",   desc:"Soustractif analogique virtuel — chaleur et punch légendaires.", price:"~170€" },
      { name:"Massive X",              brand:"Native Instruments", desc:"Wavetable moderne NI — sons complexes et évolutifs.", price:"inclus Komplete" },
      { name:"Massive",                brand:"Native Instruments", desc:"Le wavetable qui a défini le son dubstep/EDM 2010s.", price:"inclus Komplete" },
      { name:"Moog Subsequent 37 (plugin)", brand:"Moog",       desc:"Émulation Moog — basses et leads analogiques authentiques.", price:"~300€" },
      { name:"Arturia MiniMoog V",     brand:"Arturia",         desc:"Émulation Minimoog — basses et leads vintage de référence.", price:"inclus V Collection" },
      { name:"Arturia Prophet-5 V",    brand:"Arturia",         desc:"Émulation Sequential Prophet-5 — polysynth vintage riche.", price:"inclus V Collection" },
      { name:"Arturia Juno-106 V",     brand:"Arturia",         desc:"Émulation Roland Juno-106 — chorus signature, pads chauds.", price:"inclus V Collection" },
      { name:"Arturia Jupiter-8 V",    brand:"Arturia",         desc:"Émulation Roland Jupiter-8 — le polysynth analogique ultime.", price:"inclus V Collection" },
      { name:"u-he Diva",              brand:"u-he",            desc:"Émulation analogique ultra-réaliste — le plus précis du marché.", price:"~179€" },
      { name:"u-he Repro-1 / Repro-5", brand:"u-he",           desc:"Émulation Pro-One et Prophet-5 — fidélité analogique maximale.", price:"~99€" },
      { name:"u-he Hive 2",            brand:"u-he",            desc:"Soustractif moderne rapide — son immédiat et polyvalent.", price:"~149€" },
      { name:"Omnisphere 2",           brand:"Spectrasonics",   desc:"Bibliothèque de sons massive — synthèse hybride unique.", price:"~500€" },
    ],
    free: [
      { name:"Vital",                  brand:"Matt Tytel",      desc:"Wavetable synth professionnel — version gratuite très complète." },
      { name:"Surge XT",               brand:"Surge Synth Team", desc:"Open-source wavetable — énorme preset bank, qualité pro." },
      { name:"OB-Xd",                  brand:"discoDSP",        desc:"Émulation Oberheim OB-X gratuite — son analogique vintage." },
      { name:"Helm",                   brand:"Matt Tytel",      desc:"Précurseur de Vital — soustractif gratuit solide." },
    ],
    daw_native: {
      "Logic Pro":    ["ES2 (soustractif polyvalent)", "Retro Synth (vintage analogique/FM/wavetable)", "ES1 (basses analogiques)", "ES E (polysynth simple)"],
      "Ableton Live": ["Wavetable (wavetable moderne)", "Analog (émulation analogique)", "Operator (FM synthesis)", "Drift (monosynth analogique)"],
      "FL Studio":    ["Harmor (additive/resynthèse)", "Sytrus (FM avancé)", "3x OSC (soustractif simple)", "GMS (Groove Machine Synth)"],
      "Pro Tools":    ["Vacuum (triode vintage)", "DB-33 (orgue tonewheel)"],
      "Cubase":       ["HALion Sonic SE (multi)", "Retrologue 2 (analogique virtuel)", "Padshop 2 (granulaire)"],
      "Studio One":   ["Mai Tai (polysynth analogique)", "Mojito (monosynth simple)"],
      "Reaper":       ["Aucun natif — bibliothèque VST tierce recommandée"],
    },
  },
  synth_fm: {
    label: "Synthèse FM",
    paid: [
      { name:"FM8",                    brand:"Native Instruments", desc:"FM 6 opérateurs — standard de la synthèse FM logicielle.", price:"inclus Komplete" },
      { name:"Arturia DX7 V",          brand:"Arturia",         desc:"Émulation Yamaha DX7 — le son FM emblématique des années 80.", price:"inclus V Collection" },
      { name:"Native Instruments Operator (Ableton)", brand:"Ableton", desc:"FM 4 opérateurs intégré Live — polyvalent et musical.", price:"inclus Live Suite" },
      { name:"Plogue Chipsynth",       brand:"Plogue",          desc:"Émulation chips FM vintage (OPL, OPM) — lo-fi expressif.", price:"~95€" },
    ],
    free: [
      { name:"Dexed",                  brand:"Digital Suburban", desc:"Émulation DX7 gratuite et fidèle — patches DX7 compatibles." },
      { name:"OPL3 emulator",          brand:"divers",          desc:"Émulation chip FM Yamaha OPL3 — son jeux vidéo vintage." },
    ],
    daw_native: {
      "Ableton Live": ["Operator — FM 4 opérateurs complet"],
      "FL Studio":    ["Sytrus — FM 6 opérateurs + soustractif"],
      "Logic Pro":    ["Alchemy (FM partiel)", "ES2 (FM mode disponible)"],
      "Cubase":       ["Retrologue 2 (FM partiel)"],
    },
  },
  synth_wavetable: {
    label: "Wavetable & Spectral",
    paid: [
      { name:"Serum",                  brand:"Xfer Records",    desc:"Standard wavetable — wavetable custom, modulation visuelle.", price:"~200€" },
      { name:"Phase Plant",            brand:"Kilohearts",      desc:"Synthèse modulaire wavetable — architecture flexible unique.", price:"~200€" },
      { name:"Pigments 4",             brand:"Arturia",         desc:"Synth hybride wavetable/granulaire/additif/FM — très créatif.", price:"~99€" },
      { name:"Falcon 2",               brand:"UVI",             desc:"Plate-forme synthesis hybride — scripting avancé.", price:"~350€" },
      { name:"Nave",                   brand:"Waldorf",         desc:"Wavetable basé sur le Waldorf Wave — sons spectraux uniques.", price:"~50€" },
    ],
    free: [
      { name:"Vital",                  brand:"Matt Tytel",      desc:"Wavetable pro gratuit — qualité Serum, 100% libre." },
      { name:"Surge XT",               brand:"Surge Synth Team", desc:"Wavetable open source — aliasing minimal, très expressif." },
    ],
    daw_native: {
      "Ableton Live": ["Wavetable — wavetable natif avec filtres vintage"],
      "Logic Pro":    ["Alchemy — wavetable + granulaire + additif"],
      "FL Studio":    ["Harmor — additive/resynthèse de spectres"],
      "Cubase":       ["Padshop 2 — granulaire/wavetable"],
    },
  },
  synth_granular: {
    label: "Granulaire & Textural",
    paid: [
      { name:"Granulator III (Ableton)", brand:"Ableton/Robert Henke", desc:"Granulaire temps réel — textural, expérimental, unique.", price:"gratuit avec Live" },
      { name:"Output Portal",          brand:"Output",          desc:"Granulaire temps réel sur n'importe quelle source.", price:"~99€" },
      { name:"Emergence",              brand:"Zynaptiq",        desc:"Granulaire AI — génère des sons à partir d'audio existant.", price:"~149€" },
      { name:"Iris 2",                 brand:"iZotope",         desc:"Synthèse par spectrogramme — manipulation visuelle du son.", price:"~99€" },
    ],
    free: [
      { name:"Padawan",                brand:"Various",         desc:"Granulaire simple gratuit — bon pour l'apprentissage." },
      { name:"Alchemy (Logic)",        brand:"Apple",           desc:"Granulaire natif Logic — inclus dans Logic Pro." },
    ],
    daw_native: {
      "Logic Pro":    ["Alchemy — granulaire avancé intégré"],
      "Ableton Live": ["Granulator III (Max for Live gratuit)", "Meld — granulaire basique"],
      "Cubase":       ["Padshop 2 — granulaire natif"],
    },
  },
  sampler: {
    label: "Samplers & ROMplers",
    paid: [
      { name:"Kontakt 7",              brand:"Native Instruments", desc:"Standard de l'industrie — bibliothèque massive, scripting avancé.", price:"inclus Komplete / ~400€" },
      { name:"PLAY (EastWest)",        brand:"EastWest",        desc:"Moteur EastWest — orchestral, cinéma, productions premium.", price:"abonnement ~30€/mois" },
      { name:"UVI Workstation",        brand:"UVI",             desc:"Lecteur de bibliothèques UVI — sons vintage et modernes.", price:"gratuit (bibliothèques payantes)" },
      { name:"HALion 7",               brand:"Steinberg",       desc:"Sampler/synthèse intégré — natif Cubase, très polyvalent.", price:"~350€" },
      { name:"SampleTank 4",           brand:"IK Multimedia",   desc:"ROMpler et sampler — grande bibliothèque intégrée.", price:"~200€" },
      { name:"Keyscape",               brand:"Spectrasonics",   desc:"Pianos et claviers samplés premium — son exceptionnel.", price:"~400€" },
      { name:"Ravenscroft 275",        brand:"Vienna Symphonic Library", desc:"Piano de concert samplé — référence absolue.", price:"~350€" },
    ],
    free: [
      { name:"LABS",                   brand:"Spitfire Audio",  desc:"Instruments samplés gratuits de haute qualité — mis à jour régulièrement." },
      { name:"BBC Symphony Discover",  brand:"Spitfire Audio",  desc:"Orchestre symphonique BBC gratuit — qualité broadcast." },
      { name:"MT Power Drum Kit 2",    brand:"Prominy",         desc:"Batterie acoustique samplée gratuite — son naturel." },
      { name:"Vital (presets)",        brand:"communauté",      desc:"Bibliothèques de presets Vital — vastes ressources gratuites." },
    ],
    daw_native: {
      "Logic Pro":    ["EXS24/Sampler (sampler natif)", "Quick Sampler (slicing)"],
      "Ableton Live": ["Sampler (full)", "Simpler (basique)", "Drum Rack"],
      "FL Studio":    ["DirectWave (sampler complet)", "FPC (drum pads)"],
      "Pro Tools":    ["Structure Free (sampler Avid)"],
      "Cubase":       ["HALion Sonic SE (inclus)"],
      "Studio One":   ["Impact XT (drums)", "Sample One XT (sampler)"],
      "Reaper":       ["ReaSamplOmatic5000 (natif)"],
    },
  },
  drums: {
    label: "Batteries & Percussions",
    paid: [
      { name:"Superior Drummer 3",     brand:"Toontrack",       desc:"Référence batterie acoustique — samples multi-microphones.", price:"~350€" },
      { name:"EZdrummer 3",            brand:"Toontrack",       desc:"Batterie acoustique accessible — songwriting assisté.", price:"~200€" },
      { name:"BFD3",                   brand:"FXpansion/inMusic", desc:"Batterie acoustique ultra-réaliste — mixage avancé.", price:"~200€" },
      { name:"Addictive Drums 2",      brand:"XLN Audio",       desc:"Batterie acoustique — sons prêts à l'emploi, très musical.", price:"~160€" },
      { name:"Steven Slate Drums 5",   brand:"Slate Digital",   desc:"Batterie acoustique + trigger — sons modernes de prod.", price:"abonnement ~15€/mois" },
      { name:"Battery 4",              brand:"Native Instruments", desc:"Drum machine — samples électroniques et acoustiques.", price:"inclus Komplete" },
      { name:"Drum Synth (Live)",      brand:"Ableton",         desc:"Synthèse de percussions — chaque élément est synthétisé.", price:"inclus Live Suite" },
    ],
    free: [
      { name:"MT Power Drum Kit 2",    brand:"Prominy",         desc:"Batterie acoustique samplée gratuite et convaincante." },
      { name:"DrumMic'a",              brand:"Sennheiser",      desc:"Batterie acoustique multi-micro gratuite — très détaillée." },
      { name:"LABS Drumming",          brand:"Spitfire Audio",  desc:"Batteries acoustiques gratuites Spitfire." },
    ],
    daw_native: {
      "Logic Pro":    ["Drum Machine Designer", "Ultrabeat (drum synth)"],
      "Ableton Live": ["Drum Rack", "Drum Synth (Suite)", "Beat Tools"],
      "FL Studio":    ["FPC (pads)", "Drumpad"],
      "Pro Tools":    ["Boom (drum machine basique)"],
      "Cubase":       ["Beat Designer", "HALion Sonic SE drums"],
      "Studio One":   ["Impact XT"],
      "Reaper":       ["Aucun natif spécifique — VST tiers"],
    },
  },
  piano_keys: {
    label: "Pianos & Claviers",
    paid: [
      { name:"Keyscape",               brand:"Spectrasonics",   desc:"Pianos et claviers vintage samplés — qualité inégalée.", price:"~400€" },
      { name:"Ravenscroft 275",        brand:"Vienna Symphonic Library", desc:"Piano de concert — référence mastering et prod.", price:"~350€" },
      { name:"Pianoteq 8",             brand:"Modartt",         desc:"Modélisation physique — piano sans samples, très léger.", price:"~300€" },
      { name:"Alicia's Keys",          brand:"Native Instruments", desc:"Yamaha C3 samplé par Alicia Keys — son doux et intime.", price:"inclus Komplete" },
      { name:"Scarbee Vintage Keys",   brand:"Native Instruments", desc:"Claviers vintage (Rhodes, Wurli, Clavinet) — référence.", price:"inclus Komplete" },
      { name:"Mark Studio 2",          brand:"IK Multimedia",   desc:"Rhodes électrique — émulation ultra-réaliste.", price:"~150€" },
      { name:"B-3X",                   brand:"IK Multimedia",   desc:"Hammond B-3 avec Leslie — le meilleur émulateur orgue.", price:"~150€" },
    ],
    free: [
      { name:"LABS Soft Piano",        brand:"Spitfire Audio",  desc:"Piano préparé doux — textures intimistes gratuites." },
      { name:"Decent Sampler (presets)",brand:"Plugin Boutique", desc:"Moteur gratuit + banques piano gratuites de la communauté." },
      { name:"FreePiano",              brand:"divers",          desc:"Piano simple gratuit — apport basique mais fonctionnel." },
    ],
    daw_native: {
      "Logic Pro":    ["Steinway Grand Piano (EXS24)", "Vintage Electric Piano (Rhodes/Wurli)", "Vintage Clav", "Vintage Organ"],
      "Ableton Live": ["Piano & Keys (inclus avec Live)", "Electric (Rhodes/Wurli modélisé)"],
      "FL Studio":    ["FL Keys", "FLEX presets piano"],
      "Cubase":       ["HALion Sonic SE — grands pianos et électriques"],
      "Studio One":   ["Presence XT — presets piano"],
      "Reaper":       ["Aucun natif — ReaSamplOmatic + soundfonts"],
    },
  },
  orchestral: {
    label: "Orchestral & Cinématique",
    paid: [
      { name:"Spitfire BBCSO Professional", brand:"Spitfire Audio", desc:"BBC Symphony Orchestra — référence orchestrale broadcast.", price:"~600€" },
      { name:"Vienna Symphonic Library", brand:"VSL",            desc:"Standard industrie musique de film — réalisme exceptionnel.", price:"~500€+" },
      { name:"EastWest Hollywood Orchestra", brand:"EastWest",  desc:"Hollywood strings/brass/woodwinds — son de blockbuster.", price:"abonnement ~30€/mois" },
      { name:"Cinematic Studio Series", brand:"Cinematic Studio", desc:"Cordes, cuivres, bois cinématiques — légato naturel.", price:"~400€ la série" },
      { name:"LASS (LA Scoring Strings)", brand:"Audiobro",     desc:"Cordes de session LA — articulations naturelles.", price:"~300€" },
    ],
    free: [
      { name:"BBC Symphony Discover",  brand:"Spitfire Audio",  desc:"Version gratuite BBC Symphony — qualité broadcast réelle." },
      { name:"LABS Strings / Brass",   brand:"Spitfire Audio",  desc:"Instruments orchestraux LABS gratuits." },
      { name:"Virtual Playing Orchestra", brand:"Paul Battersby", desc:"Orchestre complet gratuit — bon point de départ." },
    ],
    daw_native: {
      "Logic Pro":    ["Studio Strings", "Studio Horns", "Studio Brass — orchestral natif haute qualité"],
      "Cubase":       ["HALion Sonic SE orchestral presets"],
      "GarageBand":   ["Sections orchestrales intégrées"],
    },
  },
  bass: {
    label: "Basses",
    paid: [
      { name:"Scarbee Bass Series",    brand:"Native Instruments", desc:"Précision, Jay Bass, MM-Bass — basses samplées référence.", price:"inclus Komplete" },
      { name:"Trilian",                brand:"Spectrasonics",   desc:"Basse acoustique, électrique, synth — bibliothèque complète.", price:"~300€" },
      { name:"Modo Bass 2",            brand:"IK Multimedia",   desc:"Modélisation physique basse — jeu de cordes réaliste.", price:"~150€" },
      { name:"Session Bassist (series)",brand:"Native Instruments", desc:"Basses samplées avec patterns — Ultra Bass, Prime Bass.", price:"inclus Komplete" },
    ],
    free: [
      { name:"LABS Bass Guitar",       brand:"Spitfire Audio",  desc:"Basse électrique samplée LABS gratuite." },
      { name:"4Front Bass",            brand:"4Front Technologies", desc:"Basse électrique simple et légère." },
    ],
    daw_native: {
      "Logic Pro":    ["Studio Bass (samplé réaliste)", "Bass Amp Designer"],
      "Ableton Live": ["Bass presets dans Sampler/Wavetable"],
      "GarageBand":   ["Smart Bass", "basses électriques et acoustiques intégrées"],
    },
  },
};

const buildInstrumentsContext = () =>
  Object.values(INSTRUMENTS_DB).map(cat =>
    `${cat.label} — Payants: ${cat.paid.map(p => p.name + " (" + p.brand + ")").join(", ")} | Gratuits: ${cat.free.map(p => p.name + " (" + p.brand + ")").join(", ")}`
  ).join("\n");

const buildPluginsContext = () =>
  Object.values(PLUGINS_DB).map(cat =>
    `${cat.label} — Payants: ${cat.paid.map(p => p.name + " (" + p.brand + ")").join(", ")} | Gratuits: ${cat.free.map(p => p.name + " (" + p.brand + ")").join(", ")}`
  ).join("\n");

/* ── RECIPES DATABASE — Raisonnement contextuel ──────────── */
const RECIPES_DB = [
  {
    id:"kick_punch", situation:"Kick manque de punch",
    symptoms:["kick trop mou","kick disparaît dans le mix","batterie sans impact"],
    category:"dynamics",
    steps:{
      "Logic Pro":[
        "Compressor natif, mode **Vintage VCA** : Attack **10ms**, Release Auto, Ratio **4:1**, Threshold **-8dB**",
        "Channel EQ : boost +3dB à **60Hz** (corps), cut -3dB à **250Hz** (boue), boost +2dB à **4kHz** (claque)",
        "Bitcrusher en micro-saturation (Drive +5%) pour les harmoniques",
        "Bus parallèle : send vers Compressor écrasé, blend 25% avec le signal dry",
      ],
      "Ableton Live":[
        "Drum Buss sur le groupe batterie : Boom **60Hz**, Crunch **10%**",
        "Compressor sur kick : Attack **8ms**, Release **80ms**, Ratio **4:1**",
        "EQ Eight : +3dB à **55Hz**, -3dB à **280Hz**, +2dB à **3.5kHz**",
        "Saturator en Soft Clip (Drive +5dB) pour la chaleur",
      ],
      "FL Studio":[
        "Parametric EQ 2 : +4dB à **60Hz**, -3dB à **300Hz**, +2dB à **4kHz**",
        "Fruity Compressor : Attack **10ms**, Release **100ms**, Ratio **4:1**",
        "Maximus en bus parallèle, blend 30%",
      ],
      "Pro Tools":[
        "BF-76 : Attack **5**, Release **7**, Ratio **4:1** — All-buttons mode pour le ton vintage",
        "EQ3 : boost +3dB à **60Hz**, cut -4dB à **250Hz**, boost +2dB à **4kHz**",
        "Bus parallèle compressé à -6dB, blend 25%",
      ],
      default:[
        "Compresseur : Attack **8-12ms**, Release auto, Ratio **4:1**, GR **3-5dB**",
        "EQ : +3dB à **60Hz**, -3dB à **250Hz**, +2dB à **4kHz**",
        "Saturation Soft Clip légère pour les harmoniques",
        "Compression parallèle : bus écrasé blendé à 20-30%",
      ],
    },
    free:"TDR Kotelnikov (compression) + TDR Nova (EQ dynamique) + Klanghelm IVGI (saturation)",
  },
  {
    id:"kick_bass_conflict", situation:"Conflit kick / basse",
    symptoms:["bas du spectre boueux","kick et basse se masquent","mix peu lisible en basses"],
    category:"routing",
    steps:{
      "Logic Pro":[
        "Compressor sur piste basse → Side Chain : sélectionne la piste kick",
        "Attack **1ms**, Release **100ms**, Ratio **4:1**, Threshold **-15dB** — la basse s'écarte à chaque hit",
        "Channel EQ basse : notch -3dB là où le kick est fort (**60-80Hz**)",
        "Channel EQ kick : notch -2dB à **120Hz** (zone fondamentale de la basse)",
      ],
      "Ableton Live":[
        "Compressor sur basse → Sidechain : Input = kick",
        "Attack **1ms**, Release **80ms**, Ratio **5:1**, Threshold **-12dB**",
        "EQ Eight basse : coupe à **80Hz**. EQ Eight kick : coupe à **120Hz**",
        "Utility sur basse : activer Mono sous **120Hz**",
      ],
      default:[
        "Side-chain : la basse doit s'effacer (ratio 4:1, attack 1-2ms) quand le kick frappe",
        "Séparation fréquentielle : kick à **60-80Hz**, basse à **80-120Hz** — pas d'overlap",
        "Hi-pass sur la basse à **40Hz** — supprime les sub-basses parasites",
        "Test mono obligatoire : si ça sonne bien en mono, ça sonnera bien partout",
      ],
    },
    free:"TDR Nova en side-chain (gratuit, supporte le sidechain) pour la séparation dynamique",
  },
  {
    id:"vocal_clarity", situation:"Voix manque de clarté et de présence",
    symptoms:["voix enfouie","consonnes inaudibles","voix étouffée","voix nasale","manque d'intelligibilité"],
    category:"eq",
    steps:{
      "Logic Pro":[
        "Channel EQ : hi-pass **120Hz** (12dB/oct), notch -3dB à **350Hz** (nasalité), boost +2dB à **4kHz** (présence)",
        "Compressor mode Platinum : Attack **5ms**, Release **80ms**, Ratio **3:1**",
        "DeEsser Logic : fréquence **7kHz**, threshold ajusté jusqu'au contrôle naturel",
        "Réverbe Room courte (decay **0.8s**, pre-delay **20ms**) à 12% wet",
      ],
      "Ableton Live":[
        "EQ Eight : hi-pass à **100Hz**, -3dB à **350Hz**, +2dB à **4kHz**",
        "Compressor RMS : Attack **8ms**, Release auto, Ratio **3:1**",
        "Aucun DeEsser natif — utilise FabFilter Pro-DS ou Waves Renaissance DeEsser",
        "Reverb : Small Room, decay **0.8s**, pre-delay **20ms**, wet **12%**",
      ],
      default:[
        "Hi-pass à **80-120Hz** — élimine le souffle et la proximité micro",
        "Notch -3 à -5dB à **300-450Hz** — réduit la nasalité/boxiness",
        "Boost +2 à +3dB à **3-5kHz** — présence et intelligibilité des consonnes",
        "De-esser à **6-8kHz** — contrôle les sibilances",
        "Réverbe courte pre-delay 15-25ms pour placer la voix dans l'espace",
      ],
    },
    free:"TDR Nova (EQ dynamique) + Graillon 2 Free (pitch/saturation) + Valhalla Supermassive (réverbe)",
  },
  {
    id:"mix_bus_glue", situation:"Mix manque de cohésion et de glue",
    symptoms:["instruments sonnent séparés","mix peu cohésif","son trop digital","manque de chaleur"],
    category:"mix",
    steps:{
      "Logic Pro":[
        "Compressor mode **Vintage VCA** sur le bus master : Ratio **2:1**, Attack **30ms**, Release Auto, GR max **2dB**",
        "Channel EQ final : légère courbe en sourire (+0.5dB à **80Hz**, +0.5dB à **12kHz**)",
        "Tape Delay en micro-saturation sur le bus pour l'analogique",
      ],
      "Ableton Live":[
        "**Glue Compressor** sur le bus master : Ratio **2:1**, Attack **30ms**, Release Auto, threshold jusqu'à **1-2dB** GR",
        "Saturator en Analog Clip, Drive +2dB pour la chaleur",
        "EQ Eight final en courbe douce",
      ],
      default:[
        "Bus compressor : Ratio **2:1**, Attack **30ms** (lent), Release Auto, GR **1-2dB** max",
        "Si tu entends la compression, c'est trop fort",
        "Saturation Soft Clip très légère (1-2%) pour réchauffer le son digital",
        "Bypass régulier pour vérifier l'objectivité",
      ],
    },
    free:"TDR Kotelnikov sur le bus master + Klanghelm IVGI pour la chaleur analogique",
  },
  {
    id:"low_end_mud", situation:"Mix boueux dans les basses fréquences",
    symptoms:["manque de clarté en bas du spectre","mix lourd","basses qui masquent tout","peu lisible sur petites enceintes"],
    category:"eq",
    steps:{
      "Logic Pro":[
        "Channel EQ sur CHAQUE instrument : hi-pass selon le contenu réel (guitare → **100Hz**, pad → **150Hz**, overhead → **200Hz**)",
        "Analyseur Logic : identifier les accumulations entre **200-400Hz**",
        "Notch -3dB sur cette fréquence sur les instruments secondaires",
      ],
      "Ableton Live":[
        "EQ Eight avec hi-pass sur tout ce qui n'a pas besoin de sub-basses",
        "Spectrum analyzer pour identifier les pics entre 200-400Hz",
        "Multiband Dynamics sur le bus : compresser légèrement la bande **80-250Hz**",
      ],
      default:[
        "Hi-pass sur tout : chaque piste doit avoir un hi-pass à sa fréquence minimale réelle",
        "Zone **200-400Hz** = principale source de boue — couper ici sur les éléments secondaires",
        "Moins de basses ≠ mauvais mix. La clarté vient d'enlever, pas d'ajouter",
        "Test sur petites enceintes ou casque : si c'est clair là, c'est bon partout",
      ],
    },
    free:"SPAN (Voxengo) pour l'analyse spectrale + TDR Nova pour les coupes dynamiques",
  },
];

const buildRecipesContext = (daw) => {
  const dawKey = daw && RECIPES_DB[0].steps[daw] ? daw : "default";
  return RECIPES_DB.map(r => {
    const steps = r.steps[dawKey] || r.steps["default"];
    return `SITUATION: ${r.situation}
SYMPTÔMES: ${r.symptoms.join(", ")}
RECETTE (${dawKey}):
${steps.map((s,i) => `${i+1}. ${s}`).join("\n")}
GRATUIT: ${r.free}`;
  }).join("\n\n---\n\n");
};

const getKnowledge = (itemLabel) => {
  const label = (itemLabel || "").toLowerCase();
  if (label.includes("compres") || label.includes("808") || label.includes("basse") || label.includes("kick")) return KNOWLEDGE_BASE.compression;
  if (label.includes("eq") || label.includes("fréquenc") || label.includes("filter")) return KNOWLEDGE_BASE.eq;
  if (label.includes("reverb") || label.includes("réverb") || label.includes("delay") || label.includes("espace")) return KNOWLEDGE_BASE.reverb;
  if (label.includes("dynami") || label.includes("parallel") || label.includes("transient")) return KNOWLEDGE_BASE.dynamics;
  if (label.includes("bus") || label.includes("routing") || label.includes("chain")) return KNOWLEDGE_BASE.routing;
  return KNOWLEDGE_BASE.mix;
};

const ElementDrawer = ({ item, onClose, daw, zOverride }) => {
  const { s: ls } = useLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const systemPrompt = `Tu es l'assistant intégré de Decode, expert en production musicale et mixage avec 20 ans d'expérience.

DAW : ${daw || "Logic Pro"}
Élément analysé : ${item.label} — ${item.detail}

INSTRUCTIONS :
- Réponds avec des paramètres précis (attack, release, fréquence, ratio, valeurs concrètes)
- Pour chaque plugin payant, cite l'alternative gratuite
- Connais tous les plugins standards : FabFilter (Pro-Q, Pro-C, Pro-L, Saturn), Waves (SSL, CLA-76, CLA-2A, API 2500, H-Reverb), Valhalla (Room, VintageVerb, Delay, Supermassive), iZotope (Ozone, Neutron, RX), SoundToys (Decapitator, EchoBoy), UAD (1176, LA-2A, SSL G-Bus), TDR Nova/Kotelnikov (gratuits), Klanghelm IVGI (gratuit)
- Connais les instruments : Serum, Vital (gratuit), Sylenth1, u-he Diva, Arturia V Collection, Kontakt, Omnisphere, Superior Drummer 3, Keyscape, Pianoteq, Spitfire LABS (gratuit)
- Adapte tes réponses au DAW de l'utilisateur avec les chemins précis dans ce DAW
- Réponses courtes, directes, actionnables
- Réponds en français`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role:"user", content:userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ messages: newMessages, item: { label: item.label, detail: item.detail }, daw }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "Erreur de connexion.";
      setMessages([...newMessages, { role:"assistant", content:reply }]);
    } catch(e) {
      setMessages([...newMessages, { role:"assistant", content:"Erreur : " + e.message }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, bottom:0,
      background:"rgba(0,0,0,0.65)", zIndex: zOverride || 200,
      display:"flex", alignItems:"center", justifyContent:"center",
      backdropFilter:"blur(6px)", padding:24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:T.s1, border:`1px solid ${T.border}`, borderRadius:20,
        width:"100%", maxWidth:520,
        animation:"fadeup .22s ease", position:"relative",
        display:"flex", flexDirection:"column",
        maxHeight:"80vh", overflow:"hidden",
      }}>
        {/* Scrollable content */}
        <div style={{ overflowY:"auto", padding:"28px 28px 0" }}>

          {/* Close */}
          <button onClick={onClose} style={{
            position:"absolute", top:16, right:16,
            width:30, height:30, borderRadius:"50%",
            background:T.s2, border:`1px solid ${T.border}`,
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <IconClose/>
          </button>

          {/* Confidence badge */}
          {item.conf && (
            <div style={{
              display:"inline-flex", alignItems:"center", gap:6,
              fontFamily:T.mono, fontSize:9, padding:"3px 10px", borderRadius:4,
              background:`${CONF[item.conf].color}12`, border:`1px solid ${CONF[item.conf].color}33`,
              color:CONF[item.conf].color, letterSpacing:.5, marginBottom:14,
            }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:CONF[item.conf].color }}/>
              {CONF[item.conf].label} — {CONF[item.conf].desc}
            </div>
          )}

          {/* Title + detail */}
          <div style={{ fontFamily:T.mono, fontSize:9, letterSpacing:2, color:T.amberDim, marginBottom:5 }}>DÉTAIL</div>
          <div style={{ fontFamily:T.display, fontSize:20, letterSpacing:2, color:T.text, marginBottom:12, lineHeight:1.2 }}>{item.label}</div>
          <p style={{ fontFamily:T.mono, fontSize:12, color:T.muted, lineHeight:1.8, marginBottom:16 }}>{item.detail}</p>

          {/* Tools */}
          {item.tools?.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:T.mono, fontSize:9, letterSpacing:2, color:T.amberDim, marginBottom:8 }}>APPROCHES COMPATIBLES</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {item.tools.map(t => (
                  <span key={t} style={{ fontFamily:T.mono, fontSize:11, padding:"5px 11px", borderRadius:6, background:T.s2, border:`1px solid ${T.border}`, color:T.text, display:"flex", alignItems:"center", gap:6 }}>
                    <IconPlug c={T.amberDim} s={12}/> {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height:1, background:T.border, marginBottom:20 }}/>

          {/* Assistant */}
          <div style={{ fontFamily:T.mono, fontSize:9, letterSpacing:2, color:T.amber, marginBottom:14 }}>
            {item.label === "Assistant Decode" ? ls.ask_title : `ASSISTANT — ${daw || "Logic Pro"}`}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
            {messages.length === 0 && (
              <div style={{ fontFamily:T.mono, fontSize:11, color:T.muted2, lineHeight:1.7, fontStyle:"italic" }}>
                Pose ta question sur cet élément.
              </div>
            )}
            {messages.map((m,i) => (
              <div key={i} style={{
                padding:"10px 14px", borderRadius:10,
                background: m.role==="user" ? T.amberGlow : T.s2,
                border: `1px solid ${m.role==="user" ? T.amber+"33" : T.border}`,
                alignSelf: m.role==="user" ? "flex-end" : "flex-start",
                maxWidth:"90%",
              }}>
                <div style={{ fontFamily:T.mono, fontSize:11, color: m.role==="user" ? T.amber : T.text, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ padding:"10px 14px", borderRadius:10, background:T.s2, border:`1px solid ${T.border}`, alignSelf:"flex-start" }}>
                <div style={{ fontFamily:T.mono, fontSize:11, color:T.muted }}>
                  <span style={{ animation:"blink 1s infinite" }}>▍</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input bar */}
        <div style={{ padding:"14px 20px", borderTop:`1px solid ${T.border}`, display:"flex", gap:10, alignItems:"center" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && !e.shiftKey && send()}
              placeholder={ls.ask_placeholder}
              style={{
                flex:1, background:T.s2, border:`1px solid ${T.border}`,
                borderRadius:10, padding:"10px 14px",
                fontFamily:T.mono, fontSize:16, color:T.text,
                outline:"none", transition:"border-color .2s",
              }}
              onFocus={e => e.target.style.borderColor = T.amber}
              onBlur={e => e.target.style.borderColor = T.border}
            />
            <button onClick={send} disabled={!input.trim() || loading} style={{
              width:38, height:38, borderRadius:"50%", flexShrink:0,
              background: input.trim() && !loading ? `linear-gradient(135deg, ${T.amber}, ${T.orange})` : T.s2,
              border:`1px solid ${input.trim() && !loading ? T.amber : T.border}`,
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all .2s",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7 L13 7 M8 2 L13 7 L8 12" stroke={input.trim() && !loading ? T.black : T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
      </div>
    </div>
  );
};

/* ── GEMINI ÉCOUTE TAB ──────────────────────────────────── */
const GEMINI_CATEGORIES = [
  { id:"balance",  label:"Balance & Fréquences",  icon:"〰" },
  { id:"dynamique",label:"Dynamique",              icon:"📊" },
  { id:"espace",   label:"Espace & Stéréo",        icon:"↔" },
  { id:"energie",  label:"Énergie & Structure",    icon:"⚡" },
  { id:"priorites",label:"Priorités",              icon:"🎯" },
];

// Simulated Gemini response matching the style from the real test
const GEMINI_DATA = {
  ref: {
    verdict:"Production solide, identité sonore affirmée. L'espace est travaillé avec intention, la compression est cohérente avec le genre. Quelques ajustements spectraux suffiraient à atteindre un niveau de compétitivité radio.",
    categories:{
      balance:[
        { label:"Accumulation 200–500 Hz", severity:"warning", text:"Le mix est riche et chaleureux dans les bas-médiums, ce qui crée de la profondeur — mais cette zone sature légèrement et peut étouffer la clarté vocale sur certains systèmes. Un nettoyage dynamique sur les instruments quand la voix est présente libérerait l'espace." },
        { label:"Air au-dessus de 10 kHz", severity:"info", text:"Un léger manque de brillance sur les voix et cymbales. Un boost High Shelf discret sur le bus voix (+1.5 dB à 12 kHz) apporterait ce côté «poli» des productions modernes sans dénaturer l'esthétique." },
      ],
      dynamique:[
        { label:"Compression générale cohérente", severity:"ok", text:"La batterie est bien contrôlée, la dynamique globale est maîtrisée. Le ratio d'écrêtage est dans les clous pour le genre." },
        { label:"Transitoires de caisse claire", severity:"warning", text:"La caisse claire manque de punch à l'attaque. Une compression parallèle (New York) permettrait de récupérer les transitoires sans écraser le sustain ni casser la cohérence du kit." },
      ],
      espace:[
        { label:"Largeur stéréo des guitares", severity:"ok", text:"Les guitares acoustiques sont bien placées en stéréo. Le panoramique crée une image large et stable qui sert bien l'arrangement." },
        { label:"Contraste couplet / refrain", severity:"info", text:"Le refrain pourrait être encore plus large. Doubler les guitares électriques à 100% gauche / 100% droite créerait un choc d'amplitude à l'impact du refrain — l'auditeur le ressentirait physiquement." },
      ],
      energie:[
        { label:"Montée vers le premier refrain", severity:"ok", text:"La progression est bien construite, la tension s'accumule naturellement." },
        { label:"Impact à l'entrée du refrain", severity:"info", text:"L'arrivée de la batterie pourrait être plus soudaine. Une automatisation du bus master (+0.5 à +1 dB juste à l'impact) renforcerait le contraste et la sensation de drop." },
        { label:"Traitement du pont", severity:"info", text:"Le passage parlé est une excellente cassure. Filtrer légèrement la batterie avant le pont (effet radio) puis tout relâcher sur le dernier refrain créerait un effet de retour maximal." },
      ],
      priorites:[
        { label:"1 — Clarté", severity:"high", text:"Creuser 300–400 Hz sur les instruments mid-range. Objectif : libérer la voix et éviter l'effet de boue sur petits haut-parleurs." },
        { label:"2 — Largeur", severity:"high", text:"Élargir les chœurs et guitares au refrain. Objectif : contraste dynamique puissant entre sections." },
        { label:"3 — Finitions", severity:"med", text:"Ajouter des ear candy discrets (reverse cymbal, effet de transition, automation de filtre). Maintenir l'attention sur toute la durée du titre." },
      ],
    },
  },
  perso: {
    verdict:"Mix en bonne voie avec une esthétique cohérente. Les problèmes identifiés sont classiques à ce stade de développement et tous corrigeables. La structure harmonique et la performance sont des atouts solides.",
    categories:{
      balance:[
        { label:"Accumulation 400–800 Hz", severity:"warning", text:"Cette zone surchargée crée un voile sur l'ensemble du mix. Plusieurs instruments occupent le même espace sans différenciation. Un EQ dynamique sur chaque piste permettrait de dégager de la place sans appauvrir le son." },
      ],
      dynamique:[
        { label:"LUFS trop bas — -12.1", severity:"critical", text:"Sur toutes les plateformes de streaming modernes, ce niveau sera normalisé vers le haut, introduisant des artefacts. Vise -9 à -10 LUFS intégrés avec un True Peak à -1 dBTP." },
      ],
      espace:[
        { label:"Espace stéréo bien exploité", severity:"ok", text:"Les éléments secondaires ont de la présence L/R, le centre est préservé pour les éléments principaux. C'est une des forces du mix." },
      ],
      energie:[
        { label:"Conflit kick / basse", severity:"critical", text:"Les deux occupent la même zone fréquentielle sans séparation. Le kick disparaît dès que la basse joue. Un side-chain et/ou une séparation fréquentielle (basse en dessous de 80 Hz, kick entre 60 et 100 Hz) résoudrait ce conflit fondamental." },
      ],
      priorites:[
        { label:"1 — Side-chain kick / basse", severity:"high", text:"C'est la correction la plus impactante. Rien d'autre ne sonnera correctement tant que kick et basse se marchent dessus." },
        { label:"2 — Niveau global", severity:"high", text:"Remonter à -9 LUFS avant de continuer à mixer. Le niveau actuel fausse toutes les perceptions d'équilibre." },
        { label:"3 — Nettoyage des mids", severity:"med", text:"Une fois les deux priorités précédentes réglées, attaquer les 400–800 Hz par piste." },
      ],
    },
  },
};

const SEVERITY_STYLE = {
  critical: { color:T.red,    bg:"rgba(230,57,70,0.08)",   label:"CRITIQUE" },
  warning:  { color:T.amber,  bg:"rgba(245,160,0,0.08)",   label:"ATTENTION" },
  high:     { color:T.orange, bg:"rgba(232,93,4,0.08)",    label:"PRIORITÉ" },
  info:     { color:T.cyan,   bg:"rgba(72,202,228,0.08)",  label:"CONSEIL" },
  ok:       { color:T.green,  bg:"rgba(87,204,153,0.08)",  label:"OK" },
  med:      { color:T.muted,  bg:"rgba(255,255,255,0.04)", label:"À FAIRE" },
};

const GeminiEcouteTab = ({ config, zone }) => {
  const [activeCategory, setActiveCategory] = useState("balance");
  const [loading, setLoading] = useState(false);
  const [geminiReady, setGeminiReady] = useState(true); // simulated
  const isRef = config.mode === "ref";
  const data = GEMINI_DATA[isRef ? "ref" : "perso"];
  const items = data.categories[activeCategory] || [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeup .3s ease" }}>

      {/* Header badge */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:T.s1, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 16px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:T.green, boxShadow:`0 0 8px ${T.green}` }}/>
          <div style={{ fontFamily:T.mono, fontSize:10, letterSpacing:2, color:T.muted }}>ANALYSE QUALITATIVE</div>
        </div>
        <span style={{ fontFamily:T.mono, fontSize:9, color:T.muted, letterSpacing:.5 }}>
          {zone.id === "full" ? "Morceau complet" : zone.label}
        </span>
      </div>

      {/* Verdict global */}
      <div style={{
        background:`rgba(87,204,153,0.06)`, border:`1px solid rgba(87,204,153,0.2)`,
        borderLeft:`3px solid ${T.green}`, borderRadius:10, padding:"14px 18px",
      }}>
        <div style={{ fontFamily:T.mono, fontSize:9, letterSpacing:2, color:T.green, marginBottom:8 }}>VERDICT GLOBAL</div>
        <div style={{ fontFamily:T.mono, fontSize:12, color:T.muted, lineHeight:1.8 }}>{data.verdict}</div>
      </div>

      {/* Category nav */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {GEMINI_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{
            fontFamily:T.mono, fontSize:10, padding:"5px 12px", borderRadius:20,
            border:`1px solid ${activeCategory===c.id ? T.amber : T.border}`,
            background: activeCategory===c.id ? T.amberGlow : T.s1,
            color: activeCategory===c.id ? T.amber : T.muted,
            cursor:"pointer", transition:"all .15s",
          }}>{c.label}</button>
        ))}
      </div>

      {/* Category items */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {items.map((item, i) => {
          const sev = SEVERITY_STYLE[item.severity] || SEVERITY_STYLE.info;
          return (
            <div key={i} style={{
              background: sev.bg, border:`1px solid ${sev.color}33`,
              borderRadius:10, padding:"14px 18px",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{
                  fontFamily:T.mono, fontSize:9, padding:"2px 8px", borderRadius:4,
                  background:`${sev.color}15`, border:`1px solid ${sev.color}33`,
                  color:sev.color, letterSpacing:.5,
                }}>{sev.label}</span>
                <span style={{ fontFamily:T.mono, fontSize:12, color:T.text }}>{item.label}</span>
              </div>
              <div style={{ fontFamily:T.mono, fontSize:11, color:T.muted, lineHeight:1.8 }}>{item.text}</div>
            </div>
          );
        })}
      </div>

      {/* Source note */}
      <div style={{ fontFamily:T.mono, fontSize:9, color:T.muted2, textAlign:"center", paddingTop:4 }}>
        Analyse qualitative générée par écoute IA — interprétation, pas mesure
      </div>
    </div>
  );
};

/* ── SCREEN 3 : FICHE ───────────────────────────────────── */
const FicheScreen = ({ config }) => {
  const isRef = config.mode === "ref";
  const data = isRef ? REF_DATA : PERSO_DATA;
  const { s: ls } = useLang();
  const [tab, setTab] = useState("elements");
  const [openEl, setOpenEl] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [zone, setZone] = useState(SECTIONS[0]);
  const [limitesOpen, setLimitesOpen] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [generating, setGenerating] = useState(false);

  const zoneInfo = ZONE_OVERRIDES[zone.id] || ZONE_OVERRIDES.full;

  // Generate fiche content via Claude + Puremix knowledge base
  useEffect(() => {
    const generate = async () => {
      setGenerating(true);
      const allKnowledge = Object.values(KNOWLEDGE_BASE).flat();
      const knowledgeStr = allKnowledge.map(k =>
        `### ${k.title}\n${k.summary}\nTechniques: ${k.techniques.join(" | ")}`
      ).join("\n\n");

      const pluginsStr = buildPluginsContext();
      const instrumentsStr = buildInstrumentsContext();
      const recipesStr = buildRecipesContext(config.daw);

      const prompt = isRef
        ? `Tu analyses la production "After Hours" de The Weeknd (BPM: 108, tonalité: La min, LUFS: -8.2).
           DAW de l'utilisateur : ${config.daw || "Logic Pro"}.
           MODE : RÉFÉRENCE — ton analytique. L'objectif est de décoder et comprendre, pas de conseiller.

BASE DE CONNAISSANCE AUDIO PROFESSIONNELLE :
${knowledgeStr}

BASE DE PLUGINS PROFESSIONNELS (utilise ces noms exacts) :
${pluginsStr}

INSTRUMENTS LOGICIELS DE RÉFÉRENCE :
${instrumentsStr}

RECETTES PAR DAW (paramètres précis pour les situations courantes) :
${recipesStr}

Génère une analyse complète en JSON :
{
  "elements": [
    { "cat": "BASSES|DRUMS|SYNTHS|FX & ESPACE", "icon": "bass|drums|synths|fx", "items": [
      { "conf": "measured|identified|suggested", "label": "Type détecté : ...", "detail": "Analyse technique détaillée de ce qui est entendu.", "tools": ["outil compatible"] }
    ]}
  ],
  "chain": [{ "step": "INPUT|GATE|EQ|COMP|SAT|REV|OUT", "label": "description probable", "c": "#couleur_hex" }],
  "plugins": [{ "name": "Nom du plugin", "role": "Rôle dans ce contexte précis", "free": true|false, "conf": "identified|suggested" }],
  "tips": [
    "Pour reproduire cet élément dans ${config.daw || "Logic Pro"} : étape précise avec paramètres...",
    "Tip 2 spécifique au DAW avec paramètres",
    "Tip 3",
    "Tip 4"
  ]
}
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.`
        : `Tu analyses le mix personnel "Mon Mix V3" (BPM: 95, tonalité: Ré maj, LUFS: -12.1).
           DAW : ${config.daw || "Logic Pro"}.
           MODE : PERSONNEL — ton prescriptif et bienveillant. L'objectif est de conseiller et d'aider à progresser.

BASE DE CONNAISSANCE AUDIO :
${knowledgeStr}

BASE DE PLUGINS PROFESSIONNELS (utilise ces noms exacts) :
${pluginsStr}

INSTRUMENTS LOGICIELS DE RÉFÉRENCE :
${instrumentsStr}

RECETTES PAR DAW (paramètres précis pour les situations courantes) :
${recipesStr}

Génère une analyse complète en JSON :
{
  "elements": [
    { "cat": "NIVEAU GLOBAL|FRÉQUENCES|BASSE & KICK|ESPACE STÉRÉO|DYNAMIQUE", "icon": "lufs|mids|bass|stereo|dynamics", "items": [
      { "conf": "measured|identified|suggested", "label": "Problème ou point fort détecté", "detail": "Explication claire du problème et de son impact sur le mix.", "tools": ["outil pour corriger"] }
    ]}
  ],
  "chain": [{ "step": "ÉTAPE", "label": "problème ou point fort", "c": "#couleur_hex" }],
  "plugins": [{ "name": "Nom du plugin", "role": "Ce qu'il va corriger dans ce mix", "free": true|false, "conf": "suggested" }],
  "plan": [
    { "p": "HIGH|MED", "task": "Action concrète à faire en priorité", "daw": "Comment faire dans ${config.daw || "Logic Pro"} : chemin précis" }
  ]
}
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.`;

      try {
        const res = await fetch(`${API}/api/analyze`, {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            mode: config.mode || "ref",
            daw: config.daw || "Logic Pro",
            title: config.title || "Titre inconnu",
            artist: config.artist || "",
            fileData: config.fileData || null,
            fileName: config.fileName || null,
            fileMime: config.fileMime || null,
            url: config.url || null,
          }),
        });
        const data = await res.json();
        if (data.fiche) setGenerated(data.fiche);
      } catch(e) {
        console.error("Generation error:", e);
      }
      setGenerating(false);
    };
    generate();
  }, [config]);

  // Use generated data if available, fallback to static
  const activeData = generated ? {
    ...data,
    elements: generated.elements || data.elements,
    chain: generated.chain || data.chain,
    plugins: generated.plugins || data.plugins,
    tips: generated.tips || data.tips,
    plan: generated.plan || data.plan,
  } : data;

  const Tab = ({id,l}) => (
    <button onClick={() => setTab(id)} style={{
      fontFamily:T.mono, fontSize:11, padding:"9px 16px", background:"transparent", border:"none",
      borderBottom:`2px solid ${tab===id?T.amber:"transparent"}`,
      color:tab===id?T.text:T.muted, cursor:"pointer", transition:"all .15s", letterSpacing:1,
    }}>{l}</button>
  );

  const meta = [{label:"BPM",val:data.bpm},{label:"TONALITÉ",val:data.key},{label:"LUFS",val:data.lufs},{label:"DAW",val:config.daw||"Logic Pro"}];
  const accent = isRef ? T.cyan : T.green;

  return (
    <>
      <ElementDrawer item={drawer} onClose={() => setDrawer(null)} daw={config.daw}/>

      <div style={{ maxWidth:780, margin:"0 auto", padding:"16px 16px 80px", animation:"fadeup .35s ease" }}>

        {/* Waveform — premier élément visible */}
        <div style={{ marginBottom:16 }}>
          <WaveformZone zone={zone} onZoneChange={setZone}/>
        </div>

        {/* Zone note banner */}
        {zone.id !== "full" && zoneInfo.note && (
          <div style={{
            background:`${zone.color || T.amber}10`,
            border:`1px solid ${zone.color || T.amber}33`,
            borderLeft:`3px solid ${zone.color || T.amber}`,
            borderRadius:8, padding:"10px 14px", marginBottom:14,
            animation:"fadeup .25s ease",
          }}>
            <div style={{ fontFamily:T.mono, fontSize:10, letterSpacing:1, color:zone.color || T.amber, marginBottom:3 }}>
              ANALYSE — {zone.label.toUpperCase()}
            </div>
            <div style={{ fontFamily:T.mono, fontSize:12, color:T.muted, lineHeight:1.6 }}>{zoneInfo.note}</div>
          </div>
        )}

        {/* Top info — compact, sous la waveform */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontFamily:T.mono, fontSize:10, padding:"2px 9px", borderRadius:20,
                background:isRef?"rgba(72,202,228,0.12)":"rgba(87,204,153,0.12)", color:accent, border:`1px solid ${accent}44`, letterSpacing:1 }}>
                {isRef?"RÉFÉRENCE":"PERSONNEL"}
              </span>
              <span style={{ fontFamily:T.mono, fontSize:10, color:T.green }}>✓ Analyse complète</span>
            </div>
            <h2 style={{ fontFamily:T.display, fontSize:26, letterSpacing:3, color:T.text, lineHeight:1, marginBottom:8 }}>{data.title}</h2>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {meta.map(m => (
                <div key={m.label} style={{ fontFamily:T.mono, fontSize:10, background:T.s2, border:`1px solid ${T.border}`, borderRadius:6, padding:"3px 9px", display:"flex", gap:5 }}>
                  <span style={{color:T.muted}}>{m.label}</span><span style={{color:T.amber}}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Score orbs — personal only */}
          {!isRef && (
            <div style={{ display:"flex", gap:8 }}>
              {Object.entries(data.score).map(([k,v]) => (
                <div key={k} style={{ textAlign:"center" }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", border:`2px solid ${v>=70?T.green:v>=55?T.amber:T.red}`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.display, fontSize:15, color:T.text, background:T.s1 }}>{v}</div>
                  <div style={{ fontFamily:T.mono, fontSize:8, color:T.muted, marginTop:3 }}>{k}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="fiche-tabs" style={{ display:"flex", borderBottom:`1px solid ${T.border}`, marginBottom:24, overflowX:"auto", alignItems:"center" }}>
          <Tab id="elements" l={isRef?ls.tab_elements:ls.tab_elements_perso}/>
          <Tab id="ecoute" l={isRef?ls.tab_ecoute:ls.tab_ecoute_perso}/>
          <Tab id="chain" l={isRef?ls.tab_chain:ls.tab_chain_perso}/>
          <Tab id="plugins" l={isRef?ls.tab_plugins:ls.tab_plugins_perso}/>
          <Tab id="tips" l={isRef?ls.tab_tips:ls.tab_tips_perso}/>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, paddingRight:4, paddingBottom:2 }}>
            {generating
              ? <><div style={{ width:5, height:5, borderRadius:"50%", background:T.amber, animation:"apulse 1.5s infinite" }}/><span style={{ fontFamily:T.mono, fontSize:9, color:T.amberDim, whiteSpace:"nowrap" }}>Génération…</span></>
              : generated
                ? <><div style={{ width:5, height:5, borderRadius:"50%", background:T.green }}/><span style={{ fontFamily:T.mono, fontSize:9, color:T.green, whiteSpace:"nowrap" }}>Base de connaissance active</span></>
                : null
            }
          </div>
        </div>

        {/* ── ÉCOUTE (Gemini qualitative layer) ── */}
        {tab==="ecoute" && (
          <GeminiEcouteTab config={config} zone={zone}/>
        )}

        {/* ── ELEMENTS ── */}
        {tab==="elements" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.amberDim, marginBottom:2, letterSpacing:.5 }}>
              {ls.click_to_dig}
            </div>
            {activeData.elements.map(el => {
              const isHighlighted = zoneInfo.highlight && zoneInfo.highlight.includes(el.id);
              return (
              <div key={el.id} style={{
                background:T.s1,
                border:`1px solid ${openEl===el.id ? T.amber : isHighlighted ? (zone.color||T.amber)+"55" : T.border}`,
                borderRadius:10, overflow:"hidden", transition:"border-color .2s",
              }}>
                {/* Category header */}
                <div
                  onClick={() => setOpenEl(openEl===el.id ? null : el.id)}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", cursor:"pointer" }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:28, height:28, borderRadius:6, background: isHighlighted ? `${zone.color||T.amber}18` : T.s2, border:`1px solid ${isHighlighted ? (zone.color||T.amber)+"44" : T.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {CAT_ICONS[el.icon]}
                    </div>
                    <span style={{ fontFamily:T.mono, fontSize:11, letterSpacing:2, color: openEl===el.id ? T.amber : isHighlighted ? (zone.color||T.amber) : T.muted }}>{el.cat}</span>
                    {isHighlighted && <span style={{ fontFamily:T.mono, fontSize:9, color:zone.color||T.amber, background:`${zone.color||T.amber}15`, border:`1px solid ${zone.color||T.amber}33`, borderRadius:10, padding:"1px 7px" }}>Actif sur cette zone</span>}
                    <span style={{ fontFamily:T.mono, fontSize:10, color:T.muted2 }}>{el.items.length} éléments</span>
                  </div>
                  <span style={{ fontFamily:T.mono, fontSize:14, color:T.muted, transition:"transform .2s", display:"inline-block", transform: openEl===el.id?"rotate(180deg)":"none" }}>›</span>
                </div>
                {/* Items */}
                {openEl===el.id && (
                  <div style={{ borderTop:`1px solid ${T.border}` }}>
                    {el.items.map((it,i) => (
                      <div key={i}
                        onClick={() => setDrawer(it)}
                        style={{
                          display:"flex", alignItems:"center", justifyContent:"space-between",
                          padding:"12px 20px", cursor:"pointer", transition:"background .15s",
                          borderBottom: i<el.items.length-1 ? `1px solid ${T.border2}` : "none",
                          background:"transparent",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = T.s2}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                          <span style={{ color:T.amber, fontSize:12, marginTop:1 }}>▸</span>
                          <div>
                            {it.conf && (
                              <span style={{
                                fontFamily:T.mono, fontSize:9, padding:"1px 7px", borderRadius:3,
                                background:`${CONF[it.conf].color}15`,
                                border:`1px solid ${CONF[it.conf].color}44`,
                                color:CONF[it.conf].color,
                                letterSpacing:.5, marginRight:8, display:"inline-block", marginBottom:4,
                              }}>{CONF[it.conf].label}</span>
                            )}
                            <span style={{ fontFamily:T.mono, fontSize:12, color:T.text, display:"block" }}>{it.label}</span>
                          </div>
                        </div>
                        <span style={{ fontFamily:T.mono, fontSize:10, color:T.amberDim, display:"flex", alignItems:"center", gap:4 }}>
                          Détail <span style={{fontSize:14}}>→</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ); })}
          </div>
        )}

        {/* ── CHAÎNE ── */}
        {tab==="chain" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", overflowX:"auto", paddingBottom:8, gap:0 }}>
              {activeData.chain.map((c,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
                  <div style={{ background:T.s1, border:`1px solid ${c.c}55`, borderRadius:8, padding:"12px 16px", textAlign:"center", minWidth:110, boxShadow:`0 0 18px ${c.c}15` }}>
                    <div style={{ fontFamily:T.mono, fontSize:10, color:c.c, letterSpacing:1, marginBottom:4 }}>{c.step}</div>
                    <div style={{ fontFamily:T.mono, fontSize:10, color:T.muted, lineHeight:1.4 }}>{c.label}</div>
                  </div>
                  {i < activeData.chain.length-1 && <div style={{ width:16, height:1, background:T.border, flexShrink:0 }}/>}
                </div>
              ))}
            </div>
            <p style={{ fontFamily:T.mono, fontSize:11, color:T.muted, marginTop:20, lineHeight:1.7, background:T.s1, border:`1px solid ${T.border}`, borderRadius:8, padding:16, display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{flexShrink:0, marginTop:1}}><IconBulb/></span>
              L'ordre est crucial — gate avant compressor, EQ avant saturation pour sculpter sans générer d'harmoniques parasites dans les fréquences problématiques.
            </p>
          </div>
        )}

        {/* ── PLUGINS ── */}
        {tab==="plugins" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {activeData.plugins.map(p => (
              <div key={p.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:T.s1, border:`1px solid ${T.border}`, borderRadius:10, padding:"14px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:T.s2, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}><IconPlug c={T.amber} s={16}/></div>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <div style={{ fontFamily:T.mono, fontSize:13, color:T.text }}>{p.name}</div>
                      {p.conf && <span style={{ fontFamily:T.mono, fontSize:9, padding:"1px 6px", borderRadius:3, background:`${CONF[p.conf].color}15`, border:`1px solid ${CONF[p.conf].color}33`, color:CONF[p.conf].color }}>{CONF[p.conf].label}</span>}
                    </div>
                    <div style={{ fontFamily:T.mono, fontSize:11, color:T.muted }}>{p.role}</div>
                  </div>
                </div>
                <span style={{ fontFamily:T.mono, fontSize:10, padding:"3px 10px", borderRadius:20,
                  border:`1px solid ${p.free?T.green+"44":T.border}`, background:p.free?"rgba(87,204,153,0.1)":T.s2, color:p.free?T.green:T.muted }}>
                  {p.free?"FREE":"Payant"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── TIPS / PLAN ── */}
        {tab==="tips" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {isRef
              ? activeData.tips.map((tip,i) => (
                  <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start", background:T.s1, border:`1px solid ${T.border}`, borderRadius:10, padding:"18px 20px" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:T.amberGlow, border:`1px solid ${T.amber}44`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.display, fontSize:16, color:T.amber, flexShrink:0 }}>{i+1}</div>
                    <div style={{ fontFamily:T.mono, fontSize:12, color:T.muted, lineHeight:1.7 }}>{tip}</div>
                  </div>
                ))
              : activeData.plan.map((p,i) => (
                  <div key={i} style={{ background:T.s1, border:`1px solid ${p.p==="HIGH"?T.orange+"44":T.border}`, borderRadius:10, padding:"18px 20px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <span style={{ fontFamily:T.mono, fontSize:10, padding:"2px 8px", borderRadius:4,
                        background:p.p==="HIGH"?"rgba(232,93,4,0.15)":T.s2, color:p.p==="HIGH"?T.orange:T.muted,
                        border:`1px solid ${p.p==="HIGH"?T.orange+"44":T.border}` }}>{p.p}</span>
                      <div style={{ fontFamily:T.mono, fontSize:12, color:T.text }}>{p.task}</div>
                    </div>
                    <div style={{ fontFamily:T.mono, fontSize:11, color:T.amber, background:T.s2, border:`1px solid ${T.border}`, borderRadius:6, padding:"8px 12px", borderLeft:`3px solid ${T.amber}`, display:"flex", alignItems:"center", gap:8 }}>
                      <IconPin/> {p.daw}
                    </div>
                  </div>
                ))
            }
          </div>
        )}
        {/* ── LÉGENDE CONFIANCE ── */}
        <div style={{ marginTop:32, background:T.s1, border:`1px solid ${T.border}`, borderRadius:10, padding:"16px 20px" }}>
          <div style={{ fontFamily:T.mono, fontSize:10, letterSpacing:2, color:T.muted, marginBottom:12 }}>NIVEAUX DE CONFIANCE</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {Object.values(CONF).map(c => (
              <div key={c.label} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontFamily:T.mono, fontSize:9, padding:"2px 8px", borderRadius:3, background:`${c.color}15`, border:`1px solid ${c.color}44`, color:c.color, minWidth:80, textAlign:"center" }}>{c.label}</span>
                <span style={{ fontFamily:T.mono, fontSize:11, color:T.muted }}>{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── LIMITES DE L'ANALYSE ── */}
        <div style={{ marginTop:12, background:"rgba(232,93,4,0.05)", border:`1px solid rgba(232,93,4,0.2)`, borderRadius:10, overflow:"hidden" }}>
          <div onClick={() => setLimitesOpen(o => !o)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", cursor:"pointer" }}>
            <div style={{ fontFamily:T.mono, fontSize:10, letterSpacing:2, color:T.orange }}>LIMITES DE CETTE ANALYSE</div>
            <span style={{ fontFamily:T.mono, fontSize:13, color:T.orange, transition:"transform .2s", display:"inline-block", transform:limitesOpen?"rotate(90deg)":"none" }}>›</span>
          </div>
          {limitesOpen && (
            <div style={{ padding:"0 20px 16px", borderTop:`1px solid rgba(232,93,4,0.15)` }}>
              <div style={{ fontFamily:T.mono, fontSize:11, color:T.muted, lineHeight:1.85, marginTop:12 }}>
                Cette analyse est basée sur l'empreinte spectrale et dynamique du signal. Elle ne peut pas identifier avec certitude les plugins utilisés, ni déterminer si un son est synthétisé, samplé ou enregistré. Les suggestions de recréation sont des approximations fonctionnelles — une direction, pas une reconstruction exacte. Les plugins récents absents des données d'entraînement ne seront pas identifiés.
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

/* ── HISTORIQUE SCREEN ───────────────────────────────────── */
const MOCK_HISTORY = [
  { id:1, title:"After Hours",        artist:"The Weeknd",       mode:"ref",   daw:"Logic Pro",    date:"Aujourd'hui", lufs:"-8.2",  bpm:108 },
  { id:2, title:"Mon Mix V3",         artist:"Projet personnel", mode:"perso", daw:"Logic Pro",    date:"Hier",        lufs:"-12.1", bpm:95  },
  { id:3, title:"Blinding Lights",    artist:"The Weeknd",       mode:"ref",   daw:"Ableton Live", date:"Il y a 3j",   lufs:"-7.8",  bpm:171 },
  { id:4, title:"Mon EP — Track 2",   artist:"Projet personnel", mode:"perso", daw:"Logic Pro",    date:"Il y a 5j",   lufs:"-14.0", bpm:120 },
  { id:5, title:"Levitating",         artist:"Dua Lipa",         mode:"ref",   daw:"Logic Pro",    date:"Il y a 1sem", lufs:"-9.1",  bpm:103 },
  { id:6, title:"Démo — Refrain Mix", artist:"Projet personnel", mode:"perso", daw:"FL Studio",    date:"Il y a 2sem", lufs:"-11.5", bpm:88  },
];

const HistoriqueScreen = ({ onOpen }) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { s: ls } = useLang();

  const filtered = MOCK_HISTORY.filter(h => {
    const matchMode = filter === "all" || h.mode === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || h.title.toLowerCase().includes(q) || h.daw.toLowerCase().includes(q) || h.artist.toLowerCase().includes(q);
    return matchMode && matchSearch;
  });

  return (
    <div style={{ maxWidth:780, margin:"0 auto", padding:"24px 16px 80px", animation:"fadeup .35s ease" }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:T.body, fontWeight:600, fontSize:22, letterSpacing:.3, color:T.text, marginBottom:4 }}>{ls.historique_title}</h2>
        <p style={{ fontFamily:T.body, fontWeight:300, fontSize:13, color:T.muted }}>{ls.historique_sub}</p>
      </div>

      {/* Barre de recherche */}
      <div style={{ position:"relative", marginBottom:14 }}>
        <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke={T.muted} strokeWidth="1.3"/>
          <path d="M9.5 9.5L12 12" stroke={T.muted} strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={ls.search_placeholder}
          style={{
            width:"100%", background:T.s1, border:`1px solid ${T.border}`,
            borderRadius:10, padding:"10px 14px 10px 34px",
            fontFamily:T.mono, fontSize:11, color:T.text, outline:"none",
            boxSizing:"border-box",
          }}
          onFocus={e => e.target.style.borderColor = T.amber}
          onBlur={e => e.target.style.borderColor = T.border}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{
            position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
            background:"transparent", border:"none", cursor:"pointer",
            fontFamily:T.mono, fontSize:11, color:T.muted,
          }}>✕</button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[["all",ls.filter_all,T.amber],["ref",ls.filter_ref,T.cyan],["perso",ls.filter_perso,T.green]].map(([id,label,color]) => (
          <button key={id} onClick={() => setFilter(id)} style={{
            fontFamily:T.mono, fontSize:10, padding:"5px 14px", borderRadius:20,
            border:`1px solid ${filter===id ? color : T.border}`,
            background: filter===id ? `${color}14` : "transparent",
            color: filter===id ? color : T.muted,
            cursor:"pointer", transition:"all .15s",
          }}>{label}</button>
        ))}
        {(search || filter !== "all") && (
          <span style={{ fontFamily:T.mono, fontSize:10, color:T.muted, alignSelf:"center", marginLeft:"auto" }}>
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Résultats */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 0" }}>
          <div style={{ fontFamily:T.body, fontWeight:600, fontSize:13, color:T.muted, marginBottom:6 }}>{ls.no_results}</div>
          <div style={{ fontFamily:T.body, fontWeight:300, fontSize:12, color:T.muted }}>{ls.no_results_sub}</div>
          <button onClick={() => { setSearch(""); setFilter("all"); }} style={{
            marginTop:16, fontFamily:T.mono, fontSize:11, color:T.amber,
            background:"transparent", border:`1px solid ${T.amber}44`, borderRadius:8,
            padding:"6px 14px", cursor:"pointer",
          }}>{ls.reset}</button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(h => {
            const isRef = h.mode === "ref";
            const accent = isRef ? T.cyan : T.green;
            const q = search.toLowerCase();
            const highlight = (text) => {
              if (!q || !text.toLowerCase().includes(q)) return text;
              const i = text.toLowerCase().indexOf(q);
              return <>{text.slice(0,i)}<mark style={{ background:T.amber+"33", color:T.amber, borderRadius:2 }}>{text.slice(i, i+q.length)}</mark>{text.slice(i+q.length)}</>;
            };
            return (
              <div key={h.id} onClick={() => onOpen && onOpen(h)}
                style={{
                  background:T.s1, border:`1px solid ${T.border}`, borderRadius:12,
                  padding:"16px 18px", cursor:"pointer", transition:"all .18s",
                  display:"flex", alignItems:"center", gap:14,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.amber; e.currentTarget.style.background = T.s2; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.s1; }}
              >
                <div style={{ width:36, height:36, borderRadius:8, flexShrink:0, background:`${accent}14`, border:`1px solid ${accent}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {isRef
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={T.cyan} strokeWidth="1.4"/><path d="M8 4v4l3 2" stroke={T.cyan} strokeWidth="1.4" strokeLinecap="round"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3l5 5-5 5" stroke={T.green} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:T.body, fontSize:13, fontWeight:600, color:T.text, marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {highlight(h.title)}
                  </div>
                  <div style={{ fontFamily:T.body, fontWeight:300, fontSize:11, color:T.muted, marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {h.artist}
                  </div>
                  <div style={{ fontFamily:T.mono, fontSize:10, color:T.muted, display:"flex", gap:8, flexWrap:"wrap" }}>
                    <span style={{ color:accent, fontSize:9, padding:"1px 7px", borderRadius:4, background:`${accent}12`, border:`1px solid ${accent}22` }}>
                      {isRef ? "RÉFÉRENCE" : "PERSONNEL"}
                    </span>
                    <span>{highlight(h.daw)}</span>
                    <span>{h.bpm} BPM</span>
                    <span>{h.lufs} LUFS</span>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                  <span style={{ fontFamily:T.mono, fontSize:10, color:T.muted }}>{h.date}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 7h6M7 4l3 3-3 3" stroke={T.muted} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── RÉGLAGES SCREEN ─────────────────────────────────────── */
const ReglagesScreen = ({ user, setLang: setAppLang, onLegal, avatarPhoto, setAvatarPhoto }) => {
  const [section, setSection] = useState("profil");
  const [defaultDaw, setDefaultDaw] = useState("Logic Pro");
  const [notifNews, setNotifNews] = useState(true);
  const { lang, setLang: ctxSetLang, s: ls } = useLang();

  const handleLangChange = (l) => {
    ctxSetLang(l);
    if (setAppLang) setAppLang(l);
  };

  const sections = [
    { id:"profil",      label:ls.section_profil,       icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 13c0-3 2.5-4.5 5.5-4.5S12.5 10 12.5 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
    { id:"abonnement",  label:ls.section_abonnement,   icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.5 5H13L9.5 7.5L11 12L7 9.5L3 12L4.5 7.5L1 5H5.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> },
    { id:"paiement",    label:ls.section_paiement,     icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 6h12" stroke="currentColor" strokeWidth="1.3"/></svg> },
    { id:"preferences", label:ls.section_preferences,  icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M2 7h7M2 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
    { id:"securite",    label:ls.section_securite,    icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L2 3.5V7c0 3 2.5 5 5 6 2.5-1 5-3 5-6V3.5L7 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
    { id:"donnees",     label:ls.section_donnees,     icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><ellipse cx="7" cy="4" rx="5" ry="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 4v6c0 1.1 2.2 2 5 2s5-.9 5-2V4" stroke="currentColor" strokeWidth="1.3"/><path d="M2 7c0 1.1 2.2 2 5 2s5-.9 5-2" stroke="currentColor" strokeWidth="1.3"/></svg> },
  ];

  const Input = ({ label, value, type="text" }) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontFamily:T.body, fontWeight:400, fontSize:11, color:T.muted, marginBottom:6 }}>{label}</div>
      <input defaultValue={value} type={type} className="reglages-input" style={{
        width:"100%", background:T.s2, border:`1px solid ${T.border}`, borderRadius:8,
        padding:"10px 14px", fontFamily:T.mono, fontSize:13, lineHeight:1,
        WebkitAppearance:"none", appearance:"none",
        color:T.text, outline:"none",
      }}
        onFocus={e => e.target.style.borderColor = T.amber}
        onBlur={e => e.target.style.borderColor = T.border}
      />
    </div>
  );

  const Toggle = ({ label, value, onChange }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${T.border}` }}>
      <span style={{ fontFamily:T.body, fontWeight:400, fontSize:13, color:T.text }}>{label}</span>
      <div onClick={onChange} style={{
        width:40, height:22, borderRadius:11, cursor:"pointer", transition:"background .2s",
        background: value ? T.amber : T.s2, border:`1px solid ${value ? T.amber : T.border}`,
        position:"relative",
      }}>
        <div style={{
          position:"absolute", top:2, left: value ? 20 : 2, width:16, height:16,
          borderRadius:"50%", background: value ? T.black : T.muted,
          transition:"left .2s",
        }}/>
      </div>
    </div>
  );

  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const renderSection = () => {
    switch(section) {
      case "profil": return (
        <div>
          {/* Avatar */}
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
            <div style={{
              width:64, height:64, borderRadius:"50%", overflow:"hidden", flexShrink:0,
              background:`linear-gradient(135deg, ${T.amber}, ${T.orange})`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {avatarPhoto
                ? <img src={avatarPhoto} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : <span style={{ fontFamily:T.display, fontSize:28, color:T.black }}>{user?.avatar}</span>
              }
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ fontFamily:T.mono, fontSize:11, color:T.amber, background:"transparent", border:`1px solid ${T.amber}44`, borderRadius:8, padding:"7px 14px", cursor:"pointer" }}>
                {ls.change_photo}
              </button>
              {avatarPhoto && (
                <button onClick={() => setAvatarPhoto(null)}
                  style={{ fontFamily:T.mono, fontSize:10, color:T.muted, background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}>
                  ✕ Supprimer
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display:"none" }}
            />
          </div>
          <Input label={ls.username_label} value={user?.name || ""}/>
          <Input label="EMAIL" value={user?.email || ""} type="email"/>
          <button style={{ marginTop:8, width:"100%", padding:"12px", background:`linear-gradient(135deg, ${T.amber}, ${T.orange})`, border:"none", borderRadius:10, fontFamily:T.body, fontWeight:600, fontSize:13, letterSpacing:1.5, textTransform:"uppercase", color:T.black, cursor:"pointer" }}>
            {ls.save_btn}
          </button>
        </div>
      );

      case "abonnement": return (
        <div>
          <div style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:18, marginBottom:20 }}>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.muted, marginBottom:6 }}>{ls.plan_current}</div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ fontFamily:T.body, fontWeight:700, fontSize:20, color:T.text }}>FREE</div>
              <div style={{ fontFamily:T.mono, fontSize:10, color:T.muted }}>· 5 analyses / mois</div>
            </div>
            <div style={{ fontFamily:T.body, fontWeight:300, fontSize:12, color:T.muted, lineHeight:1.7 }}>
              Analyses limitées · Pas d'export · Assistant basique
            </div>
          </div>
          <div style={{ background:`linear-gradient(135deg, ${T.amber}18, ${T.orange}12)`, border:`1px solid ${T.amber}44`, borderRadius:12, padding:18, marginBottom:12 }}>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.amber, marginBottom:6, letterSpacing:1 }}>DECODE PRO</div>
            <div style={{ fontFamily:T.body, fontWeight:700, fontSize:20, color:T.amber, marginBottom:8 }}>9,99€ <span style={{ fontSize:14, color:T.amberDim }}>/mois</span></div>
            <div style={{ fontFamily:T.body, fontWeight:300, fontSize:12, color:T.muted, lineHeight:1.8, marginBottom:16 }}>
              Analyses illimitées · Export PDF · Assistant enrichi · Historique complet
            </div>
            <button style={{ width:"100%", padding:"12px", background:`linear-gradient(135deg, ${T.amber}, ${T.orange})`, border:"none", borderRadius:10, fontFamily:T.body, fontWeight:600, fontSize:13, letterSpacing:1.5, textTransform:"uppercase", color:T.black, cursor:"pointer" }}>
              {ls.upgrade_btn}
            </button>
          </div>
        </div>
      );

      case "paiement": return (
        <div>
          <div style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:18, marginBottom:20, display:"flex", alignItems:"center", gap:14 }}>
            <svg width="36" height="24" viewBox="0 0 36 24" fill="none"><rect width="36" height="24" rx="4" fill="#1A1F36"/><path d="M7 15h4v2H7zM13 15h10" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
            <div>
              <div style={{ fontFamily:T.body, fontWeight:400, fontSize:13, color:T.text }}>{ls.no_card}</div>
              <div style={{ fontFamily:T.body, fontWeight:300, fontSize:12, color:T.muted }}>{ls.card_required}</div>
            </div>
          </div>
          <button style={{ width:"100%", padding:"12px", background:"transparent", border:`1px solid ${T.border}`, borderRadius:10, fontFamily:T.body, fontWeight:400, fontSize:13, color:T.text, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round"/></svg>
            {ls.add_card}
          </button>
        </div>
      );

      case "preferences": return (
        <div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.muted, marginBottom:8, letterSpacing:.5 }}>{ls.daw_default}</div>
            <select value={defaultDaw} onChange={e => setDefaultDaw(e.target.value)} style={{
              width:"100%", background:T.s2, border:`1px solid ${T.border}`, borderRadius:8,
              padding:"10px 14px", fontFamily:T.mono, fontSize:11, color:T.text,
              outline:"none", cursor:"pointer",
            }}>
              {["Logic Pro","Ableton Live","FL Studio","Pro Tools","Cubase","Studio One","LUNA","Reaper"].map(d => (
                <option key={d} value={d} style={{ background:T.s2 }}>{d}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.muted, marginBottom:8, letterSpacing:.5 }}>{ls.lang_label}</div>
            <div style={{ display:"flex", gap:8 }}>
              {[["fr","Français"],["en","English"]].map(([id,label]) => (
                <button key={id} onClick={() => handleLangChange(id)} style={{
                  flex:1, padding:"10px", borderRadius:8, cursor:"pointer",
                  border:`1px solid ${lang===id ? T.amber : T.border}`,
                  background: lang===id ? T.amberGlow : T.s2,
                  color: lang===id ? T.amber : T.muted,
                  fontFamily:T.body, fontWeight:400, fontSize:13,
                }}>{label}</button>
              ))}
            </div>
          </div>
          <Toggle label={ls.notif_news} value={notifNews} onChange={() => setNotifNews(v => !v)}/>
        </div>
      );

      case "securite": return (
        <div>
          <Input label="MOT DE PASSE ACTUEL" value="" type="password"/>
          <Input label="NOUVEAU MOT DE PASSE" value="" type="password"/>
          <Input label="CONFIRMER LE MOT DE PASSE" value="" type="password"/>
          <button style={{ marginTop:8, width:"100%", padding:"12px", background:`linear-gradient(135deg, ${T.amber}, ${T.orange})`, border:"none", borderRadius:10, fontFamily:T.body, fontWeight:600, fontSize:13, letterSpacing:1.5, textTransform:"uppercase", color:T.black, cursor:"pointer" }}>
            {ls.modify_btn}
          </button>
          <div style={{ marginTop:20, padding:"14px 16px", background:"rgba(230,57,70,0.06)", border:`1px solid rgba(230,57,70,0.2)`, borderRadius:10 }}>
            <div style={{ fontFamily:T.body, fontWeight:600, fontSize:12, color:T.red, marginBottom:6 }}>{ls.danger_zone}</div>
            <button style={{ fontFamily:T.body, fontWeight:400, fontSize:12, color:T.red, background:"transparent", border:`1px solid rgba(230,57,70,0.3)`, borderRadius:8, padding:"8px 14px", cursor:"pointer" }}>
              Supprimer mon compte
            </button>
          </div>
        </div>
      );

      case "donnees": return (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[
            { label:ls.export_analyses, desc:ls.export_analyses_desc, icon:"↓" },
            { label:ls.export_data, desc:ls.export_data_desc, icon:"↓" },
          ].map((item, i) => (
            <div key={i} style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}>
              <div style={{ width:36, height:36, borderRadius:8, background:T.amberGlow, border:`1px solid ${T.amber}33`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.mono, fontSize:16, color:T.amber }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontFamily:T.body, fontWeight:500, fontSize:13, color:T.text, marginBottom:3 }}>{item.label}</div>
                <div style={{ fontFamily:T.body, fontWeight:300, fontSize:11, color:T.muted }}>{item.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop:8, padding:"14px 16px", background:"rgba(230,57,70,0.06)", border:`1px solid rgba(230,57,70,0.2)`, borderRadius:10 }}>
            <div style={{ fontFamily:T.body, fontWeight:600, fontSize:12, color:T.red, marginBottom:8 }}>{ls.delete_data}</div>
            <div style={{ fontFamily:T.body, fontWeight:300, fontSize:12, color:T.muted, lineHeight:1.6, marginBottom:12 }}>Cette action est irréversible. Toutes tes analyses et préférences seront supprimées.</div>
            <button style={{ fontFamily:T.body, fontWeight:400, fontSize:12, color:T.red, background:"transparent", border:`1px solid rgba(230,57,70,0.3)`, borderRadius:8, padding:"8px 14px", cursor:"pointer" }}>
              Supprimer mes données
            </button>
          </div>
        </div>
      );

      default: return null;
    }
  };

  const isMobileView = window.innerWidth < 768;

  // Mobile : accordion vertical
  if (isMobileView) {
    return (
      <div style={{ maxWidth:780, margin:"0 auto", padding:"16px 16px 80px", animation:"fadeup .35s ease" }}>
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontFamily:T.display, fontSize:24, letterSpacing:3, color:T.text }}>{ls.reglages_title}</h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {sections.map(sec => (
            <div key={sec.id} style={{ background:T.s1, border:`1px solid ${section===sec.id ? T.amber+"44" : T.border}`, borderRadius:12, overflow:"hidden", transition:"border-color .2s" }}>
              <button onClick={() => setSection(section===sec.id ? null : sec.id)} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                width:"100%", padding:"16px 18px", background:"transparent", border:"none",
                cursor:"pointer", textAlign:"left",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ color: section===sec.id ? T.amber : T.muted }}>{sec.icon}</span>
                  <span style={{ fontFamily:T.mono, fontSize:13, color: section===sec.id ? T.amber : T.text }}>{sec.label}</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: section===sec.id ? "rotate(180deg)" : "none", transition:"transform .2s" }}>
                  <path d="M2 4l4 4 4-4" stroke={section===sec.id ? T.amber : T.muted} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {section===sec.id && (
                <div style={{ padding:"0 18px 18px", borderTop:`1px solid ${T.border}`, paddingTop:16 }}>
                  {renderSection()}
                </div>
              )}
            </div>
          ))}
          {/* Legal links mobile */}
          <div style={{ display:"flex", gap:16, justifyContent:"center", paddingTop:8, marginTop:4 }}>
            {[["cgu","CGU"],["privacy","Confidentialité"],["mentions","Mentions"]].map(([doc,label]) => (
              <button key={doc} onClick={() => onLegal && onLegal(doc)} style={{
                fontFamily:T.mono, fontSize:10, color:T.muted2, background:"transparent",
                border:"none", cursor:"pointer", padding:"4px 0",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop : sidebar + contenu
  return (
    <div style={{ maxWidth:780, margin:"0 auto", padding:"24px 16px 80px", animation:"fadeup .35s ease" }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:T.body, fontWeight:600, fontSize:22, letterSpacing:.3, color:T.text, marginBottom:4 }}>{ls.reglages_title}</h2>
      </div>

      <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
        {/* Sidebar sections */}
        <div style={{ display:"flex", flexDirection:"column", gap:2, minWidth:140, flexShrink:0 }}>
          {sections.map(sec => (
            <button key={sec.id} onClick={() => setSection(sec.id)} style={{
              display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
              borderRadius:8, background: section===sec.id ? T.amberGlow : "transparent",
              border: section===sec.id ? `1px solid ${T.amber}33` : "1px solid transparent",
              cursor:"pointer", textAlign:"left", transition:"all .15s",
              color: section===sec.id ? T.amber : T.muted,
            }}>
              <span style={{ flexShrink:0 }}>{sec.icon}</span>
              <span style={{ fontFamily:T.mono, fontSize:11 }}>{sec.label}</span>
            </button>
          ))}
          {/* Legal links */}
          <div style={{ marginTop:16, paddingTop:12, borderTop:`1px solid ${T.border}`, display:"flex", flexDirection:"column", gap:4 }}>
            {[["cgu","CGU"],["privacy","Confidentialité"],["mentions","Mentions légales"]].map(([doc,label]) => (
              <button key={doc} onClick={() => onLegal && onLegal(doc)} style={{
                fontFamily:T.mono, fontSize:10, color:T.muted2, background:"transparent",
                border:"none", cursor:"pointer", textAlign:"left", padding:"4px 12px",
                transition:"color .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.color = T.muted}
                onMouseLeave={e => e.currentTarget.style.color = T.muted2}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Section content */}
        <div style={{ flex:1, background:T.s1, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

/* ── LEGAL MODAL ─────────────────────────────────────────── */
const LEGAL_CONTENT = {
  cgu: {
    fr: { title:"Conditions Générales d'Utilisation", sections:[
      { h:"1 — Objet", t:"Les présentes CGU régissent l'accès et l'utilisation de Decode, éditée par NEODIS. En accédant au Service, l'utilisateur accepte sans réserve les présentes conditions." },
      { h:"2 — Inscription", t:"L'accès nécessite la création d'un compte avec des informations exactes. L'utilisateur est responsable de la confidentialité de ses identifiants." },
      { h:"3 — Offres", t:"Formule Gratuite : 5 analyses/mois, assistant basique. Formule Pro à 9,99 €/mois : analyses illimitées, export PDF, assistant enrichi, historique complet." },
      { h:"4 — Utilisation acceptable", t:"Il est interdit d'analyser des œuvres sans droits, de contourner les protections techniques, ou d'utiliser le Service à des fins illicites. NEODIS peut suspendre tout compte en cas de violation." },
      { h:"5 — Propriété intellectuelle", t:"Tous les éléments du Service sont la propriété de NEODIS. Les fichiers uploadés restent la propriété de l'utilisateur, qui accorde une licence limitée aux seules fins d'exécution de l'analyse." },
      { h:"6 — IA et limites", t:"Le Service utilise Claude (Anthropic), Gemini (Google) et Fadr API. Les analyses sont indicatives et peuvent comporter des inexactitudes. L'identification de plugins est probabiliste." },
      { h:"7 — Responsabilité", t:"Le Service est fourni « en l'état ». La responsabilité de NEODIS est limitée aux sommes versées sur les 12 derniers mois." },
      { h:"8 — Droit applicable", t:"Droit français. Juridiction exclusive des tribunaux de Paris. Contact : legal@decode.app" },
    ]},
    en: { title:"Terms of Service", sections:[
      { h:"1 — Purpose", t:"These Terms govern access to and use of Decode, published by NEODIS. By accessing the Service, the user unconditionally accepts these Terms." },
      { h:"2 — Registration", t:"Access requires creating an account with accurate information. The user is responsible for the confidentiality of their credentials." },
      { h:"3 — Plans", t:"Free plan: 5 analyses/month, basic assistant. Pro plan at €9.99/month: unlimited analyses, PDF export, enhanced assistant, full history." },
      { h:"4 — Acceptable use", t:"It is prohibited to analyse works without rights, to circumvent technical protections, or to use the Service for unlawful purposes. NEODIS may suspend any account for violations." },
      { h:"5 — Intellectual property", t:"All Service elements are the property of NEODIS. Uploaded files remain the user's property; the user grants a limited licence solely for analysis purposes." },
      { h:"6 — AI and limitations", t:"The Service uses Claude (Anthropic), Gemini (Google) and Fadr API. Analyses are indicative and may contain inaccuracies. Plugin identification is probabilistic." },
      { h:"7 — Liability", t:"The Service is provided 'as is'. NEODIS liability is limited to amounts paid over the last 12 months." },
      { h:"8 — Governing law", t:"French law. Exclusive jurisdiction of Paris courts. Contact: legal@decode.app" },
    ]},
  },
  privacy: {
    fr: { title:"Politique de Confidentialité", sections:[
      { h:"Responsable du traitement", t:"NEODIS — legal@decode.app — est responsable du traitement des données personnelles collectées via Decode." },
      { h:"Données collectées", t:"Nom, email, photo de profil, historique des analyses, DAW préféré, fichiers audio (non conservés après analyse), données de facturation via Stripe, logs techniques." },
      { h:"Finalités", t:"Fourniture du Service, amélioration, facturation, prévention des fraudes. Bases légales : exécution du contrat, intérêt légitime, obligation légale." },
      { h:"Sous-traitants", t:"Anthropic (Claude API), Google (Gemini), Fadr API, Stripe (paiements), Vercel (hébergement). Tous contractuellement tenus au respect du RGPD." },
      { h:"Conservation", t:"Données de compte : 3 ans post-résiliation. Fichiers audio : supprimés après analyse. Facturation : 10 ans. Logs : 12 mois." },
      { h:"Vos droits", t:"Accès, rectification, effacement, portabilité, opposition, limitation. Contact : legal@decode.app. Réclamation possible auprès de la CNIL (cnil.fr)." },
      { h:"Cookies", t:"Uniquement des cookies techniques nécessaires au fonctionnement (session, langue). Aucun cookie publicitaire." },
    ]},
    en: { title:"Privacy Policy", sections:[
      { h:"Data controller", t:"NEODIS — legal@decode.app — is the controller of personal data collected through Decode." },
      { h:"Data collected", t:"Name, email, profile photo, analysis history, preferred DAW, audio files (not retained after analysis), billing data via Stripe, technical logs." },
      { h:"Purposes", t:"Service delivery, improvement, billing, fraud prevention. Legal bases: contract performance, legitimate interest, legal obligation." },
      { h:"Sub-processors", t:"Anthropic (Claude API), Google (Gemini), Fadr API, Stripe (payments), Vercel (hosting). All contractually bound to GDPR compliance." },
      { h:"Retention", t:"Account data: 3 years post-termination. Audio files: deleted after analysis. Billing: 10 years. Logs: 12 months." },
      { h:"Your rights", t:"Access, rectification, erasure, portability, objection, restriction. Contact: legal@decode.app. You may also lodge a complaint with your data protection authority." },
      { h:"Cookies", t:"Technical cookies only (session, language preferences). No advertising or third-party tracking cookies." },
    ]},
  },
  mentions: {
    fr: { title:"Mentions Légales", sections:[
      { h:"Éditeur", t:"NEODIS — legal@decode.app — Directeur de publication : David Berdugo" },
      { h:"Hébergement", t:"Vercel Inc. — 340 Pine Street, Suite 701, San Francisco, CA 94104, USA — vercel.com" },
      { h:"Propriété intellectuelle", t:"L'ensemble du contenu de Decode est protégé par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite." },
      { h:"Données personnelles", t:"Traitement décrit dans la Politique de Confidentialité. Contact DPO : legal@decode.app. Autorité de contrôle : CNIL (cnil.fr)." },
    ]},
    en: { title:"Legal Notice", sections:[
      { h:"Publisher", t:"NEODIS — legal@decode.app — Publication director: David Berdugo" },
      { h:"Hosting", t:"Vercel Inc. — 340 Pine Street, Suite 701, San Francisco, CA 94104, USA — vercel.com" },
      { h:"Intellectual property", t:"All Decode content is protected by intellectual property law. Any reproduction without authorisation is prohibited." },
      { h:"Personal data", t:"Processing described in the Privacy Policy. DPO contact: legal@decode.app. Supervisory authority: your national data protection authority." },
    ]},
  },
};

const LegalModal = ({ doc, onClose }) => {
  const { lang } = useLang();
  const content = LEGAL_CONTENT[doc]?.[lang] || LEGAL_CONTENT[doc]?.fr;
  if (!content) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:10001, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:T.s1, border:`1px solid ${T.border}`, borderRadius:20,
        width:"100%", maxWidth:600, maxHeight:"85vh", display:"flex", flexDirection:"column", overflow:"hidden",
      }}>
        <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ fontFamily:T.body, fontWeight:600, fontSize:16, color:T.text }}>{content.title}</div>
          <button onClick={onClose} style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:"50%", width:28, height:28, cursor:"pointer", color:T.muted, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>✕</button>
        </div>
        <div style={{ overflowY:"auto", padding:"20px 24px 28px", display:"flex", flexDirection:"column", gap:20 }}>
          {content.sections.map((sec, i) => (
            <div key={i}>
              <div style={{ fontFamily:T.body, fontWeight:600, fontSize:13, color:T.amber, marginBottom:6 }}>{sec.h}</div>
              <div style={{ fontFamily:T.body, fontWeight:300, fontSize:12, color:T.muted, lineHeight:1.7 }}>{sec.t}</div>
            </div>
          ))}
          <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:16, fontFamily:T.mono, fontSize:10, color:T.muted2, lineHeight:1.6 }}>
            Ces documents sont fournis à titre informatif et doivent être revus par un professionnel du droit avant mise en production.
          </div>
        </div>
      </div>
    </div>
  );
};
const AskModal = ({ onClose }) => {
  const [msgs, setMsgs] = useState([]);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const { s: ls } = useLang();

  const ask = async () => {
    const q = val.trim();
    if (!q || busy) return;
    setVal("");
    const next = [...msgs, { r:"user", t:q }];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(m => ({ role: m.r, content: m.t })) }),
      });
      const data = await res.json();
      const txt = data.reply || data.error || "Pas de réponse.";
      setMsgs([...next, { r:"assistant", t:txt }]);
    } catch(e) {
      // Sur mobile l'API artifact ne fonctionne pas — fallback simulé
      const q = next[next.length-1].t.toLowerCase();
      let fallback = "⚠️ Aperçu desktop uniquement — réponse simulée pour mobile.\n\n";
      if (q.includes("wurly") || q.includes("electric piano") || q.includes("rhodes")) {
        fallback += "Pour un Wurly avec chorus + trémolo sur Logic :\n1. Vintage Electric Piano (natif Logic) comme source\n2. Chorus : Rate 0.8Hz, Depth 40%, Mix 50%\n3. Tremolo : Rate 5-7Hz, Depth 70%\n4. Alternative pro : Scarbee Vintage Keys (Kontakt)";
      } else if (q.includes("compres")) {
        fallback += "Compression : Attack 8-12ms (laisse le transitoire), Release Auto, Ratio 4:1.\nSur Logic : Compressor mode Vintage VCA. Gratuit : TDR Kotelnikov.";
      } else if (q.includes("reverb") || q.includes("réverb")) {
        fallback += "Réverbe : Valhalla Room (50€) ou Supermassive (gratuit).\nPre-delay 20ms pour séparer la source. Decay 1-2s selon l'espace voulu.";
      } else {
        fallback += "Teste sur desktop pour une réponse complète de l'IA. Sur mobile, les appels API ne sont pas supportés dans cet aperçu.";
      }
      setMsgs([...next, { r:"assistant", t:fallback }]);
    }
    setBusy(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:10000, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.s1, border:`1px solid ${T.border}`, borderRadius:20, width:"100%", maxWidth:520, maxHeight:"80vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"18px 20px 14px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:T.display, fontSize:18, letterSpacing:3, color:T.amber }}>POSER UNE QUESTION</div>
            <div style={{ fontFamily:T.mono, fontSize:10, color:T.muted }}>{ls.ask_sub}</div>
          </div>
          <button onClick={onClose} style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:"50%", width:28, height:28, cursor:"pointer", color:T.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10 }}>
          {msgs.length === 0 && (
            <div style={{ fontFamily:T.mono, fontSize:11, color:T.muted, fontStyle:"italic" }}>
              Pose ta question — compression, EQ, réverbe, synth, DAW…
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} style={{ display:"flex", justifyContent: m.r==="user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth:"88%", padding:"10px 14px", borderRadius:10,
                background: m.r==="user" ? T.amberGlow : T.s2,
                border:`1px solid ${m.r==="user" ? T.amber+"33" : T.border}`,
                fontFamily:T.mono, fontSize:12, color: m.r==="user" ? T.amber : T.text, lineHeight:1.75, whiteSpace:"pre-wrap",
              }}>{m.t}</div>
            </div>
          ))}
          {busy && (
            <div style={{ display:"flex", justifyContent:"flex-start" }}>
              <div style={{ padding:"10px 14px", borderRadius:10, background:T.s2, border:`1px solid ${T.border}`, fontFamily:T.mono, fontSize:12, color:T.muted }}>▍</div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.border}`, display:"flex", gap:10, alignItems:"center", flexShrink:0 }}>
          <input
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key==="Enter" && !e.shiftKey && ask()}
            placeholder="Ta question…"
            style={{ flex:1, background:T.s2, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", fontFamily:T.mono, fontSize:16, color:T.text, outline:"none" }}
            onFocus={e => e.target.style.borderColor = T.amber}
            onBlur={e => e.target.style.borderColor = T.border}
          />
          <button onClick={ask} disabled={!val.trim() || busy} style={{
            width:38, height:38, borderRadius:"50%", flexShrink:0,
            background: val.trim() && !busy ? `linear-gradient(135deg, ${T.amber}, ${T.orange})` : T.s2,
            border:`1px solid ${val.trim() && !busy ? T.amber : T.border}`,
            cursor: val.trim() && !busy ? "pointer" : "not-allowed",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7L13 7M8 2L13 7L8 12" stroke={val.trim() && !busy ? T.black : T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}; // questions par jour pour les comptes FREE

const SUGGESTED_QUESTIONS = [
  "Comment bien utiliser la compression parallèle sur la batterie ?",
  "Quelle est la différence entre un EQ dynamique et un multibande ?",
  "Comment créer de la largeur stéréo sans que ça sonne faux en mono ?",
  "Quand utiliser un limiteur vs un compresseur sur le bus master ?",
  "Comment gérer la relation kick / basse en fréquences ?",
];

const ASK_SYSTEM = `Tu es un expert en production musicale, mixage et mastering avec 20 ans d'expérience.
Tu réponds à des questions de producteurs et ingénieurs du son de tous niveaux.
Tu t'appuies sur des techniques professionnelles éprouvées.
Tes réponses sont claires, directes, actionnables et avec des paramètres précis.
Tu utilises le vocabulaire exact des studios professionnels.
Pour chaque plugin cité, tu mentionnes systématiquement son alternative gratuite.
Pour chaque recommandation, tu donnes des valeurs concrètes (attack, release, ratio, fréquence, gain…).
Réponds en français.`;

const PaywallModal = ({ used, onClose }) => {
  const { s: ls } = useLang();
  return (
  <div style={{
    position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.75)",
    display:"flex", alignItems:"center", justifyContent:"center",
    backdropFilter:"blur(8px)", padding:24,
  }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{
      background:T.s1, border:`1px solid ${T.amber}44`, borderRadius:20,
      padding:32, maxWidth:360, width:"100%", animation:"fadeup .2s ease", textAlign:"center",
    }}>
      <div style={{ width:52, height:52, borderRadius:"50%", background:T.amberGlow, border:`1px solid ${T.amber}44`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3v8M11 15v1" stroke={T.amber} strokeWidth="2" strokeLinecap="round"/><circle cx="11" cy="11" r="9" stroke={T.amber} strokeWidth="1.5"/></svg>
      </div>
      <div style={{ fontFamily:T.display, fontSize:22, letterSpacing:3, color:T.amber, marginBottom:8 }}>LIMITE ATTEINTE</div>
      <div style={{ fontFamily:T.mono, fontSize:12, color:T.muted, lineHeight:1.8, marginBottom:24 }}>
        Tu as utilisé tes <strong style={{ color:T.text }}>{FREE_LIMIT} questions gratuites</strong> du jour.<br/>
        Passe en Pro pour une utilisation illimitée.
      </div>
      <button style={{
        width:"100%", padding:"14px",
        background:`linear-gradient(135deg, ${T.amber}, ${T.orange})`,
        border:"none", borderRadius:12, cursor:"pointer",
        fontFamily:T.display, fontSize:20, letterSpacing:4, color:T.black,
        marginBottom:12, boxShadow:`0 4px 20px rgba(245,160,0,.3)`,
      }}>{ls.upgrade_btn}</button>
      <button onClick={onClose} style={{ background:"transparent", border:"none", fontFamily:T.mono, fontSize:11, color:T.muted, cursor:"pointer" }}>
        Revenir demain pour de nouvelles questions gratuites
      </button>
    </div>
  </div>
  );
};

const AskScreen = ({ onBack, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(0); // simule le compteur serveur
  const [showPaywall, setShowPaywall] = useState(false);
  const isPro = user?.plan === "pro"; // en prod : vérifié côté serveur
  const remaining = Math.max(0, FREE_LIMIT - used);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;

    if (!isPro && used >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    setInput("");
    const newMessages = [...messages, { role:"user", content:q }];
    setMessages(newMessages);
    setLoading(true);
    if (!isPro) setUsed(u => u + 1);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:100,
          messages: [{ role:"user", content:"Bonjour" }],
        }),
      });
      const data = await res.json();
      const reply = data.content[0].text || "Une erreur est survenue.";
      setMessages([...newMessages, { role:"assistant", content:reply }]);
    } catch(e) {
      setMessages([...newMessages, { role:"assistant", content:"Erreur : " + e.message }]);
    }
    setLoading(false);
  };

  return (
    <>
      {showPaywall && <PaywallModal used={used} onClose={() => setShowPaywall(false)}/>}

      <div style={{ maxWidth:780, margin:"0 auto", display:"flex", flexDirection:"column", height:"calc(100vh - 132px)", animation:"fadeup .35s ease" }}>

        {/* Header */}
        <div style={{ padding:"16px 16px 14px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:T.amberGlow, border:`1px solid ${T.amber}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke={T.amber} strokeWidth="1.3"/><path d="M5.5 5.5c0-1 .6-1.5 1.5-1.5s1.5.6 1.5 1.5c0 .7-.4 1.2-1 1.5-.3.1-.3.5-.3.7" stroke={T.amber} strokeWidth="1.3" strokeLinecap="round"/><circle cx="7" cy="9.5" r=".6" fill={T.amber}/></svg>
              </div>
              <div>
                <div style={{ fontFamily:T.display, fontSize:16, letterSpacing:3, color:T.amber }}>POSER UNE QUESTION</div>
                <div style={{ fontFamily:T.mono, fontSize:9, color:T.muted }}>L'IA Decode — spécialiste prod musicale</div>
              </div>
            </div>
            {/* Quota badge */}
            {!isPro && (
              <div style={{
                display:"flex", alignItems:"center", gap:6, padding:"4px 10px",
                background: remaining <= 3 ? "rgba(230,57,70,0.08)" : T.amberGlow,
                border:`1px solid ${remaining <= 3 ? T.red+"44" : T.amber+"33"}`,
                borderRadius:20,
              }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background: remaining <= 3 ? T.red : T.amber }}/>
                <span style={{ fontFamily:T.mono, fontSize:9, color: remaining <= 3 ? T.red : T.amber }}>
                  {remaining} question{remaining !== 1 ? "s" : ""} restante{remaining !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {isPro && (
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", background:"rgba(249,224,75,0.08)", border:"1px solid rgba(249,224,75,0.2)", borderRadius:20 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L6 3.5H8.5L6.5 5L7.5 8L5 6.5L2.5 8L3.5 5L1.5 3.5H4Z" fill="#F9E04B"/></svg>
                <span style={{ fontFamily:T.mono, fontSize:9, color:"#F9E04B" }}>PRO — illimité</span>
              </div>
            )}
          </div>
        </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
        {messages.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ fontFamily:T.mono, fontSize:11, color:T.muted, marginBottom:8 }}>
              Questions fréquentes — tap pour commencer :
            </div>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => send(q)} style={{
                background:T.s1, border:`1px solid ${T.border}`, borderRadius:10,
                padding:"12px 16px", cursor:"pointer", textAlign:"left",
                fontFamily:T.mono, fontSize:12, color:T.muted, lineHeight:1.6,
                transition:"all .15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.amber; e.currentTarget.style.color = T.text; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
              >
                <span style={{ color:T.amber, marginRight:8 }}>→</span>{q}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth:"85%", padding:"12px 16px", borderRadius:12,
                  background: m.role==="user" ? T.amberGlow : T.s1,
                  border:`1px solid ${m.role==="user" ? T.amber+"33" : T.border}`,
                  fontFamily:T.mono, fontSize:12, color: m.role==="user" ? T.amber : T.text,
                  lineHeight:1.8, whiteSpace:"pre-wrap",
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", justifyContent:"flex-start" }}>
                <div style={{ padding:"12px 16px", borderRadius:12, background:T.s1, border:`1px solid ${T.border}` }}>
                  <span style={{ fontFamily:T.mono, fontSize:12, color:T.muted, animation:"blink 1s infinite" }}>▍</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.border}`, flexShrink:0, display:"flex", gap:10, alignItems:"center" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && !e.shiftKey && send()}
          placeholder="Ta question sur la prod musicale…"
          style={{
            flex:1, background:T.s2, border:`1px solid ${T.border}`, borderRadius:10,
            padding:"11px 14px", fontFamily:T.mono, fontSize:16, color:T.text, outline:"none",
          }}
          onFocus={e => e.target.style.borderColor = T.amber}
          onBlur={e => e.target.style.borderColor = T.border}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading} style={{
          width:40, height:40, borderRadius:"50%", flexShrink:0,
          background: input.trim() && !loading ? `linear-gradient(135deg, ${T.amber}, ${T.orange})` : T.s2,
          border:`1px solid ${input.trim() && !loading ? T.amber : T.border}`,
          cursor: input.trim() && !loading ? "pointer" : "not-allowed",
          display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7L13 7M8 2L13 7L8 12" stroke={input.trim() && !loading ? T.black : T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    </>
  );
};

/* ── MOBILE HOOK ─────────────────────────────────────────── */
const useMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
};

/* ── MOBILE BOTTOM NAV ───────────────────────────────────── */
const MobileNav = ({ step, onStep, appSection, onSection, user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { s: ls } = useLang();

  const menuItems = [
    { label:"Passer en Premium", color:"#F9E04B", icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1 L8 5 L12 5 L9 8 L10 12 L6.5 9.5 L3 12 L4 8 L1 5 L5 5 Z" stroke="#F9E04B" strokeWidth="1.2" strokeLinejoin="round"/></svg> },
    { label:"Réglages",          color:T.text,    action:() => onSection("reglages"), icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.6 2.6l.85.85M9.55 9.55l.85.85M2.6 10.4l.85-.85M9.55 3.45l.85-.85" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
    { label:"Aide & support",    color:T.text,    icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5c0-1 .7-1.5 1.5-1.5S8 4 8 5c0 .8-.5 1.2-1 1.5C6.5 7 6.5 7.5 6.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="6.5" cy="10" r=".7" fill="currentColor"/></svg> },
    { label:"Se déconnecter",    color:T.red, action:onLogout, icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 4.5L11.5 6.5L8.5 8.5" stroke="#E63946" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M11.5 6.5H5" stroke="#E63946" strokeWidth="1.3" strokeLinecap="round"/><path d="M5 2H2.5C1.7 2 1 2.7 1 3.5v6C1 10.3 1.7 11 2.5 11H5" stroke="#E63946" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  ];

  const navItems = [
    { id:"analyse",    label:ls.nav_analyse,   action:() => { onSection("analyse"); onStep(0); }, active: appSection==="analyse",    icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
    { id:"historique", label:ls.nav_historique, action:() => onSection("historique"),             active: appSection==="historique", icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h10M3 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
    { id:"reglages",   label:ls.nav_reglages,   action:() => onSection("reglages"),               active: appSection==="reglages",   icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  ];

  return (
    <>
      {/* Avatar menu overlay */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.5)" }}/>
          <div style={{
            position:"fixed", bottom:70, right:12, zIndex:301,
            background:T.s1, border:`1px solid ${T.border}`, borderRadius:16,
            overflow:"hidden", width:220,
            boxShadow:"0 -8px 40px rgba(0,0,0,0.8)", animation:"fadeup .15s ease",
          }}>
            <div style={{ padding:"14px 16px 12px", borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontFamily:T.body, fontSize:13, fontWeight:600, color:T.text }}>{user?.name}</div>
              <div style={{ fontFamily:T.mono, fontSize:10, color:T.muted, marginTop:2 }}>{user?.email}</div>
              <div style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:5,
                background:T.amberGlow, border:`1px solid ${T.amber}33`, borderRadius:6, padding:"2px 8px" }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:T.amber }}/>
                <span style={{ fontFamily:T.mono, fontSize:9, color:T.amber, letterSpacing:.5 }}>FREE</span>
              </div>
            </div>
            {menuItems.map((item, i) => (
              <button key={i} onClick={() => { setMenuOpen(false); item.action && item.action(); }} style={{
                display:"flex", alignItems:"center", gap:10, width:"100%",
                padding:"13px 16px", background:"transparent", border:"none",
                borderBottom: i < menuItems.length-1 ? `1px solid ${T.border}` : "none",
                cursor:"pointer", fontFamily:T.body, fontSize:13, color:item.color || T.text,
              }}>
                <span style={{ color:item.color || T.muted, opacity:.8 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Bottom nav bar */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:200,
        background:"rgba(7,7,7,0.97)", backdropFilter:"blur(20px)",
        borderTop:`1px solid ${T.border}`,
        display:"flex", alignItems:"center",
        height:58, paddingBottom:"env(safe-area-inset-bottom)",
      }}>
        {navItems.map(n => (
          <button key={n.id} onClick={n.action} style={{
            flex:1, display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", gap:4, height:"100%",
            background:"transparent", border:"none", cursor:"pointer",
            color: n.active ? T.amber : T.muted,
            transition:"color .15s",
          }}>
            <div style={{ filter: n.active ? `drop-shadow(0 0 6px ${T.amber})` : "none", transition:"filter .15s" }}>
              {n.icon}
            </div>
            <span style={{ fontFamily:T.mono, fontSize:9, letterSpacing:.5, fontWeight: n.active ? 600 : 400 }}>
              {n.label}
            </span>
          </button>
        ))}
      </div>
    </>
  );
};

const MobileHeader = ({ step, onStep, user, onLogout, avatarPhoto, onSection }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label:"Passer en Premium", color:"#F9E04B", icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L8 5L12 5L9 8L10 12L6.5 9.5L3 12L4 8L1 5L5 5Z" stroke="#F9E04B" strokeWidth="1.2" strokeLinejoin="round"/></svg> },
    { label:"Réglages",          color:T.text,    action:() => onSection("reglages"), icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.6 2.6l.85.85M9.55 9.55l.85.85M2.6 10.4l.85-.85M9.55 3.45l.85-.85" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
    { label:"Aide & support",    color:T.text,    icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5c0-1 .7-1.5 1.5-1.5S8 4 8 5c0 .8-.5 1.2-1 1.5C6.5 7 6.5 7.5 6.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="6.5" cy="10" r=".7" fill="currentColor"/></svg> },
    { label:"Se déconnecter",    color:T.red, action:onLogout, icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 4.5L11.5 6.5L8.5 8.5" stroke="#E63946" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M11.5 6.5H5" stroke="#E63946" strokeWidth="1.3" strokeLinecap="round"/><path d="M5 2H2.5C1.7 2 1 2.7 1 3.5v6C1 10.3 1.7 11 2.5 11H5" stroke="#E63946" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  ];

  return (
    <>
      {/* Dropdown menu */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.5)" }}/>
          <div style={{
            position:"fixed", top:60, right:12, zIndex:301,
            background:T.s1, border:`1px solid ${T.border}`, borderRadius:16,
            overflow:"hidden", width:220,
            boxShadow:"0 8px 40px rgba(0,0,0,0.8)", animation:"fadeup .15s ease",
          }}>
            <div style={{ padding:"14px 16px 12px", borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontFamily:T.body, fontSize:13, fontWeight:600, color:T.text }}>{user?.name}</div>
              <div style={{ fontFamily:T.mono, fontSize:10, color:T.muted, marginTop:2 }}>{user?.email}</div>
              <div style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:5,
                background:T.amberGlow, border:`1px solid ${T.amber}33`, borderRadius:6, padding:"2px 8px" }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:T.amber }}/>
                <span style={{ fontFamily:T.mono, fontSize:9, color:T.amber, letterSpacing:.5 }}>FREE</span>
              </div>
            </div>
            {menuItems.map((item, i) => (
              <button key={i} onClick={() => { setMenuOpen(false); item.action && item.action(); }} style={{
                display:"flex", alignItems:"center", gap:10, width:"100%",
                padding:"13px 16px", background:"transparent", border:"none",
                borderBottom: i < menuItems.length-1 ? `1px solid ${T.border}` : "none",
                cursor:"pointer", fontFamily:T.body, fontSize:13, color:item.color || T.text,
              }}
                onMouseEnter={e => e.currentTarget.style.background = T.s2}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ color:item.color || T.muted, opacity:.8 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      <header style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 16px", height:52,
        borderBottom:`1px solid ${T.border}`,
        background:"rgba(7,7,7,0.96)", backdropFilter:"blur(16px)",
        position:"sticky", top:0, zIndex:100,
      }}>
        <div onClick={() => onStep(0)} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
          <DecodeLogo sz={0.8}/>
          <span style={{ fontFamily:T.display, fontSize:18, letterSpacing:5, color:T.amber }}>DECODE</span>
          <div style={{ width:5, height:5, borderRadius:"50%", background:T.amber, animation:"apulse 2.5s infinite" }}/>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {step > 0 && (
            <button onClick={() => onStep(step - 1)} style={{
              background:"transparent", border:`1px solid ${T.border}`, borderRadius:8,
              padding:"5px 12px", cursor:"pointer",
              fontFamily:T.mono, fontSize:10, color:T.muted,
              display:"flex", alignItems:"center", gap:5,
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 2L3 5L7 8" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
              Retour
            </button>
          )}
          {/* Avatar top right */}
          {user && (
            <div
              onClick={() => setMenuOpen(o => !o)}
              style={{
                width:32, height:32, borderRadius:"50%", overflow:"hidden",
                background:`linear-gradient(135deg, ${T.amber}, ${T.orange})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:T.display, fontSize:14, color:T.black,
                cursor:"pointer", flexShrink:0,
                boxShadow: menuOpen ? `0 0 0 2px ${T.amber}` : `0 0 0 1px ${T.amber}44`,
                transition:"box-shadow .2s",
              }}
            >{avatarPhoto
              ? <img src={avatarPhoto} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : user.avatar
            }</div>
          )}
        </div>
      </header>
    </>
  );
};

/* ── APP ROOT ────────────────────────────────────────────── */
export default function DecodeApp() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appSection, setAppSection] = useState("analyse");
  const [askOpen, setAskOpen] = useState(false);
  const [legalDoc, setLegalDoc] = useState(null);
  const [avatarPhoto, setAvatarPhoto] = useState(null);
  const [lang, setLangState] = useState("fr");
  const isMobile = useMobile();

  useEffect(() => {
    const load = async () => {
      try {
        const r = await window.storage.get("decode_lang");
        if (r && r.value === "fr") setLangState("fr");
        else if (r && r.value === "en") setLangState("en");
        // No stored value → stays "fr" (default)
      } catch {}
    };
    load();
  }, []);

  const setLang = async (l) => {
    setLangState(l);
    try { await window.storage.set("decode_lang", l); } catch {}
  };

  const s = STRINGS[lang];

  const goTo = (n) => {
    if (n === 0) { setMode(null); setConfig(null); setLoading(false); }
    setStep(n);
    setAppSection("analyse");
  };

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => { setUser(null); goTo(0); setAppSection("analyse"); };

  const handleMode = m => {
    if (m === "ask") { setAskOpen(true); return; }
    setMode(m); setStep(1);
  };
  const handleAnalyze = cfg => { setConfig(cfg); setLoading(true); };
  const handleLoaded = () => { setLoading(false); setStep(2); };

  if (!user) return (
    <LangContext.Provider value={{ lang, s, setLang }}>
      <FontLink/><G/>
      <div className="dapp">
        {legalDoc && <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)}/>}
        <LoginScreen onLogin={handleLogin} onLegal={setLegalDoc}/>
      </div>
    </LangContext.Provider>
  );

  const mainContent = appSection === "historique"
    ? <HistoriqueScreen onOpen={(h) => {
        setConfig({ mode: h.mode, daw: h.daw, title: h.title });
        setStep(2);
        setAppSection("analyse");
      }}/>
    : appSection === "reglages"
      ? <ReglagesScreen user={user} setLang={setLang} onLegal={setLegalDoc} avatarPhoto={avatarPhoto} setAvatarPhoto={setAvatarPhoto}/>
      : loading
        ? <LoadingScreen onDone={handleLoaded}/>
        : step===0
          ? <ModeScreen onSelect={handleMode}/>
          : step===1
            ? <InputScreen mode={mode} onAnalyze={handleAnalyze}/>
            : <FicheScreen config={config||{mode:mode||"ref", daw:"Logic Pro"}}/>;

  return (
    <LangContext.Provider value={{ lang, s, setLang }}>
      <FontLink/><G/>
      <div className="dapp">
        {askOpen && <AskModal onClose={() => setAskOpen(false)}/>}
        {legalDoc && <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)}/>}
        {isMobile ? (
          <>
            <MobileHeader step={step} onStep={goTo} user={user} onLogout={handleLogout} avatarPhoto={avatarPhoto} onSection={setAppSection}/>
            <div style={{ position:"relative", zIndex:1, paddingBottom:74 }}>
              {mainContent}
            </div>
            <MobileNav step={step} onStep={goTo} appSection={appSection} onSection={setAppSection} user={user} onLogout={handleLogout}/>
          </>
        ) : (
          <>
            <Header step={step} onStep={goTo} user={user} onLogout={handleLogout} avatarPhoto={avatarPhoto} onSection={setAppSection}/>
            <div style={{ position:"relative", zIndex:1 }}>
              {mainContent}
            </div>
          </>
        )}
      </div>
    </LangContext.Provider>
  );
}

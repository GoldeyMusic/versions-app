import T from "../constants/theme";

const GlobalStyles = () => (
  <style>{`
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:${T.black}}
    /* iOS zoom prevention — inputs only (selects don't trigger zoom) */
    @media(max-width:767px){input,textarea{font-size:16px!important;}}
    /* Réglages inputs — override 16px, pas de risque de zoom car champ court */
    @media(max-width:767px){.reglages-input{font-size:13px!important;}}
    /* Desktop inputs — force font */
    @media(min-width:768px){input,textarea{font-family:'DM Sans',sans-serif;font-size:11px;line-height:1;-webkit-appearance:none;appearance:none;}}
    /* Placeholder — DM Sans 11px partout */
    input::placeholder,textarea::placeholder{font-family:'DM Sans',sans-serif;font-size:11px;color:${T.muted};opacity:1;}
    ::-webkit-input-placeholder{font-family:'DM Sans',sans-serif;font-size:11px;color:${T.muted};}
    :-ms-input-placeholder{font-family:'DM Sans',sans-serif;font-size:11px;color:${T.muted};}
    .dapp{background:${T.black};color:${T.text};width:100%;height:100vh;height:100dvh;overflow:hidden;position:relative;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;}
    .dapp::after{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");pointer-events:none;z-index:9999;opacity:0.6}
    /* Scrollbar globale du document : masquée pour éviter la bande
       sombre du track sur le bord droit. Le scroll reste actif
       (mousewheel/keyboard/trackpad). Les scrollbars internes des
       autres conteneurs gardent leur style amber via les sélecteurs
       génériques en dessous. */
    html{scrollbar-width:none}
    html::-webkit-scrollbar{display:none}
    body::-webkit-scrollbar{display:none}
    /* Scrollbars internes (panneaux scrollables) : fines, transparentes */
    *::-webkit-scrollbar{width:4px;height:4px;background:transparent}
    *::-webkit-scrollbar-track{background:transparent}
    *::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
    *::-webkit-scrollbar-corner{background:transparent}
    @keyframes apulse{0%,100%{box-shadow:0 0 0 0 rgba(245,166,35,.3)}50%{box-shadow:0 0 0 8px rgba(245,166,35,0)}}
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

export default GlobalStyles;

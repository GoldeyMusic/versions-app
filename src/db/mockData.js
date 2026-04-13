import CONF from '../constants/confidence.js';

// Note: T (theme colors) is imported in App.jsx as needed
// If you need theme colors, import like: import T from '../constants/theme.js'

export const REF_DATA = {
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
    {step:"INPUT",  label:"Source audio",          c:"#999999"},
    {step:"GATE",   label:"Noise Gate probable",    c:"#48CAE4"},
    {step:"EQ",     label:"HP ~40Hz + dip 400Hz",   c:"#F5A000"},
    {step:"COMP",   label:"Compression ~4:1",        c:"#FF6B35"},
    {step:"SAT",    label:"Saturation harmonique",   c:"#E8A0F5"},
    {step:"REV",    label:"Hall ~4.5s",              c:"#48CAE4"},
    {step:"OUT",    label:"Bus limiter",             c:"#57CC99"},
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

export const PERSO_DATA = {
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

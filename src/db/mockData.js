import CONF from '../constants/confidence.js';

export const REF_DATA = {
  title:"After Hours — The Weeknd", bpm:108, key:"La min", lufs:-8.2,
  elements:[
    { id:"voice", cat:"VOIX", icon:"voice",
      items:[
        { conf:"identified", label:"Voix principale doublée avec harmonisation", detail:"Doublure vocale détectée à la tierce, légère désynchronisation (~20ms) pour l'épaisseur. Compression forte sur la voix lead, ratio estimé 6:1.", tools:["Compression parallèle", "EQ boost 3-5kHz pour la présence", "De-esser autour de 7kHz"] },
        { conf:"suggested", label:"Vocodeur ou pitch shifting en arrière-plan", detail:"Couche vocale traitée en arrière-plan, probablement pitch-shifted ou passée dans un vocodeur. Ajoute une texture synthétique au refrain.", tools:["Pitch shifting -12 semitones", "Vocodeur léger", "Reverb longue sur couche traitée"] },
      ]},
    { id:"instruments", cat:"INSTRUMENTS", icon:"synths",
      items:[
        { conf:"identified", label:"Pad analogique large avec détunage stéréo", detail:"Deux oscillateurs détunés de ±8 cents, panned L/R. Mouvement de chorus lent, filtre LP avec cutoff automatisé. C'est le lit harmonique principal du morceau.", tools:["2 oscillateurs détunés", "Chorus lent", "Filtre LP automatisé"] },
        { conf:"identified", label:"Lead arpégé — dent de scie filtrée", detail:"Pattern en 16ème, timbre brillant. Delay ping-pong synchronisé au tempo. Occupe la zone 2-8kHz.", tools:["Synthèse soustractive", "Delay ping-pong au tempo", "Sidechain léger au kick"] },
        { conf:"suggested", label:"Couche de cordes ou pad orchestral", detail:"Présence d'harmoniques riches dans les mids (500Hz-2kHz) qui évoquent des cordes samplées ou un pad orchestral. Filtré pour rester en arrière-plan.", tools:["Strings samplées", "EQ roll-off au-dessus de 3kHz", "Reverb hall longue"] },
      ]},
    { id:"bass", cat:"BASSES & KICK", icon:"bass",
      items:[
        { conf:"identified", label:"Sub basse synthétisée avec harmoniques contrôlées", detail:"Fondamentale sous 60Hz, release long (~800ms). Saturation harmonique légère pour la présence sur petites enceintes. Sidechain au kick.", tools:["Sidechain compresseur", "Saturation douce sur les harmoniques", "HPF sur les autres éléments"] },
        { conf:"measured", label:"Kick court et percussif — transient sous 10ms", detail:"Kick échantillonné, énergie concentrée 55-80Hz. Cohabite bien avec la basse grâce au sidechain.", tools:["Transient shaper", "EQ boost à 60Hz", "Compression rapide"] },
      ]},
    { id:"drums", cat:"DRUMS & PERCUSSIONS", icon:"drums",
      items:[
        { conf:"identified", label:"Hi-hats en 16ème avec vélocité humanisée", detail:"Pas de répétition mécanique — vélocités variables détectées. Reverb courte (~0.8s). Pattern classique trap/pop.", tools:["Variation de vélocité", "Reverb room courte", "Pan légèrement décentré"] },
        { conf:"suggested", label:"Clap layeré — sample + reverb plate", detail:"Le clap a une épaisseur qui suggère un layering de 2-3 samples. Queue de reverb plate détectée.", tools:["Layer de 2-3 samples", "Reverb plate courte", "Transient shaper pour l'attaque"] },
      ]},
    { id:"fx", cat:"SPATIAL & REVERB", icon:"fx",
      items:[
        { conf:"measured", label:"Reverb hall longue sur la voix — decay ~4-5s", detail:"Pre-delay estimé 25-30ms. Filtrage HP sur le tail. Contribue à l'atmosphère cinématique du morceau.", tools:["Reverb hall avec pre-delay 25ms", "HPF sur le return à 200Hz", "Automation du send au refrain"] },
        { conf:"measured", label:"Delay ping-pong synchronisé — 1/8 @ 108 BPM", detail:"Temps mesuré : 139ms. Feedback ~30%. Filtre LP sur les répétitions.", tools:["Delay sync 1/8", "Feedback 25-35%", "Filtre LP sur les répétitions"] },
      ]},
    { id:"master", cat:"MASTER & LOUDNESS", icon:"lufs",
      items:[
        { conf:"measured", label:"LUFS intégré : -8.2 — loud pour du streaming", detail:"Au-dessus du target Spotify (-14 LUFS). La normalisation va baisser le volume. Crest factor faible, peu de dynamique.", tools:["Limiter sur master bus", "Vérifier le true peak < -1dBTP", "A/B avec et sans limiter"] },
      ]},
  ],
  tips:[
    "Poser le sub basse et le kick en premier — leur relation fréquentielle conditionne tout le groove.",
    "Pour le pad : deux oscillateurs détunés ±8 cents, panned L/R 70%, reverb plate courte.",
    "Delay ping-pong sur le lead : 139ms à 108 BPM. Feedback ~30%, filtre HP.",
  ],
  summary:"Production très léchée, typique du son pop/R&B moderne. L'espace stéréo est large et bien organisé, chaque élément a sa place. Le loudness est élevé mais maîtrisé.",
};

export const PERSO_DATA = {
  title:"Mon Mix V3 — Analyse personnelle", bpm:95, key:"Ré maj", lufs:-12.1,
  score:{MIX:68, BALANCE:74, FREQ:61, DYN:55},
  elements:[
    { id:"voice", cat:"VOIX", icon:"voice",
      items:[
        { conf:"identified", label:"Voix bien placée mais manque de présence dans les aigus", detail:"La voix occupe bien le centre mais perd en intelligibilité face aux instruments. Un boost léger entre 3-5kHz et une compression plus agressive aideraient.", tools:["EQ boost shelf 3-5kHz", "Compression ratio 4:1", "De-esser si sibilances"] },
      ]},
    { id:"instruments", cat:"INSTRUMENTS", icon:"synths",
      items:[
        { conf:"identified", label:"Guitare acoustique : bonne prise mais occupe trop de spectre", detail:"La guitare prend beaucoup de place entre 200-800Hz, empiétant sur la voix et la basse. Un nettoyage soustractif libérerait de l'espace.", tools:["EQ soustractif -3dB @ 400Hz", "HPF à 100Hz sur la guitare", "Compression légère"] },
        { conf:"identified", label:"Piano / keys en arrière-plan", detail:"Bon placement stéréo, mais les fréquences basses du piano entrent en conflit avec la basse. Un HPF plus agressif serait utile.", tools:["HPF à 200Hz sur le piano", "Pan plus large L/R", "Reverb room pour la profondeur"] },
      ]},
    { id:"bass", cat:"BASSES & KICK", icon:"bass",
      items:[
        { conf:"identified", label:"Conflit basse-kick non résolu", detail:"Les deux occupent la même zone fréquentielle sans séparation. Le kick disparaît quand la basse joue.", tools:["Sidechain kick → basse", "EQ : kick boost 60Hz, basse boost 90Hz", "Transient shaper sur le kick"] },
      ]},
    { id:"drums", cat:"DRUMS & PERCUSSIONS", icon:"drums",
      items:[
        { conf:"identified", label:"Kit de batterie bien équilibré", detail:"Bon rapport entre les éléments du kit. Les overheads apportent de l'air. Le snare pourrait être un peu plus présent.", tools:["Boost 200Hz sur le snare", "Compression parallèle sur le bus drums", "Room reverb courte"] },
      ]},
    { id:"fx", cat:"SPATIAL & REVERB", icon:"fx",
      items:[
        { conf:"suggested", label:"Espace stéréo bien exploité sur les arrangements", detail:"Le champ stéréo est correctement utilisé. Les éléments secondaires ont de la largeur sans écraser le centre.", tools:["Garder cette approche", "Vérifier la compatibilité mono", "Mid/Side EQ si besoin"] },
      ]},
    { id:"master", cat:"MASTER & LOUDNESS", icon:"lufs",
      items:[
        { conf:"measured", label:"LUFS trop bas — -12.1 mesuré", detail:"Pour le streaming (Spotify, Apple Music), un target de -9 à -10 LUFS intégré est recommandé. Le mix a de la marge.", tools:["Limiter sur master bus", "Gain staging avant le limiter", "Vérifier true peak < -1dBTP"] },
      ]},
  ],
  plan:[
    {p:"HIGH", task:"Sidechain kick → basse : -6dB de réduction à chaque frappe", daw:"Compressor sur basse → External Side-Chain → Bus Kick → Attack 1ms, Release 100ms", metered:"Kick masqué par la basse, perd 4dB de transient", target:"Kick audible à chaque frappe, pompage musical contrôlé"},
    {p:"HIGH", task:"Nettoyage fréquentiel guitare : dip -3dB @ 400-600Hz", daw:"Channel EQ sur piste guitare → Bande paramétrique → Bell -3dB, Q=1.5 @ 500Hz", metered:"Accumulation +4dB entre 400-600Hz sur le bus instruments", target:"Plat à ±1dB dans la zone 400-600Hz"},
    {p:"MED",  task:"Remonter le loudness global — target -9 LUFS", daw:"Limiter sur Master Bus → Input gain +2-3dB → Output Ceiling -1dBTP", metered:"-12.1 LUFS intégré", target:"-9 à -10 LUFS intégré"},
    {p:"MED",  task:"Boost présence voix : shelf +2dB à 4kHz", daw:"Channel EQ sur voix → High Shelf +2dB @ 4kHz, Q=0.7", metered:"Voix perd en intelligibilité dans le refrain", target:"Voix claire et présente même avec tous les instruments"},
  ],
  summary:"Mix prometteur avec de bonnes idées d'arrangement. Les principaux axes d'amélioration sont la séparation kick/basse et le nettoyage des mids pour donner de l'air au mix.",
};

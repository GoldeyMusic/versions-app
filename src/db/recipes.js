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

export default RECIPES_DB;

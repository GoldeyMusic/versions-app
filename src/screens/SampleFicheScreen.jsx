import { useState, useEffect, useRef } from 'react';
import GlobalStyles from '../components/GlobalStyles';
import MockupStyles from '../components/MockupStyles';
import ReleaseReadinessBanner from '../components/ReleaseReadinessBanner';
import EvolutionBanner from '../components/EvolutionBanner';
import {
  ScoreRingBig,
  ScoreRingSmall,
  QualitativeSection,
  IntentPanel,
  MixRadar,
  DspMasterBlock,
  VoiceVsInstruBlock,
  StereoFieldBlock,
  computeMixIndicators,
} from './FicheScreen';
import {
  renderWithEmphasis,
  splitVerdict,
  applyVocalTypeToFiche,
  isVoiceCategory,
  normalizeDiagItem,
} from '../lib/ficheHelpers.jsx';
import useLang from '../hooks/useLang';
import T from '../constants/theme';

// FontLink dupliqué — comme PublicFicheScreen, on évite l'import circulaire
// d'App pour rester rendu en pré-auth sans dépendance lourde.
function FontLink() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
    />
  );
}

// ── Données fictives (ticket 3.2) ───────────────────────────────────────
// Morceau francophone crédible. Volontairement mid-good (78/100) pour
// montrer une fiche utile avec des actions concrètes — pas un mix parfait.
// Toutes les valeurs techniques (Hz, dB, ratios, plugins) sont plausibles
// et conformes au format de notes ticket 1.1.
const SAMPLE_INTENT = "Pop électro mélancolique. Voix porteuse, fragile mais déterminée. Couplets : retenue, intériorité ; refrain : libération qui ne décolle pas tout à fait. Références : « La Chair » de Christine and the Queens, « Sober » de Lorde.";

const SAMPLE_DATA = {
  trackTitle: 'Brûle',
  versionName: 'V2',
  prevVersionName: 'V1',
  prevScore: 80,
  vocalType: 'vocal',
  analysisResult: {
    intent_used: SAMPLE_INTENT,
    _intent_scope: 'version',
    fiche: {
      globalScore: 78,
      verdict: "Une atmosphère qui tient debout. Reste à dégager le refrain pour qu'il respire vraiment.",
      summary: "La V2 a rapproché le mix de l'intention artistique. Le parti-pris mélancolique est lisible — synthés enveloppants, basse ronde, voix présente sans surjouer. Reste à dégager la voix dans le 2-4 kHz et à mieux différencier le couplet du refrain en dynamique.",
      // Genre inféré pendant l'analyse (le bouton "Choisir automatiquement"
      // a été coché à l'upload). Le caveat "détecté pendant l'analyse"
      // s'affichera en suffixe parenthétique.
      declared_genre: null,
      inferred_genre: 'pop électro mélancolique',
      genre_inferred_by_ai: true,
      // Évolution V1 → V2 — alimente EvolutionBanner. Un mix de progrès et
      // régressions pour montrer toute la grammaire du suivi inter-versions.
      // (Exposé hors fiche dans la vraie app, on le rattache ici pour simplifier.)
      // ─── 6 catégories canoniques dans l'ordre exact de la vraie fiche ─
      // VOIX → INSTRUMENTS → BASSES & KICK → DRUMS & PERCUSSIONS → SPATIAL & REVERB → MASTER & LOUDNESS
      // (Mêmes "cat" et "icon" que le persoTemplate du backend Claude.)
      elements: [
        {
          id: 'voice',
          cat: 'VOIX',
          icon: 'voice',
          items: [
            {
              id: 'voice-1',
              section: 'VOIX',
              priority: 'high',
              score: 71,
              title: 'Sibilances marquées',
              why: "Certaines syllabes (« tout », « tu », « sortie ») ressortent du mix avec une énergie excessive dans les aigus — fatigue l'oreille à l'écoute prolongée au casque.",
              how: 'De-esser sur la voix : center 6.5 kHz, range -4 dB, threshold -22 dB. EQ shelf -1.5 dB au-dessus de 8 kHz pour adoucir les consonnes sifflantes.',
              plugin_pick: 'FabFilter Pro-DS',
            },
            {
              id: 'voice-2',
              section: 'VOIX',
              priority: 'med',
              score: 78,
              title: 'Compression voix bien dosée',
              why: "La voix tient sans pomper — la dynamique de l'interprétation reste vivante, on entend les nuances entre pianissimos et fortissimos.",
              how: "Conserver la chaîne actuelle. Vérifier que l'auto-make-up gain ne grimpe pas sur les pianissimos.",
              plugin_pick: 'Waves CLA-76',
            },
            {
              id: 'voice-3',
              section: 'VOIX',
              priority: 'low',
              score: 80,
              title: "Air et présence cohérents avec l'intention",
              why: 'Le grain fragile de la voix est préservé, ce qui sert directement le parti-pris mélancolique du morceau.',
              how: "RAS — conserver tel quel. Ne pas céder à la tentation d'ajouter de l'air dans les hautes fréquences pour « sonner pro » — ça casserait l'intention.",
              plugin_pick: '—',
            },
          ],
        },
        {
          id: 'synths',
          cat: 'INSTRUMENTS',
          icon: 'synths',
          items: [
            {
              id: 'synths-1',
              section: 'INSTRUMENTS',
              priority: 'high',
              score: 68,
              title: 'Synthé lead encombre la voix',
              why: "Le synthé lutte avec la voix dans la zone 2-4 kHz, ce qui mange l'intelligibilité du refrain alors que c'est le moment où le texte doit s'entendre le plus clairement.",
              how: 'EQ dynamique sur le synthé lead : -3 dB autour de 3 kHz, sidechainé sur le bus voix. Q 1.2, attack 10 ms, release 80 ms.',
              plugin_pick: 'FabFilter Pro-Q 4',
            },
            {
              id: 'synths-2',
              section: 'INSTRUMENTS',
              priority: 'med',
              score: 76,
              title: 'Pont moins tenu que les couplets',
              why: "Le pont (à 2:14) ouvre l'arrangement mais le mix s'éclaircit un peu trop ; on perd l'identité sombre installée plus tôt.",
              how: 'Garder les pads texturés actifs jusqu\'à 2:30 (au lieu de couper à 2:14). Vérifier que la couleur sombre du début est conservée.',
              plugin_pick: 'Serum (layer du pad existant)',
            },
            {
              id: 'synths-3',
              section: 'INSTRUMENTS',
              priority: 'low',
              score: 82,
              title: 'Identité sonore lisible',
              why: 'Le morceau a une signature claire : pads enveloppants + lead synthé reconnaissable du début à la fin. Parti-pris cohérent.',
              how: 'RAS — la signature est un atout, ne pas la diluer.',
              plugin_pick: '—',
            },
          ],
        },
        {
          id: 'bass',
          cat: 'BASSES & KICK',
          icon: 'bass',
          items: [
            {
              id: 'bass-1',
              section: 'BASSES & KICK',
              priority: 'med',
              score: 74,
              title: 'Bas du spectre un peu chargé',
              why: "Cumul d'énergie sous 60 Hz qui floute la basse synthé et la grosse caisse — l'ensemble manque de définition dans le bas.",
              how: 'High-pass à 35 Hz sur le bus instrumental (12 dB/oct), puis -2 dB en shelving sous 50 Hz uniquement sur les pads.',
              plugin_pick: 'Pultec EQP-1A (UAD)',
            },
            {
              id: 'bass-2',
              section: 'BASSES & KICK',
              priority: 'med',
              score: 76,
              title: 'Sub-bass à ajouter au pont',
              why: 'Le pont gagnerait à garder un fondement bas pour conserver le poids émotionnel sans alourdir le mix.',
              how: 'Layer un sub-bass sine au pont, -12 dB sous la basse principale, fondamentale calée sur la tonalité du morceau.',
              plugin_pick: 'Serum (preset sine pure)',
            },
          ],
        },
        {
          id: 'drums',
          cat: 'DRUMS & PERCUSSIONS',
          icon: 'drums',
          items: [
            {
              id: 'drums-1',
              section: 'DRUMS & PERCUSSIONS',
              priority: 'med',
              score: 76,
              title: 'Transitoires grosse caisse arrondis',
              why: "L'attaque colle au genre, mais le punch manque sur les downbeats du refrain — il faut que le kick pousse pour aider à libérer le refrain.",
              how: 'Transient designer : +2 sur attack, sustain neutre. Vérifier qu\'on ne casse pas la cohérence avec la snare (qui doit rester douce).',
              plugin_pick: 'SPL Transient Designer',
            },
            {
              id: 'drums-2',
              section: 'DRUMS & PERCUSSIONS',
              priority: 'low',
              score: 84,
              title: 'Caisse claire bien posée',
              why: 'La snare a un grain rond cohérent avec l\'esthétique du morceau — sèche sans claquer, présente sans dominer.',
              how: 'RAS — conserver tel quel.',
              plugin_pick: '—',
            },
          ],
        },
        {
          id: 'fx',
          cat: 'SPATIAL & REVERB',
          icon: 'fx',
          items: [
            {
              id: 'fx-1',
              section: 'SPATIAL & REVERB',
              priority: 'med',
              score: 72,
              title: 'Pré-refrain perd son centre',
              why: "Pendant le build du pré-refrain, l'élargissement stéréo des pads aspire la voix lead qui semble reculer dans le mix.",
              how: 'M/S EQ sur les pads pendant le pré-refrain : -1.5 dB sur le côté entre 1-3 kHz. La voix retrouve son ancrage central.',
              plugin_pick: 'iZotope Ozone 11 EQ (mode M/S)',
            },
            {
              id: 'fx-2',
              section: 'SPATIAL & REVERB',
              priority: 'med',
              score: 75,
              title: 'Profondeur trop frontale',
              why: "Tous les éléments arrivent à peu près au même plan. Les pads d'arrière-plan gagneraient à être plus enveloppés pour donner de l'air aux éléments de premier plan.",
              how: 'Reverb plate longue (decay 3.2 s, pre-delay 35 ms, dry/wet 18%) en send sur les pads. Couper sous 250 Hz dans la chaîne de la reverb.',
              plugin_pick: 'Valhalla VintageVerb',
            },
            {
              id: 'fx-3',
              section: 'SPATIAL & REVERB',
              priority: 'low',
              score: 84,
              title: 'Compatibilité mono correcte',
              why: 'Aucun phasing destructif détecté — le titre passe proprement sur enceinte mono téléphone et Bluetooth.',
              how: 'RAS — conserver tel quel.',
              plugin_pick: '—',
            },
          ],
        },
        {
          id: 'lufs',
          cat: 'MASTER & LOUDNESS',
          icon: 'lufs',
          items: [
            {
              id: 'lufs-1',
              section: 'MASTER & LOUDNESS',
              priority: 'high',
              score: 70,
              title: 'Refrain pas assez libéré',
              why: "Le refrain reste presque au même niveau perceptif que les couplets. À l'oreille, il ne s'élève pas — il reste en intériorité, ce qui dessert le contraste émotionnel.",
              how: 'Réduire la compression sur le bus master pendant les refrains : ratio 1.5:1 max, GR ≤ 1 dB. Booster le bus drums de +1.5 dB sur le refrain via automation.',
              plugin_pick: 'API 2500 (Waves)',
            },
            {
              id: 'lufs-2',
              section: 'MASTER & LOUDNESS',
              priority: 'high',
              score: 70,
              title: 'Loudness en dessous des plateformes',
              why: 'Le master est un peu en dessous de la cible streaming. Sur Spotify et Apple Music le titre paraîtra moins présent que les morceaux avoisinants en playlist.',
              how: 'Remonter le bus master de +2 dB. Vérifier que les pics ne franchissent pas la limite anti-saturation (ceiling -1 dBTP en sortie de chaîne master).',
              plugin_pick: 'FabFilter Pro-L 2',
            },
            {
              id: 'lufs-3',
              section: 'MASTER & LOUDNESS',
              priority: 'low',
              score: 78,
              title: 'Dynamique préservée',
              why: 'Le morceau respire encore — la compression master n\'a pas écrasé les nuances. On reste dans la zone "musical" plutôt que "écrasé".',
              how: 'RAS — surveiller au mastering pour ne pas trop comprimer le bus master.',
              plugin_pick: 'iZotope Insight 2 (monitoring)',
            },
          ],
        },
      ],
    },
    listening: {
      impression: "Le morceau pose immédiatement son atmosphère : on entend la chambre, les murs, la solitude. Le contraste couplet → refrain est là mais reste timide, comme si le refrain n'avait pas encore le droit de respirer pleinement.",
      points_forts: [
        "Voix lead très bien placée : intelligibilité parfaite sans surcompresser.",
        "Basse synthé ronde et tenue, qui porte la mélancolie sans alourdir.",
        "Réverbération des claviers cohérente avec le parti-pris ambiance.",
      ],
      a_travailler: [
        "Le refrain ne s'élève pas suffisamment : il reste au même niveau perceptif que les couplets.",
        "Sibilances marquées sur certaines syllabes (« tout », « tu ») qui sortent du mix.",
        "La cohésion stéréo perd un peu de centre dans le pré-refrain.",
      ],
      espace: "Profondeur travaillée mais assez frontale ; les éléments d'arrière-plan (pads, textures) gagneraient à être encore plus enveloppés.",
      dynamique: 'Crest factor à 7,1 dB en moyenne, correct pour le genre. Le pré-refrain casse un peu trop sa progression dynamique.',
      potentiel: 'Une fois le refrain libéré et la voix mieux dégagée dans le médium-haut, ce mix peut atteindre la zone 85-88. Le potentiel émotionnel est bien là.',
    },
    // Mesures DSP — alimentent DspMasterBlock dans la catégorie Master.
    dspMetrics: {
      lufs: -12.1,
      lra: 7.8,
      truePeak: -0.6,
    },
    // Stems — alimentent VoiceVsInstruBlock dans la catégorie Voix.
    stemsMetrics: [
      { stemType: 'vocal', lufs: -14.2 },
      { stemType: 'drums', lufs: -16.1 },
      { stemType: 'bass', lufs: -16.8 },
      { stemType: 'other', lufs: -15.6 },
    ],
    // Champ stéréo — alimente StereoFieldBlock dans la catégorie Spatial.
    stereoMetrics: {
      correlation: 0.42,
      midSideRatio: 0.68,
      balanceLR: 0.02,
      monoCompat: 1.4,
    },
    // Évolution V1 → V2 — alimente EvolutionBanner.
    evolution: {
      resume: 'V2 progresse côté arrangement et clarté, mais le refrain reste à libérer.',
      progres: [
        'Voix mieux placée dans le mix',
        'Réverbération plus cohérente avec l\'intention',
      ],
      regressions: [
        'Score global -2 (compression master un peu trop serrée)',
      ],
      persistants: [
        'Sibilances marquées sur certaines syllabes',
      ],
      nouveaux: [
        'Pré-refrain qui perd son centre stéréo',
      ],
      dominante: 'progres',
    },
    previousVersionName: 'V1',
  },
};

// Mock track minimal pour IntentPanel — il lit `currentTrack.artisticIntent`
// en fallback. On le fournit pour que le panneau soit toujours rendu.
const SAMPLE_TRACK = { artisticIntent: SAMPLE_INTENT };

// ─── Version anglaise du mock — bascule via le switch EN/FR du topbar ──
// Traduction directe (pas une variation), pour que le visiteur EN voie
// exactement la même fiche en anglais. Les valeurs techniques (BPM, scores,
// LUFS, plugins) restent telles quelles : ce sont des données universelles.
const SAMPLE_INTENT_EN = "Melancholic electro-pop. A vocal that carries the song — fragile but determined. Verses : restraint, introspection ; chorus : a release that doesn't quite take off. References : 'La Chair' by Christine and the Queens, 'Sober' by Lorde.";

const SAMPLE_DATA_EN = {
  trackTitle: 'Brûle',
  versionName: 'V2',
  prevVersionName: 'V1',
  prevScore: 80,
  vocalType: 'vocal',
  analysisResult: {
    intent_used: SAMPLE_INTENT_EN,
    _intent_scope: 'version',
    fiche: {
      globalScore: 78,
      verdict: "An atmosphere that holds together. The chorus still needs to be set free to truly breathe.",
      summary: "V2 brought the mix closer to the artistic intent. The melancholic stance reads clearly — enveloping synths, round bass, present vocals without overplaying. Still need to clear the vocal in the 2-4 kHz range and better differentiate verse from chorus dynamically.",
      declared_genre: null,
      inferred_genre: 'melancholic electro-pop',
      genre_inferred_by_ai: true,
      elements: [
        {
          id: 'voice', cat: 'VOICE', icon: 'voice',
          items: [
            { id: 'voice-1', section: 'VOICE', priority: 'high', score: 71, title: 'Marked sibilance', why: "Some syllables ('out', 'us', 'voices') jump out of the mix with excessive high-frequency energy — fatiguing on prolonged headphone listening.", how: 'De-esser on the vocal: center 6.5 kHz, range -4 dB, threshold -22 dB. EQ shelf -1.5 dB above 8 kHz to soften sibilants.', plugin_pick: 'FabFilter Pro-DS' },
            { id: 'voice-2', section: 'VOICE', priority: 'med', score: 78, title: 'Vocal compression well dosed', why: "The vocal holds without pumping — the dynamics of the performance stay alive, the nuances between pianissimos and fortissimos come through.", how: "Keep the current chain. Verify that auto-make-up gain doesn't climb on pianissimos.", plugin_pick: 'Waves CLA-76' },
            { id: 'voice-3', section: 'VOICE', priority: 'low', score: 80, title: "Air and presence aligned with intent", why: 'The fragile grain of the vocal is preserved, which directly serves the melancholic stance of the track.', how: "RAS — keep as is. Resist the urge to add air above 12 kHz to 'sound pro' — it would break the intent.", plugin_pick: '—' },
          ],
        },
        {
          id: 'synths', cat: 'INSTRUMENTS', icon: 'synths',
          items: [
            { id: 'synths-1', section: 'INSTRUMENTS', priority: 'high', score: 68, title: 'Lead synth crowds the vocal', why: "The synth fights the vocal in the 2-4 kHz zone, which eats the chorus intelligibility — exactly when the lyrics should be clearest.", how: 'Dynamic EQ on the lead synth: -3 dB around 3 kHz, sidechained on the vocal bus. Q 1.2, attack 10 ms, release 80 ms.', plugin_pick: 'FabFilter Pro-Q 4' },
            { id: 'synths-2', section: 'INSTRUMENTS', priority: 'med', score: 76, title: 'Bridge less held than the verses', why: "The bridge (at 2:14) opens the arrangement, but the mix lightens up too much — losing the dark identity established earlier.", how: 'Keep the textured pads active until 2:30 (instead of cutting at 2:14). Verify that the dark color of the opening is preserved.', plugin_pick: 'Serum (layer the existing pad)' },
            { id: 'synths-3', section: 'INSTRUMENTS', priority: 'low', score: 82, title: 'Sonic identity reads clearly', why: 'The track has a clear signature: enveloping pads + recognizable lead synth from start to finish. Coherent stance.', how: 'RAS — the signature is an asset, do not dilute.', plugin_pick: '—' },
          ],
        },
        {
          id: 'bass', cat: 'BASS & KICK', icon: 'bass',
          items: [
            { id: 'bass-1', section: 'BASS & KICK', priority: 'med', score: 74, title: 'Low end a bit cluttered', why: "Energy buildup below 60 Hz blurs the bass synth and the kick — the bottom lacks definition.", how: 'High-pass at 35 Hz on the instrumental bus (12 dB/oct), then -2 dB shelving below 50 Hz on the pads only.', plugin_pick: 'Pultec EQP-1A (UAD)' },
            { id: 'bass-2', section: 'BASS & KICK', priority: 'med', score: 76, title: 'Add a sub-bass on the bridge', why: 'The bridge would benefit from a low foundation to keep the emotional weight without weighing down the mix.', how: 'Layer a sine sub-bass on the bridge, -12 dB below the main bass, fundamental tuned to the song key.', plugin_pick: 'Serum (pure sine preset)' },
          ],
        },
        {
          id: 'drums', cat: 'DRUMS & PERCUSSION', icon: 'drums',
          items: [
            { id: 'drums-1', section: 'DRUMS & PERCUSSION', priority: 'med', score: 76, title: 'Kick transients rounded off', why: "The attack fits the genre, but punch lacks on the chorus downbeats — the kick needs to push to help free the chorus.", how: 'Transient designer: +2 on attack, sustain neutral. Verify it does not break coherence with the snare (which should stay soft).', plugin_pick: 'SPL Transient Designer' },
            { id: 'drums-2', section: 'DRUMS & PERCUSSION', priority: 'low', score: 84, title: 'Snare well placed', why: 'The snare has a round grain coherent with the track aesthetic — dry without snapping, present without dominating.', how: 'RAS — keep as is.', plugin_pick: '—' },
          ],
        },
        {
          id: 'fx', cat: 'SPATIAL & REVERB', icon: 'fx',
          items: [
            { id: 'fx-1', section: 'SPATIAL & REVERB', priority: 'med', score: 72, title: 'Pre-chorus loses its center', why: "During the pre-chorus build, the stereo widening of the pads pulls the lead vocal — it seems to recede in the mix.", how: 'M/S EQ on the pads during the pre-chorus: -1.5 dB on the side between 1-3 kHz. The vocal regains its central anchor.', plugin_pick: 'iZotope Ozone 11 EQ (M/S mode)' },
            { id: 'fx-2', section: 'SPATIAL & REVERB', priority: 'med', score: 75, title: 'Depth too frontal', why: "Everything sits roughly on the same plane. Background pads would benefit from being more enveloped to give air to the foreground elements.", how: 'Long plate reverb (decay 3.2 s, pre-delay 35 ms, dry/wet 18%) on a send for the pads. High-pass below 250 Hz in the reverb chain.', plugin_pick: 'Valhalla VintageVerb' },
            { id: 'fx-3', section: 'SPATIAL & REVERB', priority: 'low', score: 84, title: 'Mono compatibility OK', why: 'No destructive phasing detected — the track passes cleanly on phone speaker and Bluetooth.', how: 'RAS — keep as is.', plugin_pick: '—' },
          ],
        },
        {
          id: 'lufs', cat: 'MASTER & LOUDNESS', icon: 'lufs',
          items: [
            { id: 'lufs-1', section: 'MASTER & LOUDNESS', priority: 'high', score: 70, title: 'Chorus not lifted enough', why: "The chorus stays at almost the same perceived level as the verses. To the ear, it does not lift — staying introspective, which undermines the emotional contrast.", how: 'Reduce master bus compression during choruses: ratio 1.5:1 max, GR ≤ 1 dB. Boost the drums bus by +1.5 dB on the chorus via automation.', plugin_pick: 'API 2500 (Waves)' },
            { id: 'lufs-2', section: 'MASTER & LOUDNESS', priority: 'high', score: 70, title: 'Loudness below platform targets', why: 'The master is a bit below streaming target. On Spotify and Apple Music, the track will feel less present than neighboring tracks in playlists.', how: 'Raise the master bus by +2 dB. Verify peaks do not cross the anti-saturation limit (ceiling -1 dBTP at the end of the master chain).', plugin_pick: 'FabFilter Pro-L 2' },
            { id: 'lufs-3', section: 'MASTER & LOUDNESS', priority: 'low', score: 78, title: 'Dynamics preserved', why: 'The track still breathes — master compression has not crushed the nuances. We stay in the "musical" zone rather than "squashed".', how: 'RAS — monitor at mastering not to over-compress the master bus.', plugin_pick: 'iZotope Insight 2 (monitoring)' },
          ],
        },
      ],
    },
    listening: {
      impression: "The track sets its atmosphere immediately: you can hear the room, the walls, the solitude. The verse → chorus contrast is there but stays timid, as if the chorus does not yet have permission to fully breathe.",
      points_forts: [
        "Lead vocal very well placed: perfect intelligibility without over-compression.",
        "Round, sustained bass synth that carries the melancholy without weighing things down.",
        "Keyboard reverbs coherent with the atmospheric stance.",
      ],
      a_travailler: [
        "The chorus does not lift enough: it stays at the same perceived level as the verses.",
        "Marked sibilance on certain syllables ('out', 'us') that jump out of the mix.",
        "Stereo cohesion loses some center in the pre-chorus.",
      ],
      espace: "Worked but rather frontal depth ; background elements (pads, textures) would benefit from being more enveloped.",
      dynamique: 'Crest factor at 7.1 dB on average, fine for the genre. The pre-chorus breaks its dynamic progression a bit too much.',
      potentiel: 'Once the chorus is freed and the vocal is cleared in the upper-mids, this mix can reach the 85-88 zone. The emotional potential is there.',
    },
    dspMetrics: { lufs: -12.1, lra: 7.8, truePeak: -0.6 },
    stemsMetrics: [
      { stemType: 'vocal', lufs: -14.2 },
      { stemType: 'drums', lufs: -16.1 },
      { stemType: 'bass', lufs: -16.8 },
      { stemType: 'other', lufs: -15.6 },
    ],
    stereoMetrics: { correlation: 0.42, midSideRatio: 0.68, balanceLR: 0.02, monoCompat: 1.4 },
    evolution: {
      resume: 'V2 progresses on arrangement and clarity, but the chorus still needs to be freed.',
      progres: ['Vocal better placed in the mix', 'Reverb more coherent with the intent'],
      regressions: ['Global score -2 (master compression a bit too tight)'],
      persistants: ['Marked sibilance on some syllables'],
      nouveaux: ['Pre-chorus losing its stereo center'],
      dominante: 'progres',
    },
    previousVersionName: 'V1',
  },
};

// ────────────────────────────────────────────────────────────────────────

export default function SampleFicheScreen({
  onSignup,
  onBackToLanding,
  topbarCtaLabel,
  bottomCtaLabel,
}) {
  const { s, lang, setLang } = useLang();
  // CTA labels par défaut — pris dans i18n strings.js si non fournis par
  // App.jsx (cas connecté). Si lang switche, ça suit automatiquement.
  const resolvedTopbarCta = topbarCtaLabel || (lang === 'en' ? 'Create my account' : 'Créer mon compte');
  const resolvedBottomCta = bottomCtaLabel || s.landing?.ctaPrimary || (lang === 'en' ? 'Analyze my first track' : 'Analyser mon premier titre');
  // Sélection de la langue → bascule automatiquement vers le mock anglais
  // si le visiteur passe en EN. Les textes UI (boutons, libellés) suivent
  // déjà via `s` (i18n strings.js). Pour le contenu de la fiche elle-même
  // (verdict, écoute, items du diagnostic, intention), on a un mock dédié.
  const data = lang === 'en' ? SAMPLE_DATA_EN : SAMPLE_DATA;
  const analysisResult = data.analysisResult;
  const rawFiche = analysisResult.fiche;
  const listening = analysisResult.listening;
  const evolution = analysisResult.evolution || null;

  const {
    elements,
    plan,
    globalScore: adjustedScore,
    voiceLabelOverride,
  } = applyVocalTypeToFiche(rawFiche, data.vocalType);
  const score = typeof adjustedScore === 'number' ? adjustedScore : null;

  // Accordéon strict — un seul state, une seule section ouverte à la fois.
  // Identifiants : 'intent', 'release', 'impression', 'diag::<id>', 'plan::<i>'.
  // Démo fermée par défaut → le visiteur clique pour ouvrir, comme sur la
  // vraie fiche. Ouvrir une section referme automatiquement la précédente.
  const [openSection, setOpenSection] = useState(null);
  const toggleSection = (id) =>
    setOpenSection((prev) => (prev === id ? null : id));

  // État local pour la démo : items « implémentés » (visuels, pas de DB).
  // Le visiteur peut cliquer pour ressentir la grammaire mais rien n'est sauvé.
  const [doneItems, setDoneItems] = useState(new Set());
  const toggleDone = (key) => {
    setDoneItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Notes mock pour la NotesSection — préfilled avec un exemple plausible
  // (ce que l'artiste pourrait écrire après écoute critique de sa V2).
  const [sampleNotes, setSampleNotes] = useState(
    "Refrain : tester de monter le bus voix +1.5 dB pendant le couplet 2 → refrain pour vraiment libérer.\nVérifier le pré-refrain en mono sur enceintes Bluetooth (suspicion phasing pads).\nGarder l'identité sombre — ne pas céder à la tentation d'éclaircir."
  );

  return (
    <>
      <FontLink />
      <GlobalStyles />
      <MockupStyles />
      <SampleStyles />
      <div className="public-fiche-shell">
        {/* Bandeau "EXEMPLE" — très clair pour qu'aucun visiteur ne croie
            voir ses propres données. Lien retour landing à gauche, CTA
            d'inscription à droite. */}
        <header className="public-fiche-topbar sample-topbar">
          <div className="pft-left">
            {/* Logo + brand "VERSiONS" — strictement la même grammaire que
                la sidebar de l'app (cf. Sidebar.jsx). Cliquable, retour
                landing. */}
            <button type="button" className="sample-brand" onClick={onBackToLanding} aria-label={lang === 'en' ? 'Back to landing' : 'Retour à la landing'}>
              <img src="/logo-versions-2.svg" alt="" style={{ height: 28, width: 'auto' }} />
              <span className="sample-brand-text">
                {'VER'}<span className="sample-brand-accent">{'Si'}</span>{'ONS'}
              </span>
            </button>
            {/* Switch FR/EN — strictement le même composant que la sidebar
                de l'app (cf. .sb-lang-switch dans Sidebar.jsx). */}
            <div className="sb-lang-switch" role="group" aria-label="Langue / Language">
              <button
                type="button"
                className={lang === 'fr' ? 'on' : ''}
                onClick={() => setLang('fr')}
                aria-pressed={lang === 'fr'}
              >
                FR
              </button>
              <button
                type="button"
                className={lang === 'en' ? 'on' : ''}
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
              >
                EN
              </button>
            </div>
            <span className="sample-eyebrow">
              {lang === 'en' ? 'EXAMPLE — FICTIONAL DATA' : 'EXEMPLE — DONNÉES FICTIVES'}
            </span>
          </div>
          <div className="pft-right">
            <button type="button" className="pft-cta" onClick={onSignup}>{resolvedTopbarCta}</button>
          </div>
        </header>

        <main className="public-fiche-main">
          <div className="sample-stage fiche-v2">
            {/* Spacer simulant la sidebar de l'app — réserve l'espace à
                gauche comme dans la vraie fiche, sans rien afficher pour ne
                pas distraire avec une fausse sidebar. */}
            <div className="sample-sidebar-spacer" aria-hidden="true" />
            <div className="public-fiche-page page">
            {/* Bandeau "Verdict de sortie" — strictement aligné sur la
                vraie fiche : toujours déployé, montre les bloquants
                d'office, et CTA "Parlons-en dans le chat" présent
                visuellement mais inerte sur la page exemple (cliquer
                ne mène nulle part — c'est juste de la démonstration). */}
            <ReleaseReadinessBanner
              fiche={rawFiche}
              completedItems={null}
              uploadType="master"
              onOpenChat={() => {}}
            />

            {/* Verdict — strictement aligné sur FicheScreen :
                pochette à halos seedés à gauche, .rv-left avec eyebrow score,
                ScoreRingBig, score-calibration (delta vs V précédente), ligne
                genre, puis verdict-text. */}
            <section className="row-verdict">
              {(() => {
                // Pochette : 9 halos colorés seedés depuis le titre + titre en
                // gros (police logo). Strictement la même logique que dans la
                // vraie fiche pour que rendu et tailles soient identiques.
                const title = data.trackTitle || '';
                let h = 0;
                for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
                let seed = h || 1;
                const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
                const palette = [
                  'rgba(230, 140, 60, 1)',
                  'rgba(110, 185, 110, 1)',
                  'rgba(215, 115, 170, 1)',
                  'rgba(70, 150, 210, 1)',
                  'rgba(235, 130, 90, 1)',
                  'rgba(150, 110, 210, 1)',
                  'rgba(90, 195, 180, 1)',
                  'rgba(225, 90, 110, 1)',
                  'rgba(240, 195, 70, 1)',
                ];
                const halos = Array.from({ length: 9 }, () => ({
                  x: 5 + rand() * 90,
                  y: 5 + rand() * 90,
                  size: 95 + rand() * 70,
                  color: palette[Math.floor(rand() * palette.length)],
                  opacity: 0.78 + rand() * 0.22,
                }));
                return (
                  <div className="col-cover-wrap">
                    <div className="col-cover-holder">
                      <div className="col-cover no-image" aria-label={title}>
                        {halos.map((hl, i) => (
                          <span
                            key={i}
                            className="ca-halo"
                            style={{
                              left: `${hl.x}%`,
                              top: `${hl.y}%`,
                              width: `${hl.size}%`,
                              background: `radial-gradient(circle, ${hl.color} 0%, transparent 62%)`,
                              opacity: hl.opacity,
                            }}
                            aria-hidden
                          />
                        ))}
                        <div className="cover-big-title" aria-hidden>
                          {title}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="rv-left">
                <div className="rv-halo" aria-hidden="true" />
                {score != null && (
                  <div className="score-eyebrow">
                    <span className="dot" />
                    {s.fiche.scoreGlobalTitle || 'Score global'}
                  </div>
                )}
                {score != null && (
                  <div className="rv-top">
                    <ScoreRingBig value={score} prevScore={data.prevScore} />
                    {/* Radar constellation 6 catégories — strictement le même
                        rendu que la vraie fiche, alimenté par
                        computeMixIndicators sur la fiche mockée. */}
                    <MixRadar items={computeMixIndicators(rawFiche, elements, score, s)} />
                  </div>
                )}
                {/* Score calibration : delta vs version précédente, identique
                    à la vraie fiche ("↓ -2 points depuis V1"). Templates pris
                    dans i18n strings.js pour suivre la langue. */}
                {(() => {
                  if (typeof data.prevScore !== 'number' || score == null) return null;
                  const delta = Math.round(score - data.prevScore);
                  const prevName = data.prevVersionName || '';
                  if (!prevName) return null;
                  let tpl;
                  if (delta === 0) tpl = s.fiche.scoreDeltaStable;
                  else if (delta > 0) tpl = s.fiche.scoreDeltaUp;
                  else tpl = s.fiche.scoreDeltaDown;
                  if (!tpl) return null;
                  const txt = tpl
                    .replace('{delta}', String(Math.abs(delta)))
                    .replace('{prev}', prevName);
                  return (
                    <div className={`score-calibration${delta < 0 ? ' down' : delta === 0 ? ' stable' : ''}`}>
                      {txt}
                    </div>
                  );
                })()}

                {/* Ligne genre — strictement même rendu que sur la vraie fiche :
                    libellé "Genre" muté + valeur en bold + suffixe parenthétique
                    "(détecté pendant l'analyse)" en italique discret quand inféré.
                    Mode démo : non éditable (cliquable mais sans effet). */}
                {(() => {
                  const declared = (rawFiche.declared_genre || '').trim();
                  const inferred = (rawFiche.inferred_genre || '').trim();
                  const inferredFlag = rawFiche.genre_inferred_by_ai === true;
                  const currentLabel = declared || (inferredFlag ? inferred : '');
                  if (!currentLabel) return null;
                  return (
                    <div
                      className="fiche-genre-line"
                      style={{
                        fontSize: '0.85rem',
                        marginTop: 10,
                        marginBottom: 12,
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{ opacity: 0.55, marginRight: 6 }}>{s.fiche.genreDeclared}</span>
                      <strong style={{ fontWeight: 600, opacity: 1 }}>{currentLabel}</strong>
                      {!declared && inferredFlag && (
                        <span style={{ opacity: 0.45, marginLeft: 8, fontStyle: 'italic' }}>
                          ({s.fiche.genreInferredSuffix})
                        </span>
                      )}
                    </div>
                  );
                })()}

                <div className="verdict-text">
                  {(() => {
                    const v = rawFiche.verdict;
                    const sum = rawFiche.summary;
                    if (v && sum && v !== sum) {
                      return (
                        <>
                          <h1>{renderWithEmphasis(v)}</h1>
                          <p>{sum}</p>
                        </>
                      );
                    }
                    const { headline, rest } = splitVerdict(v || sum || '');
                    return (
                      <>
                        <h1>{renderWithEmphasis(headline)}</h1>
                        {rest && <p>{rest}</p>}
                      </>
                    );
                  })()}
                  <div className="public-fiche-meta">
                    <span className="pfm-track">{data.trackTitle}</span>
                    <span className="pfm-sep">·</span>
                    <span className="pfm-version">version {data.versionName}</span>
                  </div>
                  <div className="analyzed-at sample-mock-stamp">
                    {lang === 'en' ? 'Fictional mix — demo analysis' : 'Mix fictif — analyse de démonstration'}
                  </div>
                </div>
              </div>
            </section>

            {/* Évolution V1→V2 + Intention artistique stackées —
                strictement comme la vraie fiche : SOUS le row-verdict
                (à droite en layout 2-col, dessous en 1-col). */}
            {(evolution || analysisResult.intent_used) && (
              <div
                className="evo-intent-stack"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: 18,
                  minWidth: 0,
                  width: '100%',
                  marginTop: 18,
                  marginBottom: 18,
                }}
              >
                {evolution && (
                  <EvolutionBanner
                    evolution={evolution}
                    previousVersionName={analysisResult.previousVersionName}
                    floorApplied={null}
                    adviceLockApplied={null}
                  />
                )}
                <IntentPanel
                  analysisResult={analysisResult}
                  currentTrack={SAMPLE_TRACK}
                  versionInDb={null}
                  open={openSection === 'intent'}
                  onToggle={() => toggleSection('intent')}
                />
              </div>
            )}

            {/* Placeholder — l'écoute qualitative est rendue APRÈS le diagnostic
                (cf. ordre de la vraie fiche). Voir bloc plus bas. */}

            {/* Diagnostic — pleine largeur (le plan d'action a été absorbé dans les items) */}
            {elements.length > 0 && (() => {
              // Compte des items correctifs (avec un how concret) pour la barre de
              // progression, exactement comme la vraie fiche.
              let totalCount = 0;
              let doneCount = 0;
              elements.forEach((el, ei) => {
                (el.items || []).forEach((it, ii) => {
                  const howStr = ((it && it.how) || '').trim();
                  if (!howStr || /^ras\b/i.test(howStr)) return;
                  totalCount += 1;
                  const itemKey = `${el.id || el.cat || ei}::${it.id || ii}`;
                  if (doneItems.has(itemKey)) doneCount += 1;
                });
              });
              const donePct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
              return (
                <section className="diag-panel">
                  <div className="diag-eyebrow">
                    <span className="dot" />
                    {s.fiche.diagTitle} · {elements.length} {elements.length > 1 ? s.fiche.categoryPlural : s.fiche.categorySingular}
                    {totalCount > 0 && (
                      <span className="diag-progress" title={s.fiche.diagProgressTitle || ''}>
                        <span className="diag-progress-bar" aria-hidden="true">
                          <span
                            className="diag-progress-bar-fill"
                            style={{ width: `${donePct}%` }}
                          />
                        </span>
                        <span className="diag-progress-label">
                          {doneCount}/{totalCount} {s.fiche.diagProgressDone} ({donePct}%)
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="diag-cats">
                      {elements.map((el, idx) => {
                        const items = (el.items || []).map(normalizeDiagItem);
                        const scores = items.map((it) => it.score).filter((sc) => typeof sc === 'number');
                        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
                        const isVoice = isVoiceCategory(el.cat);
                        const isPendingVoice = isVoice && voiceLabelOverride;
                        const catLabel = isPendingVoice ? voiceLabelOverride : el.cat;
                        const sectionId = `diag::${el.id || el.cat || idx}`;
                        const isOpen = openSection === sectionId;
                        // Mapping accent par catégorie — strictement aligné sur la
                        // vraie fiche (cf. catColor() dans FicheScreen.jsx). Quatre
                        // accents répartis pour donner un repère visuel rapide :
                        // VOIX/MASTER → ambre, INSTRUMENTS/SPATIAL → cerulean,
                        // BASSES & KICK → rouge, DRUMS → mint.
                        const catColorOf = (cat) => {
                          const k = (cat || '').toLowerCase();
                          if (k.includes('voix') || k.includes('vocal') || k.includes('voice')) return 'amber';
                          if (k.includes('instrument')) return 'cerulean';
                          if (k.includes('bass') || k.includes('kick')) return 'red';
                          if (k.includes('drum') || k.includes('percu')) return 'mint';
                          if (k.includes('spatial') || k.includes('reverb')) return 'cerulean';
                          if (k.includes('master') || k.includes('loudness')) return 'amber';
                          return 'cerulean';
                        };
                        const catColor = catColorOf(el.cat);
                        const catClass = `diag-cat c-${catColor}${isOpen ? ' open' : ''}${isPendingVoice ? ' pending-voice' : ''}`;
                        return (
                          <div key={el.id || el.cat || idx} className={catClass}>
                            <div
                              className="diag-cat-head"
                              onClick={() => toggleSection(sectionId)}
                              role="button"
                              tabIndex={0}
                              aria-expanded={isOpen}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  toggleSection(sectionId);
                                }
                              }}
                            >
                              <span className="chev">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                              <span className="name">{catLabel}</span>
                              <span className="count">
                                {items.length} {items.length > 1 ? s.fiche.elementPlural : s.fiche.elementSingular}
                                {avg != null ? `${s.fiche.avgPrefix}${Math.round(avg)}` : ''}
                              </span>
                            </div>
                            <div className="diag-cat-body">
                              {/* DSP visuels : injecte le bon block selon la catégorie,
                                  exactement comme dans la vraie fiche. Master & Loudness
                                  -> DspMasterBlock (LUFS/LRA/TruePeak rings). Voix ->
                                  VoiceVsInstruBlock (delta voix vs instru). Image stéréo
                                  -> StereoFieldBlock (correlation, mid/side, mono compat). */}
                              {/Master/i.test(el.cat) && (
                                <DspMasterBlock analysisResult={analysisResult} isOpen={isOpen} />
                              )}
                              {isVoice && !voiceLabelOverride && (
                                <VoiceVsInstruBlock analysisResult={analysisResult} isOpen={isOpen} />
                              )}
                              {/(Image stéréo|Spatial|Stéréo)/i.test(el.cat) && (
                                <StereoFieldBlock analysisResult={analysisResult} isOpen={isOpen} />
                              )}
                              {items.map((it, i) => {
                                const itemKey = `${el.id || el.cat || idx}::${it.id || i}`;
                                const done = doneItems.has(itemKey);
                                const howStr = ((it && it.how) || '').trim();
                                // Item de validation pure (rien à corriger) :
                                // pas de "how" OU le "how" commence par "RAS".
                                // Ces items n'ont pas de checkbox — il n'y a
                                // rien à marquer comme résolu.
                                const isPureValidation = !howStr || /^ras\b/i.test(howStr);
                                const isCorrective = !isPureValidation;
                                const hasPlugin = it.plugin_pick && it.plugin_pick !== '—';
                                return (
                                  <div
                                    key={it.id || i}
                                    className={`diag-item${it.priority ? ` prio-${it.priority}` : ''}${done ? ' is-done' : ''}`}
                                  >
                                    <ScoreRingSmall value={it.score} isOpen={isOpen} animDelay={i * 60} />
                                    <div className="di-body">
                                      <div className="di-name">
                                        {it.priority && (
                                          <span className={`di-prio prio-${it.priority}`} aria-label={`priorité ${it.priority}`} />
                                        )}
                                        {it.title}
                                      </div>
                                      {it.why && <div className="di-detail">{it.why}</div>}
                                      {it.how && (
                                        <div className="di-how">
                                          <span className="di-how-label">Action</span>
                                          <code>{it.how}</code>
                                        </div>
                                      )}
                                      {(hasPlugin || isCorrective) && (
                                        <div
                                          className="di-tools"
                                          style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 10,
                                          }}
                                        >
                                          {hasPlugin
                                            ? <span className="di-plugin">{it.plugin_pick}</span>
                                            : <span aria-hidden="true" />
                                          }
                                          {isCorrective && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleDone(itemKey);
                                              }}
                                              aria-pressed={done}
                                              style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: 0,
                                                border: 0,
                                                background: 'transparent',
                                                color: done ? T.amber : T.muted,
                                                cursor: 'pointer',
                                                fontFamily: T.mono,
                                                fontSize: 10,
                                                letterSpacing: 1.2,
                                                textTransform: 'uppercase',
                                                whiteSpace: 'nowrap',
                                                flexShrink: 0,
                                                transition: 'color .15s',
                                              }}
                                            >
                                              <span
                                                aria-hidden="true"
                                                style={{
                                                  width: 16,
                                                  height: 16,
                                                  minWidth: 16,
                                                  padding: 0,
                                                  borderRadius: 4,
                                                  border: `1.5px solid ${done ? T.amber : 'rgba(255,255,255,0.25)'}`,
                                                  background: done ? T.amber : 'transparent',
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  flexShrink: 0,
                                                  boxSizing: 'border-box',
                                                  transition: 'border-color .15s, background .15s',
                                                }}
                                              >
                                                {done && (
                                                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#1b1108" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <path d="M2.5 6.2l2.3 2.3L9.5 3.5" />
                                                  </svg>
                                                )}
                                              </span>
                                              {done ? s.fiche.diagItemDoneShort : s.fiche.diagItemTodoShort}
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>
              );
            })()}

            {/* Écoute qualitative — rendue directement (pas de wrapper
                collapsible custom), exactement comme dans la vraie fiche
                après le diag-panel. */}
            {listening && (
              <QualitativeSection listening={listening} />
            )}

            {/* Notes personnelles — bloc mock identique à la NotesSection de la
                vraie fiche. Fonctionnel localement (pas de DB en mode démo) :
                le visiteur peut taper, voir le textarea s'agrandir, sentir la
                grammaire, mais rien n'est sauvegardé. */}
            <SampleNotesSection
              notes={sampleNotes}
              setNotes={setSampleNotes}
              open={openSection === 'notes'}
              onToggle={() => toggleSection('notes')}
            />

            </div>

            <aside className="sample-chat-side" aria-label="Chat de démonstration">
              <SampleChatPanel />
            </aside>
          </div>
        </main>

        {/* CTA conversion — sorti du contenu central pour rester identique
            visuellement à la vraie fiche, mais conservé en pied de page pour
            permettre au visiteur de basculer vers la création de compte. */}
        <section className="sample-cta-banner sample-cta-footer">
          <div className="sample-cta-eyebrow">
            {lang === 'en' ? 'YOUR TURN' : 'VOTRE TOUR'}
          </div>
          <h2 className="sample-cta-title">
            {lang === 'en' ? (
              <>
                <em>And your mix —</em><br />
                what would it say?
              </>
            ) : (
              <>
                <em>Et votre mix à vous,</em><br />
                qu'est-ce qu'il dirait ?
              </>
            )}
          </h2>
          <p className="sample-cta-body">
            {lang === 'en'
              ? "This is an example. Real Versions analysis adapts to your artistic intent, your references, and the stage of your mix. Five minutes, an audio file, and you know where to dig."
              : "Cette fiche est un exemple. La vraie analyse Versions s'adapte à votre intention artistique, à vos références, et au stade de votre version. Cinq minutes, un fichier audio, et vous savez où creuser."}
          </p>
          <button type="button" onClick={onSignup} className="sample-cta-btn">
            {resolvedBottomCta}
          </button>
        </section>

        <footer className="public-fiche-footer">
          <span>
            {lang === 'en'
              ? 'Versions — a studio companion, not a judge.'
              : 'Versions — un compagnon de studio, pas un juge.'}
          </span>
        </footer>

        {/* Player statique simulé en bas — strictement le même look que le
            vrai BottomPlayer (prev/play/next + meta + waveform + time +
            volume), mais non fonctionnel (pointer-events bloqués). */}
        <SampleBottomPlayer trackTitle={data.trackTitle} versionName={data.versionName} />
      </div>
    </>
  );
}

// Chat fictif statique — présenté pour montrer la grammaire de l'app
// quand le chat est ancré à droite (parité fiche desktop). Pas de logique :
// les messages sont en dur, l'input est désactivé. Le visiteur clique sur le
// CTA pour créer son compte s'il veut interagir vraiment.
function SampleChatPanel() {
  const { lang } = useLang();
  const isEn = lang === 'en';
  return (
    <aside className="chat-panel chat-panel-anchored sample-chat-panel">
      <div className="chat-head">
        <span className="ctitle">{isEn ? 'Discussion' : 'Discussion'}</span>
      </div>
      <div className="chat-body">
        <div className="msg user">
          {isEn
            ? 'Why does my vocal feel a bit drowned in the choruses?'
            : 'Pourquoi ma voix sonne un peu noyée dans les refrains ?'}
        </div>
        <div className="msg ai">
          <span className="ai-label">Versions</span>
          {isEn
            ? "In the choruses, the buildup of pads and vocal harmonies creates masking in the upper-mids (2-4 kHz). Your lead vocal loses presence. Two options: a slight additive EQ at 3 kHz on the vocal, or -2 dB automation on the pads only during choruses."
            : "Dans les refrains, l'accumulation des pads et des harmonies vocales crée un masquage dans les hauts-médiums (2-4 kHz). Ta voix lead perd en présence. Deux solutions : un EQ additif léger à 3 kHz sur la voix, ou une automation de -2 dB sur les pads uniquement pendant les refrains."}
        </div>
        <div className="msg user">
          {isEn
            ? 'And if I want to keep the dense overall feel?'
            : "Et si je veux garder l'effet d'ensemble dense ?"}
        </div>
        <div className="msg ai">
          <span className="ai-label">Versions</span>
          {isEn
            ? 'In that case, use a light side-chain on the pads triggered by the vocal — it will create just enough space without breaking the density. Try a 2:1 ratio with a fast attack.'
            : "Dans ce cas, tu peux utiliser un side-chain léger sur les pads déclenché par la voix — ça créera juste assez d'espace sans casser la densité. Essaie un ratio 2:1 avec une attaque rapide."}
        </div>
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder={isEn ? 'Ask a question…' : 'Posez une question…'}
          disabled
          aria-label={isEn ? 'Demo chat — disabled' : 'Chat de démonstration — désactivé'}
        />
        <button type="button" disabled>{isEn ? 'Send' : 'Envoyer'}</button>
      </div>
    </aside>
  );
}

// Player simulé en bas — non fonctionnel mais visuellement aligné sur le
// vrai BottomPlayer. Waveform en barres statiques (SVG) avec un curseur fictif
// à 35 %. Toute interaction est bloquée via `pointer-events: none` sur les
// contrôles, mais le player reste visible pour donner la grammaire complète
// de l'app à un visiteur.
function SampleBottomPlayer({ trackTitle, versionName }) {
  const { lang } = useLang();
  const isEn = lang === 'en';
  // Barres waveform générées une seule fois — pattern réaliste typique d'un
  // mix mastered : pic d'attaque, sustain, légère décroissance, avec quelques
  // dynamiques internes. Pas de gradient criard, juste deux opacités (joué /
  // pas joué) sur un gris neutre comme un vrai WaveSurfer en thème sombre.
  const bars = Array.from({ length: 120 }, (_, i) => {
    const t = i / 120;
    // Enveloppe : monte vite, plateau, descend doucement à la fin.
    const env = t < 0.05
      ? t * 18
      : t > 0.92
        ? (1 - t) * 12
        : 0.82 + Math.sin(i * 0.18) * 0.06;
    // Micro variations crédibles (déterministes via sin/cos combo)
    const detail = 0.55 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.13)) * 0.45;
    const h = Math.max(0.18, Math.min(0.95, env * detail));
    return h * 100;
  });
  const cursorPct = 35;
  return (
    <div className="sample-bottom-player" role="region" aria-label="Lecteur de démonstration (désactivé)">
      <div className="sbp-section sbp-controls">
        <button type="button" className="sbp-ctrl" disabled aria-label="Précédent">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </button>
        <button type="button" className="sbp-play" disabled aria-label="Lecture (désactivé)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="6 4 20 12 6 20 6 4" />
          </svg>
        </button>
        <button type="button" className="sbp-ctrl" disabled aria-label="Suivant">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      </div>
      <div className="sbp-section sbp-meta">
        <div className="sbp-title">{trackTitle}</div>
        <div className="sbp-sub">{isEn ? 'version' : 'version'} {versionName}</div>
      </div>
      <div className="sbp-section sbp-wave">
        <div className="sbp-wave-track" aria-hidden="true">
          {bars.map((h, i) => {
            const played = (i / bars.length) * 100 < cursorPct;
            return (
              <span
                key={i}
                className={`sbp-wave-bar${played ? ' is-played' : ''}`}
                style={{ height: `${h}%` }}
              />
            );
          })}
          <span
            className="sbp-wave-cursor"
            style={{ left: `${cursorPct}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="sbp-time">
          <span>1:23</span>
          <span className="sbp-time-sep">/</span>
          <span>3:45</span>
        </div>
      </div>
      <div className="sbp-section sbp-volume">
        <button type="button" className="sbp-ctrl" disabled aria-label="Volume (désactivé)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 010 7.07" />
            <path d="M19.07 4.93a10 10 0 010 14.14" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Notes personnelles — réplique visuelle de la NotesSection de FicheScreen.
// Mock fonctionnel localement (pas de DB) ; structure HTML/CSS strictement
// alignée pour profiter des styles existants (.notes-section, .notes-block,
// .notes-head, .notes-body, .notes-textarea) définis dans MockupStyles.
function SampleNotesSection({ notes, setNotes, open, onToggle }) {
  const { s } = useLang();
  // Auto-resize identique à la vraie NotesSection : la textarea grandit
  // jusqu'à ~400px et reste à 60px minimum quand vide.
  const taRef = useRef(null);
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(400, Math.max(60, ta.scrollHeight)) + 'px';
  }, [notes, open]);

  return (
    <section className="notes-section">
      <div className={`notes-block collapsible${open ? ' open' : ''}`}>
        <button className="notes-head" type="button" onClick={onToggle}>
          <span className="notes-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 13V3h7l3 3v7H3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M10 3v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M5.5 8.5h5M5.5 10.5h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </span>
          <span className="notes-title">{s.fiche.notesTitleV2 || s.fiche.notesTitle}</span>
          {notes && notes.trim() && !open && (
            <span className="notes-preview">
              {notes.trim().slice(0, 80)}{notes.trim().length > 80 ? '…' : ''}
            </span>
          )}
          <span className="notes-chev" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        <div className="notes-body">
          <textarea
            ref={taRef}
            className="notes-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={s.fiche.notesPlaceholderV2 || s.fiche.notesPlaceholder}
            rows={3}
          />
        </div>
      </div>
    </section>
  );
}

function SampleStyles() {
  return (
    <style>{`
      /* Topbar : bouton retour à gauche + eyebrow EXEMPLE.
         On surcharge .public-fiche-topbar pour les éléments specifics. */
      .sample-topbar .pft-left {
        display: flex; align-items: center; gap: 14px;
      }
      /* Brand "VERSiONS" — même grammaire que .brand de la sidebar
         (Sidebar.jsx). Logo + lettrage avec accent ambre sur le "Si". */
      .sample-brand {
        all: unset;
        display: inline-flex; align-items: center; gap: 8px;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 8px;
        transition: background .15s;
      }
      .sample-brand:hover { background: rgba(255,255,255,0.03); }
      .sample-brand-text {
        font-family: ${T.body}; font-weight: 700;
        font-size: 22px; letter-spacing: -0.5px;
        color: ${T.text}; line-height: 1;
      }
      .sample-brand-accent { color: ${T.amber}; font-style: normal; }

      /* Switch EN/FR — pill mono discret, à gauche du badge EXEMPLE. */
      .sample-lang-switch {
        display: inline-flex; align-items: center; justify-content: center;
        min-width: 38px;
        padding: 4px 10px;
        background: transparent;
        border: 1px solid ${T.border};
        border-radius: 999px;
        color: ${T.muted};
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.5px; text-transform: uppercase;
        cursor: pointer;
        transition: border-color .15s, color .15s, background .15s;
      }
      .sample-lang-switch:hover {
        border-color: ${T.borderStrong};
        color: ${T.text};
        background: rgba(255,255,255,0.03);
      }
      .sample-eyebrow {
        font-family: ${T.mono}; font-size: 10px; font-weight: 500;
        letter-spacing: 2.2px; text-transform: uppercase;
        color: ${T.amber};
        padding: 4px 10px;
        background: rgba(245,166,35,0.08);
        border: 1px solid rgba(245,166,35,0.30);
        border-radius: 999px;
      }
      .sample-mock-stamp {
        color: ${T.muted2} !important;
        font-style: italic;
      }

      /* Bannière CTA bas de page — pleine largeur, fond ambre subtil,
         halo accentué. Le CTA reprend la grammaire pill ambre du reste
         de l'identité. */
      .sample-cta-banner {
        margin: clamp(48px, 7vw, 80px) 0 0;
        padding: clamp(40px, 6vw, 64px) clamp(24px, 5vw, 48px);
        border-radius: 20px;
        background:
          radial-gradient(ellipse 600px 360px at 50% 0%, rgba(245,166,35,0.10), transparent 70%),
          ${T.s1};
        border: 1px solid rgba(245,166,35,0.22);
        display: flex; flex-direction: column; align-items: center;
        text-align: center; gap: 14px;
      }
      .sample-cta-eyebrow {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 2.4px; text-transform: uppercase;
        color: ${T.amber};
      }
      /* Recette strictement alignée sur .lp-tagline-trio "écoute, comprend,
         guide." de la landing : DM Sans 500, em ambre 600 (pas d'italique),
         couleur soft, taille intermédiaire. */
      .sample-cta-title {
        font-family: ${T.body};
        font-weight: 500;
        font-size: clamp(18px, 2.2vw, 26px);
        line-height: 1.3; letter-spacing: -0.4px;
        color: ${T.textSoft};
        max-width: 640px; margin: 0;
      }
      .sample-cta-title em {
        font-style: normal; color: ${T.amber}; font-weight: 600;
      }
      .sample-cta-body {
        font-family: ${T.body}; font-weight: 300; font-size: 15px;
        line-height: 1.6; color: ${T.textSoft};
        max-width: 560px; margin: 4px 0 8px;
      }
      .sample-cta-btn {
        margin-top: 8px;
        padding: 16px 32px;
        background: transparent; color: ${T.amber};
        border: 1px solid rgba(245,166,35,0.55); border-radius: 999px;
        font-family: ${T.mono}; font-size: 12px; font-weight: 500;
        letter-spacing: 1.8px; text-transform: uppercase;
        cursor: pointer; transition: all .15s;
      }
      .sample-cta-btn:hover {
        border-color: ${T.amber};
        background: rgba(245,166,35,0.08);
        box-shadow: 0 0 0 6px rgba(245,166,35,0.06);
      }

      /* ── Accordéon strict (sample) ───────────────────────
         Wrapper de section collapsible générique : header cliquable +
         chevron qui pivote, body en max-height transition. Utilisé pour
         "Écoute qualitative" (qui n'a pas de collapsible interne sur
         desktop). Aligné visuellement sur .row-qualitative.stacked
         (panel cerulean + halo bas-droite). */
      .sample-collapse {
        position: relative;
        overflow: hidden;
        background: var(--card, ${T.s1});
        border: 1px solid var(--border, ${T.border});
        border-radius: 14px;
      }
      .sample-collapse::before {
        content: '';
        position: absolute;
        bottom: -60px; right: -60px;
        width: 220px; height: 220px;
        border-radius: 50%;
        background: var(--cerulean, #5cb8cc);
        filter: blur(80px);
        opacity: 0.14;
        pointer-events: none;
        z-index: 0;
      }
      .sample-collapse-head {
        all: unset;
        position: relative;
        z-index: 1;
        display: flex; align-items: center; gap: 12px;
        width: 100%;
        box-sizing: border-box;
        padding: 16px 22px;
        cursor: pointer;
        transition: background .15s;
      }
      .sample-collapse-head:hover { background: rgba(255,255,255,0.025); }
      .sample-collapse-head .sc-eyebrow {
        font-family: var(--mono, ${T.mono});
        font-size: 10.5px;
        letter-spacing: 2.2px;
        text-transform: uppercase;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        line-height: 1;
      }
      .sample-collapse-head .sc-eyebrow.cerulean { color: var(--cerulean, #5cb8cc); }
      .sample-collapse-head .sc-eyebrow.cerulean .dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--cerulean, #5cb8cc);
        flex-shrink: 0;
      }
      .sample-collapse-head .sc-chev {
        color: var(--muted, ${T.muted});
        display: inline-flex; align-items: center;
        transition: transform .18s ease, color .15s;
      }
      .sample-collapse.is-open .sc-chev {
        transform: rotate(90deg);
        color: var(--cerulean, #5cb8cc);
      }
      .sample-collapse-body {
        position: relative;
        z-index: 1;
        max-height: 0;
        overflow: hidden;
        transition: max-height .28s ease;
      }
      .sample-collapse.is-open .sample-collapse-body {
        max-height: 4000px;
      }
      /* Quand la QualitativeSection est wrappée, on retire son fond/halo
         pour ne pas avoir un panel dans un panel, et on cache son eyebrow
         interne (notre header le remplace). */
      .sample-collapse > .sample-collapse-body > .row-qualitative.stacked {
        background: transparent;
        border: none;
        border-radius: 0;
        padding: 0 22px 22px;
        margin: 0;
        overflow: visible;
      }
      .sample-collapse > .sample-collapse-body > .row-qualitative.stacked::before {
        display: none;
      }
      .sample-collapse > .sample-collapse-body > .row-qualitative.stacked > .q-eyebrow {
        display: none;
      }

      /* ── Diag categories collapsibles (sample) ───────────
         La règle de base .diag-cat.open .diag-cat-body { display: block }
         est définie dans MockupStyles ; pas besoin de la dupliquer. On
         ajoute juste le hover sur la head et on s'assure que le chev est
         bien rendu (la vraie fiche le styled via .fiche-v2 .diag-panel,
         qu'on n'utilise pas ici — fallback). */
      .public-fiche-page .diag-cat-head {
        cursor: pointer;
        transition: background .15s;
      }
      .public-fiche-page .diag-cat-head:hover { background: rgba(255,255,255,0.025); }
      .public-fiche-page .diag-cat-head .chev {
        display: inline-flex;
        align-items: center;
        color: var(--muted, ${T.muted});
        transition: transform .15s;
        flex-shrink: 0;
      }
      .public-fiche-page .diag-cat.open .diag-cat-head .chev {
        transform: rotate(90deg);
        color: var(--amber, ${T.amber});
      }

      /* ── Plan items (sample) — retire le pcheck/resolve héritage,
           ajoute hover ambre comme la vraie fiche en mode collapsible. */
      .sample-priority .pcheck,
      .sample-priority .resolve-action { display: none; }

      /* ── Stage : page principale + chat fictif à droite ──
         Sur desktop large (≥ 1180px), on passe en grid 2 colonnes :
         contenu principal (max 1080) + colonne chat ancrée à droite.
         Le chat est sticky pour rester visible quand on scrolle la fiche.
         Sous le seuil, le chat est masqué (mobile/tablette) — la grammaire
         "chat ancré" est avant tout une démo desktop. */
      .sample-stage { display: block; width: 100%; }
      .sample-chat-side { display: none; }
      .sample-sidebar-spacer { display: none; }
      @media (min-width: 1180px) {
        .sample-stage {
          display: grid;
          /* 240px = largeur de la sidebar de l'app (cf. .app dans MockupStyles).
             Le spacer reproduit l'offset gauche de la vraie fiche pour que
             le contenu central retombe au même endroit visuellement. */
          grid-template-columns: 240px minmax(0, 1fr) 380px;
          column-gap: 28px;
          max-width: 1740px;
          margin: 0 auto;
          padding: 0 28px;
          align-items: start;
        }
        .sample-sidebar-spacer {
          display: block;
          height: 1px;       /* réserve la colonne grid sans rien afficher */
        }
        .sample-stage > .public-fiche-page {
          margin: 0;          /* le centrage est géré par .sample-stage */
          padding: 0;
          max-width: 1080px;
        }
        .sample-chat-side {
          display: flex;
          position: sticky;
          top: 88px;          /* topbar 56 + 32 respiration */
          /* 88 top + 76 player + 24 air = 188 réservés */
          height: calc(100vh - 188px);
          min-height: 480px;
        }
        .sample-chat-side .chat-panel.chat-panel-anchored {
          position: relative;
          width: 100%;
          height: 100%;
          flex: 1;
          background: ${T.s1};
          border: 1px solid ${T.border};
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.25);
        }
      }
      /* Input désactivé : on garde le rendu visuel actif (pas grisé)
         pour que la maquette ne donne pas l'impression d'être cassée,
         mais on bloque le focus / la frappe via [disabled]. */
      .sample-chat-panel .chat-input input[disabled] {
        opacity: 1;
        cursor: not-allowed;
        background: ${T.s2} !important;
      }
      .sample-chat-panel .chat-input button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }

      @media (max-width: 768px) {
        .sample-topbar .pft-left { gap: 10px; flex-wrap: wrap; }
        .sample-eyebrow { font-size: 9px; letter-spacing: 1.8px; padding: 3px 8px; }
        .sample-cta-banner { margin: 40px 0 0; border-radius: 14px; }
        .sample-cta-btn { padding: 14px 26px; font-size: 11px; letter-spacing: 1.5px; }
      }

      /* ── Player simulé en bas ───────────────────────────
         Réplique visuelle du vrai BottomPlayer : barre fixe en bas,
         contrôles à gauche, meta + waveform au centre, volume à droite.
         Tous les contrôles sont désactivés (cursor: not-allowed). On
         laisse le main respirer avec un padding-bottom pour que le
         contenu ne soit pas masqué par la barre fixe. */
      .public-fiche-shell { padding-bottom: 96px; }
      .sample-bottom-player {
        position: fixed;
        bottom: 0; left: 0; right: 0;
        z-index: 50;
        height: 76px;
        display: grid;
        grid-template-columns: auto 220px 1fr auto;
        align-items: center;
        gap: 18px;
        padding: 0 24px;
        background: rgba(15, 14, 13, 0.92);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-top: 1px solid ${T.border};
        box-shadow: 0 -8px 24px rgba(0,0,0,0.35);
      }
      .sbp-section { display: flex; align-items: center; min-width: 0; }
      .sbp-controls { gap: 10px; }
      .sbp-ctrl {
        display: inline-flex; align-items: center; justify-content: center;
        width: 32px; height: 32px;
        background: transparent;
        color: ${T.muted};
        border: 0;
        border-radius: 999px;
        cursor: not-allowed;
        opacity: 0.45;
      }
      .sbp-play {
        display: inline-flex; align-items: center; justify-content: center;
        width: 38px; height: 38px;
        background: rgba(245,166,35,0.14);
        color: ${T.amber};
        border: 1px solid rgba(245,166,35,0.45);
        border-radius: 999px;
        cursor: not-allowed;
      }
      .sbp-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        overflow: hidden;
      }
      .sbp-title {
        font-family: ${T.body};
        font-weight: 600; font-size: 13.5px;
        color: ${T.text};
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        max-width: 100%;
      }
      .sbp-sub {
        font-family: ${T.mono};
        font-size: 10.5px;
        letter-spacing: 1.4px; text-transform: uppercase;
        color: ${T.muted};
      }
      .sbp-wave {
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
        min-width: 0;
      }
      .sbp-wave-track {
        position: relative;
        display: flex;
        align-items: center;
        gap: 1.5px;
        height: 36px;
        overflow: hidden;
      }
      .sbp-wave-bar {
        flex: 1 0 auto;
        width: 2px;
        min-width: 2px;
        border-radius: 1px;
        background: rgba(255,255,255,0.18);
        transition: opacity .2s, background .2s;
      }
      /* Portion déjà jouée — amber subtle, plus saturé que les barres non
         jouées mais sans cassure brutale. */
      .sbp-wave-bar.is-played {
        background: rgba(245,166,35,0.78);
      }
      .sbp-wave-cursor {
        position: absolute;
        top: 0; bottom: 0;
        width: 2px;
        background: ${T.amber};
        box-shadow: 0 0 6px rgba(245,166,35,0.6);
        pointer-events: none;
      }
      .sbp-time {
        display: flex; align-items: center; gap: 6px;
        font-family: ${T.mono};
        font-size: 11px;
        color: ${T.muted};
        letter-spacing: 0.6px;
      }
      .sbp-time-sep { opacity: 0.4; }
      .sbp-volume { justify-content: flex-end; }

      @media (max-width: 900px) {
        .sample-bottom-player {
          grid-template-columns: auto 1fr auto;
          padding: 0 14px;
          height: 68px;
        }
        .sbp-meta { display: none; }
      }
    `}</style>
  );
}

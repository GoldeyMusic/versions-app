import { useState, useEffect, useRef, useCallback } from "react";
import STRINGS from "./constants/strings";
import T from "./constants/theme";
import API from "./constants/api";
import { LangContext } from "./hooks/useLang";
import useMobile from "./hooks/useMobile";
import GlobalStyles from "./components/GlobalStyles";
import MockupStyles from "./components/MockupStyles";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import WaveSurfer from 'wavesurfer.js';
import BottomPlayer, { resolveAudio } from "./components/BottomPlayer";
import AskModal from "./components/AskModal";
import Sidebar from "./components/Sidebar";
import InputScreen from "./screens/InputScreen";
import LoadingScreen from "./screens/LoadingScreen";
import FicheScreen from "./screens/FicheScreen";
import VersionsScreen from "./screens/VersionsScreen";

import { saveAnalysis, getAnalysis, loadProjects, createProject, renameProject, deleteProject, renameTrack, deleteTrack, moveTrackToProject, reorderTracksInProject } from "./lib/storage";
import { assignProjectColors, PROJECT_COLOR_COUNT } from "./lib/projectColors";
import { supabase } from "./lib/supabase";
import { useAuth } from "./hooks/useAuth";
import AuthScreen from "./screens/AuthScreen";
import ReglagesScreen from "./screens/ReglagesScreen";
import RenameModal from "./components/RenameModal";
import OnboardingModal from "./components/OnboardingModal";
import { confirmDialog } from "./lib/confirm.jsx";

/* ── Font loader ────────────────────────────────────────── */
const FontLink = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');`}</style>
);

/* ── Welcome Home Screen ─────────────────────────────────
   Les cartes "conseil" / "pédago" tournent à chaque ouverture de la Home.
   Pour éviter de voir deux fois de suite le même tip, on mémorise le
   dernier index affiché par pool dans localStorage et on tire au hasard
   un index différent à chaque render initial.
*/
const SAVIEZ_VOUS_TIPS = [
  "Faire des pauses régulières permet de conserver une écoute attentive et objective.",
  "Tes oreilles se fatiguent après 45 min — une pause de 10 min te fait gagner 2h de travail.",
  "Écouter ton mix dans un autre contexte (voiture, écouteurs) révèle ce que le studio cache.",
  "Baisser le volume de monitoring aide à repérer les déséquilibres de balance.",
  "Prendre du recul sur un mix pendant 24h change complètement ta perception.",
  "Comparer régulièrement avec une référence recalibre ton oreille et tes choix.",
  "Le silence entre les sessions est aussi important que le travail lui-même.",
  "Écouter à faible volume est le meilleur test : si le mix fonctionne bas, il fonctionnera fort.",
  "Le bas du spectre se juge mieux debout qu'assis — tu sens mieux les sub.",
  "Ton premier jet de mix contient souvent une vérité que tu perds en peaufinant trop.",
  "Un mix qui tient en mono tient presque toujours en stéréo.",
  "La meilleure compression est souvent celle qu'on n'entend pas.",
  "Les ingénieurs pros changent d'enceintes toutes les 30 minutes pour ne pas s'habituer à une seule couleur.",
  "Le cerveau « moyenne » ce qu'il entend : après 20 minutes sur un passage, tu n'entends plus les défauts.",
  "La fatigue auditive touche d'abord les aigus — c'est pour ça qu'on a tendance à ajouter du haut, tard le soir.",
  "Écouter ton mix en marchant te fait remarquer des choses que le studio assis cache.",
  "Un bon mix doit fonctionner sur un téléphone posé sur la table — c'est l'épreuve du feu.",
  "La corrélation stéréo t'indique si ton mix s'effondre quand il est lu en mono.",
  "La dynamique perçue dépend du contexte : -10 LUFS peut sonner fort en stream et faible en vinyle.",
  "Un master trop fort masque les erreurs — quand on baisse, elles ressortent.",
  "Le cerveau adore la nouveauté : écouter une référence avant ton mix te le rend plus « neuf ».",
  "Un casque fermé exagère le bas, un casque ouvert exagère le haut. Croise les deux.",
  "Les 200 premières millisecondes d'un son définissent son impact perçu — c'est là qu'il faut être précis.",
  "Tes décisions sont meilleures le matin — le cerveau est moins biaisé par la fatigue cognitive.",
  "Boire régulièrement de l'eau améliore réellement la clarté auditive.",
  "L'acoustique d'une pièce change avec l'heure : une pièce chauffée n'a pas la même réponse qu'une pièce froide.",
  "Les pros écoutent leurs mix sur des enceintes médiocres pour repérer ce qui tient malgré tout.",
  "Le silence absolu n'existe pas en studio : ton plancher de bruit fait partie de ton écoute.",
  "Un niveau de monitoring constant d'une session à l'autre t'évite de remixer les mêmes choses.",
  "Si tu bouges la tête pendant l'écoute, tu corriges naturellement les colorations de ta pièce.",
  "Le kick et la voix principale occupent souvent la même plage d'énergie : leur équilibre fait un mix.",
];

const PROCHAIN_PAS_TIPS = [
  { title: "Écoute à bas volume", body: "Monitorer à faible volume révèle les déséquilibres de balance. Si le mix fonctionne bas, il fonctionnera fort." },
  { title: "Change d'environnement", body: "Écoute ton mix en voiture ou au casque : les défauts invisibles en studio deviennent évidents ailleurs." },
  { title: "Fais une pause de 24h", body: "Reviens sur ton mix après 24h de recul — ton oreille neuve te dira plus que 2h de travail d'affilée." },
  { title: "Compare avec une référence", body: "Prends un morceau que tu aimes, cale son volume, et alterne. Tu verras ce qui te manque ou ce qui dépasse." },
  { title: "Travaille en mono", body: "Bascule ton mix en mono pour détecter les annulations de phase et vérifier la solidité du bas." },
  { title: "Imprime puis oublie", body: "Exporte ton bounce, ferme la session, écoute-le plus tard ailleurs. Tu l'entendras comme un auditeur." },
  { title: "Vérifie la dynamique", body: "Regarde ton crest factor : trop plat, le mix fatigue ; trop dynamique, il peine à sortir du lecteur." },
  { title: "Écoute en voiture", body: "L'habitacle révèle les basses qui traînent et les médiums agressifs. Un vrai révélateur." },
  { title: "Isole kick + basse", body: "Solo ton kick et ta basse : leur relation fondamentale définit le groove et l'assise de ton mix." },
  { title: "Test du téléphone", body: "Sors ton téléphone, pose-le sur la table, joue ton mix. C'est le test le plus honnête côté public." },
  { title: "Coupe le bas", body: "Passe un high-pass à 150 Hz sur ton master : ce qui reste t'indique si les médiums et aigus tiennent seuls." },
  { title: "Ferme les yeux", body: "Écoute une minute les yeux fermés, sans regarder le DAW. Tu entendras ce que l'œil cachait à l'oreille." },
  { title: "Marche pendant l'écoute", body: "Lance ton mix à bas volume et marche dans la pièce — les problèmes de balance sautent aux oreilles." },
  { title: "Passage à l'autre", body: "Enchaîne ton mix avec un titre commercial. Le « saut » de qualité t'indique précisément où travailler." },
  { title: "Écoute demain matin", body: "Ferme la session, dors dessus, réécoute au petit déjeuner sans toucher au mix. Ta vraie opinion apparaît là." },
  { title: "Vise la médiane", body: "Cherche ce qui fonctionne partout (voiture, casque, enceintes), pas ce qui brille seulement dans ton studio." },
  { title: "Coupe la voix lead", body: "Écoute le mix sans la voix principale : si l'instru ne tient pas, tu masquais un problème derrière elle." },
  { title: "Re-compresse ta musique", body: "Fais un MP3 160 kbps de ton bounce et écoute-le. Les 2/3 des auditeurs t'entendront comme ça." },
  { title: "Teste à volume réaliste", body: "Règle ton monitoring à la hauteur d'une conversation normale. Si ça passe là, ça passe partout." },
];

const PROGRESSION_TIPS_NO_SCORE = [
  "Dès que tu as deux versions d'un même titre, VERSIONS compare les mix et met en lumière ce qui a bougé.",
  "Importe un premier bounce : l'analyse fréquentielle et dynamique se fait en moins d'une minute.",
  "Chaque titre ajouté affine ton oreille et te donne une référence pour les suivants.",
  "Commence par analyser un morceau que tu connais bien — tu valideras l'analyse contre ta perception.",
  "Ajoute d'abord ta V1 brute : elle servira de repère pour voir l'évolution.",
  "Une fiche par titre suffit pour voir apparaître les forces et les manques de ton mix.",
  "Analyse d'abord un titre maîtrisé : tu confronteras ton ressenti aux mesures objectives.",
  "Tu peux importer une référence commerciale — elle te servira d'étalon pour tes propres bounces.",
  "Trois titres, c'est déjà assez pour que des tendances apparaissent dans tes choix de mix.",
  "Tes premières analyses sont aussi celles qui t'apprennent le plus : chaque fiche te donne un nouveau repère.",
];

const PROGRESSION_TIPS_WITH_SCORE = [
  "Continue à comparer tes versions pour affiner l'évaluation. Chaque analyse précise la lecture de ton mix.",
  "Un score ne juge pas ton mix — il pointe ce qui pourrait être amélioré.",
  "Le score évolue avec tes choix : équilibre fréquentiel, dynamique, clarté stéréo.",
  "Regarde les tendances plus que les valeurs absolues : deux versions écartées de 5 points, c'est déjà significatif.",
  "Si le score baisse d'une version à l'autre, c'est peut-être le bon signal pour revenir en arrière.",
  "Note tes versions avec un commentaire : tu verras ensuite quels gestes font vraiment bouger le score.",
  "Un score stable sur trois versions indique que tu tournes en rond — change d'angle d'attaque.",
  "Compare deux versions côte à côte plutôt que de les juger séparément : l'écart est plus parlant.",
  "Le score n'est qu'un repère : c'est la fiche détaillée qui te dit pourquoi.",
  "Si une version très retravaillée score moins que la précédente, fais-toi confiance et reviens en arrière.",
];

const A_QUOI_CA_SERT_TIPS = [
  { title: "Analyser comme un pro", body: "Chaque titre que tu importes passe par une analyse objective — équilibre fréquentiel, dynamique, stéréo, saturation — puis par une écoute IA détaillée. Tu obtiens une fiche claire qui pointe ce qui marche et ce qui coince." },
  { title: "Des métriques lisibles", body: "VERSIONS traduit les mesures techniques (LUFS, crest factor, corrélation stéréo) en commentaires compréhensibles. Pas besoin d'être ingé son pour savoir quoi ajuster." },
  { title: "Un second avis fiable", body: "L'écoute IA commente ton mix section par section et t'indique où ton oreille a peut-être fatigué. Un regard extérieur disponible à toute heure." },
  { title: "Une fiche claire", body: "Chaque analyse te livre une fiche structurée : forces, points à retravailler, niveaux, dynamique. Pas d'interprétation, juste des repères." },
  { title: "Repérer la fatigue d'oreille", body: "VERSIONS écoute avec la même fraîcheur quelle que soit l'heure. Elle détecte ce que ton oreille surcompense après plusieurs heures de session." },
  { title: "Sortir de la boucle V2/V3", body: "Quand on hésite entre deux versions, l'analyse comparative tranche objectivement : tu sais laquelle tient mieux, et pourquoi." },
  { title: "Un cahier de bord auditif", body: "Chaque analyse est archivée et datée. Tu peux revenir en arrière, voir l'évolution d'un titre et identifier quand un mix a commencé à dériver." },
  { title: "Un regard sans ego", body: "VERSIONS n'a pas d'intérêt à flatter ton mix ni à le démonter. Elle te dit ce qui est, tel quel, avec les mots qu'il faut." },
  { title: "Préparer le master", body: "Avant d'envoyer ton mix au mastering, VERSIONS te signale les zones à nettoyer. Tu arrives au studio avec un mix propre, pas avec du travail en moins pour l'ingé master." },
  { title: "Gagner des heures d'écoute", body: "Une analyse de 2 minutes remplace des dizaines d'allers-retours entre enceintes, casque et voiture. Tu cibles direct ce qui coince." },
];

const POURQUOI_VERSIONS_TIPS = [
  { title: "Comparer tes mix entre eux", body: "Uploade plusieurs versions d'un même titre : VERSIONS met en évidence ce qui a progressé, ce qui régresse, et les zones à retravailler." },
  { title: "Voir la progression", body: "Chaque version est datée et scorée. Tu vois d'un coup d'œil si la V3 est réellement meilleure que la V2 — ou s'il faut revenir en arrière." },
  { title: "Défaire l'intuition trompeuse", body: "Parfois on pense qu'un mix s'améliore alors qu'il perd en clarté. VERSIONS objective ce ressenti et te donne des points de repère stables." },
  { title: "Garder l'historique", body: "Tes versions restent rangées par projet et datées. Plus besoin de chercher 'quelle est la dernière bonne' dans un dossier." },
  { title: "Un studio de poche", body: "Le recul d'un ingénieur son disponible à n'importe quelle heure, sans rendez-vous, sans coût de studio, sans attente de retour par mail." },
  { title: "Rompre la solitude du home-studio", body: "Quand on mixe seul, on perd l'œil extérieur. VERSIONS remplit ce rôle — un avis tangible, étayé, qui relance ton écoute." },
  { title: "Confirmer ses choix", body: "Parfois on sait ce qui cloche mais on n'ose pas trancher. VERSIONS confirme (ou infirme) ton intuition avec des données à l'appui." },
  { title: "Apprendre en mixant", body: "Chaque fiche est aussi une leçon : tu apprends à nommer ce que tu entends et à reconnaître les patterns d'un bon mix." },
  { title: "Arrêter de douter à 3h du matin", body: "Tard le soir, l'oreille ment. VERSIONS te donne un point de repère stable quand la fatigue rend tes décisions incertaines." },
  { title: "Sortir du perfectionnisme stérile", body: "VERSIONS t'indique quand un mix est bon — pour couper le cycle infini des ajustements et oser le clore." },
];

/* HOME_TAGLINES
   Utilise des crochets [mot] pour marquer le mot-clé qui sera mis en
   orange via renderTagline(). Un seul mot par tagline pour garder
   l'accent visuel.
*/
const HOME_TAGLINES = [
  "L'[assistant] studio qui suit tes mix.",
  "La meilleure [version] de ton mix commence ici.",
  "Un avis [extérieur] disponible à toute heure.",
  "Ton oreille, mais [reposée].",
  "Le regard [neuf] que ton mix attend.",
  "Des heures de [recul], en quelques secondes.",
  "Une écoute [attentive], sans jugement.",
  "La [patience] d'un studio, la rapidité d'un clic.",
  "Pour que tes choix ne reposent plus sur la [fatigue].",
  "Un second avis, aussi [juste] qu'une nuit de sommeil.",
  "Tes versions, lues à [froid].",
  "L'assistant qui ne se [lasse] jamais de ton mix.",
  "Parce que le meilleur mix est celui qu'on a [comparé].",
  "Ton [copilote] quand tu ne sais plus si tu avances.",
  "Le point de [repère] qui manque à ta session.",
  "Pour sortir de la [boucle] V2, V3, V4 sans jamais trancher.",
  "Une écoute [professionnelle], sans louer de studio.",
  "Écouter [mieux], pas plus longtemps.",
  "Le second [souffle] de ton mix.",
  "Chaque version mérite une écoute [neuve].",
  "Le recul que l'heure [tardive] t'enlève.",
  "Quand tes oreilles saturent, l'analyse, elle, reste [fraîche].",
  "[Avance] sur ton mix sans tourner en rond.",
  "Ton studio [silencieux], à toute heure.",
  "L'oreille que tu n'as plus à la fin de la [session].",
  "Un regard qui ne [juge] pas, qui éclaire.",
  "La [clarté] qui manque quand tu as trop écouté.",
  "Le [sparring partner] de ton mix.",
  "Ce que ton oreille [fatiguée] ne te dit plus.",
  "L'écoute [stable] dont ta session manquait.",
  "[Respire] — VERSIONS écoute pour toi.",
  "Quand le doute s'installe, VERSIONS [tranche].",
  "Parce que mixer seul n'est pas mixer [aveuglément].",
  "Moins de [doutes], plus de décisions.",
  "Ton [oreille témoin], toujours fraîche.",
  "Un œil [extérieur] qui ne dort jamais.",
  "Sors du tunnel de la [V7] qui sonne comme la V3.",
  "[Trancher] ne devrait plus prendre trois soirées.",
  "L'[objectivité] que la fatigue t'enlève.",
  "Le vrai [recul], pas celui de 2h du matin.",
  "Un filet de [sécurité] avant le master.",
  "Le [calme] d'une écoute qui n'a pas d'ego.",
  "Pour avancer sans [tourner] autour du mix.",
  "Ton mix vaut une écoute [neuve] — chaque fois.",
  "L'écoute [pro] sans l'agenda d'un pro.",
  "Une oreille de plus, [patiente] et précise.",
  "Ta [boussole] quand tu ne sais plus où est le nord.",
  "[Finir] un mix, enfin.",
];

const CONSEIL_TIPS = [
  { title: "Commence simple", body: "Pas besoin d'un master commercial — même un bounce rapide depuis Logic ou Ableton suffit pour un premier tour. Tu peux aussi tester sur une référence que tu aimes pour calibrer ton oreille." },
  { title: "Trois versions suffisent", body: "Tu n'as pas besoin de 10 versions pour voir le progrès. Une V1 (brute), une V2 (retravaillée), une V3 (mix presque final) suffisent pour lire l'évolution." },
  { title: "Note chaque version", body: "Ajoute un commentaire court à chaque upload : 'passe de comp', 'EQ plus nette', 'low cut sur les claviers'. Ça te permet de relier le score aux choix que tu fais." },
  { title: "Teste la référence", body: "Balance dans VERSIONS un titre commercial que tu aimes et regarde son profil. Ça te donne un étalon réaliste pour tes propres mix." },
  { title: "Analyse à froid", body: "Uploade une version et ne lis la fiche que le lendemain. Les commentaires te sauteront aux yeux avec une oreille reposée." },
  { title: "Un titre par projet au départ", body: "Ne commence pas par uploader ton catalogue entier. Prends un seul titre, travaille-le jusqu'à comprendre la fiche, puis élargis." },
  { title: "Mix puis pause puis fiche", body: "Termine ta session, exporte, sors marcher 30 minutes, reviens lire la fiche. Ton cerveau sera beaucoup plus réceptif à la critique." },
  { title: "Ne corrige pas tout d'un coup", body: "Si la fiche signale cinq points, choisis-en un ou deux pour la version suivante. Corriger tout en bloc brouille la lecture." },
  { title: "Garde la V1 brute", body: "Ne jette jamais ton bounce initial. C'est ton zéro, ta référence. Sans lui, tu ne sauras plus si tu as vraiment progressé." },
  { title: "Importe aussi tes vieux mix", body: "Uploader un mix qui a six mois te montre ce que ton oreille a gagné depuis. Précieux pour calibrer tes exigences." },
  { title: "Lis la fiche dans l'ordre", body: "Commence par les forces, puis les points à retravailler, puis les mesures techniques. C'est ainsi que tu gardes une lecture équilibrée du mix." },
  { title: "Imprime tes fiches importantes", body: "Pour les titres clés, exporte ou garde un PDF de la fiche. Tu y reviendras avant le master pour valider les gestes finaux." },
];

function pickTip(pool, storageKey) {
  if (!pool?.length) return null;
  let lastIdx = -1;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw != null) lastIdx = Number(raw);
  } catch { /* ignore */ }
  let next;
  if (pool.length <= 1) {
    next = 0;
  } else {
    do { next = Math.floor(Math.random() * pool.length); } while (next === lastIdx);
  }
  try { localStorage.setItem(storageKey, String(next)); } catch { /* ignore */ }
  return pool[next];
}

/* renderTagline(text)
   Parse les marqueurs [mot] dans une tagline et retourne un tableau
   de nœuds React où les parties entre crochets sont colorées en orange
   (var(--amber)). Le reste est rendu tel quel en blanc.
*/
function renderTagline(text) {
  if (!text) return null;
  const parts = text.split(/\[(.+?)\]/);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} style={{ color: 'var(--amber)' }}>{part}</span>
      : part
  );
}

/* ── Hero waveform ────────────────────────────────────────
   WaveSurfer attachée au même HTMLAudioElement (audioPool) que le
   BottomPlayer : play/pause/seek sont synchrones entre les deux vues,
   sans double décodage coûteux puisque WaveSurfer partage le media.
*/
function HeroWaveform({ storagePath, isActive }) {
  const containerRef = useRef(null);
  const wsRef = useRef(null);
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const lastPathRef = useRef(null);

  useEffect(() => {
    if (!storagePath || !containerRef.current) return;
    if (lastPathRef.current === storagePath && wsRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        const audio = await resolveAudio(storagePath);
        if (cancelled || !containerRef.current) return;

        if (wsRef.current) {
          try { wsRef.current.destroy(); } catch { /* noop */ }
          wsRef.current = null;
        }

        const ws = WaveSurfer.create({
          container: containerRef.current,
          waveColor: 'rgba(255,255,255,0.18)',
          progressColor: '#f5b056',
          cursorColor: 'rgba(245,176,86,0.85)',
          cursorWidth: 1,
          barWidth: 2,
          barGap: 2,
          barRadius: 2,
          height: 56,
          normalize: true,
          interact: true,
          media: audio,
        });
        wsRef.current = ws;
        audioRef.current = audio;
        lastPathRef.current = storagePath;
      } catch (err) {
        console.warn('[hero wave] load error:', err?.message || err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storagePath]);

  // Sync manuel du curseur : on manipule directement le shadow DOM de WaveSurfer
  // (contourne renderer.renderProgress qui peut être minifié/indisponible en prod).
  // Coût : ~3 writes DOM par frame, négligeable.
  useEffect(() => {
    const tick = () => {
      const hero = containerRef.current;
      const holder = hero?.firstElementChild;
      const shadow = holder?.shadowRoot;
      const ws = wsRef.current;
      const audio = (ws && typeof ws.getMediaElement === 'function')
        ? ws.getMediaElement()
        : audioRef.current;
      if (shadow && audio && audio.duration) {
        const ratio = Math.max(0, Math.min(1, audio.currentTime / audio.duration));
        const pct = ratio * 100;
        const cursor = shadow.querySelector('.cursor');
        const progress = shadow.querySelector('.progress');
        const canvases = shadow.querySelector('.canvases');
        if (cursor) cursor.style.left = `${pct}%`;
        if (progress) progress.style.width = `${pct}%`;
        if (canvases) {
          canvases.style.clipPath = `polygon(${pct}% 0%, 100% 0%, 100% 100%, ${pct}% 100%)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  // Nettoie l'instance quand le composant disparaît (changement d'écran)
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        try { wsRef.current.destroy(); } catch { /* noop */ }
        wsRef.current = null;
        lastPathRef.current = null;
      }
      audioRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="wh-hero-wave"
      style={{ opacity: isActive ? 1 : 0.75 }}
      aria-label="Forme d'onde du titre"
    />
  );
}

function WelcomeHome({ userProfile, currentProjectId, onSetCurrentProject, onNewTrack, onAddVersion, onSelectVersion, onOpenFiche, onPlay, onToggle, playerState, projects = [], projectsLoaded = false, onMutate }) {
  // Rotation des conseils : un tip distinct à chaque ouverture, sans répétition consécutive
  const [tip] = useState(() => pickTip(SAVIEZ_VOUS_TIPS, 'versions_tip_saviez'));
  const [prochainPasTip] = useState(() => pickTip(PROCHAIN_PAS_TIPS, 'versions_tip_prochain'));
  const [aQuoiTip] = useState(() => pickTip(A_QUOI_CA_SERT_TIPS, 'versions_tip_aquoi'));
  const [pourquoiTip] = useState(() => pickTip(POURQUOI_VERSIONS_TIPS, 'versions_tip_pourquoi'));
  const [conseilTip] = useState(() => pickTip(CONSEIL_TIPS, 'versions_tip_conseil'));
  const [progressionNoScoreTip] = useState(() => pickTip(PROGRESSION_TIPS_NO_SCORE, 'versions_tip_progression_noscore'));
  const [progressionWithScoreTip] = useState(() => pickTip(PROGRESSION_TIPS_WITH_SCORE, 'versions_tip_progression_score'));
  const [homeTagline] = useState(() => pickTip(HOME_TAGLINES, 'versions_tip_tagline'));
  const [pickingTrack, setPickingTrack] = useState(false);
  const pickerRef = useRef(null);
  const [pickingProject, setPickingProject] = useState(false);
  const projectPickerRef = useRef(null);
  // true si l'utilisateur a cliqué "+ Nouveau projet" depuis le picker "Nouveau titre"
  // → après création on enchaîne directement sur la saisie du titre.
  const pendingNewTrackRef = useRef(false);

  // Modales
  const [renameProjectTarget, setRenameProjectTarget] = useState(null);
  const [renameTrackTarget, setRenameTrackTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectValue, setNewProjectValue] = useState('');
  const renameInputRef = useRef(null);
  const newProjectInputRef = useRef(null);

  // Ferme le picker au clic extérieur / Escape
  useEffect(() => {
    if (!pickingTrack) return;
    const onDown = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickingTrack(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setPickingTrack(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [pickingTrack]);

  // Même logique pour le picker "Nouveau titre → dans quel projet ?"
  useEffect(() => {
    if (!pickingProject) return;
    const onDown = (e) => {
      if (projectPickerRef.current && !projectPickerRef.current.contains(e.target)) setPickingProject(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setPickingProject(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [pickingProject]);

  // Liste à plat de tous les titres (pour le picker "À quel titre ?")
  const allTracks = projects.flatMap((p) => (p.tracks || []).map((t) => ({ ...t, _projectName: p.name })));

  // Map projectId → index de couleur. Garantit l'unicité tant que
  // le nombre de projets ≤ PROJECT_COLOR_COUNT. Recalculée à chaque render,
  // mais basée uniquement sur createdAt ⇒ stable quand on réordonne.
  const projectColorMap = assignProjectColors(projects);

  const displayName = userProfile?.prenom || null;

  // ── Helpers ──
  const metaLine = (project) => {
    const nTracks = project.tracks?.length || 0;
    const nVersions = (project.tracks || []).reduce(
      (sum, t) => sum + (t.versions?.length || 0),
      0
    );
    const tLabel = `${nTracks} titre${nTracks > 1 ? 's' : ''}`;
    const vLabel = `${nVersions} version${nVersions > 1 ? 's' : ''}`;
    return `${tLabel} · ${vLabel}`;
  };

  const buildProjectPlaylist = (project) =>
    (project.tracks || [])
      .map((t) => {
        const latest = t.versions?.[t.versions.length - 1];
        if (!latest?.storagePath) return null;
        return { trackTitle: t.title, versionName: latest.name, storagePath: latest.storagePath };
      })
      .filter(Boolean);

  // ── Handlers projets ──
  const toggleProject = (projectId) => {
    if (!onSetCurrentProject) return;
    onSetCurrentProject(projectId === currentProjectId ? null : projectId);
  };

  const handlePlayProject = (e, project) => {
    e.stopPropagation();
    const playlist = buildProjectPlaylist(project);
    if (!playlist.length || !onPlay) return;
    // Toggle si déjà en lecture sur ce projet
    const firstTitle = playlist[0].trackTitle;
    if (playerState?.trackTitle && project.tracks?.some(t => t.title === playerState.trackTitle) && onToggle) {
      onToggle();
      return;
    }
    onPlay(playlist[0].trackTitle, playlist[0].versionName, playlist[0].storagePath, playlist, 0);
    // Ouvre l'accordéon si fermé
    if (project.id !== currentProjectId && onSetCurrentProject) onSetCurrentProject(project.id);
    void firstTitle;
  };

  const handlePlayTrack = (track, project) => {
    if (playerState?.trackTitle === track.title && onToggle) { onToggle(); return; }
    const playlist = buildProjectPlaylist(project);
    const idx = playlist.findIndex((p) => p.trackTitle === track.title);
    if (idx < 0 || !onPlay) return;
    onPlay(playlist[idx].trackTitle, playlist[idx].versionName, playlist[idx].storagePath, playlist, idx);
  };

  const handleViewFiche = (track) => {
    const latest = track.versions?.[track.versions.length - 1];
    if (!latest) return;
    if (onOpenFiche) onOpenFiche(track, latest);
    else if (onSelectVersion) onSelectVersion(track, latest);
  };

  const handleAddTrackToProject = (project) => {
    if (onSetCurrentProject) onSetCurrentProject(project.id);
    if (onNewTrack) onNewTrack();
  };

  // Renommer projet
  const handleRenameProjectStart = (project) => {
    setRenameProjectTarget(project);
    setRenameValue(project.name);
    setTimeout(() => renameInputRef.current?.select(), 50);
  };
  const submitRenameProject = async () => {
    const next = renameValue.trim();
    if (!next || next === renameProjectTarget?.name) { setRenameProjectTarget(null); return; }
    try {
      await renameProject(renameProjectTarget.id, next);
      if (onMutate) onMutate();
    } catch (err) { console.warn('renameProject failed', err); }
    setRenameProjectTarget(null);
  };

  // Supprimer projet
  const handleDeleteProject = async (project) => {
    if (projects.length <= 1) {
      await confirmDialog({
        title: 'Impossible',
        message: 'Au moins un projet est requis. Crée un autre projet avant de supprimer celui-ci.',
        confirmLabel: 'OK',
        cancelLabel: null,
      });
      return;
    }
    const nTracks = (project.tracks || []).length;
    const msg = nTracks === 0
      ? `Supprimer le projet "${project.name}" ?`
      : `Supprimer le projet "${project.name}" et ses ${nTracks} titre${nTracks > 1 ? 's' : ''} (avec toutes leurs versions et fichiers audio) ? Cette action est définitive.`;
    const ok = await confirmDialog({
      title: 'Supprimer le projet ?',
      message: msg,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      danger: true,
    });
    if (ok !== 'confirm') return;
    try {
      const res = await deleteProject(project.id);
      if (res?.ok === false && res?.reason === 'last-project') {
        await confirmDialog({
          title: 'Impossible',
          message: 'Au moins un projet est requis.',
          confirmLabel: 'OK',
          cancelLabel: null,
        });
        return;
      }
      if (onMutate) onMutate();
    } catch (err) { console.warn('deleteProject failed', err); }
  };

  // Nouveau projet
  const handleNewProject = () => {
    setNewProjectValue('');
    setNewProjectOpen(true);
    setTimeout(() => newProjectInputRef.current?.focus(), 50);
  };
  const submitNewProject = async () => {
    const name = newProjectValue.trim();
    if (!name) return;
    try {
      const created = await createProject(name);
      setNewProjectOpen(false);
      setNewProjectValue('');
      if (onMutate) onMutate();
      if (created?.id && onSetCurrentProject) onSetCurrentProject(created.id);
      // Si l'utilisateur venait du bouton "Nouveau titre", on enchaîne
      // directement sur la saisie du titre dans ce projet fraîchement créé.
      if (pendingNewTrackRef.current) {
        pendingNewTrackRef.current = false;
        if (onNewTrack) onNewTrack();
      }
    } catch (err) { console.warn('createProject failed', err); }
  };

  // Renommer titre
  const handleRenameTrackStart = (track) => {
    setRenameTrackTarget(track);
    setRenameValue(track.title);
    setTimeout(() => renameInputRef.current?.select(), 50);
  };
  const submitRenameTrack = async () => {
    const next = renameValue.trim();
    if (!next || next === renameTrackTarget?.title) { setRenameTrackTarget(null); return; }
    try {
      await renameTrack(renameTrackTarget.id, next);
      if (onMutate) onMutate();
    } catch (err) { console.warn('renameTrack failed', err); }
    setRenameTrackTarget(null);
  };

  // Supprimer titre
  const handleDeleteTrack = async (track) => {
    const n = (track.versions || []).length;
    const ok = await confirmDialog({
      title: 'Supprimer le titre ?',
      message: `Supprimer "${track.title}" et ses ${n} version${n > 1 ? 's' : ''} ? Cette action est définitive.`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      danger: true,
    });
    if (ok !== 'confirm') return;
    try {
      await deleteTrack(track.id);
      if (onMutate) onMutate();
    } catch (err) { console.warn('deleteTrack failed', err); }
  };

  const totalProjects = projects.length;
  const isMobile = useMobile();
  const hasContent = totalProjects > 0 && allTracks.length > 0;

  // ── Calculs pour la home desktop (hero + stats) ──
  // Ne servent qu'en version desktop ; mobile les ignore entièrement.
  const trackLastDateMs = (t) => {
    const latest = t?.versions?.[t.versions.length - 1];
    const src = latest?.date || latest?.createdAt || t?.createdAt;
    return src ? new Date(src).getTime() : 0;
  };

  const heroInfo = (() => {
    // 1) Titre en cours de lecture dans le player (fil d'Ariane naturel)
    if (playerState?.trackTitle) {
      for (const p of projects) {
        const found = p.tracks?.find((t) => t.title === playerState.trackTitle);
        if (found) {
          const gradIdx = p.coverGradient
            ? p.coverGradient % PROJECT_COLOR_COUNT
            : (projectColorMap.get(p.id) ?? 0);
          return { track: found, project: p, gradIdx };
        }
      }
    }
    // 2) Sinon : titre le plus récemment analysé
    let best = null;
    for (const p of projects) {
      for (const t of p.tracks || []) {
        const ts = trackLastDateMs(t);
        if (!best || ts > best.ts) {
          const gradIdx = p.coverGradient
            ? p.coverGradient % PROJECT_COLOR_COUNT
            : (projectColorMap.get(p.id) ?? 0);
          best = { track: t, project: p, gradIdx, ts };
        }
      }
    }
    return best;
  })();

  const nTitres = allTracks.length;
  const nVersions = allTracks.reduce((s, t) => s + (t.versions?.length || 0), 0);
  const allScores = allTracks
    .map((t) => t.versions?.[t.versions.length - 1]?.analysisResult?.fiche?.globalScore)
    .filter((x) => typeof x === 'number');
  const avgScore = allScores.length
    ? Math.round(allScores.reduce((s, x) => s + x, 0) / allScores.length)
    : null;

  // Derniers scores chronologiques pour le sparkline
  const sparkScores = allTracks
    .flatMap((t) => (t.versions || []).map((v) => ({
      score: v.analysisResult?.fiche?.globalScore,
      ts: new Date(v.date || v.createdAt || 0).getTime(),
    })))
    .filter((e) => typeof e.score === 'number')
    .sort((a, b) => a.ts - b.ts)
    .slice(-8)
    .map((e) => e.score);

  // Date de la dernière activité (version la plus récente toutes confondues)
  const lastActivityMs = Math.max(0, ...allTracks.map(trackLastDateMs));
  const formatRelative = (ms) => {
    if (!ms) return '—';
    // Label informatif "il y a X" — l'impureté de Date.now() est tolérée ici
    // car la valeur n'influence pas l'arbre (pas de condition de rendu).
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - ms;
    const day = 86400000;
    if (diff < day) return "aujourd'hui";
    if (diff < 2 * day) return 'hier';
    if (diff < 7 * day) return `il y a ${Math.floor(diff / day)}j`;
    if (diff < 30 * day) return `il y a ${Math.floor(diff / (7 * day))}sem`;
    return `il y a ${Math.floor(diff / (30 * day))} mois`;
  };

  // Score de la dernière analyse du héros (pour badge + CTA "Voir la fiche")
  const heroLatestVersion = heroInfo?.track?.versions?.[heroInfo.track.versions.length - 1];
  const heroScore = heroLatestVersion?.analysisResult?.fiche?.globalScore;
  // Waveform = version réellement jouée si c'est le titre en cours, sinon la dernière
  const heroWaveStoragePath = (
    heroInfo && playerState?.trackTitle === heroInfo.track.title && playerState?.storagePath
  ) ? playerState.storagePath : heroLatestVersion?.storagePath;

  /* ─── Drag & drop Home ──────────────────────────────── */
  const [drag, setDrag] = useState(null);

  const handleDropTrackOnTrack = async (sourceTrackId, sourceProjectId, targetTrackId, targetProjectId, position) => {
    if (sourceTrackId === targetTrackId) return;
    const targetProject = projects.find(p => p.id === targetProjectId);
    if (!targetProject) return;
    const targetOrder = (targetProject.tracks || []).map(t => t.id).filter(id => id !== sourceTrackId);
    const targetIdx = targetOrder.findIndex(id => id === targetTrackId);
    if (targetIdx < 0 && sourceProjectId === targetProjectId) return;
    const insertAt = position === 'before' ? (targetIdx < 0 ? 0 : targetIdx) : (targetIdx < 0 ? targetOrder.length : targetIdx + 1);
    targetOrder.splice(insertAt, 0, sourceTrackId);
    try {
      if (sourceProjectId !== targetProjectId) {
        await moveTrackToProject(sourceTrackId, targetProjectId);
        const sourceProject = projects.find(p => p.id === sourceProjectId);
        if (sourceProject) {
          const sourceOrder = (sourceProject.tracks || []).map(t => t.id).filter(id => id !== sourceTrackId);
          if (sourceOrder.length) await reorderTracksInProject(sourceProjectId, sourceOrder);
        }
      }
      await reorderTracksInProject(targetProjectId, targetOrder);
      if (onMutate) onMutate();
    } catch (err) { console.warn('home drop track on track failed', err); }
  };

  const handleDropTrackOnProject = async (sourceTrackId, sourceProjectId, targetProjectId) => {
    if (sourceProjectId === targetProjectId) return;
    try {
      await moveTrackToProject(sourceTrackId, targetProjectId);
      const sourceProject = projects.find(p => p.id === sourceProjectId);
      if (sourceProject) {
        const sourceOrder = (sourceProject.tracks || []).map(t => t.id).filter(id => id !== sourceTrackId);
        if (sourceOrder.length) await reorderTracksInProject(sourceProjectId, sourceOrder);
      }
      if (onMutate) onMutate();
    } catch (err) { console.warn('home drop track on project failed', err); }
  };

  /* ─── JSX réutilisables (mobile + desktop) ─────────────── */
  const actionsBar = (
    <div className="wh-actions">
      <button className="wh-action" onClick={handleNewProject}>
        <span className="wh-action-icon">+</span>
        <span>Nouveau projet</span>
      </button>
      <div ref={projectPickerRef} style={{ position: "relative", display: "flex" }}>
        <button
          className="wh-action"
          style={{ flex: 1 }}
          onClick={() => {
            // Pas encore de projet → créer d'abord, puis chaîner sur le titre
            if (totalProjects === 0) {
              pendingNewTrackRef.current = true;
              handleNewProject();
              return;
            }
            setPickingProject((v) => !v);
          }}
        >
          <span className="wh-action-icon">+</span>
          <span>Nouveau titre</span>
        </button>
        {pickingProject && (
          <div className="wh-track-picker">
            <div className="wh-picker-label">Dans quel projet ?</div>
            {projects.map((p) => (
              <div
                key={p.id}
                className="wh-picker-item"
                onClick={() => {
                  setPickingProject(false);
                  if (onSetCurrentProject) onSetCurrentProject(p.id);
                  if (onNewTrack) onNewTrack();
                }}
              >
                {p.name}
                <span className="wh-picker-count">{metaLine(p)}</span>
              </div>
            ))}
            <div
              className="wh-picker-item wh-picker-create"
              onClick={() => {
                setPickingProject(false);
                pendingNewTrackRef.current = true;
                handleNewProject();
              }}
            >
              <span className="wh-action-icon">+</span>
              <span>Nouveau projet</span>
            </div>
          </div>
        )}
      </div>
      {allTracks.length > 0 && (
        <div ref={pickerRef} style={{ position: "relative", display: "flex" }}>
          <button
            className="wh-action"
            style={{ flex: 1 }}
            onClick={() => setPickingTrack((v) => !v)}
          >
            <span className="wh-action-icon">↻</span>
            <span>Ajouter une version</span>
          </button>
          {pickingTrack && (
            <div className="wh-track-picker">
              <div className="wh-picker-label">À quel titre ?</div>
              {allTracks.map((t) => (
                <div
                  key={t.id}
                  className="wh-picker-item"
                  onClick={() => { setPickingTrack(false); if (onAddVersion) onAddVersion(t); }}
                >
                  {t.title}
                  <span className="wh-picker-count">
                    {t.versions?.length || 0} version{(t.versions?.length || 0) > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const projectsAccordion = totalProjects > 0 ? (
    <div className="wh-tracklist">
      <div className="wh-section-title">Mes <em>projets</em></div>
      <div className="wh-projects">
        {projects.map((project) => {
          const isOpen = project.id === currentProjectId;
          const nTracks = project.tracks?.length || 0;
          // Couleur du projet : priorité à cover_gradient s'il est explicite (>0),
          // sinon index unique issu de assignProjectColors (garanti distinct
          // tant qu'on a ≤ PROJECT_COLOR_COUNT projets).
          const gradIdx = project.coverGradient
            ? project.coverGradient % PROJECT_COLOR_COUNT
            : (projectColorMap.get(project.id) ?? 0);
          const isProjectPlaying = !!(
            playerState?.isPlaying &&
            project.tracks?.some((t) => t.title === playerState.trackTitle)
          );

          return (
            <div
              key={project.id}
              className={`wh-acc-item wh-tint-${gradIdx}${isOpen ? ' open' : ''}`}
            >
              {/* Header projet */}
              <div
                className="wh-acc-head"
                onClick={() => toggleProject(project.id)}
                onDragOver={(e) => {
                  // Seul le drop d'un titre depuis un autre projet est accepté sur le header
                  if (!drag || drag.type !== 'track') return;
                  if (drag.sourceProjectId === project.id) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  e.currentTarget.style.background = 'rgba(245,176,86,.08)';
                }}
                onDragLeave={(e) => { e.currentTarget.style.background = ''; }}
                onDrop={(e) => {
                  e.preventDefault();
                  const d = drag;
                  e.currentTarget.style.background = '';
                  setDrag(null);
                  if (!d) return;
                  if (d.type === 'track' && d.sourceProjectId !== project.id) {
                    handleDropTrackOnProject(d.trackId, d.sourceProjectId, project.id);
                  }
                }}
              >
                <div className={`wh-acc-cover wh-gradient-${gradIdx}`}>
                  {/* Play projet — apparaît au hover de la vignette, centré dessus */}
                  <button
                    className={`wh-acc-play${isProjectPlaying ? ' playing' : ''}`}
                    onClick={(e) => handlePlayProject(e, project)}
                    title={isProjectPlaying ? 'En lecture' : 'Lire le projet'}
                  >
                    {isProjectPlaying ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z"/></svg>
                    )}
                  </button>
                </div>

                <div className="wh-acc-title">
                  <div className="wh-acc-kicker">Projet</div>
                  <div className="wh-acc-name">{project.name}</div>
                  <div className="wh-acc-meta">{metaLine(project)}</div>
                  {isOpen && (
                    <div className="wh-head-actions">
                      <button
                        className="wh-head-btn primary"
                        onClick={(e) => { e.stopPropagation(); handleAddTrackToProject(project); }}
                      >+ Nouveau titre</button>
                      <button
                        className="wh-head-btn"
                        onClick={(e) => { e.stopPropagation(); handleRenameProjectStart(project); }}
                      >Renommer</button>
                      <button
                        className="wh-head-btn danger ghost"
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(project); }}
                      >Supprimer</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body : liste des titres */}
              <div className="wh-acc-body">
                {nTracks > 0 ? (
                  <div className="wh-acc-tracklist">
                    {project.tracks.map((track) => (
                      <WhTrackRow
                        key={track.id}
                        track={track}
                        project={project}
                        playerState={playerState}
                        onPlay={() => handlePlayTrack(track, project)}
                        onViewFiche={() => handleViewFiche(track)}
                        onRename={() => handleRenameTrackStart(track)}
                        onDelete={() => handleDeleteTrack(track)}
                        drag={drag}
                        setDrag={setDrag}
                        onDropTrackOnTrack={handleDropTrackOnTrack}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="wh-acc-empty">Aucun titre pour l'instant.</div>
                )}
                <button
                  className="wh-acc-add-track"
                  onClick={() => handleAddTrackToProject(project)}
                >+ Nouveau titre</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  const mobileEmpty = totalProjects === 0 ? (
    <div className="wh-empty">
      <img src="/logo-versions.svg" alt="" style={{ height: 60, width: "auto", opacity: 0.3 }} />
      <div>Crée ton premier projet pour commencer l'aventure.</div>
    </div>
  ) : null;

  const modalsSlot = (
    <>
      {renameTrackTarget && (
        <RenameModal
          title="Renommer le titre"
          placeholder="Nom du titre"
          value={renameValue}
          originalValue={renameTrackTarget.title}
          inputRef={renameInputRef}
          onChange={setRenameValue}
          onCancel={() => setRenameTrackTarget(null)}
          onSubmit={submitRenameTrack}
          confirmLabel="Renommer"
        />
      )}
      {renameProjectTarget && (
        <RenameModal
          title="Renommer le projet"
          placeholder="Nom du projet"
          value={renameValue}
          originalValue={renameProjectTarget.name}
          inputRef={renameInputRef}
          onChange={setRenameValue}
          onCancel={() => setRenameProjectTarget(null)}
          onSubmit={submitRenameProject}
          confirmLabel="Renommer"
        />
      )}
      {newProjectOpen && (
        <RenameModal
          title="Nouveau projet"
          placeholder="Nom du projet"
          value={newProjectValue}
          originalValue=""
          inputRef={newProjectInputRef}
          onChange={setNewProjectValue}
          onCancel={() => setNewProjectOpen(false)}
          onSubmit={submitNewProject}
          confirmLabel="Créer"
        />
      )}
    </>
  );

  /* ─── Desktop-only : hero "Reprends où tu étais" ───────── */
  const heroIsPlaying = !!(
    heroInfo && playerState?.isPlaying &&
    playerState?.trackTitle === heroInfo.track.title
  );
  const desktopHero = heroInfo && (
    <div className="wh-hero">
      <div className={`wh-hero-cover tint-${heroInfo.gradIdx}`}>
        <button
          className="wh-hero-play"
          onClick={() => handlePlayTrack(heroInfo.track, heroInfo.project)}
          title={heroIsPlaying ? 'En lecture' : 'Écouter'}
          aria-label={heroIsPlaying ? 'Mettre en pause' : 'Lire ce titre'}
        >
          {heroIsPlaying ? (
            <svg width="22" height="22" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z"/></svg>
          )}
        </button>
      </div>
      <div className="wh-hero-info">
        <div>
          <div className="wh-hero-kicker">Reprends où tu étais</div>
          <div className="wh-hero-title">{heroInfo.track.title}</div>
          <div className="wh-hero-meta">
            {heroInfo.project.name} · {heroInfo.track.versions?.length || 0} version{(heroInfo.track.versions?.length || 0) > 1 ? 's' : ''}
            {heroLatestVersion?.date ? ` · ${heroLatestVersion.date}` : ''}
          </div>
        </div>
        {heroWaveStoragePath ? (
          <HeroWaveform
            storagePath={heroWaveStoragePath}
            isActive={heroIsPlaying}
          />
        ) : (
          <div className="wh-hero-wave wh-hero-wave-empty" aria-hidden />
        )}
        <div className="wh-hero-bottom">
          {typeof heroScore === 'number' ? (
            <div className="wh-hero-score">
              <span className="num">{Math.round(heroScore)}</span>
              <span className="lbl">Score du mix</span>
            </div>
          ) : <div />}
          <div className="wh-hero-ctas">
            <button className="wh-btn wh-btn-primary" onClick={() => handleViewFiche(heroInfo.track)}>
              Voir la fiche
            </button>
            <button className="wh-btn" onClick={() => { if (onAddVersion) onAddVersion(heroInfo.track); }}>
              Nouvelle version
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── Desktop-only : ligne de stats (4 tuiles) ─────────── */
  const sparkPath = (() => {
    if (sparkScores.length < 2) return null;
    const w = 120, h = 24;
    const min = Math.min(...sparkScores);
    const max = Math.max(...sparkScores);
    const range = max - min || 1;
    return sparkScores
      .map((s, i) => {
        const x = (i / (sparkScores.length - 1)) * w;
        const y = h - ((s - min) / range) * h;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  })();

  const desktopStats = (
    <div className="wh-stats">
      <div className="wh-stat">
        <div className="wh-stat-label">Titres</div>
        <div className="wh-stat-value">{nTitres}</div>
        <div className="wh-stat-hint">{totalProjects} projet{totalProjects > 1 ? 's' : ''}</div>
      </div>
      <div className="wh-stat">
        <div className="wh-stat-label">Versions</div>
        <div className="wh-stat-value">{nVersions}</div>
        <div className="wh-stat-hint">{formatRelative(lastActivityMs)}</div>
      </div>
      <div className="wh-stat">
        <div className="wh-stat-label">Score moyen</div>
        <div className="wh-stat-value">{avgScore != null ? avgScore : '—'}</div>
        <div className="wh-stat-hint">
          {allScores.length
            ? `sur ${allScores.length} analyse${allScores.length > 1 ? 's' : ''}`
            : 'aucune analyse'}
        </div>
      </div>
      <div className="wh-stat">
        <div className="wh-stat-label">Progression</div>
        <div className="wh-stat-spark">
          {sparkPath ? (
            <svg width="100%" height="38" viewBox="0 0 120 24" preserveAspectRatio="none" aria-hidden>
              <path d={sparkPath} fill="none" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 8, letterSpacing: 0.5 }}>
              Analyse quelques titres pour voir ta courbe.
            </div>
          )}
        </div>
        <div className="wh-stat-hint">
          {sparkScores.length >= 2 ? `${sparkScores.length} dernières analyses` : 'courbe en construction'}
        </div>
      </div>
    </div>
  );

  /* ─── Cartes conseils (colonne droite) : saviez-vous / progression / prochain pas ──── */
  const tipsBlock = (
    <>
      <div className="wh-card amber">
        <div className="wh-card-kicker">Le saviez-vous</div>
        <div className="wh-card-body">{tip}</div>
      </div>
      <div className="wh-card">
        <div className="wh-card-kicker">Ta progression</div>
        <div className="wh-card-title">
          {avgScore != null ? `Score moyen ${avgScore}/100` : 'Lance ta première analyse'}
        </div>
        <div className="wh-card-body">
          {avgScore != null ? progressionWithScoreTip : progressionNoScoreTip}
        </div>
      </div>
      <div className="wh-card">
        <div className="wh-card-kicker">Prochain pas</div>
        <div className="wh-card-title">{prochainPasTip?.title}</div>
        <div className="wh-card-body">{prochainPasTip?.body}</div>
      </div>
    </>
  );
  const editorialSidebar = (
    <div className="wh-col-right">
      {tipsBlock}
    </div>
  );

  /* ─── Bloc pédagogique (À quoi ça sert / Pourquoi / Conseil) ────
     Visible sur la home compte neuf ET sur la home avec contenu
     (David veut garder ces repères en permanence, avec rotation).
  */
  const pedagoBlock = (
    <>
      <div className="wh-card">
        <div className="wh-card-kicker">À quoi ça sert</div>
        <div className="wh-card-title">{aQuoiTip?.title}</div>
        <div className="wh-card-body">{aQuoiTip?.body}</div>
      </div>
      <div className="wh-card">
        <div className="wh-card-kicker">Pourquoi « Versions »</div>
        <div className="wh-card-title">{pourquoiTip?.title}</div>
        <div className="wh-card-body">{pourquoiTip?.body}</div>
      </div>
      <div className="wh-card">
        <div className="wh-card-kicker">Conseil</div>
        <div className="wh-card-title">{conseilTip?.title}</div>
        <div className="wh-card-body">{conseilTip?.body}</div>
      </div>
    </>
  );

  /* ─── Desktop-only : hero d'onboarding (compte neuf) ──── */
  const onboardingChecks = [
    { label: 'Créer ton premier projet', done: totalProjects > 0 },
    { label: 'Analyser un premier titre', done: allTracks.length > 0 },
    { label: 'Comparer deux versions', done: nVersions > 1 },
    { label: 'Explorer les questions au chat', done: false },
  ];
  const doneCount = onboardingChecks.filter((c) => c.done).length;
  const onboardingProgress = Math.round((doneCount / onboardingChecks.length) * 100);

  const desktopOnboarding = (
    <div className="wh-onboarding">
      <div>
        <div className="wh-ob-welcome">
          {displayName ? `Bienvenue, ${displayName}` : 'Bienvenue'}
        </div>
        <div className="wh-ob-tagline">
          VERSIONS analyse tes mix et compare tes versions entre elles.
          Commençons par un premier titre.
        </div>
        <div className="wh-ob-ctas">
          <button
            className="wh-btn wh-btn-primary"
            onClick={() => {
              if (totalProjects === 0) {
                pendingNewTrackRef.current = true;
                handleNewProject();
              } else if (onNewTrack) {
                onNewTrack();
              }
            }}
          >+ Mon premier titre</button>
          <button className="wh-btn" onClick={handleNewProject}>Nouveau projet</button>
        </div>
      </div>
      <div className="wh-ob-checklist">
        <div className="wh-card-kicker">Mise en route</div>
        <div className="wh-ob-progress">
          <div className="wh-ob-progress-fill" style={{ width: `${onboardingProgress}%` }} />
        </div>
        <div className="wh-checklist">
          {onboardingChecks.map((c, i) => (
            <div key={i} className={`wh-check-item${c.done ? ' done' : ''}`}>
              <span className="wh-check-box">✓</span>
              <span className="wh-check-label">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const onboardingColumnLeft = (
    <div className="wh-col-left">
      {pedagoBlock}
    </div>
  );

  return (
    <div className={`welcome-home${!isMobile ? ' wh-desktop' : ''}`}>
      {/* Header — même tagline desktop/mobile, avec mot en orange */}
      <div className="wh-tagline-hero">
        <div className="wh-tagline-text">« {renderTagline(homeTagline)} »</div>
      </div>

      {isMobile ? (
        <>
          {actionsBar}
          {projectsAccordion}
          {mobileEmpty}
          {/* Tips et cartes pédagogiques (rotation à chaque ouverture) */}
          {tipsBlock}
          {pedagoBlock}
        </>
      ) : hasContent ? (
        <>
          {desktopHero}
          {desktopStats}
          {actionsBar}
          <div className="wh-cols">
            <div className="wh-col-left">{projectsAccordion}</div>
            <div className="wh-col-right">
              {tipsBlock}
              {pedagoBlock}
            </div>
          </div>
        </>
      ) : projectsLoaded ? (
        <>
          {desktopOnboarding}
          <div className="wh-cols">
            {onboardingColumnLeft}
            {editorialSidebar}
          </div>
        </>
      ) : null /* première session sans cache — on ne montre rien plutôt que flasher l'écran d'onboarding */}

      {modalsSlot}
    </div>
  );
}

/* ─── Ligne titre dans Home (accordéon ouvert) ─────────────────────── */
function WhTrackRow({ track, project, playerState, onPlay, onViewFiche, onRename, onDelete, drag, setDrag, onDropTrackOnTrack }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOver, setDropOver] = useState(null);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('keydown', esc);
    };
  }, [menuOpen]);

  const latest = track.versions?.[track.versions.length - 1];
  const fiche = latest?.analysisResult?.fiche;
  const hasFiche = !!fiche;
  const dur = fiche?.duration_seconds;
  const durStr = dur ? `${Math.floor(dur / 60)}:${String(Math.floor(dur % 60)).padStart(2, '0')}` : null;
  const dateStr = latest?.date || null;
  const isThisPlaying = playerState?.trackTitle === track.title && !!playerState?.isPlaying;
  const showDots = hover || menuOpen;

  return (
    <div
      className="wh-track-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragOver={(e) => {
        if (!drag || drag.type !== 'track') return;
        if (drag.trackId === track.id) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        const rect = e.currentTarget.getBoundingClientRect();
        const isAbove = (e.clientY - rect.top) < rect.height / 2;
        setDropOver(isAbove ? 'before' : 'after');
      }}
      onDragLeave={() => setDropOver(null)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const d = drag;
        const rect = e.currentTarget.getBoundingClientRect();
        setDropOver(null);
        if (setDrag) setDrag(null);
        if (!d || d.type !== 'track' || d.trackId === track.id) return;
        const isAbove = (e.clientY - rect.top) < rect.height / 2;
        onDropTrackOnTrack?.(d.trackId, d.sourceProjectId, track.id, project?.id, isAbove ? 'before' : 'after');
      }}
      style={{
        position: 'relative',
        boxShadow: dropOver === 'before' ? 'inset 0 2px 0 0 #f5b056' : (dropOver === 'after' ? 'inset 0 -2px 0 0 #f5b056' : 'none'),
        transition: 'box-shadow .1s',
      }}
    >
      {/* Poignée de déplacement titre */}
      <span
        className="wh-drag-handle"
        draggable={true}
        onClick={(e) => e.stopPropagation()}
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('application/x-versions-dnd', 'track');
          const row = e.currentTarget.closest('.wh-track-row');
          if (row) e.dataTransfer.setDragImage(row, 10, 10);
          if (setDrag) setDrag({ type: 'track', trackId: track.id, sourceProjectId: project?.id });
        }}
        onDragEnd={() => { if (setDrag) setDrag(null); setDropOver(null); }}
        title="Glisser pour déplacer le titre"
        aria-label="Déplacer le titre"
        style={{ opacity: hover ? 0.55 : 0 }}
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
          <circle cx="3" cy="3" r="1.1"/><circle cx="7" cy="3" r="1.1"/>
          <circle cx="3" cy="7" r="1.1"/><circle cx="7" cy="7" r="1.1"/>
          <circle cx="3" cy="11" r="1.1"/><circle cx="7" cy="11" r="1.1"/>
        </svg>
      </span>

      {/* Play */}
      <button
        className={`wh-track-play${isThisPlaying ? ' playing' : ''}`}
        onClick={(e) => { e.stopPropagation(); onPlay?.(e); }}
        title={isThisPlaying ? 'En lecture' : 'Écouter'}
      >
        {isThisPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z"/></svg>
        )}
      </button>

      {/* Info */}
      <div className="wh-track-info">
        <div className="wh-track-title">{track.title}</div>
        <div className="wh-track-meta">
          {durStr && <>{durStr} · </>}
          {track.versions?.length || 1} version{(track.versions?.length || 1) > 1 ? 's' : ''}
        </div>
      </div>

      {/* Date */}
      {dateStr && <span className="wh-track-date">{dateStr}</span>}

      {/* Voir analyse */}
      {hasFiche && (
        <button className="wh-track-fiche" onClick={(e) => { e.stopPropagation(); onViewFiche?.(e); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>Analyse</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3.5 2l3.5 3-3.5 3"/></svg>
        </button>
      )}

      {/* Menu ⋯ */}
      {showDots && (
        <button
          ref={btnRef}
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
          title="Options"
          style={{
            width: 26, height: 26, borderRadius: 6,
            background: menuOpen ? 'rgba(245,176,86,.15)' : 'transparent',
            border: 'none', color: '#c5c5c7', cursor: 'pointer',
            padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, lineHeight: 1, marginLeft: 4,
          }}
        >⋯</button>
      )}

      {menuOpen && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 100,
            minWidth: 180, background: '#141416', border: '1px solid #2a2a2e',
            borderRadius: 10, padding: 6, boxShadow: '0 12px 32px rgba(0,0,0,.55)',
          }}
        >
          <WhMenuItem label="Renommer" onClick={() => { setMenuOpen(false); onRename(); }} />
          <div style={{ height: 1, background: '#2a2a2e', margin: '4px 2px' }} />
          <WhMenuItem label="Supprimer" danger onClick={() => { setMenuOpen(false); onDelete(); }} />
        </div>
      )}
    </div>
  );
}

function WhMenuItem({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '8px 12px', borderRadius: 6, border: 'none',
        background: 'transparent', cursor: 'pointer',
        fontFamily: 'Inter, sans-serif', fontSize: 12,
        color: danger ? '#ef6b6b' : '#c5c5c7',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? 'rgba(239,107,107,.08)' : 'rgba(245,176,86,.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >{label}</button>
  );
}

const SIDEBAR_WIDTH = 260;

/* ── Mobile Avatar Menu ────────────────────────────────── */
function MobileMenu({ onNavigate, onSignOut, user, userProfile }) {
  const [open, setOpen] = useState(false);
  const go = (target) => { setOpen(false); onNavigate(target); };
  const avatarUrl = userProfile?.avatar_url || null;
  const displayName = userProfile?.prenom || (user?.email ? user.email.split('@')[0] : 'utilisateur');
  const initial = (userProfile?.prenom || user?.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <>
      {/* ── Top bar ── */}
      <div className="mobile-topbar">
        <div className="brand" onClick={() => go('welcome')} style={{ cursor: 'pointer', fontSize: 20, letterSpacing: 2, gap: 8 }}>
          <img src="/logo-versions.svg" alt="" style={{ height: 22, width: 'auto' }} />
          <span>{"VER"}<span className="accent">{"SI"}</span>{"ONS"}</span>
        </div>
        <div className="mobile-avatar-wrap">
          <button
            className={`mobile-avatar-btn${open ? ' open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label="Menu utilisateur"
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="" />
              : <span className="mobile-avatar-initial">{initial}</span>}
          </button>

          {open && (
            <>
              <div className="mobile-avatar-backdrop" onClick={() => setOpen(false)} />
              <div className="mobile-avatar-popover">
                <div className="mobile-avatar-popover-user">
                  <div className="mobile-avatar-popover-who">{displayName}</div>
                  {user?.email && <div className="mobile-avatar-popover-mail">{user.email}</div>}
                </div>
                <button className="mobile-avatar-popover-item" onClick={() => go('reglages')}>
                  <span className="mobile-menu-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                  </span>
                  Réglages
                </button>
                <button
                  className="mobile-avatar-popover-item danger"
                  onClick={async () => { setOpen(false); if (onSignOut) await onSignOut(); }}
                >
                  <span className="mobile-menu-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </span>
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Hash routing (permet "Précédent/Suivant" navigateur) ──
   On utilise des hashs (#/…) : un reload retombe toujours sur index.html
   et Vercel n'a pas besoin de règle de rewrite côté serveur. */
const SCREEN_HASH = {
  welcome: '#/',
  input: '#/nouveau',
  loading: '#/analyse',
  fiche: '#/fiche',
  versions: '#/versions',
  reglages: '#/reglages',
};
const HASH_SCREEN = {
  '': 'welcome',
  '#/': 'welcome',
  '#/nouveau': 'input',
  '#/analyse': 'loading',
  '#/fiche': 'fiche',
  '#/versions': 'versions',
  '#/reglages': 'reglages',
};

/* ═══════════════════════════════════════════════════════════ */
/* APP                                                        */
/* ═══════════════════════════════════════════════════════════ */
export default function VersionsApp() {
  const { user, loading: authLoading, signOut } = useAuth();
  const isMobile = useMobile();
  const isDesktop = !isMobile;
  // On desktop, default = "welcome" (neutral empty state); on mobile, old default = "input"
  const [screen, setScreen] = useState("welcome");
  const isHashSyncRef = useRef(false);
  const routeInitRef = useRef(false);
  const prevScreenRef = useRef(null);
  const scrollContentRef = useRef(null);

  // À chaque changement d'écran, on remonte tout en haut du container de contenu
  // (sinon on garde la position de scroll de l'écran précédent — gênant quand on
  // revient sur la home alors qu'on avait scrollé dans une fiche).
  useEffect(() => {
    if (scrollContentRef.current) {
      scrollContentRef.current.scrollTop = 0;
    }
  }, [screen]);

  // Sur la home (welcome), le BottomPlayer est masqué : on retire la réserve
  // de 68px appliquée globalement (padding-bottom du body + height de la
  // sidebar) pour que la sidebar descende jusqu'en bas. Les autres écrans
  // conservent la réserve, puisque le player y est toujours présent.
  useEffect(() => {
    const cls = 'no-bottom-player';
    if (screen === 'welcome') document.body.classList.add(cls);
    else document.body.classList.remove(cls);
    return () => { document.body.classList.remove(cls); };
  }, [screen]);
  const [config, setConfig] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [askOpen, setAskOpen] = useState(false);
  // When adding a new version from an existing track, we prefill the title
  // and, after analysis completes, auto-open that track's folder in Versions tab
  const [prefillTitle, setPrefillTitle] = useState("");
  const [autoSelectTrackTitle, setAutoSelectTrackTitle] = useState("");
  // ── Projets : état centralisé au niveau App ──
  // Une seule requête loadProjects() par mutation, distribuée à Sidebar
  // et WelcomeHome en props. Évite la triple fetch qu'on avait avant
  // (Sidebar + Home + App pour l'onboarding gate).
  //
  // Cache localStorage pour un rendu instantané : au mount, on lit la
  // dernière liste connue et on l'affiche direct. La requête live met
  // à jour silencieusement derrière (stale-while-revalidate).
  const [projects, setProjects] = useState(() => {
    try {
      const raw = localStorage.getItem('versions_projects_cache');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { /* ignore */ }
    return [];
  });
  const [projectsLoaded, setProjectsLoaded] = useState(() => {
    try { return !!localStorage.getItem('versions_projects_cache'); } catch { return false; }
  });
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0);
  const refreshProjects = useCallback(() => setProjectsRefreshKey((k) => k + 1), []);

  // Projet courant — synchronise l'accordéon Sidebar ↔ Home, et sert de scope
  // à la playlist du player. null = aucun projet explicitement ouvert.
  const [currentProjectId, setCurrentProjectId] = useState(null);

  // ── User profile (avatar, prénom…) ──
  const [userProfile, setUserProfile] = useState(null);
  useEffect(() => {
    if (!user) { setUserProfile(null); return; }
    supabase
      .from("profiles")
      .select("prenom, nom, avatar_url, default_daw, langue")
      .eq("id", user.id)
      .single()
      .then(({ data }) => { if (data) setUserProfile(data); })
      .catch(() => {});
  }, [user]);

  // ── Hash routing : lecture initiale de l'URL ─────────────
  // Quand l'utilisateur est connecté, on aligne l'écran sur le hash courant.
  // Les écrans qui dépendent d'un state en mémoire (loading, fiche) retombent
  // sur welcome si on y arrive directement (refresh, lien entrant).
  useEffect(() => {
    if (!user || routeInitRef.current) return;
    routeInitRef.current = true;
    const current = window.location.hash || '#/';
    const target = HASH_SCREEN[current] || 'welcome';
    const safe = (target === 'fiche' || target === 'loading') ? 'welcome' : target;
    const targetHash = SCREEN_HASH[safe];
    if (window.location.hash !== targetHash) {
      window.history.replaceState({ screen: safe }, '', targetHash);
    }
    if (safe !== screen) {
      isHashSyncRef.current = true;
      setScreen(safe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Hash routing : screen → URL ──────────────────────────
  // Chaque changement d'écran pousse une nouvelle entrée dans l'historique,
  // sauf quand c'est nous-mêmes qui venons de le setter en réaction à popstate.
  useEffect(() => {
    if (!user) return;
    if (isHashSyncRef.current) {
      isHashSyncRef.current = false;
      prevScreenRef.current = screen;
      return;
    }
    const nextHash = SCREEN_HASH[screen] || '#/';
    if (window.location.hash !== nextHash) {
      // loading → fiche : on remplace l'entrée "loading" par "fiche" pour que
      // "Précédent" depuis la fiche saute directement avant l'analyse au lieu
      // de repasser sur l'écran de chargement.
      const shouldReplace = prevScreenRef.current === 'loading' && screen === 'fiche';
      if (shouldReplace) {
        window.history.replaceState({ screen }, '', nextHash);
      } else {
        window.history.pushState({ screen }, '', nextHash);
      }
    }
    prevScreenRef.current = screen;
  }, [screen, user]);

  // ── Hash routing : URL → screen (Précédent/Suivant) ──────
  useEffect(() => {
    const onPop = () => {
      const current = window.location.hash || '#/';
      const target = HASH_SCREEN[current] || 'welcome';
      // Si on revient sur une vue qui a besoin de state volatil et qu'on ne l'a
      // plus (recharge après précédent), on retombe proprement sur welcome.
      const safe =
        (target === 'fiche' && !analysisResult) ? 'welcome'
        : (target === 'loading' && !config) ? 'welcome'
        : target;
      if (safe !== target) {
        window.history.replaceState({ screen: safe }, '', SCREEN_HASH[safe]);
      }
      isHashSyncRef.current = true;
      setScreen(safe);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [config, analysisResult]);

  // ── Onboarding gate : true si user connecté mais sans projet ──
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // ── Chargement des projets + onboarding gate + preload premier audio ──
  // Une seule requête par mutation grâce à projectsRefreshKey centralisé.
  // Alimente projects/projectsLoaded, met à jour le cache localStorage,
  // déclenche l'onboarding bloquant et pré-charge le premier audio pour
  // éliminer le délai de première lecture.
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setProjectsLoaded(false);
      setNeedsOnboarding(false);
      return;
    }
    let alive = true;
    loadProjects().then((list) => {
      if (!alive) return;
      const next = list || [];
      setProjects(next);
      setProjectsLoaded(true);
      try { localStorage.setItem('versions_projects_cache', JSON.stringify(next)); } catch { /* ignore */ }
      if (next.length === 0) {
        setNeedsOnboarding(true);
        return;
      }
      setNeedsOnboarding(false);
      const firstProject = next[0];
      const firstTrack = firstProject?.tracks?.[0];
      const latest = firstTrack?.versions?.[firstTrack.versions.length - 1];
      if (latest?.storagePath) resolveAudio(latest.storagePath).catch(() => {});
      if (firstProject?.id) setCurrentProjectId((cur) => cur ?? firstProject.id);
    }).catch(() => {});
    return () => { alive = false; };
  }, [user, projectsRefreshKey]);

  const handleOnboardingCreate = async (name) => {
    const created = await createProject(name);
    if (!created?.id) throw new Error('La création a échoué, réessaye.');
    setCurrentProjectId(created.id);
    setNeedsOnboarding(false);
    refreshProjects();
  };

  // ── Language ──
  const [lang, setLangState] = useState("fr");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("versions_lang");
      if (stored === "en") setLangState("en");
    } catch {}
  }, []);
  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem("versions_lang", l); } catch {}
  };
  const s = STRINGS[lang];

  // ── Persistent player state ──
  const [playerState, setPlayerState] = useState(null);
  const resetKeyRef = useRef(0);

  const play = (trackTitle, versionName, storagePath, playlist, currentIdx, keepProgress) => {
    if (!storagePath) return; // pas d'audio disponible
    const samePath = playerState?.storagePath === storagePath;
    const sameTrack = playerState?.trackTitle === trackTitle;
    // Restart si : même fichier rejoué, OU titre différent (playlist avance)
    // Pas de restart si : switch de version au sein du même titre (lecture ininterrompue)
    if (samePath && !keepProgress) {
      resetKeyRef.current += 1;  // replay même fichier
    } else if (!sameTrack) {
      resetKeyRef.current += 1;  // nouveau titre → reprend du début
    }
    // Si sameTrack && !samePath → switch de version, pas de bump → lecture continue
    setPlayerState({
      trackTitle, versionName, storagePath, isPlaying: true,
      playlist: playlist || [], currentIdx: currentIdx || 0,
      resetKey: resetKeyRef.current,
    });
  };
  const loadPlayer = (trackTitle, versionName, storagePath) => {
    if (!storagePath) return;
    resetKeyRef.current += 1;
    setPlayerState({
      trackTitle, versionName, storagePath, isPlaying: false,
      playlist: [], currentIdx: 0,
      resetKey: resetKeyRef.current,
    });
  };
  const togglePlay = () => setPlayerState(prev => prev ? { ...prev, isPlaying: !prev.isPlaying } : null);
  const stopPlay = () => setPlayerState(null);
  const playNext = () => {
    if (!playerState?.playlist?.length) return;
    const nextIdx = playerState.currentIdx + 1;
    if (nextIdx >= playerState.playlist.length) {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      return;
    }
    const next = playerState.playlist[nextIdx];
    resetKeyRef.current += 1;
    setPlayerState({
      trackTitle: next.trackTitle, versionName: next.versionName,
      storagePath: next.storagePath,
      isPlaying: true, playlist: playerState.playlist, currentIdx: nextIdx,
      resetKey: resetKeyRef.current,
    });
  };
  const playPrev = () => {
    if (!playerState?.playlist?.length) return;
    const prevIdx = playerState.currentIdx - 1;
    if (prevIdx < 0) return;
    const prev = playerState.playlist[prevIdx];
    resetKeyRef.current += 1;
    setPlayerState({
      trackTitle: prev.trackTitle, versionName: prev.versionName,
      storagePath: prev.storagePath,
      isPlaying: true, playlist: playerState.playlist, currentIdx: prevIdx,
      resetKey: resetKeyRef.current,
    });
  };
  const hasNext = playerState?.playlist?.length > 0 && playerState.currentIdx < playerState.playlist.length - 1;
  const hasPrev = playerState?.playlist?.length > 0 && playerState.currentIdx > 0;

  // ── Background polling for progressive results ──
  const pollingRef = useRef(null);

  // Track saved state to avoid double-saving
  const savedRef = useRef(false);

  const startBackgroundPolling = (jobId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/analyze/status/${jobId}`);
        const job = await res.json();
        if (job.fiche) {
          setAnalysisResult(prev => ({ ...prev, fiche: job.fiche, _stage: job.stage }));
        }
        if (job.listening) {
          setAnalysisResult(prev => ({ ...prev, listening: job.listening, _stage: job.stage }));
        }
        if (job.status === "complete" || job.status === "error") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          // Save completed analysis to localStorage
          if (job.status === "complete" && !savedRef.current) {
            savedRef.current = true;
            setAnalysisResult(prev => {
              const full = { ...prev, fiche: job.fiche || prev?.fiche, listening: job.listening || prev?.listening, storagePath: job.storagePath || prev?.storagePath || null, _stage: "all_done" };
              saveAnalysis(config, full, job.storagePath || prev?.storagePath || null)
                .then(() => refreshProjects())
                .catch(e => console.warn("saveAnalysis failed:", e));
              return full;
            });
          }
        }
      } catch (e) { console.error("bg poll error:", e); }
    }, 3000);
  };

  // Cleanup on unmount
  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  // ── Handlers ──
  const handleAnalyze = (cfg) => {
    // Injecte le projet cible (choisi explicitement dans InputScreen ou déduit du contexte)
    const cfgWithProject = { ...cfg, projectId: cfg.projectId || currentProjectId || null };
    setConfig(cfgWithProject);
    setAnalysisResult(null);
    savedRef.current = false;
    setScreen("loading");
  };
  const handleLoaded = (result) => {
    // Called with partial or complete results — always go to fiche
    const merged = { ...(analysisResult || {}), ...result };
    setAnalysisResult(merged);
    const cfgWithHash = result.audioHash ? { ...config, audioHash: result.audioHash } : config;
    if (result.audioHash) setConfig(cfgWithHash);
    if (screen !== "fiche") {
      setScreen("fiche");
      // Start background polling if not complete yet
      if (result._jobId && result._stage !== "all_done") {
        startBackgroundPolling(result._jobId);
      } else if (result._stage === "all_done" && !savedRef.current) {
        // Analysis completed in one shot — save immediately
        savedRef.current = true;
        saveAnalysis(cfgWithHash, merged, merged.storagePath || null)
          .then(() => refreshProjects())
          .catch(e => console.warn("saveAnalysis failed:", e));
      }
    }
  };
  const goHome = () => {
    setScreen("welcome");
    setConfig(null);
    setAnalysisResult(null);
    setPrefillTitle("");
  };

  // Sidebar handlers
  // Focus uniquement : charge l'audio dans le player et met à jour config/analysisResult,
  // SANS basculer sur l'écran fiche (David: seuls les boutons "Analyse" et "Voir la fiche"
  // ouvrent la fiche d'analyse).
  const handleSidebarSelectVersion = async (track, v) => {
    // Charger l'audio EN PREMIER (avant l'await) pour éviter la coupure
    if (v.storagePath) {
      if (playerState?.isPlaying) {
        play(track.title, v.name, v.storagePath);
      } else {
        loadPlayer(track.title, v.name, v.storagePath);
      }
    }
    const saved = await getAnalysis(track.id, v.id);
    setConfig({ title: track.title, version: v.name, daw: config?.daw || "Logic Pro" });
    setAnalysisResult(saved || v.analysisResult || null);
    // Si on est déjà dans la fiche (Timeline), on y reste. Sinon on ne change pas d'écran.
  };

  // Ouvrir la fiche d'analyse : réservé aux boutons "Analyse" / "Voir la fiche".
  const handleOpenFiche = async (track, v) => {
    if (v?.storagePath) {
      if (playerState?.isPlaying) {
        play(track.title, v.name, v.storagePath);
      } else {
        loadPlayer(track.title, v.name, v.storagePath);
      }
    }
    const saved = v ? await getAnalysis(track.id, v.id) : null;
    setConfig({ title: track.title, version: v?.name, daw: config?.daw || "Logic Pro" });
    setAnalysisResult(saved || v?.analysisResult || null);
    setScreen("fiche");
  };
  const handleSidebarNewTrack = () => {
    setPrefillTitle("");
    setAutoSelectTrackTitle("");
    setAnalysisResult(null);
    setConfig(null);
    setScreen("input");
  };
  const handleAddVersionFromPicker = (track) => {
    // Pré-sélectionne le projet du titre pour que l'upload y atterrisse
    if (track?.projectId) setCurrentProjectId(track.projectId);
    setPrefillTitle(track.title);
    setAutoSelectTrackTitle(track.title);
    setAnalysisResult(null);
    setConfig(null);
    setScreen("input");
  };

  // ── Screen routing ──
  const renderContent = () => {
    switch (screen) {
      case "welcome":
        return (
          <WelcomeHome
            userProfile={userProfile}
            currentProjectId={currentProjectId}
            onSetCurrentProject={setCurrentProjectId}
            onNewTrack={handleSidebarNewTrack}
            onAddVersion={handleAddVersionFromPicker}
            onSelectVersion={handleSidebarSelectVersion}
            onOpenFiche={handleOpenFiche}
            onPlay={play}
            onToggle={togglePlay}
            playerState={playerState}
            projects={projects}
            projectsLoaded={projectsLoaded}
            onMutate={refreshProjects}
          />
        );
      case "input":
        return <InputScreen onAnalyze={handleAnalyze} onAsk={() => setAskOpen(true)} initialTitle={prefillTitle} initialProjectId={currentProjectId} lockProject={!!prefillTitle} onRefreshProjects={refreshProjects} />;
      case "loading":
        return <LoadingScreen config={config} onDone={handleLoaded} onBackToInput={handleSidebarNewTrack} />;
      case "fiche":
        return (
          <FicheScreen
            config={config}
            analysisResult={analysisResult}
            onSelectVersion={handleSidebarSelectVersion}
            onGoHome={goHome}
            refreshKey={projectsRefreshKey}
            onAddVersion={handleAddVersionFromPicker}
          />
        );
      case "versions":
        return (
          <VersionsScreen
            onViewAnalysis={handleOpenFiche}
            onAddVersion={handleAddVersionFromPicker}
            autoSelectTrackTitle={autoSelectTrackTitle}
            onAutoSelectConsumed={() => setAutoSelectTrackTitle("")}
            onPlay={play}
            onStop={stopPlay}
            onToggle={togglePlay}
            playerState={playerState}
          />
        );
      case "reglages":
        return <ReglagesScreen onSignOut={signOut} onGoHome={goHome} onProfileUpdate={setUserProfile} />;
      default:
        return <InputScreen onAnalyze={handleAnalyze} onAsk={() => setAskOpen(true)} initialProjectId={currentProjectId} onRefreshProjects={refreshProjects} />;
    }
  };

  // Auth gate
  if (authLoading) {
    return (
      <>
        <FontLink />
        <GlobalStyles />
        <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:T.black,color:T.muted,fontFamily:T.mono,fontSize:12,letterSpacing:2}}>
          CHARGEMENT...
        </div>
      </>
    );
  }
  if (!user) {
    return (
      <LangContext.Provider value={{ lang, s, setLang }}>
        <FontLink />
        <GlobalStyles />
        <MockupStyles />
        <AuthScreen />
      </LangContext.Provider>
    );
  }

  // On desktop, the sidebar shows the tracks list so we don't need the "versions" screen
  const showSidebar = isDesktop;
  const contentMarginLeft = showSidebar ? SIDEBAR_WIDTH : 0;

  return (
    <LangContext.Provider value={{ lang, s, setLang }}>
      <FontLink />
      <GlobalStyles />
      <MockupStyles />
      {needsOnboarding && (
        <OnboardingModal
          displayName={userProfile?.prenom || null}
          onCreate={handleOnboardingCreate}
        />
      )}
      <div className={showSidebar ? "app" : "dapp"}>
        {/* Desktop Sidebar */}
        {showSidebar && (
          <Sidebar
            currentTrackTitle={config?.title}
            currentVersionName={config?.version}
            currentProjectId={currentProjectId}
            onSetCurrentProject={setCurrentProjectId}
            onSelectVersion={handleSidebarSelectVersion}
            onNewTrack={handleSidebarNewTrack}
            onGoReglages={() => setScreen("reglages")}
            onAskOpen={() => setAskOpen(true)}
            onPlay={play}
            onToggle={togglePlay}
            onMutate={refreshProjects}
            onStop={stopPlay}
            playerState={playerState}
            user={user}
            userProfile={userProfile}
            onSignOut={signOut}
            onGoHome={goHome}
            projects={projects}
            projectsLoaded={projectsLoaded}
          />
        )}

        {/* Main column */}
        <div style={showSidebar ? { display: "flex", flexDirection: "column", minWidth: 0 } : { marginLeft: contentMarginLeft, display: "flex", flexDirection: "column", minHeight: "100vh", transition: "margin-left .2s" }}>
          {/* Mobile top bar with avatar menu */}
          {isMobile && (
            <MobileMenu
              onNavigate={(target) => {
                setAskOpen(false);
                if (target === 'input') setPrefillTitle('');
                setScreen(target);
              }}
              onSignOut={signOut}
              user={user}
              userProfile={userProfile}
            />
          )}

          {/* Ask Modal */}
          {askOpen && <AskModal onClose={() => setAskOpen(false)} />}

          {/* Content */}
          <div ref={scrollContentRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", width: "100%", minHeight: 0, paddingBottom: screen === "welcome" ? 0 : 80 }}>
            {renderContent()}
          </div>

          {/* Bottom Player — masqué sur la home (doublon avec le hero) */}
          {screen !== "welcome" && (
            <BottomPlayer
              trackTitle={playerState?.trackTitle}
              versionName={playerState?.versionName}
              storagePath={playerState?.storagePath}
              isPlaying={!!playerState?.isPlaying}
              onToggle={togglePlay}
              onNext={playNext}
              onPrev={playPrev}
              hasNext={hasNext}
              hasPrev={hasPrev}
              resetKey={playerState?.resetKey || 0}
              idle={!playerState}
              playlist={playerState?.playlist}
              currentIdx={playerState?.currentIdx}
            />
          )}

          {/* BottomNav retiré — remplacé par le hamburger menu */}
        </div>
      </div>
    </LangContext.Provider>
  );
}

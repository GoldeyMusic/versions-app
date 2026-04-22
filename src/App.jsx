import { useState, useEffect, useRef, useCallback } from "react";
import STRINGS, { pick } from "./constants/strings";
import T from "./constants/theme";
import API from "./constants/api";
import { LangContext } from "./hooks/useLang";
import useLang from "./hooks/useLang";
import useMobile from "./hooks/useMobile";
import GlobalStyles from "./components/GlobalStyles";
import MockupStyles from "./components/MockupStyles";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import WaveSurfer from 'wavesurfer.js';
import BottomPlayer, { resolveAudio, VolumeControl } from "./components/BottomPlayer";
import AskModal from "./components/AskModal";
import Sidebar from "./components/Sidebar";
import LoadingScreen from "./screens/LoadingScreen";
import IntentionScreen from "./screens/IntentionScreen";
import FicheScreen from "./screens/FicheScreen";
import VersionsScreen from "./screens/VersionsScreen";

import { saveAnalysis, getAnalysis, loadProjects, createProject, renameProject, deleteProject, renameTrack, deleteTrack, moveTrackToProject, reorderTracksInProject, setProjectCoverImage, clearProjectCoverImage, setTrackCoverImage, clearTrackCoverImage, updateTrackIntent, updateVersionIntent } from "./lib/storage";
import { assignProjectColors, PROJECT_COLOR_COUNT } from "./lib/projectColors";
import { resizeImageFile } from "./lib/image";
import { supabase } from "./lib/supabase";
import { useAuth } from "./hooks/useAuth";
import AuthScreen from "./screens/AuthScreen";
import PublicFicheScreen from "./screens/PublicFicheScreen";
import ReglagesModal from "./components/ReglagesModal";
import RenameModal from "./components/RenameModal";
import OnboardingModal from "./components/OnboardingModal";
import AddModal from "./components/AddModal";
import { confirmDialog } from "./lib/confirm.jsx";

/* ── Font loader ────────────────────────────────────────── */
const FontLink = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&display=swap');`}</style>
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

/* ── EN translations of the same pools. Kept parallel to FR so the picker
   logic can select the pool matching the active language. ─────────── */
const SAVIEZ_VOUS_TIPS_EN = [
  "Taking regular breaks keeps your listening attentive and objective.",
  "Your ears fatigue after 45 min — a 10 min break saves you 2h of work.",
  "Listening to your mix in another context (car, headphones) reveals what the studio hides.",
  "Lowering the monitoring volume helps you spot balance imbalances.",
  "Stepping away from a mix for 24h completely changes your perception.",
  "Regularly comparing with a reference recalibrates your ear and your choices.",
  "Silence between sessions matters as much as the work itself.",
  "Listening at low volume is the best test: if the mix works quiet, it will work loud.",
  "The low end is easier to judge standing than sitting — you feel the sub better.",
  "Your first mix draft often contains a truth you lose when over-polishing.",
  "A mix that holds in mono almost always holds in stereo.",
  "The best compression is often the one you don't hear.",
  "Pro engineers switch speakers every 30 minutes to avoid getting used to a single color.",
  "The brain averages what it hears: after 20 minutes on a passage, you stop noticing flaws.",
  "Ear fatigue first hits the highs — that's why we tend to add top end late at night.",
  "Listening to your mix while walking reveals things a seated studio hides.",
  "A good mix should work on a phone placed on a table — that's the ultimate test.",
  "Stereo correlation tells you whether your mix collapses when summed to mono.",
  "Perceived dynamics depend on context: -10 LUFS can sound loud on streaming and weak on vinyl.",
  "A master that's too loud masks mistakes — when you turn down, they reappear.",
  "The brain loves novelty: listening to a reference before your mix makes it feel fresh again.",
  "Closed headphones exaggerate the low end, open ones exaggerate the highs. Cross-check both.",
  "The first 200 ms of a sound define its perceived impact — that's where you need to be precise.",
  "Your decisions are better in the morning — the brain is less biased by cognitive fatigue.",
  "Drinking water regularly actually improves hearing clarity.",
  "A room's acoustics shift with temperature: a heated room doesn't respond like a cold one.",
  "Pros listen on cheap speakers to catch what holds up despite them.",
  "Absolute silence doesn't exist in a studio: your noise floor is part of what you hear.",
  "A consistent monitoring level from session to session saves you from re-mixing the same things.",
  "Moving your head while listening naturally corrects your room's colorations.",
  "The kick and the lead vocal often share the same energy band: their balance makes the mix.",
];

const PROCHAIN_PAS_TIPS_EN = [
  { title: "Listen at low volume", body: "Monitoring quietly reveals balance imbalances. If the mix works quiet, it will work loud." },
  { title: "Change environments", body: "Listen in the car or on headphones: flaws invisible in the studio become obvious elsewhere." },
  { title: "Take a 24h break", body: "Come back to your mix after 24 hours — a fresh ear tells you more than 2 hours of continuous work." },
  { title: "Compare with a reference", body: "Grab a track you love, level-match it, and toggle. You'll see what's missing or too much." },
  { title: "Work in mono", body: "Flip your mix to mono to catch phase cancellations and check low-end solidity." },
  { title: "Print then forget", body: "Export, close the session, listen elsewhere later. You'll hear it like a listener." },
  { title: "Check the dynamics", body: "Look at your crest factor: too flat, the mix fatigues; too dynamic, it struggles to come through." },
  { title: "Listen in the car", body: "Car cabins reveal lingering basses and aggressive mids. A real tell-tale." },
  { title: "Solo kick + bass", body: "Solo kick and bass: their core relationship defines your mix's groove and foundation." },
  { title: "The phone test", body: "Grab your phone, set it on the table, play the mix. Most honest audience-side test." },
  { title: "Cut the low end", body: "High-pass your master at 150 Hz: what remains tells you if mids and highs hold on their own." },
  { title: "Close your eyes", body: "Listen for a minute with eyes closed, no DAW visual. You'll hear what your eyes were hiding from your ears." },
  { title: "Walk while listening", body: "Play the mix quietly and walk around — balance issues jump out." },
  { title: "Back-to-back compare", body: "Follow your mix with a commercial track. The quality 'jump' tells you exactly where to work." },
  { title: "Listen tomorrow morning", body: "Close the session, sleep on it, listen at breakfast without touching anything. Your real opinion appears there." },
  { title: "Aim for the middle", body: "Look for what works everywhere (car, headphones, speakers), not what only shines in your studio." },
  { title: "Mute the lead vocal", body: "Listen without the lead: if the instrumental doesn't hold, you were masking a problem behind the voice." },
  { title: "Re-compress your music", body: "Make a 160 kbps MP3 of your bounce and listen. Two-thirds of listeners will hear it that way." },
  { title: "Test at realistic volume", body: "Set monitoring to conversation level. If it works there, it works everywhere." },
];

const PROGRESSION_TIPS_NO_SCORE_EN = [
  "As soon as you have two versions of a track, VERSIONS compares the mixes and highlights what has changed.",
  "Import a first bounce: frequency and dynamics analysis happens in under a minute.",
  "Each track added sharpens your ear and gives you a reference for the next ones.",
  "Start by analyzing a track you know well — you'll validate the analysis against your own perception.",
  "First upload your raw V1: it serves as a reference point to see the evolution.",
  "One report per track is enough to reveal the strengths and gaps of your mix.",
  "Analyze a well-mastered track first: you'll confront your feelings with objective measurements.",
  "You can import a commercial reference — it becomes your benchmark for your own bounces.",
  "Three tracks is already enough for trends to emerge in your mix choices.",
  "Your first analyses teach you the most: each report gives you a new reference point.",
];

const PROGRESSION_TIPS_WITH_SCORE_EN = [
  "Keep comparing your versions to refine evaluation. Each analysis sharpens how you read your mix.",
  "A score doesn't judge your mix — it points out what could be improved.",
  "The score evolves with your choices: frequency balance, dynamics, stereo clarity.",
  "Watch trends rather than absolute values: two versions 5 points apart is already meaningful.",
  "If the score drops between versions, it might be the signal to go back.",
  "Add a comment to each version: you'll see which moves actually shift the score.",
  "A stable score across three versions means you're going in circles — change your angle of attack.",
  "Compare two versions side-by-side rather than judging them separately: the gap speaks louder.",
  "The score is just a reference — the detailed report tells you why.",
  "If a heavily reworked version scores lower than the previous one, trust yourself and go back.",
];

const A_QUOI_CA_SERT_TIPS_EN = [
  { title: "Analyze like a pro", body: "Each track you import goes through an objective analysis — frequency balance, dynamics, stereo, saturation — then through a detailed AI listen. You get a clear report showing what works and what doesn't." },
  { title: "Readable metrics", body: "VERSIONS translates technical measurements (LUFS, crest factor, stereo correlation) into understandable comments. No need to be a sound engineer to know what to adjust." },
  { title: "A reliable second opinion", body: "The AI listen comments on your mix section by section and points out where your ears may have fatigued. An outside perspective, available anytime." },
  { title: "A clear report", body: "Each analysis delivers a structured report: strengths, points to rework, levels, dynamics. No interpretation, just reference points." },
  { title: "Spot ear fatigue", body: "VERSIONS listens with the same freshness at any hour. It detects what your ears overcompensate for after several hours of work." },
  { title: "Break the V2/V3 loop", body: "When torn between two versions, comparative analysis decides objectively: you know which holds up better, and why." },
  { title: "An auditory logbook", body: "Every analysis is archived and dated. You can look back, see a track's evolution, and spot when a mix started to drift." },
  { title: "An ego-less perspective", body: "VERSIONS has no interest in flattering your mix or tearing it apart. It tells you what is, with the right words." },
  { title: "Prepare for mastering", body: "Before sending your mix to mastering, VERSIONS flags what to clean up. You arrive at the studio with a clean mix." },
  { title: "Save hours of listening", body: "A 2-minute analysis replaces dozens of trips between speakers, headphones, and car. You target what's wrong, fast." },
];

const POURQUOI_VERSIONS_TIPS_EN = [
  { title: "Compare your mixes", body: "Upload multiple versions of the same track: VERSIONS highlights what has progressed, what has regressed, and where to rework." },
  { title: "See progress", body: "Each version is dated and scored. At a glance, you see if V3 is actually better than V2 — or if you should go back." },
  { title: "Undo misleading intuition", body: "Sometimes you think a mix is improving when it's losing clarity. VERSIONS objectifies this feeling and gives you stable reference points." },
  { title: "Keep the history", body: "Your versions stay organized by project and dated. No more hunting for 'the last good one' in a folder." },
  { title: "A pocket studio", body: "The perspective of a sound engineer, available anytime, no appointment, no studio cost, no waiting for feedback." },
  { title: "Break home-studio loneliness", body: "Mixing alone, you lose the outside eye. VERSIONS fills that role — a tangible, backed opinion that renews your listening." },
  { title: "Confirm your choices", body: "Sometimes you know what's off but can't decide. VERSIONS confirms (or disproves) your intuition with data to back it up." },
  { title: "Learn while mixing", body: "Each report is also a lesson: you learn to name what you hear and recognize the patterns of a good mix." },
  { title: "Stop doubting at 3 AM", body: "Late at night, your ears lie. VERSIONS gives you a stable reference point when fatigue blurs your decisions." },
  { title: "Escape sterile perfectionism", body: "VERSIONS tells you when a mix is good — to break the endless cycle of adjustments and finally close it." },
];

const HOME_TAGLINES_EN = [
  "The studio [assistant] that follows your mixes.",
  "The best [version] of your mix starts here.",
  "An outside [opinion], available anytime.",
  "Your ear, but [rested].",
  "The [fresh] take your mix is waiting for.",
  "Hours of [distance], in seconds.",
  "An [attentive] listen, free of judgment.",
  "A studio's [patience], a click's speed.",
  "So your choices no longer rest on [fatigue].",
  "A second opinion, as [fair] as a night's sleep.",
  "Your versions, read [cold].",
  "The assistant that never gets [tired] of your mix.",
  "Because the best mix is the one that's been [compared].",
  "Your [copilot] when you're unsure you're moving forward.",
  "The [reference] point your session is missing.",
  "To escape the V2, V3, V4 [loop] without ever deciding.",
  "A [professional] listen, without renting a studio.",
  "Listen [better], not longer.",
  "The second [wind] of your mix.",
  "Every version deserves a [fresh] listen.",
  "The distance the [late] hour takes from you.",
  "When your ears saturate, the analysis stays [fresh].",
  "[Move forward] on your mix without going in circles.",
  "Your [silent] studio, at any hour.",
  "The ear you've lost by the end of the [session].",
  "A perspective that doesn't [judge], that illuminates.",
  "The [clarity] missing when you've listened too long.",
  "The [sparring partner] for your mix.",
  "What your [tired] ear no longer tells you.",
  "The [stable] listen your session was missing.",
  "[Breathe] — VERSIONS listens for you.",
  "When doubt sets in, VERSIONS [decides].",
  "Because mixing alone isn't mixing [blindly].",
  "Less [doubt], more decisions.",
  "Your [witness ear], always fresh.",
  "An [outside] eye that never sleeps.",
  "Leave the tunnel where [V7] sounds like V3.",
  "[Deciding] shouldn't take three evenings anymore.",
  "The [objectivity] that fatigue takes from you.",
  "Real [distance], not 2 AM distance.",
  "A [safety] net before mastering.",
  "The [calm] of a listen with no ego.",
  "To move forward without [circling] the mix.",
  "Your mix deserves a [fresh] listen — every time.",
  "A [pro] listen without a pro's calendar.",
  "One more ear, [patient] and precise.",
  "Your [compass] when you've lost north.",
  "[Finish] a mix, at last.",
];

const CONSEIL_TIPS_EN = [
  { title: "Start simple", body: "No need for a commercial master — even a quick bounce from Logic or Ableton works for a first pass. You can also test on a reference you love to calibrate your ear." },
  { title: "Three versions are enough", body: "You don't need 10 versions to see progress. A V1 (raw), V2 (reworked), V3 (near-final mix) is enough to read the evolution." },
  { title: "Label each version", body: "Add a short comment on each upload: 'comp pass', 'cleaner EQ', 'low cut on keys'. It ties the score to the choices you make." },
  { title: "Test the reference", body: "Drop a commercial track you love into VERSIONS and look at its profile. It gives you a realistic benchmark for your own mixes." },
  { title: "Analyze cold", body: "Upload a version and read the report the next day. The comments will jump out with a rested ear." },
  { title: "One track per project at first", body: "Don't upload your whole catalog. Take one track, work it until you understand the report, then expand." },
  { title: "Mix then pause then report", body: "Finish your session, export, go walk 30 minutes, then read the report. Your brain will be more open to critique." },
  { title: "Don't fix everything at once", body: "If the report flags five points, pick one or two for the next version. Fixing everything at once blurs the read." },
  { title: "Keep the raw V1", body: "Never throw away your initial bounce. It's your zero, your reference. Without it, you won't know if you've really progressed." },
  { title: "Import your old mixes too", body: "Uploading a mix from six months ago shows what your ear has gained since. Valuable for calibrating your standards." },
  { title: "Read the report in order", body: "Start with strengths, then points to rework, then technical measurements. That way you keep a balanced read of the mix." },
  { title: "Print your key reports", body: "For important tracks, export or save a PDF of the report. You'll come back to it before mastering to validate final moves." },
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
function HeroWaveform({ storagePath, isActive, resetKey = 0, onFinish }) {
  const containerRef = useRef(null);
  const wsRef = useRef(null);
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const lastPathRef = useRef(null);
  // Ref miroir pour lire l'état le plus récent d'isActive depuis l'async loader
  // (évite de devoir re-déclencher l'effet à chaque toggle play/pause)
  const isActiveRef = useRef(isActive);
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  // Ref miroir pour onFinish : permet d'attacher un seul listener 'ended' par
  // audio sans devoir re-binder quand la prop change.
  const onFinishRef = useRef(onFinish);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  // Charge audio + WaveSurfer. Sur changement de storagePath OU resetKey
  // (relance du même titre), on remet currentTime=0 et on lance si actif.
  // Sur la home, le BottomPlayer est masqué : c'est ici qu'on pilote le play().
  useEffect(() => {
    if (!storagePath || !containerRef.current) return;

    let cancelled = false;
    let endedCleanup = null;
    (async () => {
      try {
        const audio = await resolveAudio(storagePath);
        if (cancelled || !containerRef.current) return;

        const samePath = lastPathRef.current === storagePath;
        const prev = audioRef.current;
        if (prev && prev !== audio) {
          try { prev.pause(); } catch { /* noop */ }
        }

        // Toujours reset au début quand la clé change (nouveau titre ou replay)
        try { audio.currentTime = 0; } catch { /* noop */ }

        if (!samePath || !wsRef.current) {
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
        }
        audioRef.current = audio;
        lastPathRef.current = storagePath;

        // Écoute la fin du titre pour enchaîner la playlist sur la home
        // (le BottomPlayer est masqué ici, donc son propre handler 'finish'
        // ne tire pas — on pilote l'auto-advance depuis le hero).
        const handleEnded = () => {
          const cb = onFinishRef.current;
          if (typeof cb === 'function') cb();
        };
        audio.addEventListener('ended', handleEnded);
        endedCleanup = () => {
          try { audio.removeEventListener('ended', handleEnded); } catch { /* noop */ }
        };

        // Si on doit être en lecture (heroIsPlaying), on lance maintenant
        if (isActiveRef.current) {
          try { await audio.play(); } catch { /* autoplay bloqué, user-gesture requis */ }
        }
      } catch (err) {
        console.warn('[hero wave] load error:', err?.message || err);
      }
    })();

    return () => {
      cancelled = true;
      if (endedCleanup) endedCleanup();
    };
  }, [storagePath, resetKey]);

  // Sync isActive → play/pause sur l'audio actif (toggle sans reload)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isActive && audio.paused) {
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(() => { /* noop */ });
    } else if (!isActive && !audio.paused) {
      try { audio.pause(); } catch { /* noop */ }
    }
  }, [isActive]);

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

function WelcomeHome({ userProfile, currentProjectId, onSetCurrentProject, onNewTrack, onAddVersion, onAnalyze, onSelectVersion, onOpenFiche, onPlay, onToggle, onNext, playerState, projects = [], projectsLoaded = false, onMutate, addModalOpen, setAddModalOpen, addModalCtx = null, setAddModalCtx }) {
  const { lang, s } = useLang();
  const pool = (fr, en) => (lang === 'en' ? en : fr);
  // Rotation des conseils : un tip distinct à chaque ouverture, sans répétition consécutive
  const [tip] = useState(() => pickTip(pool(SAVIEZ_VOUS_TIPS, SAVIEZ_VOUS_TIPS_EN), 'versions_tip_saviez'));
  const [prochainPasTip] = useState(() => pickTip(pool(PROCHAIN_PAS_TIPS, PROCHAIN_PAS_TIPS_EN), 'versions_tip_prochain'));
  const [aQuoiTip] = useState(() => pickTip(pool(A_QUOI_CA_SERT_TIPS, A_QUOI_CA_SERT_TIPS_EN), 'versions_tip_aquoi'));
  const [pourquoiTip] = useState(() => pickTip(pool(POURQUOI_VERSIONS_TIPS, POURQUOI_VERSIONS_TIPS_EN), 'versions_tip_pourquoi'));
  const [conseilTip] = useState(() => pickTip(pool(CONSEIL_TIPS, CONSEIL_TIPS_EN), 'versions_tip_conseil'));
  const [progressionNoScoreTip] = useState(() => pickTip(pool(PROGRESSION_TIPS_NO_SCORE, PROGRESSION_TIPS_NO_SCORE_EN), 'versions_tip_progression_noscore'));
  const [progressionWithScoreTip] = useState(() => pickTip(pool(PROGRESSION_TIPS_WITH_SCORE, PROGRESSION_TIPS_WITH_SCORE_EN), 'versions_tip_progression_score'));
  const [homeTagline] = useState(() => pickTip(pool(HOME_TAGLINES, HOME_TAGLINES_EN), 'versions_tip_tagline'));
  // Menu 3-points ouvert pour un projet donné (null = aucun)
  const [openProjectMenuId, setOpenProjectMenuId] = useState(null);
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

  // Ferme le menu 3-points au clic extérieur / Escape
  useEffect(() => {
    if (!openProjectMenuId) return;
    const onDown = (e) => {
      if (!e.target.closest?.('.wh-acc-menu, .wh-acc-menu-btn')) setOpenProjectMenuId(null);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setOpenProjectMenuId(null); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [openProjectMenuId]);

  // Liste à plat de tous les titres (pour le picker "À quel titre ?")
  const allTracks = projects.flatMap((p) => (p.tracks || []).map((t) => ({ ...t, _projectName: p.name, projectId: p.id })));

  // Map projectId → index de couleur. Garantit l'unicité tant que
  // le nombre de projets ≤ PROJECT_COLOR_COUNT. Recalculée à chaque render,
  // mais basée uniquement sur createdAt ⇒ stable quand on réordonne.
  const projectColorMap = assignProjectColors(projects);

  const displayName = userProfile?.prenom || null;

  // ── Helpers ──
  // Score moyen du projet : moyenne des scores globaux des dernières versions
  // de chaque titre. Retourne null si aucune analyse disponible.
  const projectScore = (project) => {
    const scores = (project.tracks || [])
      .map((t) => t.versions?.[t.versions.length - 1]?.analysisResult?.fiche?.globalScore)
      .filter((x) => typeof x === 'number');
    if (!scores.length) return null;
    return Math.round(scores.reduce((sum, x) => sum + x, 0) / scores.length);
  };
  // Classe CSS de couleur du score : mint (>=80), amber (60-79), red (<60).
  const scoreClass = (score) => {
    if (score == null) return 'dash';
    if (score >= 80) return 'good';
    if (score >= 60) return 'mid';
    return 'low';
  };
  // Date la plus récente d'une activité du projet (dernière version créée).
  const projectLastActivityMs = (project) =>
    Math.max(0, ...(project.tracks || []).map(trackLastDateMs));
  const metaLine = (project) => {
    const nTracks = project.tracks?.length || 0;
    const tLabel = `${nTracks} ${nTracks > 1 ? s.home.trackPlural : s.home.trackSingular}`;
    const ms = projectLastActivityMs(project);
    const when = ms ? s.home.lastAnalysis.replace('{when}', formatRelative(ms)) : s.home.noAnalysisYet;
    return `${tLabel} · ${when}`;
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
        title: s.home.impossible,
        message: s.home.lastProjectMsg,
        confirmLabel: s.home.ok,
        cancelLabel: null,
      });
      return;
    }
    const nTracks = (project.tracks || []).length;
    const trackWord = nTracks > 1 ? s.home.trackPlural : s.home.trackSingular;
    const msg = nTracks === 0
      ? s.home.deleteProjectMsgEmpty.replace('{name}', project.name)
      : s.home.deleteProjectMsgWithTracks
          .replace('{name}', project.name)
          .replace('{n}', String(nTracks))
          .replace('{trackWord}', trackWord);
    const ok = await confirmDialog({
      title: s.home.deleteProjectTitle,
      message: msg,
      confirmLabel: s.home.delete,
      cancelLabel: s.home.cancel,
      danger: true,
    });
    if (ok !== 'confirm') return;
    try {
      const res = await deleteProject(project.id);
      if (res?.ok === false && res?.reason === 'last-project') {
        await confirmDialog({
          title: s.home.impossible,
          message: s.home.lastProjectMsgShort,
          confirmLabel: s.home.ok,
          cancelLabel: null,
        });
        return;
      }
      if (onMutate) onMutate();
    } catch (err) { console.warn('deleteProject failed', err); }
  };

  // Changer l'image de cover du projet (file input caché, déclenché via menu)
  const coverFileInputRef = useRef(null);
  const [coverUploadTarget, setCoverUploadTarget] = useState(null);
  const handleChangeCoverStart = (project) => {
    setCoverUploadTarget(project);
    // on relance systématiquement la value pour autoriser le re-upload du même fichier
    if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    coverFileInputRef.current?.click();
  };
  const handleCoverFileChange = async (e) => {
    const file = e.target.files?.[0];
    const target = coverUploadTarget;
    e.target.value = '';
    if (!file || !target) { setCoverUploadTarget(null); return; }
    try {
      // Redimensionnement automatique client-side (max 1200px, JPEG/WebP ~85%).
      // Pas de message de taille : on adapte silencieusement.
      const resized = await resizeImageFile(file).catch(() => file);
      await setProjectCoverImage(target.id, resized || file);
      if (onMutate) onMutate();
    } catch (err) { console.warn('setProjectCoverImage failed', err); }
    setCoverUploadTarget(null);
  };
  const handleClearCover = async (project) => {
    try {
      await clearProjectCoverImage(project.id);
      if (onMutate) onMutate();
    } catch (err) { console.warn('clearProjectCoverImage failed', err); }
  };

  // ─── Image d'illustration par titre (track) ────────────────────────
  // Même pattern que le projet : un file input caché + target courante.
  // Propagé vers WhTrackRow via onChangeCover / onClearCover.
  const trackCoverFileInputRef = useRef(null);
  const [trackCoverUploadTarget, setTrackCoverUploadTarget] = useState(null);
  const handleChangeTrackCoverStart = (track) => {
    setTrackCoverUploadTarget(track);
    if (trackCoverFileInputRef.current) trackCoverFileInputRef.current.value = '';
    trackCoverFileInputRef.current?.click();
  };
  const handleTrackCoverFileChange = async (e) => {
    const file = e.target.files?.[0];
    const target = trackCoverUploadTarget;
    e.target.value = '';
    if (!file || !target) { setTrackCoverUploadTarget(null); return; }
    try {
      const resized = await resizeImageFile(file).catch(() => file);
      await setTrackCoverImage(target.id, resized || file);
      if (onMutate) onMutate();
    } catch (err) { console.warn('setTrackCoverImage failed', err); }
    setTrackCoverUploadTarget(null);
  };
  const handleClearTrackCover = async (track) => {
    try {
      await clearTrackCoverImage(track.id);
      if (onMutate) onMutate();
    } catch (err) { console.warn('clearTrackCoverImage failed', err); }
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
    const versionWord = n > 1 ? s.home.versionPlural : s.home.versionSingular;
    const ok = await confirmDialog({
      title: s.home.deleteTrackTitle,
      message: s.home.deleteTrackMsg
        .replace('{name}', track.title)
        .replace('{n}', String(n))
        .replace('{versionWord}', versionWord),
      confirmLabel: s.home.delete,
      cancelLabel: s.home.cancel,
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

  // Dernier titre analysé : track dont la dernière version a une fiche,
  // avec la date la plus récente (priorité à v.date puis v.createdAt).
  // Sert la carte "Dernier titre analysé" du bloc utilisateur (colonne droite).
  const lastAnalyzedInfo = (() => {
    let best = null;
    for (const t of allTracks) {
      const last = t.versions?.[t.versions.length - 1];
      const fiche = last?.analysisResult?.fiche;
      if (!fiche) continue;
      const ts = new Date(last?.date || last?.createdAt || 0).getTime();
      if (!best || ts > best.ts) best = { track: t, version: last, fiche, ts };
    }
    return best;
  })();

  // Date de la dernière activité (version la plus récente toutes confondues)
  const lastActivityMs = Math.max(0, ...allTracks.map(trackLastDateMs));
  const formatRelative = (ms) => {
    if (!ms) return s.home.relativeDash;
    // Label informatif "il y a X" — l'impureté de Date.now() est tolérée ici
    // car la valeur n'influence pas l'arbre (pas de condition de rendu).
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - ms;
    const day = 86400000;
    if (diff < day) return s.home.relativeToday;
    if (diff < 2 * day) return s.home.relativeYesterday;
    if (diff < 7 * day) return s.home.relativeDaysAgo.replace('{n}', String(Math.floor(diff / day)));
    if (diff < 30 * day) return s.home.relativeWeeksAgo.replace('{n}', String(Math.floor(diff / (7 * day))));
    return s.home.relativeMonthsAgo.replace('{n}', String(Math.floor(diff / (30 * day))));
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
      <button
        className="wh-action wh-action-primary"
        onClick={() => setAddModalOpen(true)}
      >
        <span className="wh-action-icon">+</span>
        <span>{s.home.add}</span>
      </button>
    </div>
  );

  const projectsAccordion = totalProjects > 0 ? (
    <div className="wh-tracklist">
      <div className="wh-projects">
        {/* Titre "Mes projets" à l'intérieur du cadre (v4-panel-head) */}
        <div className="wh-section-title wh-projects-title">{s.home.myProjects} <em>{s.home.myProjectsAccent}</em></div>
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
              className={`wh-acc-item wh-tint-${gradIdx}${isOpen ? ' open' : ''}${openProjectMenuId === project.id ? ' menu-open' : ''}`}
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
                <div
                  className={`wh-acc-cover wh-gradient-${gradIdx}${project.coverImageUrl ? ' has-image' : ''}`}
                  style={project.coverImageUrl ? {
                    backgroundImage: `url("${project.coverImageUrl}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  } : undefined}
                >
                  {/* Play projet — apparaît au hover de la vignette, centré dessus */}
                  <button
                    className={`wh-acc-play${isProjectPlaying ? ' playing' : ''}`}
                    onClick={(e) => handlePlayProject(e, project)}
                    title={isProjectPlaying ? s.home.playing : s.home.heroPlayProject}
                  >
                    {isProjectPlaying ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z"/></svg>
                    )}
                  </button>
                </div>

                <div className="wh-acc-title">
                  <div className="wh-acc-kicker">{s.home.projectKicker}</div>
                  <div className="wh-acc-name">{project.name}</div>
                  <div className="wh-acc-meta">{metaLine(project)}</div>
                </div>

                {/* Score projet — moyenne des dernières versions de chaque titre.
                    Classe good/mid/low pour colorer selon les seuils 80/60. */}
                {(() => {
                  const pScore = projectScore(project);
                  return (
                    <div className={`wh-acc-score ${scoreClass(pScore)}`}>
                      {pScore != null ? pScore : s.home.relativeDash}
                    </div>
                  );
                })()}

                {/* Menu 3-points en haut à droite de la carte projet */}
                <button
                  className="wh-acc-menu-btn"
                  aria-label={s.home.projectOptions}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenProjectMenuId((cur) => (cur === project.id ? null : project.id));
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <circle cx="8" cy="3" r="1.5" />
                    <circle cx="8" cy="8" r="1.5" />
                    <circle cx="8" cy="13" r="1.5" />
                  </svg>
                </button>
                {openProjectMenuId === project.id && (
                  <div className="wh-acc-menu" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="wh-acc-menu-item"
                      onClick={() => { setOpenProjectMenuId(null); handleRenameProjectStart(project); }}
                    >{s.home.rename}</button>
                    <button
                      className="wh-acc-menu-item"
                      onClick={() => { setOpenProjectMenuId(null); handleChangeCoverStart(project); }}
                    >{project.coverImageUrl ? s.home.replaceImage : s.home.changeImage}</button>
                    {project.coverImageUrl && (
                      <button
                        className="wh-acc-menu-item"
                        onClick={() => { setOpenProjectMenuId(null); handleClearCover(project); }}
                      >{s.home.removeImage}</button>
                    )}
                    <div className="wh-acc-menu-sep" />
                    <button
                      className="wh-acc-menu-item danger"
                      onClick={() => { setOpenProjectMenuId(null); handleDeleteProject(project); }}
                    >{s.home.delete}</button>
                  </div>
                )}
              </div>

              {/* Body : liste des titres */}
              <div className="wh-acc-body">
                {nTracks > 0 ? (
                  <div className="wh-acc-tracklist">
                    {project.tracks.map((track, i, arr) => (
                      <WhTrackRow
                        key={track.id}
                        track={track}
                        project={project}
                        playerState={playerState}
                        onPlay={() => handlePlayTrack(track, project)}
                        onViewFiche={() => handleViewFiche(track)}
                        onRename={() => handleRenameTrackStart(track)}
                        onDelete={() => handleDeleteTrack(track)}
                        onChangeCover={() => handleChangeTrackCoverStart(track)}
                        onClearCover={() => handleClearTrackCover(track)}
                        drag={drag}
                        setDrag={setDrag}
                        onDropTrackOnTrack={handleDropTrackOnTrack}
                        prevTrackId={arr[i - 1]?.id ?? null}
                        nextTrackId={arr[i + 1]?.id ?? null}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="wh-acc-empty">{s.home.emptyProject}</div>
                )}
                <button
                  className="wh-acc-add-track"
                  onClick={() => handleAddTrackToProject(project)}
                >{s.home.newTrackInProject}</button>
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
      <div>{s.home.emptyProjectsMobile}</div>
    </div>
  ) : null;

  const modalsSlot = (
    <>
      {/* File input caché — déclenché via le menu "Changer l'image" (projet) */}
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleCoverFileChange}
      />
      {/* File input caché — déclenché via le menu "Changer l'image" (titre) */}
      <input
        ref={trackCoverFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleTrackCoverFileChange}
      />
      {renameTrackTarget && (
        <RenameModal
          title={s.home.renameTrackTitle}
          placeholder={s.home.trackNamePlaceholder}
          value={renameValue}
          originalValue={renameTrackTarget.title}
          inputRef={renameInputRef}
          onChange={setRenameValue}
          onCancel={() => setRenameTrackTarget(null)}
          onSubmit={submitRenameTrack}
          confirmLabel={s.home.confirmRename}
        />
      )}
      {renameProjectTarget && (
        <RenameModal
          title={s.home.renameProjectTitle}
          placeholder={s.home.projectNamePlaceholder}
          value={renameValue}
          originalValue={renameProjectTarget.name}
          inputRef={renameInputRef}
          onChange={setRenameValue}
          onCancel={() => setRenameProjectTarget(null)}
          onSubmit={submitRenameProject}
          confirmLabel={s.home.confirmRename}
        />
      )}
      {newProjectOpen && (
        <RenameModal
          title={s.home.newProject}
          placeholder={s.home.projectNamePlaceholder}
          value={newProjectValue}
          originalValue=""
          inputRef={newProjectInputRef}
          onChange={setNewProjectValue}
          onCancel={() => setNewProjectOpen(false)}
          onSubmit={submitNewProject}
          confirmLabel={s.home.confirmCreate}
        />
      )}
      {addModalOpen && (
        <AddModal
          onClose={() => { setAddModalOpen(false); if (setAddModalCtx) setAddModalCtx(null); }}
          projects={projects}
          allTracks={allTracks}
          initialContext={addModalCtx}
          defaultDaw={userProfile?.default_daw || ''}
          onCreateProject={async (name) => {
            // Création inline depuis l'étape 'new-project-name'.
            // On retourne le projet créé pour que la modale puisse enchaîner sur l'upload si besoin.
            try {
              const created = await createProject(name);
              if (onMutate) onMutate();
              if (created?.id && onSetCurrentProject) onSetCurrentProject(created.id);
              return created;
            } catch (err) {
              console.warn('createProject from AddModal failed', err);
              throw err;
            }
          }}
          onAnalyze={(cfg) => {
            // Appelé depuis l'étape 'upload' quand l'utilisateur clique sur Lancer l'analyse.
            // La modale se ferme elle-même, on route vers l'écran de chargement ici.
            if (cfg.projectId && onSetCurrentProject) onSetCurrentProject(cfg.projectId);
            onAnalyze?.(cfg);
          }}
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
      <div
        className={`wh-hero-cover tint-${heroInfo.gradIdx}${heroInfo.project?.coverImageUrl ? ' has-image' : ''}`}
        style={heroInfo.project?.coverImageUrl ? {
          backgroundImage: `url("${heroInfo.project.coverImageUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <button
          className="wh-hero-play"
          onClick={() => handlePlayTrack(heroInfo.track, heroInfo.project)}
          title={heroIsPlaying ? s.home.heroPlaying : s.home.heroListen}
          aria-label={heroIsPlaying ? s.home.heroPause : s.home.heroPlayTrack}
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
          <div className="wh-hero-kicker">{s.home.heroResume}</div>
          <div className="wh-hero-title">{heroInfo.track.title}</div>
          <div className="wh-hero-meta">
            {heroInfo.project.name} · {heroInfo.track.versions?.length || 0} {(heroInfo.track.versions?.length || 0) > 1 ? s.home.versionPlural : s.home.versionSingular}
            {heroLatestVersion?.date ? ` · ${heroLatestVersion.date}` : ''}
          </div>
        </div>
        {heroWaveStoragePath ? (
          <div className="wh-hero-wave-row">
            <HeroWaveform
              storagePath={heroWaveStoragePath}
              isActive={heroIsPlaying}
              resetKey={playerState?.resetKey || 0}
              onFinish={onNext}
            />
            <VolumeControl idle={!heroWaveStoragePath} />
          </div>
        ) : (
          <div className="wh-hero-wave wh-hero-wave-empty" aria-hidden />
        )}
        <div className="wh-hero-bottom">
          {typeof heroScore === 'number' ? (
            <div className="wh-hero-score">
              <span className="num">
                {Math.round(heroScore)}
                <span className="num-suffix">/100</span>
              </span>
              <span className="lbl">{s.home.heroScoreLabel}</span>
            </div>
          ) : <div />}
          <div className="wh-hero-ctas">
            <button className="wh-btn wh-btn-primary" onClick={() => handleViewFiche(heroInfo.track)}>
              {s.home.viewFiche}
            </button>
            <button className="wh-btn" onClick={() => { if (onAddVersion) onAddVersion(heroInfo.track); }}>
              {s.home.newVersionShort}
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
        <div className="wh-stat-label">{s.home.statsTracks}</div>
        <div className="wh-stat-value">{nTitres}</div>
        <div className="wh-stat-hint">{totalProjects} {totalProjects > 1 ? s.home.projectPlural : s.home.projectSingular}</div>
      </div>
      <div className="wh-stat">
        <div className="wh-stat-label">{s.home.statsVersions}</div>
        <div className="wh-stat-value">{nVersions}</div>
        <div className="wh-stat-hint">{formatRelative(lastActivityMs)}</div>
      </div>
      <div className="wh-stat">
        <div className="wh-stat-label">{s.home.statsAvgScore}</div>
        <div className="wh-stat-value">{avgScore != null ? avgScore : s.home.relativeDash}</div>
        <div className="wh-stat-hint">
          {allScores.length
            ? `${s.home.statsOn} ${allScores.length} ${allScores.length > 1 ? s.home.analysisPlural : s.home.analysisSingular}`
            : s.home.statsNoAnalysis}
        </div>
      </div>
      <div className="wh-stat">
        <div className="wh-stat-label">{s.home.statsProgress}</div>
        <div className="wh-stat-spark">
          {sparkPath ? (
            <svg width="100%" height="38" viewBox="0 0 120 24" preserveAspectRatio="none" aria-hidden>
              <path d={sparkPath} fill="none" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 8, letterSpacing: 0.5 }}>
              {s.home.statsEmptyCurve}
            </div>
          )}
        </div>
        <div className="wh-stat-hint">
          {sparkScores.length >= 2 ? s.home.statsRecentAnalyses.replace('{n}', String(sparkScores.length)) : s.home.statsCurveBuilding}
        </div>
      </div>
    </div>
  );

  /* ─── Colonne droite : 2 blocs distincts ────────────────────────────
     Bloc 1 « Toi »            : cartes centrées utilisateur (progression,
                                  prochain pas, dernier titre analysé).
     Bloc 2 « Le saviez-vous » : cartes pédagogiques (tip rotatif,
                                  à quoi ça sert, pourquoi VERSIONS, conseil).
  */
  const userBlock = (
    <section className="wh-rcol-section">
      <div className="wh-rcol-title">
        <span className="wh-rcol-dot" />
        {s.home.rightSectionYou}
      </div>
      <div className="wh-rcol-cards">
        <div className="wh-card cerulean">
          <div className="wh-card-kicker">{s.home.cardYourProgress}</div>
          <div className="wh-card-title">
            {avgScore != null ? s.home.cardAvgScore.replace('{n}', String(avgScore)) : s.home.cardLaunchFirst}
          </div>
          <div className="wh-card-body">
            {avgScore != null ? progressionWithScoreTip : progressionNoScoreTip}
          </div>
        </div>
        <div className="wh-card mint">
          <div className="wh-card-kicker">{s.home.cardNextStep}</div>
          <div className="wh-card-title">{prochainPasTip?.title}</div>
          <div className="wh-card-body">{prochainPasTip?.body}</div>
        </div>
        <div className="wh-card amber">
          <div className="wh-card-kicker">{s.home.cardLastAnalyzed}</div>
          {lastAnalyzedInfo ? (
            <>
              <button
                type="button"
                className="wh-card-title wh-card-title-link"
                onClick={() => handleViewFiche(lastAnalyzedInfo.track)}
                title={s.home.trackAnalysis}
              >
                {lastAnalyzedInfo.track.title}
              </button>
              <div className="wh-card-body">
                {typeof lastAnalyzedInfo.fiche.globalScore === 'number'
                  ? `${lastAnalyzedInfo.fiche.globalScore}/100 · ${formatRelative(lastAnalyzedInfo.ts)}`
                  : formatRelative(lastAnalyzedInfo.ts)}
              </div>
            </>
          ) : (
            <div className="wh-card-body">{s.home.cardLastAnalyzedEmpty}</div>
          )}
        </div>
      </div>
    </section>
  );

  const knowBlock = (
    <section className="wh-rcol-section">
      <div className="wh-rcol-title">
        <span className="wh-rcol-dot wh-rcol-dot-violet" />
        {s.home.rightSectionKnow}
      </div>
      <div className="wh-rcol-cards">
        <div className="wh-card violet">
          <div className="wh-card-kicker">{s.home.cardWhyUseful}</div>
          <div className="wh-card-title">{aQuoiTip?.title}</div>
          <div className="wh-card-body">{aQuoiTip?.body}</div>
        </div>
        <div className="wh-card amber">
          <div className="wh-card-kicker">{s.home.cardWhyVersions}</div>
          <div className="wh-card-title">{pourquoiTip?.title}</div>
          <div className="wh-card-body">{pourquoiTip?.body}</div>
        </div>
        <div className="wh-card mint">
          <div className="wh-card-kicker">{s.home.cardAdvice}</div>
          <div className="wh-card-title">{conseilTip?.title}</div>
          <div className="wh-card-body">{conseilTip?.body}</div>
        </div>
      </div>
    </section>
  );

  // Compat : les noms `tipsBlock` / `pedagoBlock` restent utilisés ailleurs
  // (écran onboarding, mobile). On les réexporte vers les nouveaux blocs.
  const tipsBlock = userBlock;
  const pedagoBlock = knowBlock;
  const editorialSidebar = (
    <div className="wh-col-right">
      {userBlock}
      {knowBlock}
    </div>
  );

  /* ─── Desktop-only : hero d'onboarding (compte neuf) ──── */
  const onboardingChecks = [
    { label: s.home.checkCreateProject, done: totalProjects > 0 },
    { label: s.home.checkFirstTrack, done: allTracks.length > 0 },
    { label: s.home.checkCompare, done: nVersions > 1 },
    { label: s.home.checkExploreChat, done: false },
  ];
  const doneCount = onboardingChecks.filter((c) => c.done).length;
  const onboardingProgress = Math.round((doneCount / onboardingChecks.length) * 100);

  const desktopOnboarding = (
    <div className="wh-onboarding">
      <div>
        <div className="wh-ob-welcome">
          {displayName ? s.home.welcomeHiName.replace('{name}', displayName) : s.home.welcomeHi}
        </div>
        <div className="wh-ob-tagline">
          {s.home.onboardingTagline}
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
          >{s.home.firstTrack}</button>
          <button className="wh-btn" onClick={handleNewProject}>{s.home.newProject}</button>
        </div>
      </div>
      <div className="wh-ob-checklist">
        <div className="wh-card-kicker">{s.home.gettingStarted}</div>
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
      {/* Bouton Ajouter desktop : déplacé dans la sidebar (sous la liste
          des projets) pour rester accessible quel que soit l'écran. */}

      {/* Header — même tagline desktop/mobile, avec mot en orange.
          En desktop, masquée ici et réinsérée sous les stats. */}
      <div className="wh-tagline-hero">
        <div className="wh-tagline-text">« {renderTagline(homeTagline)} »</div>
      </div>

      {isMobile ? (
        <>
          {actionsBar}
          {projectsAccordion}
          {mobileEmpty}
          {/* Tips masqués jusqu'à ce que les projets soient connus — évite
              l'affichage tips-avant-projets quand il n'y a pas encore de cache */}
          {projectsLoaded && tipsBlock}
          {projectsLoaded && pedagoBlock}
        </>
      ) : hasContent ? (
        <>
          {/* Bloc intro desktop v2 — eyebrow violet, slogan fixe en 88px,
              tagline rotative en petit italique. Remplace l'ancien desktopHero. */}
          <div className="wh-intro">
            <div className="wh-eyebrow">
              {nTitres === 1
                ? s.home.heroEyebrowActiveSingle.replace('{name}', displayName || '')
                : s.home.heroEyebrowActive.replace('{name}', displayName || '').replace('{n}', String(nTitres))}
            </div>
            <div className="wh-intro-row">
              <h1 className="wh-slogan">
                <span className="wh-slogan-line">{s.home.sloganStart}<em>{s.home.sloganEm}</em>,</span><br />{s.home.sloganEnd.replace(/^,\s*/, '')}
              </h1>
              <div className="wh-tagline-text">{renderTagline(homeTagline)}</div>
            </div>
          </div>
          {desktopStats}
          <div className="wh-cols">
            <div className="wh-col-left">{projectsAccordion}</div>
            <div className="wh-col-right">
              {userBlock}
              {knowBlock}
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
function WhTrackRow({ track, project, playerState, onPlay, onViewFiche, onRename, onDelete, onChangeCover, onClearCover, drag, setDrag, onDropTrackOnTrack, prevTrackId = null, nextTrackId = null }) {
  const { s } = useLang();
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
      className={`wh-track-row${menuOpen ? ' menu-open' : ''}`}
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
        // Pas de trait de dépôt si la position visée correspond à la
        // position actuelle du titre déplacé (déplacement nul).
        if (drag.sourceProjectId === project?.id) {
          if (isAbove && drag.nextTrackId === track.id) { setDropOver(null); return; }
          if (!isAbove && drag.prevTrackId === track.id) { setDropOver(null); return; }
        }
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
          if (setDrag) setDrag({ type: 'track', trackId: track.id, sourceProjectId: project?.id, prevTrackId, nextTrackId });
        }}
        onDragEnd={() => { if (setDrag) setDrag(null); setDropOver(null); }}
        title={s.home.trackDragHandle}
        aria-label={s.home.trackMove}
        style={{ opacity: hover ? 0.55 : 0 }}
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
          <circle cx="3" cy="3" r="1.1"/><circle cx="7" cy="3" r="1.1"/>
          <circle cx="3" cy="7" r="1.1"/><circle cx="7" cy="7" r="1.1"/>
          <circle cx="3" cy="11" r="1.1"/><circle cx="7" cy="11" r="1.1"/>
        </svg>
      </span>

      {/* Play + cover fusionnés : image en fond si définie, sinon icône note ♪ */}
      <button
        className={`wh-track-play${isThisPlaying ? ' playing' : ''}${track.coverImageUrl ? ' has-image' : ''}`}
        onClick={(e) => { e.stopPropagation(); onPlay?.(e); }}
        title={isThisPlaying ? s.home.playing : s.home.play}
        style={track.coverImageUrl ? {
          backgroundImage: `url("${track.coverImageUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        } : undefined}
      >
        {/* Icône note de musique (fallback quand pas d'image) */}
        {!track.coverImageUrl && (
          <span className="wh-track-note" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M11 1.5v7.2a2.3 2.3 0 1 1-1.2-2V3.8L5.2 5v5.7a2.3 2.3 0 1 1-1.2-2V3.8z"/>
            </svg>
          </span>
        )}
        {/* Overlay : triangle play (ou carrés pause) par-dessus l'image au survol */}
        <span className="wh-track-play-overlay">
          {isThisPlaying ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z"/></svg>
          )}
        </span>
      </button>

      {/* Info */}
      <div className="wh-track-info">
        <div className="wh-track-title">{track.title}</div>
        <div className="wh-track-meta">
          {durStr && <>{durStr} · </>}
          {track.versions?.length || 1} {(track.versions?.length || 1) > 1 ? s.home.versionPlural : s.home.versionSingular}
        </div>
      </div>

      {/* Date */}
      {dateStr && <span className="wh-track-date">{dateStr}</span>}

      {/* Chip "ANALYSE" — pilule cerulean, label uniquement (pas d'icône). */}
      {hasFiche && (
        <button className="wh-track-fiche" onClick={(e) => { e.stopPropagation(); onViewFiche?.(e); }}>
          {s.home.trackAnalysis}
        </button>
      )}

      {/* Menu ⋯ */}
      {showDots && (
        <button
          ref={btnRef}
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
          title={s.home.trackOptions}
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
          <WhMenuItem label={s.home.rename} onClick={() => { setMenuOpen(false); onRename(); }} />
          {onChangeCover && (
            <WhMenuItem
              label={track.coverImageUrl ? s.home.trackReplaceImage : s.home.trackChangeImage}
              onClick={() => { setMenuOpen(false); onChangeCover(); }}
            />
          )}
          {onClearCover && track.coverImageUrl && (
            <WhMenuItem
              label={s.home.trackRemoveImage}
              onClick={() => { setMenuOpen(false); onClearCover(); }}
            />
          )}
          <div style={{ height: 1, background: '#2a2a2e', margin: '4px 2px' }} />
          <WhMenuItem label={s.home.delete} danger onClick={() => { setMenuOpen(false); onDelete(); }} />
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
        fontFamily: "'DM Sans', sans-serif", fontSize: 16,
        color: danger ? '#ef6b6b' : '#c5c5c7',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? 'rgba(239,107,107,.08)' : 'rgba(245,176,86,.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >{label}</button>
  );
}

const SIDEBAR_WIDTH = 260;

/* ── Mobile Avatar Menu ────────────────────────────────── */
function MobileMenu({ onNavigate, onSignOut, user, userProfile, onAdd }) {
  const [open, setOpen] = useState(false);
  const go = (target) => { setOpen(false); onNavigate(target); };
  const avatarUrl = userProfile?.avatar_url || null;
  const displayName = userProfile?.prenom || (user?.email ? user.email.split('@')[0] : 'utilisateur');
  const initial = (userProfile?.prenom || user?.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <>
      {/* ── Top bar ── */}
      <div className="mobile-topbar">
        <div className="brand" onClick={() => go('welcome')} style={{ cursor: 'pointer', fontSize: 20, letterSpacing: '-0.3px', gap: 8 }}>
          <img src="/logo-versions.svg" alt="" style={{ height: 22, width: 'auto' }} />
          <span>{"VER"}<span className="accent">{"Si"}</span>{"ONS"}</span>
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
                {onAdd && (
                  <button
                    className="mobile-avatar-popover-item mobile-avatar-popover-add"
                    onClick={() => { setOpen(false); onAdd(); }}
                  >
                    <span className="mobile-menu-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </span>
                    Ajouter
                  </button>
                )}
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
  loading: '#/analyse',
  fiche: '#/fiche',
  versions: '#/versions',
};
const HASH_SCREEN = {
  '': 'welcome',
  '#/': 'welcome',
  '#/analyse': 'loading',
  '#/fiche': 'fiche',
  '#/versions': 'versions',
};

/* ═══════════════════════════════════════════════════════════ */
/* APP                                                        */
/* ═══════════════════════════════════════════════════════════ */
// Extrait un éventuel token de partage (#/p/<token>) de l'URL courante.
// Retourne null si on n'est pas sur une route publique.
function extractPublicToken() {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash || '';
  const m = h.match(/^#\/p\/([A-Za-z0-9_-]+)$/);
  return m ? m[1] : null;
}

export default function VersionsApp() {
  // ── Route publique lien partagé : court-circuite tout (auth, sidebar, etc.)
  // pour que les destinataires du lien n'aient jamais besoin d'un compte.
  const [publicToken, setPublicToken] = useState(() => extractPublicToken());
  useEffect(() => {
    const onPop = () => setPublicToken(extractPublicToken());
    window.addEventListener('hashchange', onPop);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('hashchange', onPop);
      window.removeEventListener('popstate', onPop);
    };
  }, []);
  if (publicToken) {
    return <PublicFicheScreen token={publicToken} />;
  }

  return <VersionsAppAuthed />;
}

function VersionsAppAuthed() {
  const { user, loading: authLoading, signOut } = useAuth();
  const isMobile = useMobile();
  const isDesktop = !isMobile;
  // On desktop, default = "welcome" (neutral empty state); on mobile, old default = "input"
  const [screen, setScreen] = useState("welcome");
  const [homeAddOpen, setHomeAddOpen] = useState(false);
  // Contexte transmis à AddModal pour ouvrir directement dans un flow
  // précis (ex. "Nouveau titre" depuis la hero, "Ajouter version" depuis
  // le menu d'une version). Null = modale ouverte sur le menu racine.
  const [addModalCtx, setAddModalCtx] = useState(null);
  // États app-level pour la modale AddModal + prompt "Nouveau projet"
  // utilisés quand l'utilisateur clique sur "+ AJOUTER" dans la sidebar
  // depuis un écran autre que la Home (WelcomeHome a sa propre copie).
  const [newProjectOpenApp, setNewProjectOpenApp] = useState(false);
  const [newProjectValueApp, setNewProjectValueApp] = useState('');
  const newProjectInputRefApp = useRef(null);
  const pendingNewTrackRefApp = useRef(false);
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

  // Le BottomPlayer est maintenant toujours rendu (sticky bas de page),
  // y compris sur la home — donc plus besoin de retirer la réserve de 68px :
  // on la garde partout pour que rien ne passe sous la barre du player.

  // ── Halo ambient — 3 calques qui crossfade au fil de la session ──
  // On insère un conteneur `.ambient-halo` en premier enfant du body,
  // avec 3 calques `.ambient-layer` à l'intérieur. Chaque calque a une
  // variante différente (5 positions/couleurs préréglées dans
  // MockupStyles) — le CSS les fait crossfader sur ~90s avec des
  // offsets, donc la teinte/position dominante évolue lentement tout
  // au long de la session. Le fade-in global se fait via `.loaded`
  // ajoutée au next frame, pour éviter un flash dès le mount.
  useEffect(() => {
    const halo = document.createElement('div');
    halo.className = 'ambient-halo';
    halo.setAttribute('aria-hidden', 'true');
    // 3 variantes distinctes pour éviter les doublons — on shuffle
    // l'ordre [0..4] et on prend les 3 premières.
    const variants = [0, 1, 2, 3, 4]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    variants.forEach((v) => {
      const layer = document.createElement('div');
      layer.className = 'ambient-layer';
      layer.setAttribute('data-variant', String(v));
      halo.appendChild(layer);
    });
    document.body.insertBefore(halo, document.body.firstChild);
    const raf = requestAnimationFrame(() => halo.classList.add('loaded'));
    return () => {
      cancelAnimationFrame(raf);
      halo.remove();
    };
  }, []);
  const [config, setConfig] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  // Contexte de l'écran intention : { jobId, perception, inheritedIntent, audioHash } ou null.
  // Posé par handleAwaitingIntent quand le backend bascule en 'awaiting_intent'.
  const [intentCtx, setIntentCtx] = useState(null);
  const [askOpen, setAskOpen] = useState(false);
  // Les réglages s'ouvrent en modale (plus de page dédiée)
  const [reglagesOpen, setReglagesOpen] = useState(false);
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

  // ── Logout : reset de la route + forçage retour Home ──────
  // Après un signOut, on veut que le prochain login arrive toujours sur la
  // Home, même si la dernière page visitée avant déconnexion était une fiche
  // (#/fiche). Sans ça, routeInitRef reste à true et le hash reste sur
  // #/fiche → au relogin, on voit soit la fiche figée, soit welcome avec un
  // hash incohérent. On neutralise tout ici pour repartir propre.
  useEffect(() => {
    if (user) return;
    routeInitRef.current = false;
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash !== '#/') {
      window.history.replaceState({ screen: 'welcome' }, '', '#/');
    }
    if (screen !== 'welcome') {
      isHashSyncRef.current = true;
      setScreen('welcome');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Hash routing : lecture initiale de l'URL ─────────────
  // Quand l'utilisateur est connecté, on aligne l'écran sur le hash courant.
  // Les écrans qui dépendent d'un state en mémoire (loading, fiche) retombent
  // sur welcome si on y arrive directement (refresh, lien entrant).
  useEffect(() => {
    if (!user || routeInitRef.current) return;
    routeInitRef.current = true;
    const current = window.location.hash || '#/';
    // Compat : #/reglages ouvre désormais la modale et renvoie sur #/
    if (current === '#/reglages') {
      setReglagesOpen(true);
      window.history.replaceState({ screen: 'welcome' }, '', '#/');
      if (screen !== 'welcome') {
        isHashSyncRef.current = true;
        setScreen('welcome');
      }
      return;
    }
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
    // Auth pas encore stabilisée : on garde le state initialisé depuis le cache
    // localStorage sans le réinitialiser à []. Sans ce guard, le !user ci-dessous
    // s'exécute avec user=null pendant le chargement auth et efface le cache →
    // tips visibles un instant avant que les projets réapparaissent (layout shift).
    if (authLoading) return;
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
  }, [user, projectsRefreshKey, authLoading]);

  const handleOnboardingCreate = async (name) => {
    const created = await createProject(name);
    if (!created?.id) throw new Error(s.errors.projectCreate);
    setCurrentProjectId(created.id);
    setNeedsOnboarding(false);
    refreshProjects();
  };

  // ── Language ──
  // Priorité de chargement : localStorage > profile.langue Supabase > navigator.language > 'fr'
  // L'init est SYNCHRONE pour éviter un flash FR→EN au démarrage.
  const detectInitialLang = () => {
    try {
      const stored = localStorage.getItem("versions_lang");
      if (stored === "fr" || stored === "en") return stored;
    } catch {}
    // Fallback : langue du navigateur (ex. "en-US" → "en")
    try {
      const nav = (typeof navigator !== "undefined" && (navigator.language || navigator.userLanguage)) || "";
      if (nav.toLowerCase().startsWith("en")) return "en";
    } catch {}
    return "fr";
  };
  const [lang, setLangState] = useState(detectInitialLang);

  // Sync côté Supabase : quand le profil se charge, si une préférence serveur existe
  // et diffère du cache local, on l'adopte (l'utilisateur a pu changer sur un autre appareil).
  useEffect(() => {
    if (!userProfile) return;
    const serverLang = userProfile.langue;
    if ((serverLang === "fr" || serverLang === "en") && serverLang !== lang) {
      setLangState(serverLang);
      try { localStorage.setItem("versions_lang", serverLang); } catch {}
    }
  }, [userProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const setLang = useCallback((l) => {
    if (l !== "fr" && l !== "en") return;
    setLangState(l);
    try { localStorage.setItem("versions_lang", l); } catch {}
    // Persiste côté serveur si l'utilisateur est connecté (silent — on n'attend pas)
    if (user?.id) {
      supabase.from("profiles")
        .upsert({ id: user.id, langue: l, updated_at: new Date().toISOString() })
        .then(() => {})
        .catch((e) => console.warn("save langue:", e));
    }
    // Met à jour le state local de userProfile pour rester cohérent
    setUserProfile((prev) => prev ? { ...prev, langue: l } : prev);
  }, [user]);

  const s = STRINGS[lang];
  const t = useCallback((path, vars) => pick(lang, path, vars), [lang]);

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
              saveAnalysis(config, full, job.storagePath || prev?.storagePath || null, lang)
                .then((ids) => {
                  // Persiste l'intention au scope choisi (track/version)
                  const intent = full?.intent_used || config?._pendingIntent || null;
                  const scope = full?._intent_scope || config?._pendingIntentScope || 'track';
                  if (intent && ids) {
                    if (scope === 'version' && ids.versionId) updateVersionIntent(ids.versionId, intent);
                    else if (ids.trackId) updateTrackIntent(ids.trackId, intent);
                  }
                  return refreshProjects();
                })
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
    // Injecte le projet cible (choisi explicitement dans AddModal ou déduit du contexte)
    const cfgWithProject = { ...cfg, projectId: cfg.projectId || currentProjectId || null };
    setConfig(cfgWithProject);
    setAnalysisResult(null);
    savedRef.current = false;
    setScreen("loading");
  };
  const handleLoaded = (result) => {
    console.log("📥 VERSIONS handleLoaded called", { stage: result?._stage, jobId: result?._jobId, hasFiche: !!result?.fiche, currentScreen: screen });
    // Called with partial or complete results — always go to fiche
    // On injecte le scope choisi à l'écran IntentionScreen pour que
    // IntentPanel puisse afficher « appliquée à ce titre / cette version ».
    const injectedScope = config?._pendingIntentScope || null;
    const merged = {
      ...(analysisResult || {}),
      ...result,
      ...(injectedScope ? { _intent_scope: injectedScope } : {}),
    };
    setAnalysisResult(merged);
    const cfgWithHash = result.audioHash ? { ...config, audioHash: result.audioHash } : config;
    if (result.audioHash) setConfig(cfgWithHash);
    if (screen !== "fiche") {
      console.log("➡️ VERSIONS setScreen('fiche') triggered from handleLoaded");
      setScreen("fiche");
      // Start background polling if not complete yet
      if (result._jobId && result._stage !== "all_done") {
        startBackgroundPolling(result._jobId);
      } else if (result._stage === "all_done" && !savedRef.current) {
        // Analysis completed in one shot — save immediately
        savedRef.current = true;
        saveAnalysis(cfgWithHash, merged, merged.storagePath || null, lang)
          .then((ids) => {
            // Persiste l'intention utilisée au scope choisi
            const intent = merged?.intent_used || cfgWithHash?._pendingIntent || null;
            const scope = merged?._intent_scope || cfgWithHash?._pendingIntentScope || 'track';
            if (intent && ids) {
              if (scope === 'version' && ids.versionId) updateVersionIntent(ids.versionId, intent);
              else if (ids.trackId) updateTrackIntent(ids.trackId, intent);
            }
            return refreshProjects();
          })
          .catch(e => console.warn("saveAnalysis failed:", e));
      }
    }
  };
  const goHome = () => {
    setScreen("welcome");
    setConfig(null);
    setAnalysisResult(null);
    setPrefillTitle("");
    setIntentCtx(null);
  };

  // ── Handlers intention artistique ──
  // Appelé par LoadingScreen quand le backend passe en 'awaiting_intent'.
  // On stocke le contexte (jobId, perception, intention héritée) et on
  // bascule sur l'écran intention.
  const handleAwaitingIntent = (ctx) => {
    setIntentCtx(ctx);
    setScreen("intention");
  };

  // L'artiste a saisi une intention + choisi son scope (track/version).
  // 1) POST /api/analyze/diagnose/:jobId avec l'intention → relance le job
  // 2) On revient sur LoadingScreen en mode "inlineIntent" (ne repassera
  //    plus par awaiting_intent, donc le pipeline enchaîne naturellement)
  // 3) Le write Supabase (updateTrackIntent / updateVersionIntent) se fait
  //    au retour de l'analyse, dans handleLoaded, via intent_used.
  const handleIntentSubmit = async (intent, scope) => {
    if (!intentCtx?.jobId) return;
    try {
      await fetch(`${API}/api/analyze/diagnose/${intentCtx.jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, scope }),
      });
    } catch (e) {
      console.warn("[intent] diagnose POST failed:", e.message);
    }
    // Mémorise le scope choisi pour le write post-analyse.
    // resumeJobId = signal à LoadingScreen : NE PAS redémarrer un nouveau job,
    // juste poller le job existant que le backend vient de reprendre avec
    // l'intention reçue.
    setConfig((c) => ({
      ...(c || {}),
      _pendingIntent: intent,
      _pendingIntentScope: scope,
      resumeJobId: intentCtx.jobId,
    }));
    setIntentCtx(null);
    setScreen("loading");
  };

  const handleIntentSkip = async () => {
    if (!intentCtx?.jobId) return;
    try {
      await fetch(`${API}/api/analyze/diagnose/${intentCtx.jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skipIntent: true }),
      });
    } catch (e) {
      console.warn("[intent] skip POST failed:", e.message);
    }
    // Même logique : on reprend le même job côté backend.
    setConfig((c) => ({ ...(c || {}), resumeJobId: intentCtx.jobId }));
    setIntentCtx(null);
    setScreen("loading");
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
    // Ouvre la modale d'ajout dans le flow "Nouveau titre".
    // AddModal se charge de la suite (pick-project / upload selon le
    // nombre de projets). Plus d'écran isolé /nouveau.
    setPrefillTitle("");
    setAutoSelectTrackTitle("");
    setAnalysisResult(null);
    setConfig(null);
    setAddModalCtx({ mode: 'new-track' });
    setHomeAddOpen(true);
  };
  const handleAddVersionFromPicker = (track) => {
    // Pré-sélectionne le projet du titre pour que l'upload y atterrisse.
    // On ouvre la modale directement à l'étape upload, titre verrouillé.
    if (track?.projectId) setCurrentProjectId(track.projectId);
    setPrefillTitle(track.title);
    setAutoSelectTrackTitle(track.title);
    setAnalysisResult(null);
    setConfig(null);
    setAddModalCtx({ mode: 'add-version', trackId: track?.id });
    setHomeAddOpen(true);
  };

  // Handlers app-level pour AddModal — miroir de ceux définis
  // localement dans WelcomeHome (utilisés hors de l'écran Home).
  const handleNewProjectApp = () => {
    setNewProjectValueApp('');
    setNewProjectOpenApp(true);
    setTimeout(() => newProjectInputRefApp.current?.focus(), 50);
  };
  const submitNewProjectApp = async () => {
    const name = newProjectValueApp.trim();
    if (!name) return;
    try {
      const created = await createProject(name);
      setNewProjectOpenApp(false);
      setNewProjectValueApp('');
      refreshProjects();
      if (created?.id) setCurrentProjectId(created.id);
      if (pendingNewTrackRefApp.current) {
        pendingNewTrackRefApp.current = false;
        handleSidebarNewTrack();
      }
    } catch (err) { console.warn('createProject failed', err); }
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
            onAnalyze={handleAnalyze}
            onSelectVersion={handleSidebarSelectVersion}
            onOpenFiche={handleOpenFiche}
            onPlay={play}
            onToggle={togglePlay}
            onNext={playNext}
            playerState={playerState}
            projects={projects}
            projectsLoaded={projectsLoaded}
            onMutate={refreshProjects}
            addModalOpen={homeAddOpen}
            setAddModalOpen={setHomeAddOpen}
            addModalCtx={addModalCtx}
            setAddModalCtx={setAddModalCtx}
          />
        );
      case "loading":
        return (
          <LoadingScreen
            config={config}
            onDone={handleLoaded}
            onAwaitingIntent={handleAwaitingIntent}
            onBackToInput={handleSidebarNewTrack}
          />
        );
      case "intention": {
        // Un titre est "V1" s'il n'existe pas encore dans les projets
        // (ou si c'est sa toute première version). Utilisé par
        // IntentionScreen pour choisir le layout (colonne vs compact).
        const title = (config?.title || "").trim().toLowerCase();
        const allTracks = (projects || []).flatMap((p) => p.tracks || []);
        const existing = title ? allTracks.find((t) => (t.title || "").trim().toLowerCase() === title) : null;
        const isFirstVersion = !existing || !(existing.versions?.length);
        return (
          <IntentionScreen
            perception={intentCtx?.perception || null}
            config={config}
            isFirstVersion={isFirstVersion}
            inheritedIntent={intentCtx?.inheritedIntent || null}
            onSubmit={handleIntentSubmit}
            onSkip={handleIntentSkip}
          />
        );
      }
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
      default:
        // Fallback si screen invalide : on retombe sur la home
        // (plus de page /nouveau dédiée : tout passe par la modale Add).
        return (
          <WelcomeHome
            userProfile={userProfile}
            currentProjectId={currentProjectId}
            onSetCurrentProject={setCurrentProjectId}
            onNewTrack={handleSidebarNewTrack}
            onAddVersion={handleAddVersionFromPicker}
            onAnalyze={handleAnalyze}
            onSelectVersion={handleSidebarSelectVersion}
            onOpenFiche={handleOpenFiche}
            onPlay={play}
            onToggle={togglePlay}
            onNext={playNext}
            playerState={playerState}
            projects={projects}
            projectsLoaded={projectsLoaded}
            onMutate={refreshProjects}
            addModalOpen={homeAddOpen}
            setAddModalOpen={setHomeAddOpen}
            addModalCtx={addModalCtx}
            setAddModalCtx={setAddModalCtx}
          />
        );
    }
  };

  // Auth gate
  if (authLoading) {
    return (
      <>
        <FontLink />
        <GlobalStyles />
        <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:T.black,color:T.muted,fontFamily:T.mono,fontSize:14,letterSpacing:2}}>
          CHARGEMENT...
        </div>
      </>
    );
  }
  if (!user) {
    return (
      <LangContext.Provider value={{ lang, s, setLang, t }}>
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
    <LangContext.Provider value={{ lang, s, setLang, t }}>
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
            onGoReglages={() => setReglagesOpen(true)}
            onAskOpen={() => setAskOpen(true)}
            onAdd={() => setHomeAddOpen(true)}
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
                // Réglages → modale, pas d'écran dédié
                if (target === 'reglages') { setReglagesOpen(true); return; }
                setScreen(target);
              }}
              onSignOut={signOut}
              user={user}
              userProfile={userProfile}
              onAdd={() => setHomeAddOpen(true)}
            />
          )}

          {/* Ask Modal */}
          {askOpen && <AskModal onClose={() => setAskOpen(false)} />}

          {/* Réglages — modale globale, ouvrable depuis sidebar desktop
              ou menu avatar mobile */}
          <ReglagesModal
            open={reglagesOpen}
            onClose={() => setReglagesOpen(false)}
            onSignOut={signOut}
            onProfileUpdate={setUserProfile}
          />

          {/* AddModal accessible depuis la sidebar sur n'importe quel
              écran autre que la Home (la Home garde ses propres instances
              pour ne pas casser ses flux internes). */}
          {screen !== "welcome" && newProjectOpenApp && (
            <RenameModal
              title={s.home.newProject}
              placeholder={s.home.projectNamePlaceholder}
              value={newProjectValueApp}
              originalValue=""
              inputRef={newProjectInputRefApp}
              onChange={setNewProjectValueApp}
              onCancel={() => setNewProjectOpenApp(false)}
              onSubmit={submitNewProjectApp}
              confirmLabel={s.home.confirmCreate}
            />
          )}
          {screen !== "welcome" && homeAddOpen && (
            <AddModal
              onClose={() => { setHomeAddOpen(false); setAddModalCtx(null); }}
              projects={projects}
              allTracks={projects.flatMap((p) => (p.tracks || []).map((t) => ({ ...t, _projectName: p.name, projectId: p.id })))}
              initialContext={addModalCtx}
              defaultDaw={userProfile?.default_daw || ''}
              onCreateProject={async (name) => {
                try {
                  const created = await createProject(name);
                  refreshProjects();
                  if (created?.id) setCurrentProjectId(created.id);
                  return created;
                } catch (err) {
                  console.warn('createProject from AddModal (app) failed', err);
                  throw err;
                }
              }}
              onAnalyze={(cfg) => {
                if (cfg.projectId) setCurrentProjectId(cfg.projectId);
                handleAnalyze(cfg);
              }}
            />
          )}

          {/* Content */}
          <div ref={scrollContentRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", width: "100%", minHeight: 0, paddingBottom: 80 }}>
            {renderContent()}
          </div>

          {/* Bottom Player — toujours présent (sticky), y compris sur la home.
              État "idle" quand aucune piste n'est lancée : transport grisé,
              waveform placeholder, meta vide. */}
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

          {/* BottomNav retiré — remplacé par le hamburger menu */}
        </div>
      </div>
    </LangContext.Provider>
  );
}

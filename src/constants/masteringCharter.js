// ─── Charte mastering — cibles LUFS / true peak / mono par destination
//
// Ce contenu est injecté comme PREMIER message assistant dans le chat
// d'une fiche d'analyse, quand le chat est encore vide. C'est le pendant
// "savoir mastering" de Versions : on n'a pas de section mastering
// dédiée dans la fiche (ce n'est pas notre cœur de métier, on parle
// surtout du mix), mais on donne les normes à viser pour chaque
// destination, et l'utilisateur peut continuer la conversation s'il
// veut creuser un point précis.
//
// Format : markdown léger compatible avec le rendu actuel du chat
// (messages affichés en pre-line via la regle CSS du <div className="msg">).
// On garde des sauts de ligne explicites, des en-têtes en **gras**, des
// puces en "•" pour rester lisible même si markdown n'est pas parsé.
//
// Orientation : chaque section donne d'abord la cible théorique, puis
// **un conseil pratique concret** ("voilà ce que tu fais réellement"),
// puis le pourquoi en court. L'utilisateur ne veut pas de la théorie
// pure — il veut savoir à combien il masterise s'il sort sur toutes
// les plateformes en même temps. Réponse : un master à −14 LUFS / −1
// dBTP couvre 90% des cas (cf. section "Et concrètement..." en bas).

const FR = `**Petit guide des cibles mastering — par destination**

Avant tout : la vraie question, c'est "tu sors ton track *où* ?". La réponse change tout. Pour chaque destination ci-dessous : la cible théorique, puis **ce que tu fais concrètement**.

**1. Streaming — Spotify, Apple Music, Deezer, Tidal, YouTube Music**
• Cible : **−14 LUFS intégré / −1 dBTP**
• **Concrètement** : un seul master à **−14 LUFS / −1 dBTP** suffit pour TOUTES les plateformes streaming. Pas besoin de master Apple-spécifique ou Deezer-spécifique — Spotify/Tidal/YouTube sortent ton track tel quel, Apple ne baisse que de ~1-2 dB (imperceptible), Deezer pareil.
• Ne descends PAS à −16 "pour faire plaisir à Apple" : tu seras juste plus faible que tes voisins sur Spotify/Tidal sans bénéfice audible sur Apple.
• Genres dynamiques (jazz, classique, folk, ambient) → tu peux livrer plus dynamique (−16 à −18 LUFS), ça respire mieux.
• Genres compressés (trap, hyperpop, hard techno, drill) → −10 à −12 LUFS reste OK, Spotify va réduire ton volume (~−2 dB) mais tu colles à l'esthétique du genre.
• Pourquoi : les plateformes normalisent automatiquement. Pousser à −9 LUFS ne te rend pas plus fort — elles *baissent* ton volume et tu perds en dynamique. Tu finis plus faible que ton voisin qui a livré propre.

**2. Réseaux sociaux — TikTok, Instagram Reels, YouTube Shorts**
• Cible : **−14 à −10 LUFS / −1 dBTP**
• **Concrètement** : ton master streaming (−14 LUFS) marche très bien sur TikTok / Reels. Ne fais PAS un master spécifique sauf si les RS sont *vraiment* ton canal principal.
• Si TikTok est ton terrain (hook viral, snippet 15-30s pour danse) → tu peux pousser à **−10 / −11 LUFS** : les algos sociaux récompensent les masters qui "claquent" dès la 1ère seconde, et le compresseur des plateformes mobiles est plus permissif.
• Mono compatibility CRITIQUE : ~80% des écoutes se font au speaker du téléphone, en mono. Test ton mix en mono — si une nappe ou un effet stéréo disparaît, retravaille le mix avant de masteriser.
• Pas de "moments calmes" sur les 2 premières secondes d'un snippet : un creux à −20 LUFS coupe net l'attention. Garde l'énergie dès la première mesure.

**3. Club / DJ sets — fichiers WAV pour DJ, labels club**
• Cible : **−8 à −6 LUFS / −0.5 à −1 dBTP**
• **Concrètement** : si tu sors en streaming ET tu veux que ton track soit jouable en club, **prépare deux masters**. Le DJ qui mixe ton track ne va pas remonter le gain pour toi : si ton track est à −14 LUFS dans une tracklist de Charlotte de Witte à −7 LUFS, tu seras fantôme.
• Master club = LRA serré (3-6 LU), sub mono ≤ 100-120 Hz strict (sinon le système club annule en phase), pas de moments calmes qui plombent l'énergie.
• Format de livraison label : WAV 44.1 kHz/16 bits ou 48 kHz/24 bits selon la demande.
• Tendance 2024-26 : certains labels (techno mélodique, deep house) acceptent maintenant des masters club à **−10 LUFS** — plus respirants, mieux pour les longs sets. Vérifie avec ton label avant de masteriser.

**4. Vinyle (pressage 12" / 7")**
• Cible : **−14 à −9 LUFS / −1 dBTP minimum**
• **Concrètement** : si tu sors en vinyle, le studio de gravure va te demander un master vinyle dédié — **ne livre JAMAIS ton master streaming brut**. Si tu n'as pas le matos / l'expertise pour faire un master vinyle, demande au studio de gravure le service "pre-master vinyle" (50-150 €) — ça vaut largement le coup.
• Le graveur a besoin de : sub mono ≤ 100 Hz (ou ≤ 200 Hz pour les longues faces 22+ min), sibilances domptées (de-esser systématique sur la voix), pas de limiteur brutal (le graveur veut de la dynamique pour la modulation de l'aiguille), pas de phase aiguë inversée sur les transitoires (ça fait sauter l'aiguille).
• Durée par face : moins tu graves longtemps, plus tu peux taper fort. 12"/33 tours = 18 min max par face conseillé pour garder de la dynamique.

**5. CD audio**
• Cible : **−10 à −9 LUFS / −1 dBTP**
• **Concrètement** : si tu vends ton album en concert ou en boutique physique, master à **−10 LUFS / −1 dBTP**. C'est le compromis : plus chaud que le streaming, plus dynamique que le club.
• Pas de norme imposée, mais éviter d'aller au-delà de −9 LUFS — au-delà, tu rentres dans la "loudness war" des années 2000 et l'écoute fatigue.

**6. Broadcast TV / Radio (EBU R128)**
• Cible : **−23 LUFS / −1 dBTP** (Europe) ou **−24 LKFS** (US, ATSC A/85)
• **Concrètement** : si c'est une commande pub, une sync TV, ou de la diffusion radio pro, le diffuseur t'imposera la norme. **Un master plus chaud sera AUTOMATIQUEMENT REJETÉ** par les contrôles automatiques de la chaîne. Tu ne peux pas tricher.

**7. Cinéma (Dolby)**
• Cible : dialogue calé à environ **−27 LUFS** en référence
• **Concrètement** : si tu vises un placement film, c'est le mixeur du film qui fera le master final salle. Livre-lui ton master streaming **le plus dynamique possible** (−16 LUFS idéalement) pour qu'il ait du headroom et puisse intégrer ton track dans la dynamique très large de la salle (jusqu'à 20+ LU).

—

**Et concrètement, dans 90% des cas — qu'est-ce que tu fais ?**

**Un seul master à −14 LUFS / −1 dBTP.** Ça couvre Spotify, Apple Music, Deezer, Tidal, YouTube Music, Amazon Music, TikTok, Instagram Reels, YouTube Shorts, Bandcamp. C'est le format de livraison standard des distributeurs (DistroKid, TuneCore, IDOL, Believe, Idol).

**Tu prépares un master supplémentaire UNIQUEMENT si :**
• Tu sors en vinyle → master vinyle dédié obligatoire (ou pre-master par le studio de gravure)
• Tu sors sur un label club / tu joues en DJ set → master club −8 LUFS
• Tu vends un CD physique → master CD −10 LUFS
• Tu fais une pub / sync TV / radio → master broadcast −23 LUFS

—

**Comment atteindre −14 LUFS, concrètement**

Ta chaîne master bus, du mix vers le limiteur :
1. **EQ correctif** — coupe le rumble (HP à 30 Hz), creux léger 200-300 Hz si ça "boue", touche d'air à 12-15 kHz
2. **Compresseur de bus** — ratio 2:1 ou 4:1, attaque lente (30-50 ms), release auto, **2-3 dB de gain reduction max** sur les peaks (pas plus, sinon tu écrases la dynamique)
3. **Saturation/coloration** — optionnel, un poil de saturation analogique (Decapitator, Saturn 2, Black Box HG-2) pour densifier sans monter le LUFS
4. **Limiteur final** — brickwall, ceiling **−1 dBTP** (oversampling x4 minimum), tu pousses le gain d'entrée jusqu'à atteindre −14 LUFS intégré

**Si tu as besoin de plus de 6-7 dB de gain reduction au limiteur pour atteindre −14 LUFS, ton mix est trop dynamique ou pas maîtrisé.** Le limiteur ne doit pas faire le boulot du compresseur de bus. Reviens au mix : compresse mieux tes groupes (drums, bass, vocals), maîtrise ta basse (sidechain au kick si besoin), contrôle tes peaks parasites.

**Méthode A/B obligatoire :** ouvre 2-3 références de ton genre dans ta DAW, mesure leur LUFS intégré (Youlean Loudness Meter, gratuit), et compare en aveugle au même volume perçu (compense le gain pour ne pas être trompé par le "louder = better"). Si tes références sont à −10 LUFS et toi à −14, ne pousse pas pour rattraper — Spotify va te ramener au même niveau de toute façon.

—

Tu veux qu'on rentre dans un cas précis ? Une plateforme spécifique, ton genre, ton matos, ton mix bus actuel — dis-moi.`;

const EN = `**Quick guide to mastering targets — by destination**

First things first: the real question is "*where* are you releasing?". The answer changes everything. For each destination below: the theoretical target, then **what you actually do**.

**1. Streaming — Spotify, Apple Music, Deezer, Tidal, YouTube Music**
• Target: **−14 LUFS integrated / −1 dBTP**
• **In practice**: a single master at **−14 LUFS / −1 dBTP** covers ALL streaming platforms. No need for an Apple-specific or Deezer-specific master — Spotify/Tidal/YouTube play your track as-is, Apple only reduces by ~1-2 dB (inaudible), Deezer is similar.
• Do NOT go down to −16 "to please Apple": you'll just be quieter than your neighbors on Spotify/Tidal with no audible benefit on Apple.
• Dynamic genres (jazz, classical, folk, ambient) → you can deliver more dynamic (−16 to −18 LUFS), it breathes better.
• Compressed genres (trap, hyperpop, hard techno, drill) → −10 to −12 LUFS is OK, Spotify will reduce your volume (~−2 dB) but you stay in the genre's aesthetic.
• Why: platforms normalize automatically. Pushing to −9 LUFS does not make you louder — they *lower* your volume and you lose dynamics. You end up quieter than the neighbor who delivered clean.

**2. Social media — TikTok, Instagram Reels, YouTube Shorts**
• Target: **−14 to −10 LUFS / −1 dBTP**
• **In practice**: your streaming master (−14 LUFS) works great on TikTok / Reels. Do NOT make a separate master unless social is *really* your main channel.
• If TikTok is your turf (viral hook, 15-30s dance snippet) → you can push to **−10 / −11 LUFS**: social algorithms reward masters that "punch" from the first second, and mobile platform compressors are more permissive.
• Mono compatibility CRITICAL: ~80% of listens happen on phone speaker, in mono. Test your mix in mono — if a pad or stereo effect disappears, fix the mix before mastering.
• No "quiet moments" in the first 2 seconds of a snippet: a −20 LUFS dip kills attention. Keep energy from bar 1.

**3. Club / DJ sets — WAV files for DJ, club labels**
• Target: **−8 to −6 LUFS / −0.5 to −1 dBTP**
• **In practice**: if you're releasing on streaming AND want your track to be club-playable, **prep two masters**. The DJ mixing your track won't bump the gain for you: if your track is at −14 LUFS in a Charlotte de Witte tracklist at −7 LUFS, you'll sound ghostly.
• Club master = tight LRA (3-6 LU), strict sub mono ≤ 100-120 Hz (otherwise the club system phase-cancels), no quiet moments that drag down the energy.
• Label delivery format: WAV 44.1 kHz/16 bit or 48 kHz/24 bit depending on request.
• 2024-26 trend: some labels (melodic techno, deep house) now accept club masters at **−10 LUFS** — more breathing room, better for long sets. Check with your label before mastering.

**4. Vinyl (12" / 7" pressing)**
• Target: **−14 to −9 LUFS / −1 dBTP minimum**
• **In practice**: if you're releasing on vinyl, the cutting studio will ask for a dedicated vinyl master — **NEVER deliver your raw streaming master**. If you don't have the gear / expertise for a vinyl master, ask the cutting studio for their "vinyl pre-master" service ($60-180) — well worth it.
• The cutting engineer needs: sub mono ≤ 100 Hz (or ≤ 200 Hz for long 22+ min sides), tamed sibilance (de-esser on vocals systematic), no brutal limiting (the engineer needs dynamics for needle modulation), no inverted high-frequency phase on transients (that makes the needle skip).
• Side duration: shorter side = louder cut possible. 12"/33 RPM → 18 min max per side recommended to keep dynamics.

**5. Audio CD**
• Target: **−10 to −9 LUFS / −1 dBTP**
• **In practice**: if you sell your album at gigs or in physical stores, master at **−10 LUFS / −1 dBTP**. It's the compromise: louder than streaming, more dynamic than club.
• No enforced norm, but avoid going beyond −9 LUFS — past that you re-enter the 2000s "loudness war" and listening fatigue sets in.

**6. Broadcast TV / Radio (EBU R128)**
• Target: **−23 LUFS / −1 dBTP** (Europe) or **−24 LKFS** (US, ATSC A/85)
• **In practice**: if it's an ad, TV sync, or pro radio broadcast, the broadcaster will impose the norm. **A louder master will be AUTOMATICALLY REJECTED** by the chain's automatic loudness controls. You can't cheat.

**7. Cinema (Dolby)**
• Target: dialog anchored around **−27 LUFS** reference
• **In practice**: if you're targeting a film placement, the film mixer will do the final theatrical master. Hand them your **most dynamic** streaming master (ideally −16 LUFS) so they have headroom to integrate your track into the room's very wide dynamic range (up to 20+ LU possible).

—

**So in practice, in 90% of cases — what do you actually do?**

**A single master at −14 LUFS / −1 dBTP.** That covers Spotify, Apple Music, Deezer, Tidal, YouTube Music, Amazon Music, TikTok, Instagram Reels, YouTube Shorts, Bandcamp. It's the standard delivery format for distributors (DistroKid, TuneCore, CD Baby, Believe).

**You prep an extra master ONLY if:**
• You're releasing on vinyl → dedicated vinyl master required (or pre-master by the cutting studio)
• You're releasing on a club label / DJing → club master at −8 LUFS
• You're selling a physical CD → CD master at −10 LUFS
• You're doing an ad / TV sync / radio → broadcast master at −23 LUFS

—

**How to actually hit −14 LUFS, in practice**

Your master bus chain, from mix to limiter:
1. **Corrective EQ** — cut the rumble (HP at 30 Hz), light dip 200-300 Hz if it muds up, a touch of air at 12-15 kHz
2. **Bus compressor** — 2:1 or 4:1 ratio, slow attack (30-50 ms), auto release, **2-3 dB gain reduction max** on peaks (no more, or you crush the dynamics)
3. **Saturation/coloration** — optional, a hint of analog saturation (Decapitator, Saturn 2, Black Box HG-2) to thicken without raising LUFS
4. **Final limiter** — brickwall, ceiling **−1 dBTP** (oversampling x4 minimum), push the input gain until you hit −14 LUFS integrated

**If you need more than 6-7 dB of gain reduction on the limiter to hit −14 LUFS, your mix is too dynamic or not under control.** The limiter shouldn't do the bus compressor's job. Go back to the mix: compress your groups better (drums, bass, vocals), tame your bass (sidechain to kick if needed), control rogue peaks.

**Mandatory A/B method:** open 2-3 references from your genre in your DAW, measure their integrated LUFS (Youlean Loudness Meter, free), and compare blind at matched perceived volume (compensate gain so "louder = better" doesn't fool you). If your references sit at −10 LUFS and you sit at −14, don't push to catch up — Spotify will pull them back to your level anyway.

—

Want to dig into a specific case? A specific platform, your genre, your gear, your current mix bus — tell me.`;

export const MASTERING_CHARTER_SEED_KEY = 'mastering-charter-v2';

/**
 * Renvoie la charte mastering à injecter comme premier message assistant.
 * @param {string} lang - 'fr' | 'en' (default 'fr')
 * @returns {string}
 */
export function getMasteringCharter(lang = 'fr') {
  return lang === 'en' ? EN : FR;
}

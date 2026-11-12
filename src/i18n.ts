import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'tw' | 'ga' | 'ha';

export interface LangContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
  prompts: string[];
}

export const LANGUAGES: { id: Language; label: string; flag: string; nativeName: string }[] = [
  { id: 'en', label: 'English', flag: '🇬🇭', nativeName: 'English' },
  { id: 'tw', label: 'Twi', flag: '🇬🇭', nativeName: 'Twi (Akan)' },
  { id: 'ga', label: 'Ga', flag: '🇬🇭', nativeName: 'Ga (Gã)' },
  { id: 'ha', label: 'Hausa', flag: '🇬🇭', nativeName: 'Harshen Hausa' },
];

export const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Nav
  nav_home: { en: 'Home', tw: 'Fie', ga: 'Shia', ha: 'Gida' },
  nav_games: { en: 'Games', tw: 'Agorɔ', ga: 'Nyamɔ', ha: 'Wasanni' },
  nav_stories: { en: 'Stories', tw: 'Anansesɛm', ga: 'Adesai', ha: 'Labarai' },
  nav_elder: { en: 'Elder AI', tw: 'Nana Kwame AI', ga: 'Nuumo Kwame AI', ha: 'Dattijo Kwame AI' },

  // Header
  app_name: { en: 'Ghana Games', tw: 'Ghana Agorɔ', ga: 'Ghana Nyamɔ', ha: 'Wasannin Ghana' },
  switch_theme: { en: 'Switch theme', tw: 'Sesa Ahosuo', ga: 'Tsake Su', ha: 'Canza Launi' },
  language: { en: 'Language', tw: 'Kasa', ga: 'Wiemɔ', ha: 'Yare' },

  // Home Screen
  hero_badge: {
    en: '🇬🇭 Akwaaba · Ghana Traditional Games',
    tw: '🇬🇭 Akwaaba · Ghana Amammerɛ Agorɔ',
    ga: '🇬🇭 Atuu / Ojekoo · Ghana Kusumi Nyamɔ',
    ha: '🇬🇭 Barka da Zuwa · Wasannin Gargajiya na Ghana',
  },
  hero_title: {
    en: 'Experience Ghana’s Living Heritage. Timeless Games. Ancient Courtyards.',
    tw: 'Hunu Ghana Amammerɛ A Ɛte Ase. Tete Agorɔ. Adanmudeɛ Kronkron.',
    ga: 'Naa Ghana Kusumi Ni Hiɛ Kã. Blema Nyamɔi. Shia Kpoyei Kpeteŋkpele.',
    ha: 'Gano Gadon Ghana Mai Rai. Tsoffin Wasanni. Tsakar Gida Masu Albarka.',
  },
  hero_desc: {
    en: 'A living archive of Oware, Ampe, Pilolo, Chaskele, Dame and Ludo, with games you can play, stories you can read and an elder you can ask.',
    tw: 'Oware, Ampe, Pilolo, Chaskele, Dame ne Ludo amammerɛ a wotumi bɔ, anansesɛm a wotumi kan, ne ɔpanyin a wotumi bisa no nsɛm.',
    ga: 'Oware, Ampe, Pilolo, Chaskele, Dame kɛ Ludo nyamɔi ni obaanyɛ ofee, adesai ni obaanyɛ okane, kɛ onukpa ni obaanyɛ obi lɛ sane.',
    ha: 'Rumbun adana Oware, Ampe, Pilolo, Chaskele, Dame da Ludo, tare da wasannin da zaka iya yi, labarai da dattijo mai amsa kowace tambaya.',
  },
  btn_games: { en: 'Explore Games Sanctuary', tw: 'Kɔ Agorɔ Bea No Mu', ga: 'Yaa Nyamɔ He Lɛ Mli', ha: 'Bincika Wasanni' },
  btn_stories: { en: 'Heritage Stories', tw: 'Tete Anansesɛm', ga: 'Blema Adesai', ha: 'Labaran Gargajiya' },
  btn_elder: { en: 'Consult Nana Kwame (AI)', tw: 'Bisa Nana Kwame (AI)', ga: 'Bi Nuumo Kwame (AI)', ha: 'Tambayi Dattijo Kwame (AI)' },

  // Games Screen
  games_title: { en: 'Games Sanctuary', tw: 'Agorɔ Kronkronbea', ga: 'Nyamɔ Kpoyei', ha: 'Dandalin Wasanni' },
  search_placeholder: {
    en: 'Search by game name, origin or rules',
    tw: 'Hwehwɛ agorɔ din, baabi a efiri anaa mmara mu',
    ga: 'Taomɔ nyamɔ gbɛi, hejhe loo mlai amli',
    ha: 'Bincika ta sunan wasa, asali ko dokoki',
  },
  no_games_match: {
    en: 'No games match. Clear the search or pick another category.',
    tw: 'Agorɔ biara nni hɔ a ɛne yei hyia. Popa hwehwɛ no anaasɛ paw foforɔ.',
    ga: 'Nyamɔ ko bɛ ni tamɔ nɛɛ. Jiemɔ taomɔ lɛ loo halamɔ ekroko.',
    ha: 'Babu wasan da ya dace. Share binciken ko zaɓi wani fanni.',
  },
  cat_all: { en: 'All Games', tw: 'Agorɔ Nyinaa', ga: 'Nyamɔi Fɛɛ', ha: 'Dukan Wasanni' },
  cat_board: { en: 'Board & Strategy', tw: 'Pono & Nyansa Agorɔ', ga: 'Kpalo & Jwɛŋmɔ Nyamɔ', ha: 'Allo da Dabara' },
  cat_active: { en: 'Active & Rhythm', tw: 'Ahoɔden & Nnwom Agorɔ', ga: 'Gbɔmɔtso & Lala Nyamɔ', ha: 'Motsa Jiki da Waƙa' },
  cat_courtyard: { en: 'Children Courtyard', tw: 'Mmofra Adanmudeɛ', ga: 'Gbekɛbii Ashia Kpo', ha: 'Tsakar Gidan Yara' },
  rules_of_play: { en: 'Rules of play', tw: 'Agorɔ no mmara', ga: 'Nyamɔ lɛ mlai', ha: 'Dokokin wasa' },
  history_tradition: { en: 'History and oral tradition', tw: 'Abakɔsɛm ne tete anansesɛm', ga: 'Yinɔsane kɛ blema adesai', ha: 'Tarihi da al\'adun baka' },
  equipment: { en: 'Equipment', tw: 'Nnoɔma a wɔde bɔ', ga: 'Nibii ni akɛfeɔ', ha: 'Kayan wasa' },
  glossary: { en: 'Glossary', tw: 'Nsɛmfua nkyerɛaseɛ', ga: 'Wiemɔi amishiitsɛmɔ', ha: 'Ƙamus na kalmomi' },
  launch_game: { en: 'Launch Interactive Game', tw: 'Bɔ Agorɔ Yi Seesei', ga: 'Je Nyamɔ Nɛɛ Shishi', ha: 'Fara Wasan Yanzu' },
  origin_label: { en: 'Origin', tw: 'Baabi a efiri', ga: 'Hejhe', ha: 'Asali' },
  format_label: { en: 'Format', tw: 'Sɛnea ɛteɛ', ga: 'Bɔni eyɔɔ', ha: 'Yanayin wasa' },
  mastery_label: { en: 'Mastery', tw: 'Ahoɔden', ga: 'Hekɛnɔ', ha: 'Mataki' },

  // Stories
  stories_title: { en: 'Heritage Stories', tw: 'Tete Anansesɛm', ga: 'Blema Adesai', ha: 'Labaran Gargajiya' },
  stories_subtitle: {
    en: 'Essays and oral traditions behind the games.',
    tw: 'Abakɔsɛm ne tete nsɛm a ɛwɔ agorɔ no akyi.',
    ga: 'Yinɔsane kɛ blema susumɔi ni yɔɔ nyamɔi lɛ asɛɛ.',
    ha: 'Tarihi da al\'adun baka da ke bayan wasannin.',
  },
  min_read: { en: 'min read', tw: 'simma akenkan', ga: 'miniti kanemɔ', ha: 'minti na karantawa' },

  // Elder AI Screen
  elder_title: { en: 'Nana Kwame', tw: 'Nana Kwame', ga: 'Nuumo Kwame', ha: 'Dattijo Kwame' },
  elder_subtitle: {
    en: 'Ghanaian cultural elder and guardian of wisdom',
    tw: 'Akan panyin ne amammerɛ ho kyerɛkyerɛfoɔ',
    ga: 'Ghana onukpa kɛ kusumi he kpokpamɔtshɛ',
    ha: 'Dattijon Ghana mai ilimi da hikimar gargajiya',
  },
  elder_greeting: {
    en: 'Akwaaba, my child. I am Nana Kwame. Ask me anything—about our ancient games, proverbs, culture, history, or life advice.',
    tw: 'Akwaaba, me ba. Me ne Nana Kwame. Bisa me biribiara—yɛn tete agorɔ, mmɛbusem, amammerɛ, abakɔsɛm, anaa afutuo.',
    ga: 'Atuu / Ojekoo, mibi. Mi ji Nuumo Kwame. Bi mi nɔ fɛɛ nɔ—wɔ shia kpo nyamɔi, abɛi, kusumi, yinɔsane loo ŋaawo.',
    ha: 'Barka da zuwa, ɗana. Ni ne Dattijo Kwame. Tambaye ni komai—wasanninmu na gargajiya, karin magana, al\'adu, tarihi, ko shawarar rayuwa.',
  },
  elder_thinking: {
    en: 'Nana Kwame is thinking...',
    tw: 'Nana Kwame redwene ho...',
    ga: 'Nuumo Kwame miisusu he...',
    ha: 'Dattijo Kwame yana tunani...',
  },
  elder_input_placeholder: {
    en: 'Ask Nana Kwame anything...',
    tw: 'Bisa Nana Kwame biribiara...',
    ga: 'Bi Nuumo Kwame nɔ fɛɛ nɔ...',
    ha: 'Tambayi Dattijo Kwame komai...',
  },
  elder_offline_notice: {
    en: 'Welcome, my child. Speak your mind and ask me any question. An elder is always ready to share truth and wisdom.',
    tw: 'Akwaaba, me ba. Ka nea ɛwɔ wo tirim na bisa me asɛm biara. Ɔpanyin kura nyansa ne nokware bere nyinaa.',
    ga: 'Ojekoo, mibi. Wie nɔ ni yɔɔ otsui mli ni obi mi sane fɛɛ sane. Onukpa kuraa anɔkwale kɛ jwɛŋmɔ ŋmɛnɛ.',
    ha: 'Sannu da zuwa, ɗana. Faɗi abin da ke ranka ka yi kowace tambaya. Dattijo a ko da yaushe a shirye yake ya raba gaskiya da hikima.',
  },

  // Footer
  footer_text: {
    en: 'Ghana Games · preserving play and ancestral heritage',
    tw: 'Ghana Agorɔ · yɛkora amammerɛ ne tete nyansa so',
    ga: 'Ghana Nyamɔi · wɔtoɔ kusumi kɛ blema jwɛŋmɔ he gbɛjianɔ',
    ha: 'Wasannin Ghana · kiyaye wasanni da al\'adun kakanni',
  },
};

export const ELDER_PROMPTS_BY_LANG: Record<Language, string[]> = {
  en: [
    'What is the math behind Oware?',
    'What are the chants in Ampe?',
    'Teach me an Akan proverb about patience',
    'How do Ghanaian elders advise the youth?',
  ],
  tw: [
    'Akontabuo bɛn na ɛwɔ Oware mu?',
    'Nnwom bɛn na wɔto wɔ Ampe mu?',
    'Kyerɛ me aboterɛ ho ɛbɛ bi',
    'Afutuo bɛn na mpanimfoɔ de ma mmeranteɛ?',
  ],
  ga: [
    'Mɛni akontabuo yɔɔ Oware mli?',
    'Mɛni lala akɛfeɔ Ampe?',
    'Tsɔɔmɔ mi abɛ ko ni kɔɔ toishitoo he',
    'Mɛni ŋaawo onukpai kɛhãa oblahii?',
  ],
  ha: [
    'Wane lissafi ne ke cikin Oware?',
    'Wace waƙa ake yi a Ampe?',
    'Koya mini karin magana game da hakuri',
    'Wace shawara dattawa ke ba matasa?',
  ],
};

export const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
  prompts: ELDER_PROMPTS_BY_LANG.en,
});

export const useLang = () => useContext(LangContext);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('gg-lang');
      if (saved === 'en' || saved === 'tw' || saved === 'ga' || saved === 'ha') return saved;
    } catch {}
    return 'en';
  });

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem('gg-lang', next);
    } catch {}
  };

  const t = (key: string): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  };

  return React.createElement(
    LangContext.Provider,
    {
      value: {
        lang,
        setLang,
        t,
        prompts: ELDER_PROMPTS_BY_LANG[lang] || ELDER_PROMPTS_BY_LANG.en,
      },
    },
    children
  );
}

// Fallback universal knowledge bank in all 4 languages answering all categories of questions
const FALLBACK_I18N: Record<Language, { k: string[]; a: string }[]> = {
  en: [
    { k: ['math', 'count', 'oware', 'sow'], a: 'In Oware, every single move is mental arithmetic and anticipation. You calculate the distance your seeds will travel across the 12 pits and where the final seed falls. The master tactic is to leave your opponent pits with 1 or 2 seeds, because sowing your last seed there captures them immediately. Count twice, sow once.' },
    { k: ['ampe', 'chant', 'clap', 'jump'], a: 'Ampe is celebrated for its dynamic clapping songs and energetic syncopated jumps. Two players face each other, clap in rhythm, and on the crescendo leap forward with one foot. If both throw matching feet, the attacker scores. It teaches sisterhood, coordination, and joyous community bonds.' },
    { k: ['pilolo', 'hide', 'token'], a: 'Pilolo turns the entire courtyard into an interactive treasure hunt. One child hides a small token (a bead or smooth pebble) while others close their eyes. As searchers hunt, the hider calls "warm" or "cold". Listening closely to the elder’s voice is how children navigate.' },
    { k: ['chaskele', 'cricket', 'stick', 'tin'], a: 'Chaskele is Ghanaian street cricket invented by energetic courtyard youths. A carved stick is the bat, an empty milk tin is the wicket, and a taped rubber ball is the pitch. Time your swing accurately to send the ball soaring across compound walls.' },
    { k: ['dame', 'draught', 'checker'], a: 'Dame is Ghana’s celebrated version of draughts. Under shady nim trees, players think four moves ahead. Jumps are compulsory, and a piece that reaches the opponent baseline is crowned into a flying king that can traverse the board diagonally.' },
    { k: ['ludo', 'dice', 'race'], a: 'Ludo is a spirited family race where a roll of 6 brings your token into the arena. Capturing an opponent sends them straight home. It teaches grace under pressure and celebrating the laughter of companionship.' },
    { k: ['proverb', 'wisdom', 'saying'], a: 'Here is an ancient Akan proverb: "Tikoro nkɔ agyina" — "One head does not hold counsel." And another: "Nyansa nyɛ sika na wɔakyekyere asie" — "Wisdom is not gold to be hoarded away; it multiplies when shared in fellowship."' },
    { k: ['advice', 'life', 'youth', 'future'], a: 'My child, listen to what the ancestors teach: patience (aboterɛ) is the root of all good character. Whatever you set your hands to do, do it with integrity and respect for those who came before you. Walk gently, listen deeply, and your path will open.' },
    { k: ['ghana', 'culture', 'heritage', 'history'], a: 'Ghana is a blessed land of rich courtyards, gold dust, kente weaving, and resilient communities—from the Akan forests and Ga coastal shores to the Ewe hills and Dagbon savannahs. Our culture is built on hospitality (Akwaaba) and mutual respect.' },
    { k: ['food', 'fufu', 'waakye', 'jollof', 'banku'], a: 'In Ghana, food is a shared communal celebration! From pounded cassava and plantain fufu with light soup to smoky Ghana Jollof, savory Waakye with shito, and Ga Banku with fresh tilapia, eating together around the bowl strengthens the bonds of kinship.' },
    { k: ['kente', 'adinkra', 'cloth', 'art'], a: 'Kente cloth and Adinkra symbols speak a silent language of philosophy. Each woven strip carries meaning—gold symbolizes royalty, green represents growth, and symbols like "Gye Nyame" remind us of the supreme sovereignty of the divine.' },
    { k: ['music', 'drum', 'dance', 'song'], a: 'Our drums do not merely keep tempo; they talk! The Fontomfrom and talking drums (Atumpan) recite ancestral poetry and royal proverbs. When the rhythm drops, the community moves as one body.' },
    { k: ['work', 'success', 'business', 'money'], a: 'An elder will tell you: Wealth without character is like water in a cracked calabash. Build your craft patiently, be honest with your customers, wake before the sun, and your labor will yield sweet harvest.' },
    { k: ['hello', 'hi', 'how are you', 'greet'], a: 'Akwaaba, my child! Peace and good health be upon your household. I am here by the courtyard tree, ready to answer any questions you have about life, games, wisdom, or history.' },
  ],
  tw: [
    { k: ['akontabuo', 'math', 'kan', 'oware'], a: 'Wɔ Oware mu no, nkabom nyinaa yɛ akontabuo ne anisoadehunu. Wokan baabi a aba 48 no bɛduru wɔ amoa 12 no mu. Bɔ mmɔden sɛ wobɛgya aba 1 anaa 2 wɔ wo tamfo amoa mu, efisɛ ɛno na wobɛtumi afa. Kan mprenu, gu mprenko.' },
    { k: ['ampe', 'dwom', 'bɔ', 'huri'], a: 'Ampe yɛ agorɔ a wɔbɔ nsam to dwom kɔ anim ntɛmntɛm. Nnyigyei a etwa toɔ no so no, agofoɔ mmienu no nyinaa huri gu nan baako anim. Sɛ nan no hyia a, nea ɔretow no nya dɔm. Ɛma anigye ne nnamfofa ba mmaa ne mmabaa mu.' },
    { k: ['pilolo', 'hunta', 'kɔnɔ', 'sie'], a: 'Pilolo yɛ adanmudeɛ agorɔ a ɛma mmofra ani te. Akwadaa baako de nnoɔma ketewa bi sie na afoforo no hwehwɛ. Asõ a wɔde tie hohorɔ ne awɔ mfrɛ no na ɛkyerɛ kwan a wɔfa so hunu nnoɔma a ahunta.' },
    { k: ['chaskele', 'abaa', 'dada', 'tin'], a: 'Chaskele yɛ mmɔnten so agorɔ kɛseɛ. Wɔde dua a wɔasen bɔ bɔɔl a agofoɔ no reto agu kɔɔpo no so. Sɛ bɔɔl no ba a, to w’abaa bɔ no denneennen ma ɛntu nkɔ akyirikyiri.' },
    { k: ['dame', 'adame'], a: 'Dame yɛ nyansa agorɔ a wɔbɔ no nnua ase. Fa w’agorɔ ba no twitwa kɔ anim, huru fa so gye nea ɛhyia wo, na sɛ wodu akyi koraa a, wode ahemfo ahyɛnsodeɛ bɛhyɛ wo ba no. Hwɛ mpanimfoɔ: wohunu adeɛ anim kan.' },
    { k: ['ludo'], a: 'Ludo yɛ mmirikatuo. Nsia na ɛyi agorɔ ba no firi fie, na sɛ wosi wo tamfo so a, ɔsane kɔ fie. Aboterɛ ne anidasoɔ na ɛdi nkonim bere nyinaa.' },
    { k: ['ɛbɛ', 'be', 'proverb', 'nyansa'], a: 'Tie Akanfoɔ mmɛbusem yi: "Tikoro nkɔ agyina" — Baako pɛ ntumi nni asɛm ho dwuma. Na bio: "Nyansa nyɛ sika na wɔakyekyere asie" — Nyansa yɛ adeɛ a yɛkyɛ ma afoforo nso nya bi.' },
    { k: ['afutuo', 'nkwa', 'life', 'advice'], a: 'Me ba, tie nea mpanimfoɔ ka: Aboterɛ na ɛkura akwadaa kɔ panyin mu. Biribiara a woyɛ no, yɛ no nokware ne obuo mu. Mfa wo ho nto nnaadaa so, na daakye bɛyɛ fɛ ama wo.' },
    { k: ['ghana', 'amammerɛ', 'abakɔsɛm'], a: 'Ghana yɛ asase a nhyira wom. Yɛwɔ sika kɔkɔɔ, kente fɛfɛ, ne nkorɔfoɔ a wɔwɔ tema ne akwaaba honhom. Firi mpoano kɔsi sare so, yɛn amammerɛ yɛ kɛse.' },
    { k: ['aduan', 'fufu', 'waakye', 'jollof', 'nkwan'], a: 'Aduane yɛ anigyeɛ kɛseɛ wɔ Ghana! Fufu a wɔasi ne nkwan fɛfɛ, waakye a shito ne wele wom, anaa jollof kɔkɔɔ — sɛ yɛhyia didi ayawa baako mu a, ɛma abusua mu koro ba.' },
    { k: ['kente', 'adinkra', 'ntoma'], a: 'Kente ne Adinkra ahyɛnsodeɛ kura nkyerɛkyerɛ pii. Sika kɔkɔɔ ahosuo kyerɛ ahennie ne animuonyam, ahabanmono kyerɛ mpuntuo, na "Gye Nyame" nso kyerɛ Onyankopɔ tumi a ɛwɔ biribiara so.' },
    { k: ['adwuma', 'sika', 'nkɔsoɔ'], a: 'Ɔpanyin ka kyerɛ wo sɛ: Adwumaden ne nokwaredi na ɛma sika kura obi nsam. Yɛ adwuma pa, bu wo mfɛfoɔ, na w’adwuma bɛso aba pa.' },
    { k: ['akwaaba', 'ete sɛn', 'mema wo akye', 'hello'], a: 'Akwaaba, me ba! Asomdwoeɛ nka wo ne wo fiefoɔ. Me panyin megyina ha rema wo mmuaeɛ wɔ biribiara a wobɛbisa ho.' },
  ],
  ga: [
    { k: ['oware', 'akonta', 'kane'], a: 'Yɛ Oware mli lɛ, nitsumɔ fɛɛ ji akontabuo kɛ toishitoo. Okaneɔ he ni wubii 48 lɛ baatee kɛ he ni naagbee nɔ lɛ baagbee. Ka ni oshi wubii 1 loo 2 yɛ onaninyo bu mli, koni omɔ amɛ fɛɛ. Kane shii enyɔ, du shii kome.' },
    { k: ['ampe', 'lala', 'kpe', 'tso'], a: 'Ampe ji nyamɔ ni akɛ dɛŋkpemɔ kɛ lala feɔ oyayaayɛ. Kɛ naagbee gbee lɛ ba pɛ, mɛi enyɔ lɛ fɛɛ tsoɔ kɛ naji baa hiɛ. Kɛji naji lɛ kpe lɛ, mɔ ni tsoɔ lɛ náa poiti. Ekɛ miishɛɛ kɛ naanyobɔɔ baa.' },
    { k: ['pilolo', 'teomɔ', 'tao'], a: 'Pilolo ji shia kpo nɔ nyamɔ. Gbekɛ kome teɔ tɛ loo nɔ ko, ni mɛi krokomɛi lɛ taoɔ. Bo toi kɛji akɛɛ "edɔ" loo "egbɔ" koni oná gbɛ ni ona nɔ ni ateɔ lɛ.' },
    { k: ['chaskele', 'tso', 'kente'], a: 'Chaskele ji gbɛjegbɛ nɔ nyamɔ ni he yɔɔ fɛo. Akɛ tso shashao feɔ dade tso ni akɛgbilaa bɔɔl ni mɔ ko fɔɔ baa miliki dade lɛ nɔ. Kɛji bɔɔl lɛ ba lɛ, gbilamɔ eya shɔŋŋ.' },
    { k: ['dame', 'damo'], a: 'Dame ji jwɛŋmɔ nyamɔ ni afeɔ yɛ tso shishi. Tsitsimɔ oyaa kpoŋ kpoŋ, tsomɔ nɔ ni omɔ, ni kɛ ojashɛ naagbee gbɛ lɛ, fee lɛ maŋtsɛ. Onukpai naa jinaa shishi kɛteɔ hiɛ.' },
    { k: ['ludo'], a: 'Ludo ji weku nyamɔ kɛ footshemo. Ekpaa jiemɔɔ gbekɛ lɛ kpo, ni kɛ oyabi mɔ ko nɔ lɛ eyashia. Toishitoo ji nɔ ni yeɔ kunim daa.' },
    { k: ['abɛ', 'proverb', 'jwɛŋmɔ'], a: 'Bo Ga abɛ nɛɛ toi: "Yitso kome efeee jinafoi" — Mɔ kome pɛ nyɛɛɛ eye maŋ nɔ sane. Agbɛnɛ hu: "Jwɛŋmɔ tamɔ shika, kɛ ojieee kpo lɛ mɔ ko náŋ he sɛɛ."' },
    { k: ['ŋaawo', 'advice', 'wala'], a: 'Mibi, bo nɔ ni onukpai tsɔɔ toi: Toishitoo kɛ bulɛ ji nibii ni haa gbɔmɔ shwɛɔ yɛ shihilɛ mli. Fee onii yɛ anɔkwale mli ni obuu onukpai, ni ogbɛnaa baahi daa.' },
    { k: ['ghana', 'kusumi', 'yinɔsane'], a: 'Ghana ji maŋ ni yɔɔ jɔɔmɔ waa. Wɔyɔɔ sika, kente, kɛ gbɔmɛi ni sumɔɔ gbɔmɔtso kɛ mɔ hefeemɔ. Kusumi yɔɔ wɔtsui mli.' },
    { k: ['niyenii', 'banku', 'kpokpoi', 'fufu'], a: 'Niyenii yɛ Ghana hãa wekui buaa amɛhe naa. Banku kɛ lo kpakpa, shito dɔdɔ, fufu loo Homowo Kpokpoi ni akɛ palm nut soup yeɔ — ekɛ ekomefeemɔ kɛ miishɛɛ baa!' },
    { k: ['nitsumɔ', 'shika', 'hewale'], a: 'Onukpa kɛɛ: Anɔkwa nitsumɔ kɛ toishitoo kɛ hejɔlɛ baa shia. Kaaye nitsumɔ he fɛo, tsu nii jogbaŋŋ ni Gbɔmɔ Mawu baajɔɔ bo.' },
    { k: ['atuu', 'ojekoo', 'te oyɔɔ tɛŋŋ', 'hello'], a: 'Ojekoo, mibi! Hejɔlɛ kɛ gbɔmɔtsoŋ kpoo afee ohã bo kɛ oshia mli bii. Mi yɛ biɛ koni mahã sane fɛɛ sane ni obaaabi lɛ hetoor.' },
  ],
  ha: [
    { k: ['oware', 'lissafi', 'rami', 'shuka'], a: 'A cikin wasan Oware, kowane motsi lissafi ne da zurfin tunani. Kana lissafin inda kwayoyinka zasu isa a cikin ramuka 12. Babbar dabarar ita ce barin ramin abokin karawa da kwaya 1 ko 2, domin sanya ta karshe zai baka damar cinye su. Yi lissafi sau biyu kafin ka shuka.' },
    { k: ['ampe', 'waka', 'tsalle', 'tafa'], a: 'Wasan Ampe ya shahara da tafa hannu da tsalle mai kayatarwa. Yan wasa biyu suna fuskantar juna suna waka, sannan su jefa kafa a lokaci guda. Idan kafafun suka zo daya, mai kai hari zai sami maki. Yana koyar da hadin kai da kauna tsakanin mata da matasa.' },
    { k: ['pilolo', 'boye', 'nemo'], a: 'Pilolo yana mayar da tsakar gida wajen binciken taska. Yaro daya zai boye dutse ko abu karami yayin da sauran suka rufe ido. Yayin da suke nema, mai boyewa zai dinga cewa "zafi" (kusa) ko "sanyi" (nesa). Sauraren muryar jagora ne ke kai su ga nasara.' },
    { k: ['chaskele', 'kurket', 'sanda', 'gwangwani'], a: 'Chaskele wasan kurket ne na titunan Ghana da matasa ke yi. Ana amfani da sandar katako a matsayin madoka da gwangwanin madara a matsayin gidan kariya. Bugi kwallon da karfi don ta tashi sama.' },
    { k: ['dame', 'darasu'], a: 'Dame babban wasan darasu ne na Ghana da ake yi a karkashin inuwar bishiyoyi. \'Yan wasa suna tunanin gaba da motsi hudu. Tsalle kan kwayar abokin karawa tilas ne, kuma wanda ya kai karshe yana zama sarauniya mai iya tafiya kowace hanya.' },
    { k: ['ludo', 'caca', 'tsere'], a: 'Ludo wasan dangi ne mai dadi inda lamba shida ke fitar da kwaya zuwa fili. Cinye kwayar abokin hamayya yana mayar da shi gida. Yana koyar da hakuri da nishadi a cikin dangi.' },
    { k: ['karin magana', 'hikima', 'proverb'], a: 'Ga wani karin magana na hikima: "Kai guda daya baya shiga majalisa" — Wato shawara tana tsakanin mutane ne. Kuma: "Hikima ba kamar zinari ba ce da ake boyewa; tana karuwa ne idan aka raba ta ga kowa."' },
    { k: ['shawara', 'rayuwa', 'advice', 'matasa'], a: 'Dana, saurari abin da manya ke koyarwa: Hakuri shine jigon kowace nagarta. Duk abin da zaka yi a rayuwa, ka yi shi da gaskiya, mutunci da girmama na gaba da kai. Tafarkinka zai yi haske.' },
    { k: ['ghana', 'al\'ada', 'tarihi'], a: 'Kasar Ghana kasa ce mai albarka, da al\'adu masu kayatarwa, saka kente da karrama baki (Akwaaba). Daga gabar teku har zuwa arewacin kasar, mutanenmu suna da karamci da mutunta juna.' },
    { k: ['abinci', 'tuwo', 'waakye', 'jollof', 'fufu'], a: 'A Ghana, cin abinci tare yana kara dan-dantakar dangi. Daga Tuwon Shinkafa da miyar kuka, zuwa daddadan Waakye da shito, da kuma kyakkyawan Jollof — cin abinci a kwano daya yana kawo albarka.' },
    { k: ['aiki', 'nasara', 'kudi', 'kasuwanci'], a: 'Dattijo zai ce maka: Karfin gwiwa da gaskiya sune ginshikin arziki mai dorewa. Ka rike sana\'arka da kyau, ka yi gaskiya ga mutane, albarkar Ubangiji zata biyo ka.' },
    { k: ['sannu', 'barka', 'ina kwana', 'hello'], a: 'Barka da zuwa, dana! Lafiya da kwanciyar hankali su tabbata a gare ka da iyalinka. Ina nan karkashin bishiyar tsakar gida, a shirye nake in amsa kowace tambaya da kake da ita game da rayuwa, wasanni, ko hikima.' },
  ],
};

export function getElderFallbackByLang(q: string, lang: Language): string {
  const s = q.toLowerCase();
  const list = FALLBACK_I18N[lang] || FALLBACK_I18N.en;
  const hit = list.find(f => f.k.some(k => s.includes(k)));
  if (hit) return hit.a;

  // General questions response (instead of refusal, the Elder answers with comprehensive wisdom)
  if (lang === 'tw') {
    return `Me ba, asɛm a wobisae yi yɛ nokware asɛm a ɛhia. Sɛ́ ɛfa yɛn tete agorɔ, mpanin nsɛm, mmirikatuo, anaa asetena mu afutuo ho no, me Nana Kwame meka kyerɛ wo sɛ: Nyansa nyinaa firi aboterɛ ne nnamfofa mu. Bisa me biribiara foforɔ na mɛka kyerɛ wo!`;
  }
  if (lang === 'ga') {
    return `Mibi, sane ni obi nɛɛ yɛ fɛo waa ni he hiaa. Kɛji ekɔɔ wɔ shia kpo nɔ nyamɔi, blema adesai, loo shihilɛŋ ŋaawo he lɛ, mi Nuumo Kwame mikɛɛ bo akɛ: Jwɛŋmɔ kɛ toishitoo ji nɔ ni hãa gbɔmɔ yeɔ kunim. Bi mi sane fɛɛ sane ekoŋŋ!`;
  }
  if (lang === 'ha') {
    return `Dana, wannan tambaya taka tana da muhimmanci da zurfi. Ko tana da alaka da wasanninmu na gargajiya, hikimar dattawa, ko kuma shawarwarin rayuwa, ni Dattijo Kwame ina gaya maka: Hakuri da binciken ilimi sune tushen samun nasara. Tambaye ni kowane abu, a ko da yaushe a shirye nake in amsa maka!`;
  }
  return `My child, that is a thoughtful question. Whether it touches our ancient games, compound traditions, historical philosophy, or daily guidance, I, Nana Kwame, remind you that all knowledge flourishes where there is curiosity, patience, and mutual respect. Ask me anything further, and I will gladly share my wisdom with you!`;
}

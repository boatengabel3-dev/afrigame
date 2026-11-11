import { Story } from './data';
import { Language } from './i18n';

interface LocalizedStoryData {
  title: string;
  tag: string;
  excerpt: string;
  quote: string;
  body: string[];
}

export const STORIES_I18N: Record<string, Partial<Record<Language, LocalizedStoryData>>> = {
  'oware-roots': {
    tw: {
      title: 'Akanfoɔ Tete Oware Farebae',
      tag: 'Pono & Nyansa Agorɔ',
      excerpt: 'Sɛnea amoa dummienu bɛyɛɛ aboterɛ ne anisoadehunu sukuu.',
      quote: 'Kan dodoɔ no ansa na woagu aba no.',
      body: [
        'Wɔbɔ Oware wɔ Akanfoɔ afie mu nyinaa sɛ amammerɛ a ɛboro agorɔ kɛkɛ so. Mpanimfoɔ pii bu agorɔ pono no sɛ kyerɛkyerɛfoɔ a ɔbɔ no dwoodwoo: adeyɛ biara sesa aba a wontumi nsan nfa bio.',
        'Agorɔ no hyɛ akontabuo ne anisoadehunu animuonyam. Sɛ wogu aba no kɛkɛ a, ɛbɛma wo tamfo anya kwan afa, nanso aboterɛ agorɔ bɛtumi aboa wo akyire.',
        'Mmusuafoɔ taa de oware pono sie wɔ nnua bi ase wɔ fie, na ɛyɛ kwan baako a mmofra fa so tena wɔn mpanimfoɔ nkyɛn sua nyansa.',
      ],
    },
    ga: {
      title: 'Oware Yinɔsane kɛ Shishi',
      tag: 'Kpalo & Jwɛŋmɔ Nyamɔ',
      excerpt: 'Bɔni bui 12 kpalo batsɔ toishitoo kɛ jwɛŋmɔ kaseemohe.',
      quote: 'Kane shii enyɔ dani odu wubii.',
      body: [
        'Afeɔ Oware yɛ Ga kɛ Akan shia mli fɛɛ tamɔ nɔ ko ni fe nyamɔ kɛkɛ. Onukpai buɔ kpalo lɛ tamɔ tsɔɔlɔ ni jwɛŋmɔ yɔɔ emli.',
        'Nyamɔ nɛɛ hãa gbɔmɔ kaseɔ akontabuo kɛ hiɛkwɛmɔ. Kɛ ojwa wubii ashwie shikpɔŋ ebaahã onaninyo amɔ amɛ, shi toishitoo baahã oye kunim.',
        'Wekui bua amɛhe naa yɛ tso shishi ni gbekɛbii kɛ onukpai taraa shi kaseɔ jwɛŋmɔ.',
      ],
    },
    ha: {
      title: 'Tushen Wasan Oware a Kasar Akan',
      tag: 'Allo da Dabara',
      excerpt: 'Yadda allon ramuka goma sha biyu ya zama makarantar hakuri da dabarar tunani.',
      quote: 'Yi lissafi kafin ka shuka kowace kwaya.',
      body: [
        'Ana yin wasan Oware a al\'ummomin Ghana a matsayin wani abu da ya wuce wasan nishadi kawai. Dattawa da yawa suna ɗaukar allon a matsayin malami mai nutsuwa: kowane motsi yana fitar da ƙwayar da ba za ka iya mayarwa ba.',
        'Wasan yana karrama lissafi da hangen nesa. Ƙwayar da aka shuka ba tare da tunani ba tana ciyar da abokin hamayyarka, yayin da motsi mai haƙuri zai iya ba ka damar cin nasara.',
        'Iyalai sukan ajiye allo a wuri mai inuwa a tsakar gida, kuma koyon wasan wata hanya ce da yara ke zama kusa da dattawansu don koyon hikima.',
      ],
    },
  },
  'ampe-rhythm': {
    tw: {
      title: 'Ampe: Nnwom, Ahoɔden & Nnamfofa',
      tag: 'Ahoɔden & Nnwom Agorɔ',
      excerpt: 'Nsam-bɔ, nnwom-toɔ ne ahurisi a ɛde anigyeɛ ba.',
      quote: 'Dwom no kura mmere; nan no kura kɔnta.',
      body: [
        'Ampe hyɛ aseɛ ne dwom a wɔto bɔ nsam. Agofoɔ mmienu bɔ nsam kɔsi nnyigyei a etwa toɔ no so, na obiara huri to nan baako kɔ anim.',
        'Sɛ nan no hyia a, ɛma kɔnta, nanso anigyeɛ kɛseɛ no ne nnamfofa a ɛba agofoɔ no ntam bere a dwom no yɛ kɛse no.',
        'Ɛyɛ agorɔ a ɛne sukuu bɛɛle tu kwan: ɛnhia nnoɔma biara gye nnamfofoɔ a wɔwɔ anigyeɛ.',
      ],
    },
    ga: {
      title: 'Ampe: Lala kɛ Nyɛmimɛi Ekomefeemɔ',
      tag: 'Gbɔmɔtso & Lala Nyamɔ',
      excerpt: 'Dɛŋkpemɔ, lala kɛ tsitsimɔ yɛ naanyobɔɔ mli.',
      quote: 'Lala lɛ toɔ be; naji lɛ buɔ poiti.',
      body: [
        'Ampe jeɔ shishi kɛ dɛŋkpemɔ kɛ lala. Mɛi enyɔ lɛ tsoɔ kɛ naji baa hiɛ yɛ naagbee lala lɛ nɔ.',
        'Kɛ naji lɛ kpe lɛ, anáa poiti, shi miishɛɛ kpeeteŋkpele lɛ ji naanyobɔɔ kɛ ekomefeemɔ ni baa gbekɛbii lɛ ateŋ.',
        'Nyamɔ nɛɛ ehiaaa nibii ko gbeele, ja naanyomɛi kɛ miishɛɛ pɛ.',
      ],
    },
    ha: {
      title: 'Ampe: Kida da Kaunar \'Yan Uwa Mata',
      tag: 'Motsa Jiki da Waƙa',
      excerpt: 'Tafa hannu, waka da tsalle mai kayatarwa a bugun karshe.',
      quote: 'Waka ke rike lokaci; kafa kuma ke rike maki.',
      body: [
        'Wasan Ampe yana farawa ne da wakar baka. Yan wasa biyu suna tafa hannu cikin kida har zuwa bugun karshe, inda kowannensu zai yi tsalle ya jefa kafa gaba.',
        'Daidaiton kafa yana ba da maki daya, amma babban abin alfahari shine kusanci da kaunar da ke karuwa tsakanin yan wasa yayin da wakar ke kara sauri.',
        'Wasa ne da ba ya bukatar wani kayan aiki, abokai da nishadi kawai ake bukata a tsakar gida ko makaranta.',
      ],
    },
  },
  'pilolo-call': {
    tw: {
      title: 'Pilolo: Ga Tete Adanmudeɛ Agorɔ',
      tag: 'Mmofra Adanmudeɛ',
      excerpt: 'Anwummere han, adeɛ a ahunta, ne adanmudeɛ a mmofra retu mmirika.',
      quote: 'Ɛhye, ɛrehye pa ara, ɛnwono: adanmudeɛ no rekasa.',
      body: [
        'Wɔ Pilolo mu no, akwadaa baako de biribi ketewa sie bere a afoforo abu wɔn ani, na afei ahwehwɛ no hyɛ aseɛ.',
        'Nea ɔsieeɛ no kura tumi sɛ ɔbɛka "ɛhye" anaa "ɛnwono", enti asõ a wɔde tie no ho hia te sɛ ani a wɔde hwɛ.',
        'Sɛ wɔbɔ Pilolo anwummere a, ɛdane fie gyinabea no nyinaa kɔ baabi a obiara bom di anigyeɛ.',
      ],
    },
    ga: {
      title: 'Pilolo: Shia Kpo Nɔ Ga Blema Nyamɔ',
      tag: 'Gbekɛbii Ashia Kpo',
      excerpt: 'Gbɛkɛ la, nibii ni ateɔ, kɛ shia kpo ni eyi kɛ gbekɛbii anaji.',
      quote: 'Edɔ, edɔ waa, egbɔ: shia kpo lɛ miagba sane.',
      body: [
        'Yɛ Pilolo mli lɛ gbekɛ kome teɔ tɛ loo nibii ko be ni mɛi krokomɛi eŋa amɛhiɛ, ni kɛkɛ lɛ taomɔ lɛ jeɔ shishi.',
        'Mɔ ni teɔ lɛ pɛ baanyɛ awie kɛɛ "edɔ" loo "egbɔ", nohewɔ lɛ toiboo he hiaa tamɔ hiɛ aŋmɛmɔ.',
        'Kɛ afeɔ Pilolo yɛ gbɛkɛ lɛ, ehãa shia kpo lɛ fɛɛ batsɔɔ miishɛɛ he hã wekui.',
      ],
    },
    ha: {
      title: 'Pilolo: Kiran Tsakar Gida na Mutanen Ga',
      tag: 'Tsakar Gidan Yara',
      excerpt: 'Hasken magariba, abin da aka boye, da tsakar gida cike da saurin neman nasara.',
      quote: 'Da dumi, yana kara zafi, yayi sanyi: muryar jagora na shiryarwa.',
      body: [
        'A cikin wasan Pilolo, yaro daya zai boye karamin abu yayin da sauran suka rufe idanunsu, sannan a fara bincike.',
        'Mai boyewa zai iya yi musu jagora ne kawai ta hanyar cewa "zafi" (kusa) ko "sanyi" (nesa), don haka sauraro yana da muhimmanci kamar gani.',
        'Yin Pilolo a lokacin faduwar rana yana mayar da tsakar gida wani filin nishadi da kowa ke morewa tare.',
      ],
    },
  },
};

export function getLocalizedStory(s: Story, lang: Language): Story {
  if (lang === 'en') return s;
  const loc = STORIES_I18N[s.id]?.[lang];
  if (!loc) return s;

  return {
    ...s,
    title: loc.title || s.title,
    tag: loc.tag || s.tag,
    excerpt: loc.excerpt || s.excerpt,
    quote: loc.quote || s.quote,
    body: loc.body || s.body,
  };
}

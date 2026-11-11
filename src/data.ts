export type Game = {
  id: string; name: string; category: 'Board & Strategy' | 'Active & Rhythm' | 'Children Courtyard';
  players: string; level: 'Easy' | 'Medium' | 'Hard'; origin: string; format: string; summary: string;
  rules: string[]; history: string; equipment: string[]; glossary: [string, string][];
  play?: string; colors: [string, string];
};
export type Story = { id: string; title: string; tag: string; minutes: number; excerpt: string; quote: string; body: string[]; colors: [string, string] };

// Generated Kente-style artwork used until a curator uploads real photography.
export function art(a: string, b: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient><pattern id='k' width='48' height='48' patternUnits='userSpaceOnUse'><path d='M0 24h48M24 0v48' stroke='#F7D070' stroke-opacity='.2' stroke-width='6'/><rect x='17' y='17' width='14' height='14' fill='#E5A93C' fill-opacity='.28' transform='rotate(45 24 24)'/></pattern></defs><rect width='800' height='450' fill='url(#g)'/><rect width='800' height='450' fill='url(#k)'/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export const GAMES: Game[] = [
  { id: 'oware', name: 'Oware', category: 'Board & Strategy', players: '2 players', level: 'Hard', origin: 'Akan, Ghana', format: 'Two-player seed-sowing board game',
    summary: 'A seed-sowing game of counting, foresight and patience, played across two rows of six pits.',
    rules: ['The board has two rows of six pits. Every pit starts with four seeds, 48 in all.', 'Each player owns the row nearest them and sits opposite their rival.', 'On your turn, lift every seed from one of your pits and sow them one by one into the next pits, anticlockwise.', 'If your last seed lands in an opponent pit that now holds two or three seeds, you capture them, and may keep capturing backwards through pits that also hold two or three.', 'You must give your opponent a move whenever you can.', 'The first player to capture 25 or more seeds wins.'],
    history: 'Oware is among the best-known mancala-family games in West Africa and is closely associated with Akan communities. Elders often describe it as a game that teaches calm and calculation.',
    equipment: ['Carved hardwood board with two rows of six pits', '48 playing seeds (oware aba), traditionally grey nickernut seeds', 'Two storage bowls for captured seeds'],
    glossary: [['Oware', 'the game'], ['Oware aba', 'the playing seeds'], ['Nana', 'a respectful title for an elder']], colors: ['#3a2410', '#8a5a1c'] },
  { id: 'ampe', name: 'Ampe', category: 'Active & Rhythm', players: '2 or more', level: 'Medium', origin: 'Ghana', format: 'Clap, chant and jump',
    summary: 'A rhythm and reflex game where two players clap, jump and throw a leg forward, hoping to match.',
    rules: ['Two players face each other and clap in time with a chant.', 'On the final beat both jump and throw one leg forward.', 'If the two legs match (left with left, right with right), the attacker scores a point.', 'If the legs differ, no point is scored. Players swap the attacker role each round.', 'Play to a set number of rounds. Highest score wins.'],
    history: 'Ampe is played in school yards and compounds, often by girls, and is as much about song and sisterhood as it is about scoring.',
    equipment: ['Open flat ground', 'A chant and clapping hands'], glossary: [['Ampe', 'the clap-and-jump game']], play: '/play-ampe', colors: ['#10432a', '#1F9D55'] },
  { id: 'pilolo', name: 'Pilolo', category: 'Children Courtyard', players: '3 or more', level: 'Easy', origin: 'Ga, Ghana', format: 'Hide and seek with a hidden token',
    summary: 'A courtyard search game: one player hides a token and the others hunt for it.',
    rules: ['One player hides a small token somewhere in the courtyard while the others look away.', 'The seekers search, guided only by calls of warm and cold.', 'The first seeker to find the token wins and hides it next.'],
    history: 'Pilolo is remembered as a Ga courtyard game, played in the cool of the evening when neighbours gather.',
    equipment: ['A small token such as a pebble or bead', 'A courtyard or open yard'], glossary: [['Pilolo', 'the hide-and-find game']], play: '/play-pilolo', colors: ['#4a1219', '#c0392b'] },
  { id: 'chaskele', name: 'Chaskele', category: 'Children Courtyard', players: '2 teams', level: 'Medium', origin: 'Ghana', format: 'Street cricket with a carved stick',
    summary: 'Street cricket played with a carved stick and a crushed milk tin for a wicket.',
    rules: ['A pitcher throws a ball toward a batter guarding a tin wicket.', 'The batter swings the carved stick and scores runs if they connect.', 'If the ball knocks the tin down, the batter is out.', 'Teams swap roles after three outs.'],
    history: 'Chaskele grew on streets and school grounds where a stick, a ball and a tin were all a team needed.',
    equipment: ['Carved wooden stick', 'Crushed milk tin as the wicket', 'A rubber or cloth ball'], glossary: [['Chaskele', 'street cricket']], play: '/play-chaskele', colors: ['#2c261f', '#E5A93C'] },
  { id: 'dame', name: 'Dame', category: 'Board & Strategy', players: '2 players', level: 'Medium', origin: 'Ghana', format: 'Draughts on a chequered board',
    summary: 'Ghana’s version of draughts, played on tables under shade trees and outside shops.',
    rules: ['Each player begins with 12 pieces on dark squares.', 'Pieces move diagonally forward one square.', 'Jump over an opponent piece to capture it. Captures are compulsory.', 'A piece reaching the far row is crowned and may move backwards.', 'Capture or block every opposing piece to win.'],
    history: 'Dame is a social game. Spectators gather and quietly argue over every move.',
    equipment: ['Chequered board', '24 pieces in two colours, often bottle caps'], glossary: [['Dame', 'draughts']], colors: ['#1C1914', '#6b5d49'] },
  { id: 'ludo', name: 'Ludo', category: 'Board & Strategy', players: '2 to 4 players', level: 'Easy', origin: 'Played widely in Ghana', format: 'Dice and race board',
    summary: 'A dice race that fills family living rooms with laughter and friendly rivalry.',
    rules: ['Each player has four tokens in their home corner.', 'Roll a six to bring a token out.', 'Move tokens around the board by the dice total.', 'Landing on an opponent sends their token home.', 'Get all four tokens to the centre first to win.'],
    history: 'Ludo is a family favourite, easy to learn and loud to play.',
    equipment: ['Ludo board', 'Four tokens per player', 'One die'], glossary: [['Ludo', 'the dice race']], colors: ['#0f2a4a', '#2f6fbf'] },
];

export const STORIES: Story[] = [
  { id: 'oware-roots', title: 'The Akan Roots of Oware', tag: 'Board & Strategy', minutes: 4, colors: ['#3a2410', '#8a5a1c'],
    excerpt: 'How a board of twelve pits became a school for patience.',
    quote: 'Count before you sow.',
    body: ['Oware is played across Akan communities as more than a pastime. Many elders treat the board as a quiet teacher: every move spends seeds you cannot take back.', 'The game rewards counting ahead. A seed sown carelessly feeds your opponent, while a patient move can set up a capture several turns later.', 'Families often keep a board in a shaded corner of the compound, and learning to play is a way for children to sit beside their elders.'] },
  { id: 'ampe-rhythm', title: 'Ampe: Rhythm & Sisterhood', tag: 'Active & Rhythm', minutes: 3, colors: ['#10432a', '#1F9D55'],
    excerpt: 'Clapping, chanting and a leap of faith on the final beat.',
    quote: 'The song keeps time; the feet keep score.',
    body: ['Ampe begins with a chant. Two players clap in rhythm until the final beat, when each jumps and throws a leg forward.', 'A matching leg earns a point, but the real prize is the closeness that grows between players as the song speeds up.', 'It is a game that travels with a school bell: it needs no equipment, only friends.'] },
  { id: 'pilolo-call', title: 'Pilolo: The Ga Call of the Courtyard', tag: 'Children Courtyard', minutes: 3, colors: ['#4a1219', '#c0392b'],
    excerpt: 'Evening light, a hidden token, and a courtyard full of searching feet.',
    quote: 'Warm, warmer, cold: the courtyard speaks.',
    body: ['In Pilolo one child hides a small token while the others look away, and then the search begins.', 'The hider can only guide with calls of warm and cold, so listening matters as much as looking.', 'Played at dusk, Pilolo turns a shared yard into a map that everyone reads together.'] },
];

export const ELDER_PROMPTS = ['What is the math behind Oware?', 'What are the chants in Ampe?', 'How do I play Pilolo?', 'Tell me about Chaskele'];

const FALLBACK: { k: string[]; a: string }[] = [
  { k: ['math', 'count', 'strategy', 'win'], a: 'In Oware every move is arithmetic. You count how far your seeds will travel and where the last one lands. Aim to leave your opponent pits holding one or two seeds, because those become captures. Count twice, sow once.' },
  { k: ['ampe', 'chant', 'clap', 'jump'], a: 'Ampe is played to a clapping chant that speeds up. On the last beat both players jump and throw a leg. If the legs match, the attacker scores. Different villages sing different verses, so ask the elders where you are.' },
  { k: ['pilolo', 'hide', 'token'], a: 'Pilolo is a courtyard game. One player hides a small token and the others search, guided only by calls of warm and cold. Listen well: the hider’s voice is your map.' },
  { k: ['chaskele', 'cricket', 'stick', 'tin'], a: 'Chaskele is street cricket. A carved stick is the bat and a crushed milk tin is the wicket. Time your swing as the ball arrives and you will send it flying.' },
  { k: ['dame', 'draught', 'checker'], a: 'Dame is draughts. Move diagonally, jump to capture, and crown pieces that reach the far row. Watch the old men play under the tree: they see six moves ahead.' },
  { k: ['ludo', 'dice'], a: 'Ludo is a race. A six brings a token out, and landing on a rival sends them home. Patience, and a little luck, wins the day.' },
  { k: ['oware', 'seed', 'board'], a: 'Oware has twelve pits and forty-eight seeds. You lift one pit, sow anticlockwise, and capture when your last seed makes a pit of two or three. It is the game of patience.' },
];
export function elderFallback(q: string) {
  const s = q.toLowerCase();
  const hit = FALLBACK.find(f => f.k.some(k => s.includes(k)));
  return hit ? hit.a : 'Akwaaba, my child. Ask me about Oware, Ampe, Pilolo, Chaskele, Dame or Ludo, and I will share what I know of the old courtyards.';
}

export { getLocalizedGame } from './gamesI18n';

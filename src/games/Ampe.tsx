import { useEffect, useRef, useState } from 'react';
import { beep } from '../hooks';

const OPPS = ['Abena', 'Efua', 'Akosua'];
const ROUNDS = 7;
type Leg = 'L' | 'R';

export default function Ampe() {
  const [opp, setOpp] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState({ you: 0, opp: 0 });
  const [beat, setBeat] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'count' | 'reveal'>('idle');
  const [res, setRes] = useState('');
  const pick = useRef<Leg | null>(null);
  const [chosen, setChosen] = useState<Leg | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const attacker = round % 2 === 1 ? 'you' : 'opp'; // round index is 1-based once started
  function choose(l: Leg) { if (phase === 'count') { pick.current = l; setChosen(l); beep(660, 60); } }
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') choose('L'); if (e.key === 'ArrowRight') choose('R'); };
    addEventListener('keydown', f); return () => removeEventListener('keydown', f);
  });

  function start() {
    const r = round + 1;
    setRound(r); setPhase('count'); setRes(''); pick.current = null; setChosen(null);
    [1, 2, 3].forEach(i => timers.current.push(window.setTimeout(() => { setBeat(i); beep(380 + i * 60, 90); }, i * 650)));
    timers.current.push(window.setTimeout(() => {
      const theirs: Leg = Math.random() < 0.5 ? 'L' : 'R';
      const mine = pick.current;
      const atk = r % 2 === 1 ? 'you' : 'opp';
      const match = mine === theirs;
      setPhase('reveal'); setBeat(4);
      if (!mine) setRes('You did not choose a leg in time.');
      else setRes(`You threw ${mine === 'L' ? 'left' : 'right'}, ${opp} threw ${theirs === 'L' ? 'left' : 'right'}. ${match ? (atk === 'you' ? 'Match! You score.' : `Match! ${opp} scores.`) : 'No match.'}`);
      if (match) { beep(880, 250); setScore(s => ({ ...s, [atk]: s[atk as 'you' | 'opp'] + 1 })); } else beep(200, 200, 'sawtooth');
    }, 4 * 650));
  }

  if (!opp) return (
    <div className="max-w-md mx-auto px-5 py-10 space-y-4">
      <h1 className="font-display text-3xl">Play Ampe</h1>
      <p className="text-[var(--mute)]">Choose an opponent.</p>
      {OPPS.map(o => <button key={o} className="btn glass w-full justify-center" onClick={() => setOpp(o)}>{o}</button>)}
    </div>
  );
  const over = round >= ROUNDS && phase === 'reveal';
  return (
    <div className="max-w-md mx-auto px-5 py-10 space-y-5 text-center">
      <h1 className="font-display text-3xl">Ampe vs {opp}</h1>
      <p>You {score.you} : {score.opp} {opp} · Round {Math.max(round, 1)} of {ROUNDS}</p>
      <p className="text-[var(--mute)]">{phase === 'idle' ? `Round ${round + 1}: ${(round + 1) % 2 === 1 ? 'you attack' : `${opp} attacks`}.` : phase === 'count' ? 'Clap ' + '👏'.repeat(Math.max(beat, 1)) + ' Pick a leg before the last beat.' : res}</p>
      <div className="grid grid-cols-2 gap-3">
        {(['L', 'R'] as Leg[]).map(l => <button key={l} className="btn glass justify-center py-6 text-lg" style={chosen === l ? { background: 'var(--gold)', color: '#1a1405' } : {}} onClick={() => choose(l)} disabled={phase !== 'count'}>{l === 'L' ? 'Left leg' : 'Right leg'}</button>)}
      </div>
      {over ? <><p className="font-display text-2xl">{score.you === score.opp ? 'A draw' : score.you > score.opp ? 'You win!' : `${opp} wins`}</p><button className="btn btn-gold" onClick={() => { setRound(0); setScore({ you: 0, opp: 0 }); setPhase('idle'); }}>Play again</button></>
        : phase !== 'count' && <button className="btn btn-gold" onClick={start}>{round === 0 ? 'Start' : 'Next round'}</button>}
      <p className="text-xs text-[var(--mute)]">Keyboard: left and right arrow keys.</p>
    </div>
  );
}

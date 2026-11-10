import { useEffect, useState } from 'react';
import { beep } from '../hooks';

const N = 5, TIME = 30;
const rnd = () => Math.floor(Math.random() * N * N);
const dist = (a: number, b: number) => Math.abs((a % N) - (b % N)) + Math.abs(Math.floor(a / N) - Math.floor(b / N));

export default function Pilolo() {
  const [token, setToken] = useState(rnd);
  const [tried, setTried] = useState<Record<number, string>>({});
  const [left, setLeft] = useState(TIME);
  const [state, setState] = useState<'play' | 'won' | 'lost'>('play');
  useEffect(() => {
    if (state !== 'play') return;
    const t = setInterval(() => setLeft(l => { if (l <= 1) { setState('lost'); beep(200, 300, 'sawtooth'); return 0; } return l - 1; }), 1000);
    return () => clearInterval(t);
  }, [state]);
  function search(i: number) {
    if (state !== 'play' || tried[i]) return;
    const d = dist(i, token);
    if (d === 0) { setState('won'); beep(880, 300); setTried(t => ({ ...t, [i]: '🟡' })); return; }
    const w = d <= 1 ? 'Hot' : d <= 3 ? 'Warm' : 'Cold';
    beep(w === 'Hot' ? 700 : w === 'Warm' ? 500 : 300, 90);
    setTried(t => ({ ...t, [i]: w }));
  }
  const reset = () => { setToken(rnd()); setTried({}); setLeft(TIME); setState('play'); };
  const last = Object.values(tried).slice(-1)[0];
  return (
    <div className="max-w-md mx-auto px-5 py-10 space-y-4 text-center">
      <h1 className="font-display text-3xl">Play Pilolo</h1>
      <p className="font-display text-2xl text-[var(--gold)]">{state === 'play' ? 'Pilolo!' : state === 'won' ? 'You found it!' : 'Time is up'}</p>
      <p>Time left: {left}s {last && state === 'play' ? `· ${last}` : ''}</p>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: N * N }, (_, i) => <button key={i} className="cell" aria-label={`Cell ${i + 1}`} onClick={() => search(i)} style={tried[i] === 'Hot' ? { background: '#c0392b' } : tried[i] === 'Warm' ? { background: '#E5A93C', color: '#1a1405' } : tried[i] === 'Cold' ? { background: '#0f2a4a' } : state === 'lost' && i === token ? { background: 'var(--gold)' } : {}}>{tried[i] === '🟡' ? '🟡' : state === 'lost' && i === token ? '🟡' : ''}</button>)}
      </div>
      <p className="text-sm text-[var(--mute)]">Tap a square. Hot means one step away, warm is close, cold is far.</p>
      {state !== 'play' && <button className="btn btn-gold" onClick={reset}>Hide it again</button>}
    </div>
  );
}

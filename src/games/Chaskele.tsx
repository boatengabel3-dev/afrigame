import { useEffect, useRef, useState } from 'react';
import { beep } from '../hooks';

const BALLS = 6, ZONE: [number, number] = [0.68, 0.82];

export default function Chaskele() {
  const [ball, setBall] = useState(0);
  const [runs, setRuns] = useState(0);
  const [outs, setOuts] = useState(0);
  const [pos, setPos] = useState(0);
  const [flying, setFlying] = useState(false);
  const [msg, setMsg] = useState('Press Pitch to begin.');
  const raf = useRef(0), t0 = useRef(0), dur = useRef(1400), swung = useRef(false);

  function pitch() {
    if (flying || ball >= BALLS) return;
    dur.current = 1000 + Math.random() * 700; swung.current = false; t0.current = performance.now(); setFlying(true); setMsg('Swing!');
    const tick = (n: number) => {
      const p = (n - t0.current) / dur.current;
      setPos(Math.min(p, 1.05));
      if (p < 1.05) raf.current = requestAnimationFrame(tick);
      else { if (!swung.current) finish(null); }
    };
    raf.current = requestAnimationFrame(tick);
  }
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  function finish(p: number | null) {
    cancelAnimationFrame(raf.current); setFlying(false); setBall(b => b + 1);
    if (p === null || p < ZONE[0] - 0.08 || p > ZONE[1] + 0.08) { setOuts(o => o + 1); setMsg('The tin falls! Out.'); beep(180, 250, 'sawtooth'); return; }
    const d = Math.abs(p - (ZONE[0] + ZONE[1]) / 2);
    const r = d < 0.02 ? 6 : d < 0.05 ? 4 : d < 0.08 ? 2 : 1;
    setRuns(x => x + r); setMsg(`Crack! ${r} run${r > 1 ? 's' : ''}.`); beep(500 + r * 80, 160);
  }
  function swing() { if (!flying) return; swung.current = true; finish(pos); }
  useEffect(() => { const f = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); swing(); } }; addEventListener('keydown', f); return () => removeEventListener('keydown', f); });
  const done = ball >= BALLS;
  return (
    <div className="max-w-lg mx-auto px-5 py-10 space-y-5 text-center">
      <h1 className="font-display text-3xl">Play Chaskele</h1>
      <p>Runs {runs} · Outs {outs} · Ball {Math.min(ball + (flying ? 1 : 0), BALLS)} of {BALLS}</p>
      <div className="glass rounded-2xl relative h-24 overflow-hidden">
        <div className="absolute top-0 bottom-0" style={{ left: `${ZONE[0] * 100}%`, width: `${(ZONE[1] - ZONE[0]) * 100}%`, background: 'rgba(31,157,85,.35)' }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full" style={{ left: `${Math.min(pos, 1) * 94}%`, background: 'var(--gold)', opacity: flying ? 1 : 0.3 }} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl" aria-hidden>🥫</span>
      </div>
      <p className="text-[var(--mute)]" role="status">{done ? `Innings over: ${runs} runs.` : msg}</p>
      <div className="flex gap-3 justify-center">
        {!done && <button className="btn btn-gold" onClick={pitch} disabled={flying}>Pitch</button>}
        {!done && <button className="btn glass" onClick={swing} disabled={!flying}>Swing (space)</button>}
        {done && <button className="btn btn-gold" onClick={() => { setBall(0); setRuns(0); setOuts(0); setPos(0); setMsg('Press Pitch to begin.'); }}>Play again</button>}
      </div>
    </div>
  );
}

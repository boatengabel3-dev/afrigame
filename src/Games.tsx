import { useState, Fragment } from 'react';
import { X } from 'lucide-react';
import { GAMES, Game, art } from './data';
import { go, useAssetsCtx } from './hooks';

const CATS = ['All Games', 'Board & Strategy', 'Active & Rhythm', 'Children Courtyard'];

function Modal({ g, img, onClose }: { g: Game; img: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md overflow-y-auto" onClick={onClose}>
      <div className="glass rounded-3xl max-w-2xl mx-auto my-6 overflow-hidden" onClick={e => e.stopPropagation()} role="dialog" aria-label={g.name}>
        <div className="relative">
          <img src={img} alt={g.name} className="h-56 w-full object-cover sepia" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.7))' }} />
          <button onClick={onClose} aria-label="Close" className="btn absolute top-3 right-3 glass"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-5">
          <h2 className="font-display text-3xl">{g.name}</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="pill">Origin: {g.origin}</span><span className="pill">Format: {g.format}</span><span className="pill">Mastery: {g.level}</span>
          </div>
          <section><h3 className="font-bold mb-2">Rules of play</h3><ol className="list-decimal pl-5 space-y-1 text-[var(--mute)]">{g.rules.map((r, i) => <li key={i}>{r}</li>)}</ol></section>
          <section><h3 className="font-bold mb-2">History and oral tradition</h3><p className="text-[var(--mute)]">{g.history}</p></section>
          <section><h3 className="font-bold mb-2">Equipment</h3><ul className="list-disc pl-5 text-[var(--mute)]">{g.equipment.map(e => <li key={e}>{e}</li>)}</ul></section>
          <section><h3 className="font-bold mb-2">Glossary</h3><dl className="grid grid-cols-[auto_1fr] gap-x-4 text-[var(--mute)]">{g.glossary.map(([t, m], i) => <Fragment key={`${t}-${i}`}><dt className="font-bold text-[var(--gold)]">{t}</dt><dd>{m}</dd></Fragment>)}</dl></section>
          {g.play && <button className="btn btn-gold" onClick={() => go(g.play!)}>Launch Interactive Game</button>}
        </div>
      </div>
    </div>
  );
}

export default function Games() {
  const { assets } = useAssetsCtx();
  const [cat, setCat] = useState(CATS[0]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Game | null>(null);
  const list = GAMES.filter(g => (cat === CATS[0] || g.category === cat) && [g.name, g.origin, g.summary, ...g.rules].join(' ').toLowerCase().includes(q.toLowerCase()));
  const img = (g: Game) => assets.games[g.id] || art(...g.colors);
  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="font-display text-4xl mb-6">Games Sanctuary</h1>
      <div className="flex flex-wrap gap-2 mb-4">{CATS.map(c => <button key={c} className="pill" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}</div>
      <input className="field mb-8" placeholder="Search by game name, origin or rules" value={q} onChange={e => setQ(e.target.value)} aria-label="Search games" />
      {list.length === 0 && <p className="text-[var(--mute)]">No games match. Clear the search or pick another category.</p>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(g => (
          <button key={g.id} onClick={() => setOpen(g)} className="glass rounded-3xl overflow-hidden text-left">
            <img src={img(g)} alt={g.name} className="h-40 w-full object-cover sepia" />
            <div className="p-4">
              <div className="flex gap-2 text-xs mb-2"><span className="pill">{g.category}</span><span className="pill">{g.players}</span><span className="pill">{g.level}</span></div>
              <h3 className="font-display text-xl">{g.name}</h3><p className="text-sm text-[var(--mute)] mt-1">{g.summary}</p>
            </div>
          </button>
        ))}
      </div>
      {open && <Modal g={open} img={img(open)} onClose={() => setOpen(null)} />}
    </div>
  );
}

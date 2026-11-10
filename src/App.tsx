import { useEffect, useState } from 'react';
import { Home as HomeIcon, Gamepad2, BookOpen, MessageCircle, Lock, Sun, Moon, Palette } from 'lucide-react';
import { AssetsCtx, go, useAssets, useAssetsCtx, useRoute } from './hooks';
import { GAMES, art } from './data';
import Games from './Games';
import Stories from './Stories';
import Elder from './Elder';
import Admin from './Admin';
import Ampe from './games/Ampe';
import Pilolo from './games/Pilolo';
import Chaskele from './games/Chaskele';

const THEMES = [['dark', 'Dark Heritage', Moon], ['ivory', 'Ivory Sun', Sun], ['kente', 'Royal Kente', Palette]] as const;
const NAV = [['/', 'Home', HomeIcon], ['/games', 'Games', Gamepad2], ['/stories', 'Stories', BookOpen], ['/elder', 'Elder AI', MessageCircle]] as const;

function Home() {
  const { assets } = useAssetsCtx();
  const hero = assets.hero || art('#2C261F', '#6b3b12');
  return (
    <div>
      <section className="relative min-h-[78vh] flex items-end overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover sepia" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.35) 95%), linear-gradient(to top, rgba(0,0,0,.35), transparent 60%)' }} />
        <div className="relative max-w-5xl mx-auto px-5 pb-16 pt-32 w-full">
          <span className="glass inline-block rounded-full px-4 py-1.5 text-sm mb-5">🇬🇭 Akwaaba · Ghana Traditional Games</span>
          <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] max-w-3xl">Play Ghana’s Soul. Ancient Rules. Living Courtyards.</h1>
          <p className="mt-5 max-w-xl text-[var(--mute)]">A living archive of Oware, Ampe, Pilolo, Chaskele, Dame and Ludo, with games you can play, stories you can read and an elder you can ask.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="btn btn-gold" onClick={() => go('/games')}>Explore Games Sanctuary</button>
            <button className="btn glass" onClick={() => go('/stories')}>Listen to Heritage Stories</button>
            <button className="btn glass" onClick={() => go('/elder')}>Consult Nana Kwame (AI)</button>
          </div>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-5 py-14 grid gap-5 sm:grid-cols-3">
        {GAMES.filter(g => g.play).map(g => (
          <button key={g.id} onClick={() => go(g.play!)} className="glass rounded-3xl overflow-hidden text-left">
            <img src={assets.games[g.id] || art(...g.colors)} alt={g.name} className="h-40 w-full object-cover sepia" />
            <div className="p-4"><h3 className="font-display text-xl">{g.name}</h3><p className="text-sm text-[var(--mute)] mt-1">{g.summary}</p><p className="text-sm mt-3 text-[var(--gold)] font-bold">Play now</p></div>
          </button>
        ))}
      </section>
    </div>
  );
}

export default function App() {
  const route = useRoute();
  const a = useAssets();
  const [theme, setTheme] = useState(() => localStorage.getItem('gg-theme') || 'dark');
  const [loading, setLoading] = useState(true);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('gg-theme', theme); }, [theme]);
  useEffect(() => { setLoading(true); window.scrollTo(0, 0); const t = setTimeout(() => setLoading(false), 450); return () => clearTimeout(t); }, [route]);
  const [, label, Icon] = THEMES.find(t => t[0] === theme) || THEMES[0];
  const next = () => setTheme(THEMES[(THEMES.findIndex(t => t[0] === theme) + 1) % 3][0]);

  let page = <Home />;
  if (route === '/games') page = <Games />;
  else if (route === '/stories') page = <Stories />;
  else if (route === '/elder') page = <Elder />;
  else if (route === '/admin') page = <Admin />;
  else if (route === '/play-ampe') page = <Ampe />;
  else if (route === '/play-pilolo') page = <Pilolo />;
  else if (route === '/play-chaskele') page = <Chaskele />;

  return (
    <AssetsCtx.Provider value={a}>
      <div className="kente" />
      <header className="glass sticky top-0 z-40 hidden md:block">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <button onClick={() => go('/')} className="font-display text-xl text-[var(--gold)]">Ghana Games</button>
          <nav className="flex items-center gap-1">
            {NAV.map(([p, n]) => <button key={p} onClick={() => go(p)} className="btn border-transparent" aria-current={route === p ? 'page' : undefined} style={route === p ? { color: 'var(--gold)' } : {}}>{n}</button>)}
            <button className="btn" onClick={next} title="Switch theme"><Icon size={16} />{label}</button>
          </nav>
        </div>
      </header>
      <header className="md:hidden flex items-center justify-between px-5 h-14">
        <span className="font-display text-lg text-[var(--gold)]">Ghana Games</span>
        <button className="btn" onClick={next} aria-label="Switch theme"><Icon size={16} /></button>
      </header>
      <main className="pb-28 md:pb-10 min-h-[80vh]">{page}</main>
      <footer className="text-center text-sm text-[var(--mute)] pb-24 md:pb-8 flex items-center justify-center gap-3">
        <span>Ghana Games · preserving play</span>
        <button onClick={() => go('/admin')} aria-label="Curator console" className="p-2"><Lock size={14} /></button>
      </footer>
      <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 glass rounded-3xl grid grid-cols-4">
        {NAV.map(([p, n, I]) => <button key={p} onClick={() => go(p)} className="py-3 flex flex-col items-center text-xs gap-1 min-h-[56px]" style={route === p ? { color: 'var(--gold)' } : {}}><I size={20} />{n}</button>)}
      </nav>
      {loading && <div className="fixed inset-0 z-50 grid place-items-center" style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(30px)' }}><div className="emblem" role="status" aria-label="Loading" /></div>}
    </AssetsCtx.Provider>
  );
}

import { useEffect, useState } from 'react';
import { Home as HomeIcon, Gamepad2, BookOpen, MessageCircle, Lock, Sun, Moon, Palette, ArrowRight, Sparkles } from 'lucide-react';
import { AssetsCtx, go, useAssets, useAssetsCtx, useRoute } from './hooks';
import { art } from './data';
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
      <section className="relative min-h-[82vh] flex items-end overflow-hidden">
        {/* Background Image with theme-specific blend & filters */}
        <img src={hero} alt="" className="hero-image absolute inset-0 w-full h-full" />

        {/* Ambient Theme Color Glows matching the active theme palette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 80% 25%, color-mix(in srgb, var(--orb1) 40%, transparent) 0%, transparent 70%), radial-gradient(ellipse 55% 45% at 20% 75%, color-mix(in srgb, var(--orb2) 35%, transparent) 0%, transparent 70%)',
          }}
        />

        {/* Unified radial & vertical gradient overlay that blends seamlessly into var(--bg) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 85% 75% at 50% 30%, transparent 20%, color-mix(in srgb, var(--bg) 60%, transparent) 65%, var(--bg) 100%), linear-gradient(to bottom, color-mix(in srgb, var(--bg) 20%, transparent) 0%, color-mix(in srgb, var(--bg) 50%, transparent) 55%, var(--bg) 100%)',
          }}
        />

        {/* Smooth bottom gradient fade to guarantee seamless transition to games section */}
        <div
          className="absolute inset-x-0 bottom-0 h-36 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, var(--bg))',
          }}
        />
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
      {/* Cultural Sanctuary Pillars */}
      <section className="max-w-5xl mx-auto px-5 py-14 space-y-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="glass rounded-3xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--bg2)] text-[var(--gold)] border border-[var(--line)]">
                <Gamepad2 size={24} />
              </div>
              <h3 className="font-display text-2xl">Courtyard Sanctuary</h3>
              <p className="text-sm text-[var(--mute)] leading-relaxed">
                Step into authentic Ghanaian play. From the mathematical foresight of Akan Oware to the clapping jumps of Ampe and the courtyard search of Pilolo.
              </p>
            </div>
            <button className="btn btn-gold w-full justify-center text-sm" onClick={() => go('/games')}>
              Explore Games Sanctuary <ArrowRight size={15} />
            </button>
          </div>

          <div className="glass rounded-3xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--bg2)] text-[var(--gold)] border border-[var(--line)]">
                <BookOpen size={24} />
              </div>
              <h3 className="font-display text-2xl">Heritage Stories</h3>
              <p className="text-sm text-[var(--mute)] leading-relaxed">
                Delve into the oral histories, ancestral folklore, and compound evening traditions behind each game, recorded to preserve living cultural memory.
              </p>
            </div>
            <button className="btn glass w-full justify-center text-sm" onClick={() => go('/stories')}>
              Read Heritage Stories <ArrowRight size={15} />
            </button>
          </div>

          <div className="glass rounded-3xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--bg2)] text-[var(--gold)] border border-[var(--line)]">
                <MessageCircle size={24} />
              </div>
              <h3 className="font-display text-2xl">Nana Kwame (Elder AI)</h3>
              <p className="text-sm text-[var(--mute)] leading-relaxed">
                Ask our virtual compound elder about proverb interpretations, historical etiquette, game rules, and traditional Ghanaian cultural philosophy.
              </p>
            </div>
            <button className="btn glass w-full justify-center text-sm" onClick={() => go('/elder')}>
              Consult the Elder <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Ancestral Proverb & Wisdom Banner */}
        <div className="glass rounded-3xl p-8 sm:p-10 relative overflow-hidden text-center space-y-4 border border-[var(--gold)]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[var(--gold)] bg-[var(--bg2)] border border-[var(--line)]">
            <Sparkles size={13} />
            Akan Proverb · Traditional Wisdom
          </div>
          <blockquote className="font-display text-2xl sm:text-3xl max-w-2xl mx-auto leading-snug">
            “Tikoro nkɔ agyina; nyansa nso nyɛ sika na wɔakyekyere asie.”
          </blockquote>
          <p className="text-sm text-[var(--mute)] max-w-xl mx-auto leading-relaxed">
            “One head does not go into council; and wisdom is not like gold to be hoarded in secret — in our courtyards, games are where fellowship is woven and minds are sharpened together.”
          </p>
        </div>
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

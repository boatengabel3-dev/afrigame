import { useEffect, useState } from 'react';
import { Home as HomeIcon, Gamepad2, BookOpen, MessageCircle, Lock, Sun, Moon, Palette } from 'lucide-react';
import { AssetsCtx, go, useAssets, useAssetsCtx, useRoute } from './hooks';
import { art } from './data';
import { LangProvider, useLang } from './i18n';
import LanguageSwitcher from './components/LanguageSwitcher';
import Games from './Games';
import Stories from './Stories';
import Elder from './Elder';
import Admin from './Admin';
import Ampe from './games/Ampe';
import Pilolo from './games/Pilolo';
import Chaskele from './games/Chaskele';
import { ContentProvider } from './contentContext';

const THEMES = [
  ['very-dark', 'Very Dark', Moon],
  ['dark', 'Dark Heritage', Moon],
  ['ivory', 'Ivory Sun', Sun],
  ['kente', 'Royal Kente', Palette],
] as const;

const NAV = [
  ['/', 'nav_home', HomeIcon],
  ['/games', 'nav_games', Gamepad2],
  ['/stories', 'nav_stories', BookOpen],
  ['/elder', 'nav_elder', MessageCircle],
] as const;

function Home() {
  const { assets } = useAssetsCtx();
  const { t } = useLang();
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
              'radial-gradient(ellipse 60% 50% at 80% 25%, color-mix(in srgb, var(--orb1) 25%, transparent) 0%, transparent 70%), radial-gradient(ellipse 55% 45% at 20% 75%, color-mix(in srgb, var(--orb2) 20%, transparent) 0%, transparent 70%)',
          }}
        />

        {/* Soft atmospheric gradient overlay that keeps the background image quite visible while ensuring contrast */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.38) 60%, var(--bg) 100%)',
          }}
        />

        {/* Smooth bottom gradient fade to guarantee seamless transition to games section */}
        <div
          className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, var(--bg))',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-5 pb-20 pt-32 w-full">
          <span className="glass inline-block rounded-full px-4 py-1.5 text-sm mb-5 shadow-md">
            {t('hero_badge')}
          </span>
          <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] max-w-3xl drop-shadow-md text-[var(--ink)]">
            {t('hero_title')}
          </h1>
          <div className="mt-6 max-w-xl glass rounded-2xl p-4 sm:p-5 shadow-lg border border-[var(--glass-edge)]">
            <p className="text-base sm:text-lg leading-relaxed text-[var(--ink)] font-normal">
              {t('hero_desc')}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="btn btn-gold shadow-md" onClick={() => go('/games')}>
              {t('btn_games')}
            </button>
            <button className="btn glass shadow-md" onClick={() => go('/stories')}>
              {t('btn_stories')}
            </button>
            <button className="btn glass shadow-md" onClick={() => go('/elder')}>
              {t('btn_elder')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AppContent() {
  const route = useRoute();
  const a = useAssets();
  const { t } = useLang();
  const [theme, setTheme] = useState(() => localStorage.getItem('gg-theme') || 'very-dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('gg-theme', theme);
  }, [theme]);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    const tTimer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(tTimer);
  }, [route]);

  const [, label, Icon] = THEMES.find(th => th[0] === theme) || THEMES[0];
  const next = () => setTheme(THEMES[(THEMES.findIndex(th => th[0] === theme) + 1) % THEMES.length][0]);

  let page = <Home />;
  if (route === '/games') page = <Games />;
  else if (route === '/stories') page = <Stories />;
  else if (route === '/elder') page = <Elder />;
  else if (route === '/admin') page = <Admin />;
  else if (route === '/play-ampe') page = <Ampe />;
  else if (route === '/play-pilolo') page = <Pilolo />;
  else if (route === '/play-chaskele') page = <Chaskele />;

  const isHome = !['/games', '/stories', '/elder', '/admin', '/play-ampe', '/play-pilolo', '/play-chaskele'].includes(route);

  return (
    <AssetsCtx.Provider value={a}>
      <div className="kente" />
      {/* Desktop Header */}
      <header className="glass sticky top-0 z-40 hidden md:block">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <button onClick={() => go('/')} className="font-display text-xl text-[var(--gold)]">
            {t('app_name')}
          </button>
          <nav className="flex items-center gap-2">
            {NAV.map(([p, transKey]) => (
              <button
                key={p}
                onClick={() => go(p)}
                className="btn border-transparent"
                aria-current={route === p ? 'page' : undefined}
                style={route === p ? { color: 'var(--gold)' } : {}}
              >
                {t(transKey)}
              </button>
            ))}
            <LanguageSwitcher />
            <button className="btn" onClick={next} title={t('switch_theme')}>
              <Icon size={16} />
              {label}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-5 h-14">
        <span className="font-display text-lg text-[var(--gold)]">{t('app_name')}</span>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher compact />
          <button className="btn p-2" onClick={next} aria-label={t('switch_theme')}>
            <Icon size={16} />
          </button>
        </div>
      </header>

      <main className={`min-h-[80vh] ${isHome ? 'pb-10' : 'pb-28 md:pb-10'}`}>{page}</main>

      <footer className={`text-center text-sm text-[var(--mute)] ${isHome ? 'pb-8' : 'pb-24 md:pb-8'} flex items-center justify-center gap-3`}>
        <span>{t('footer_text')}</span>
        <button onClick={() => go('/admin')} aria-label="Curator console" className="p-2">
          <Lock size={14} />
        </button>
      </footer>

      {/* Mobile Bottom Navigation - strictly hidden on home screen only */}
      {!isHome && (
        <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 glass rounded-3xl grid grid-cols-4">
          {NAV.map(([p, transKey, I]) => (
            <button
              key={p}
              onClick={() => go(p)}
              className="py-3 flex flex-col items-center text-xs gap-1 min-h-[56px]"
              style={route === p ? { color: 'var(--gold)' } : {}}
            >
              <I size={20} />
              {t(transKey)}
            </button>
          ))}
        </nav>
      )}

      {loading && (
        <div
          className="fixed inset-0 z-50 grid place-items-center"
          style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(30px)' }}
        >
          <div className="emblem" role="status" aria-label="Loading" />
        </div>
      )}
    </AssetsCtx.Provider>
  );
}

export default function App() {
  return (
    <LangProvider>
      <ContentProvider>
        <AppContent />
      </ContentProvider>
    </LangProvider>
  );
}

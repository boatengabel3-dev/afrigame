import { useState, Fragment } from 'react';
import { X } from 'lucide-react';
import { Game, art, getLocalizedGame } from './data';
import { go, useAssetsCtx } from './hooks';
import { useLang } from './i18n';
import { useContent } from './contentContext';

const CAT_KEYS = [
  { id: 'All Games', key: 'cat_all' },
  { id: 'Board & Strategy', key: 'cat_board' },
  { id: 'Active & Rhythm', key: 'cat_active' },
  { id: 'Children Courtyard', key: 'cat_courtyard' },
];

function Modal({ rawGame, img, onClose }: { rawGame: Game; img: string; onClose: () => void }) {
  const { t, lang } = useLang();
  const g = getLocalizedGame(rawGame, lang);

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
            <span className="pill">{t('origin_label')}: {g.origin}</span>
            <span className="pill">{t('format_label')}: {g.format}</span>
            <span className="pill">{t('mastery_label')}: {g.level}</span>
          </div>
          <section>
            <h3 className="font-bold mb-2">{t('rules_of_play')}</h3>
            <ol className="list-decimal pl-5 space-y-1 text-[var(--mute)]">
              {g.rules.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          </section>
          <section>
            <h3 className="font-bold mb-2">{t('history_tradition')}</h3>
            <p className="text-[var(--mute)]">{g.history}</p>
          </section>
          <section>
            <h3 className="font-bold mb-2">{t('equipment')}</h3>
            <ul className="list-disc pl-5 text-[var(--mute)]">
              {g.equipment.map(e => <li key={e}>{e}</li>)}
            </ul>
          </section>
          <section>
            <h3 className="font-bold mb-2">{t('glossary')}</h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 text-[var(--mute)]">
              {g.glossary.map(([term, meaning], i) => (
                <Fragment key={`${term}-${i}`}>
                  <dt className="font-bold text-[var(--gold)]">{term}</dt>
                  <dd>{meaning}</dd>
                </Fragment>
              ))}
            </dl>
          </section>
          {rawGame.play && (
            <button className="btn btn-gold" onClick={() => go(rawGame.play!)}>
              {t('launch_game')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Games() {
  const { assets } = useAssetsCtx();
  const { games } = useContent();
  const { t, lang } = useLang();
  const [cat, setCat] = useState('All Games');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Game | null>(null);

  const list = games.map(g => ({
    raw: g,
    loc: getLocalizedGame(g, lang),
  })).filter(({ raw, loc }) => {
    const catMatch = cat === 'All Games' || raw.category === cat;
    const searchable = [
      raw.name, raw.origin, raw.summary, ...raw.rules,
      loc.name, loc.origin, loc.summary, ...loc.rules, loc.category
    ].join(' ').toLowerCase();
    return catMatch && searchable.includes(q.toLowerCase());
  });

  const img = (g: Game) => assets.games[g.id] || art(...g.colors);

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="font-display text-4xl mb-6">{t('games_title')}</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {CAT_KEYS.map(c => (
          <button
            key={c.id}
            className="pill"
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
          >
            {t(c.key)}
          </button>
        ))}
      </div>
      <input
        className="field mb-8"
        placeholder={t('search_placeholder')}
        value={q}
        onChange={e => setQ(e.target.value)}
        aria-label={t('search_placeholder')}
      />
      {list.length === 0 && <p className="text-[var(--mute)]">{t('no_games_match')}</p>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(({ raw, loc }) => (
          <button key={raw.id} onClick={() => setOpen(raw)} className="glass rounded-3xl overflow-hidden text-left transition hover:scale-[1.01]">
            <img src={img(raw)} alt={loc.name} className="h-40 w-full object-cover sepia" />
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5 text-xs mb-2">
                <span className="pill">{loc.category}</span>
                <span className="pill">{loc.players}</span>
                <span className="pill">{loc.level}</span>
              </div>
              <h3 className="font-display text-xl">{loc.name}</h3>
              <p className="text-sm text-[var(--mute)] mt-1">{loc.summary}</p>
            </div>
          </button>
        ))}
      </div>
      {open && <Modal rawGame={open} img={img(open)} onClose={() => setOpen(null)} />}
    </div>
  );
}

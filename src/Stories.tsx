import { useState } from 'react';
import { X } from 'lucide-react';
import { Story, art } from './data';
import { useAssetsCtx } from './hooks';
import { useLang } from './i18n';
import { getLocalizedStory } from './storiesI18n';
import { useContent } from './contentContext';

export default function Stories() {
  const { assets } = useAssetsCtx();
  const { stories } = useContent();
  const { t, lang } = useLang();
  const [open, setOpen] = useState<Story | null>(null);
  const img = (s: Story) => assets.stories[s.id] || art(...s.colors);

  const localizedOpen = open ? getLocalizedStory(open, lang) : null;

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="font-display text-4xl mb-2">{t('stories_title')}</h1>
      <p className="text-[var(--mute)] mb-8">{t('stories_subtitle')}</p>
      <div className="grid gap-5 md:grid-cols-3">
        {stories.map(s => {
          const loc = getLocalizedStory(s, lang);
          return (
            <button key={s.id} onClick={() => setOpen(s)} className="glass rounded-3xl overflow-hidden text-left transition hover:scale-[1.01]">
              <img src={img(s)} alt="" className="h-40 w-full object-cover sepia" />
              <div className="p-4">
                <div className="flex gap-2 text-xs mb-2">
                  <span className="pill">{loc.tag}</span>
                  <span className="pill">{loc.minutes} {t('min_read')}</span>
                </div>
                <h3 className="font-display text-xl">{loc.title}</h3>
                <p className="text-sm text-[var(--mute)] mt-1">{loc.excerpt}</p>
              </div>
            </button>
          );
        })}
      </div>
      {localizedOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md overflow-y-auto" onClick={() => setOpen(null)}>
          <article className="glass rounded-3xl max-w-2xl mx-auto my-6 overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={img(localizedOpen)} alt="" className="h-52 w-full object-cover sepia" />
            <div className="p-6 space-y-4 leading-relaxed">
              <button onClick={() => setOpen(null)} className="btn float-right" aria-label="Close"><X size={16} /></button>
              <h2 className="font-display text-3xl">{localizedOpen.title}</h2>
              <blockquote className="border-l-4 pl-4 italic text-xl" style={{ borderColor: 'var(--gold)' }}>{localizedOpen.quote}</blockquote>
              {localizedOpen.body.map((p, i) => <p key={i} className="text-[var(--mute)]">{p}</p>)}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

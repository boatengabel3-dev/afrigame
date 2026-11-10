import { useState } from 'react';
import { X } from 'lucide-react';
import { STORIES, Story, art } from './data';
import { useAssetsCtx } from './hooks';

export default function Stories() {
  const { assets } = useAssetsCtx();
  const [open, setOpen] = useState<Story | null>(null);
  const img = (s: Story) => assets.stories[s.id] || art(...s.colors);
  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="font-display text-4xl mb-2">Heritage Stories</h1>
      <p className="text-[var(--mute)] mb-8">Essays and oral traditions behind the games.</p>
      <div className="grid gap-5 md:grid-cols-3">
        {STORIES.map(s => (
          <button key={s.id} onClick={() => setOpen(s)} className="glass rounded-3xl overflow-hidden text-left">
            <img src={img(s)} alt="" className="h-40 w-full object-cover sepia" />
            <div className="p-4"><div className="flex gap-2 text-xs mb-2"><span className="pill">{s.tag}</span><span className="pill">{s.minutes} min read</span></div>
              <h3 className="font-display text-xl">{s.title}</h3><p className="text-sm text-[var(--mute)] mt-1">{s.excerpt}</p></div>
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md overflow-y-auto" onClick={() => setOpen(null)}>
          <article className="glass rounded-3xl max-w-2xl mx-auto my-6 overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={img(open)} alt="" className="h-52 w-full object-cover sepia" />
            <div className="p-6 space-y-4 leading-relaxed">
              <button onClick={() => setOpen(null)} className="btn float-right" aria-label="Close"><X size={16} /></button>
              <h2 className="font-display text-3xl">{open.title}</h2>
              <blockquote className="border-l-4 pl-4 italic text-xl" style={{ borderColor: 'var(--gold)' }}>{open.quote}</blockquote>
              {open.body.map((p, i) => <p key={i} className="text-[var(--mute)]">{p}</p>)}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

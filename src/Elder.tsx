import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { art } from './data';
import { useAssetsCtx } from './hooks';
import { useLang, getElderFallbackByLang } from './i18n';

type Msg = { role: 'user' | 'elder'; text: string };

export default function Elder() {
  const { assets } = useAssetsCtx();
  const { lang, t, prompts } = useLang();
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    { role: 'elder', text: t('elder_greeting') },
  ]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  // Update initial elder greeting if language changes and no user messages yet
  useEffect(() => {
    setMsgs(prev => {
      if (prev.length === 1 && prev[0].role === 'elder') {
        return [{ role: 'elder', text: t('elder_greeting') }];
      }
      return prev;
    });
  }, [lang]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  async function send(q: string) {
    if (!q.trim() || busy) return;
    const history = [...msgs, { role: 'user' as const, text: q }];
    setMsgs(history);
    setText('');
    setBusy(true);

    let reply = '';

    try {
      const res = await fetch('/api/elder-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.slice(-12),
          language: lang,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.reply) {
        reply = data.reply;
      }
    } catch {
      /* fall through to oral archive */
    }

    const responseText = reply || getElderFallbackByLang(q, lang);
    setMsgs(m => [...m, { role: 'elder', text: responseText }]);
    setBusy(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={assets.avatar || art('#2C261F', '#E5A93C')}
          alt={t('elder_title')}
          className="w-16 h-16 rounded-full object-cover border-2"
          style={{ borderColor: 'var(--gold)' }}
        />
        <div>
          <h1 className="font-display text-3xl">{t('elder_title')}</h1>
          <p className="text-sm text-[var(--mute)]">{t('elder_subtitle')}</p>
        </div>
      </div>
      <div className="glass rounded-3xl p-4 h-[50vh] overflow-y-auto space-y-3" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <span
              className="inline-block rounded-3xl px-4 py-2 max-w-[85%] text-left"
              style={{
                background: m.role === 'user' ? 'var(--gold)' : 'var(--bg3)',
                color: m.role === 'user' ? '#1a1405' : 'var(--ink)',
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
        {busy && <p className="text-sm text-[var(--mute)]">{t('elder_thinking')}</p>}
        <div ref={end} />
      </div>
      <div className="flex flex-wrap gap-2 my-4">
        {prompts.map(p => (
          <button key={p} className="pill" onClick={() => send(p)}>
            {p}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="field"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(text)}
          placeholder={t('elder_input_placeholder')}
          aria-label={t('elder_input_placeholder')}
        />
        <button className="btn btn-gold" onClick={() => send(text)} aria-label="Send">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

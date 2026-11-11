import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLang, LANGUAGES, Language } from '../i18n';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const current = LANGUAGES.find(l => l.id === lang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`btn ${compact ? 'px-2.5 py-1.5 text-xs' : 'text-sm'} border-transparent hover:border-[var(--glass-edge)] flex items-center gap-1.5`}
        aria-label="Select language"
        aria-expanded={open}
      >
        <Globe size={compact ? 14 : 16} className="text-[var(--gold)]" />
        <span className="font-semibold uppercase tracking-wider">{current.id}</span>
        <span className="hidden sm:inline text-xs text-[var(--mute)]">({current.label})</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl glass p-1.5 shadow-2xl z-50 border border-[var(--gold)] animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--mute)] uppercase tracking-wider border-b border-[var(--line)] mb-1">
            Ghana Kasa / Language
          </div>
          {LANGUAGES.map(item => {
            const active = item.id === lang;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setLang(item.id as Language);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition ${
                  active
                    ? 'bg-[var(--gold)] text-[#1a1405] font-bold shadow-md'
                    : 'hover:bg-[var(--bg3)] text-[var(--ink)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{item.flag}</span>
                  <div>
                    <div className="leading-tight">{item.nativeName}</div>
                    <div className={`text-[10px] ${active ? 'text-[#3d2c0b]' : 'text-[var(--mute)]'}`}>
                      {item.label}
                    </div>
                  </div>
                </div>
                {active && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

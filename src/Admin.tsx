import { useEffect, useRef, useState, Fragment } from 'react';
import {
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  Upload,
  Mail,
  Key,
  Check,
  AlertCircle,
  Database,
  Copy,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  X,
  Gamepad2,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { Game, Story, art } from './data';
import { go, useAssetsCtx, saveLocalAsset } from './hooks';
import { useContent } from './contentContext';
import { supabase } from './lib/supabase';

const PASSCODE = '12341234'; // Curator console gate
const PRESETS: [string, string][] = [
  ['#3a2410', '#8a5a1c'],
  ['#10432a', '#1F9D55'],
  ['#4a1219', '#c0392b'],
  ['#2C261F', '#E5A93C'],
  ['#0f2a4a', '#2f6fbf'],
  ['#1C1914', '#F7D070'],
];

const SQL_INIT = `-- Ghana Games: Run in Supabase SQL Editor
create table if not exists public.admins (email text primary key);

create table if not exists public.site_settings (
  id text primary key check (id = 'site'),
  hero_image text check (char_length(hero_image) <= 2000000),
  elder_avatar text check (char_length(elder_avatar) <= 2000000),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_assets (
  id text primary key check (id ~ '^[a-z0-9_-]{1,40}$'),
  image text not null check (char_length(image) <= 2000000),
  name text check (char_length(name) <= 120),
  category text check (char_length(category) <= 60),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_assets (
  id text primary key check (id ~ '^[a-z0-9_-]{1,40}$'),
  image text not null check (char_length(image) <= 2000000),
  title text check (char_length(title) <= 200),
  updated_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.game_assets enable row level security;
alter table public.story_assets enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
      and coalesce((auth.jwt() -> 'user_metadata' ->> 'email_verified')::boolean, true)
  );
$$;

do $$
declare t text;
begin
  foreach t in array array['site_settings','game_assets','story_assets'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

alter publication supabase_realtime add table public.site_settings, public.game_assets, public.story_assets;
`;

function downscale(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = () => rej(new Error('read'));
    r.onload = () => {
      const img = new Image();
      img.onerror = () => rej(new Error('decode'));
      img.onload = () => {
        const k = Math.min(1, 1440 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.82));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(file);
  });
}

function ArtworkEditor({
  label,
  current,
  canWrite,
  onSave,
  onReset,
}: {
  label: string;
  current?: string;
  canWrite: boolean;
  onSave: (v: string) => Promise<string | null>;
  onReset: () => Promise<string | null>;
}) {
  const [draft, setDraft] = useState('');
  const [url, setUrl] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const shown = draft || current;

  const run = async (f: () => Promise<string | null>, ok: string) => {
    setLoading(true);
    setMsg('');
    try {
      const err = await f();
      setMsg(err ? err : ok);
      if (!err) {
        setDraft('');
        setUrl('');
      }
    } catch (e: any) {
      setMsg(e?.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-4 space-y-3">
      <h3 className="font-bold">{label}</h3>
      <div className="h-36 rounded-lg overflow-hidden border border-[var(--line)]" style={{ background: 'var(--bg3)' }}>
        {shown && <img src={shown} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="flex gap-2">
        <input
          ref={file}
          type="file"
          accept="image/*"
          hidden
          onChange={async e => {
            const f = e.target.files?.[0];
            if (f) {
              try {
                setDraft(await downscale(f));
              } catch {
                setMsg('Error: could not read that image.');
              }
            }
          }}
        />
        <button className="btn" onClick={() => file.current?.click()}>
          <Upload size={14} />
          Upload from device
        </button>
      </div>
      <div className="flex gap-2">
        <input
          className="field text-sm"
          placeholder="https://image-url"
          value={url}
          onChange={e => {
            setUrl(e.target.value);
            setDraft(e.target.value);
          }}
          aria-label="Image URL"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            className="w-9 h-9 rounded-lg border hover:scale-105 transition"
            style={{
              borderColor: 'var(--line)',
              backgroundImage: `url("${art(...p)}")`,
              backgroundSize: 'cover',
            }}
            aria-label={`Preset ${i + 1}`}
            onClick={() => setDraft(art(...p))}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          className="btn btn-gold"
          disabled={!draft || !canWrite || loading}
          onClick={() => run(() => onSave(draft), 'Saved successfully.')}
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
        <button
          className="btn"
          disabled={!canWrite || loading}
          onClick={() => run(onReset, 'Reset to default.')}
        >
          Reset to default
        </button>
      </div>
      {msg && (
        <p className={`text-sm ${msg.startsWith('Error') ? 'text-red-400' : 'text-[var(--gold)]'}`} role="status">
          {msg}
        </p>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------
// Game Content Editor Modal (Add & Change any content of games)
// -----------------------------------------------------------------------
function GameContentModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Game | null;
  onSave: (data: Game) => void;
  onClose: () => void;
}) {
  const isNew = !initial;
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState<string>(initial?.category || 'Board & Strategy');
  const [players, setPlayers] = useState(initial?.players || '2 players');
  const [level, setLevel] = useState<'Easy' | 'Medium' | 'Hard'>(initial?.level || 'Medium');
  const [origin, setOrigin] = useState(initial?.origin || 'Ghana');
  const [format, setFormat] = useState(initial?.format || 'Courtyard game');
  const [summary, setSummary] = useState(initial?.summary || '');
  const [history, setHistory] = useState(initial?.history || '');
  const [play, setPlay] = useState(initial?.play || '');
  const [colors, setColors] = useState<[string, string]>(initial?.colors || ['#2C261F', '#E5A93C']);

  // Dynamic lists
  const [rules, setRules] = useState<string[]>(initial?.rules || []);
  const [newRule, setNewRule] = useState('');

  const [equipment, setEquipment] = useState<string[]>(initial?.equipment || []);
  const [newEquip, setNewEquip] = useState('');

  const [glossary, setGlossary] = useState<[string, string][]>(initial?.glossary || []);
  const [newTerm, setNewTerm] = useState('');
  const [newMeaning, setNewMeaning] = useState('');

  const [error, setError] = useState('');

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setRules([...rules, newRule.trim()]);
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleAddEquip = () => {
    if (!newEquip.trim()) return;
    setEquipment([...equipment, newEquip.trim()]);
    setNewEquip('');
  };

  const handleRemoveEquip = (index: number) => {
    setEquipment(equipment.filter((_, i) => i !== index));
  };

  const handleAddGlossary = () => {
    if (!newTerm.trim() || !newMeaning.trim()) return;
    setGlossary([...glossary, [newTerm.trim(), newMeaning.trim()]]);
    setNewTerm('');
    setNewMeaning('');
  };

  const handleRemoveGlossary = (index: number) => {
    setGlossary(glossary.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a game name.');
      return;
    }
    const id =
      initial?.id ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') ||
      `game-${Date.now()}`;

    const gameData: Game = {
      id,
      name: name.trim(),
      category: category as any,
      players: players.trim(),
      level,
      origin: origin.trim(),
      format: format.trim(),
      summary: summary.trim(),
      history: history.trim(),
      rules,
      equipment,
      glossary,
      play: play.trim() ? play.trim() : undefined,
      colors,
    };

    onSave(gameData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md overflow-y-auto p-4 flex items-center justify-center">
      <div className="glass rounded-3xl max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <Gamepad2 size={22} className="text-[var(--gold)]" />
            {isNew ? 'Add New Traditional Game' : `Edit Content: ${initial.name}`}
          </h2>
          <button onClick={onClose} className="btn p-2">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold block mb-1">Game Name *</label>
              <input
                className="field text-sm"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Oware, Ampe, Pilolo"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Category</label>
              <select
                className="field text-sm"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Board & Strategy">Board & Strategy</option>
                <option value="Active & Rhythm">Active & Rhythm</option>
                <option value="Children Courtyard">Children Courtyard</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-bold block mb-1">Players</label>
              <input
                className="field text-sm"
                value={players}
                onChange={e => setPlayers(e.target.value)}
                placeholder="e.g. 2 players, 3 or more"
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Mastery Level</label>
              <select
                className="field text-sm"
                value={level}
                onChange={e => setLevel(e.target.value as any)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Origin / Region</label>
              <input
                className="field text-sm"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="e.g. Akan, Ghana or Ga, Ghana"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Format Summary</label>
            <input
              className="field text-sm"
              value={format}
              onChange={e => setFormat(e.target.value)}
              placeholder="e.g. Two-player seed-sowing board game"
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Overview Summary (Card text)</label>
            <textarea
              className="field text-sm min-h-[60px]"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="A brief 1-2 sentence description shown on the game card"
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">History & Cultural Tradition</label>
            <textarea
              className="field text-sm min-h-[80px]"
              value={history}
              onChange={e => setHistory(e.target.value)}
              placeholder="The cultural heritage, oral history, and traditional compound significance of the game..."
            />
          </div>

          {/* Rules Section */}
          <div className="space-y-2 pt-2 border-t border-[var(--line)]">
            <label className="text-xs font-bold block">Rules of Play ({rules.length} steps)</label>
            <div className="space-y-2">
              {rules.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2.5 rounded-xl bg-[var(--bg3)] border border-[var(--line)]">
                  <span className="font-bold text-[var(--gold)] shrink-0 mt-0.5">{i + 1}.</span>
                  <span className="flex-1">{r}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(i)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete rule"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="field text-xs flex-1"
                placeholder="Add next rule step..."
                value={newRule}
                onChange={e => setNewRule(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
              />
              <button type="button" onClick={handleAddRule} className="btn text-xs">
                <Plus size={13} />
                Add Step
              </button>
            </div>
          </div>

          {/* Equipment Section */}
          <div className="space-y-2 pt-2 border-t border-[var(--line)]">
            <label className="text-xs font-bold block">Equipment Needed ({equipment.length} items)</label>
            <div className="flex flex-wrap gap-2">
              {equipment.map((eq, i) => (
                <span key={i} className="pill text-xs flex items-center gap-1.5">
                  {eq}
                  <button type="button" onClick={() => handleRemoveEquip(i)} className="hover:text-red-400">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="field text-xs flex-1"
                placeholder="Add equipment (e.g. Carved hardwood board, 48 seeds)..."
                value={newEquip}
                onChange={e => setNewEquip(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEquip();
                  }
                }}
              />
              <button type="button" onClick={handleAddEquip} className="btn text-xs">
                <Plus size={13} />
                Add Item
              </button>
            </div>
          </div>

          {/* Glossary Section */}
          <div className="space-y-2 pt-2 border-t border-[var(--line)]">
            <label className="text-xs font-bold block">Cultural Glossary ({glossary.length} terms)</label>
            <div className="space-y-1.5">
              {glossary.map(([term, meaning], i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[var(--bg3)] border border-[var(--line)]">
                  <div>
                    <span className="font-bold text-[var(--gold)] mr-2">{term}:</span>
                    <span className="text-[var(--mute)]">{meaning}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveGlossary(i)} className="text-red-400 p-1">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-[1fr_2fr_auto] gap-2">
              <input
                className="field text-xs"
                placeholder="Term (e.g. Aba)"
                value={newTerm}
                onChange={e => setNewTerm(e.target.value)}
              />
              <input
                className="field text-xs"
                placeholder="Meaning (e.g. playing seeds)"
                value={newMeaning}
                onChange={e => setNewMeaning(e.target.value)}
              />
              <button type="button" onClick={handleAddGlossary} className="btn text-xs">
                <Plus size={13} />
                Add
              </button>
            </div>
          </div>

          {/* Theme Artwork Palette */}
          <div className="pt-2 border-t border-[var(--line)]">
            <label className="text-xs font-bold block mb-1.5">Kente Artwork Color Palette</label>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((p, i) => (
                <button
                  type="button"
                  key={i}
                  className={`w-9 h-9 rounded-lg border transition ${
                    colors[0] === p[0] && colors[1] === p[1] ? 'ring-2 ring-[var(--gold)] scale-110' : 'hover:scale-105'
                  }`}
                  style={{
                    borderColor: 'var(--line)',
                    backgroundImage: `url("${art(...p)}")`,
                    backgroundSize: 'cover',
                  }}
                  onClick={() => setColors(p)}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--line)]">
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-gold">
              <Check size={15} />
              {isNew ? 'Create Game' : 'Save Content Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Story Content Editor Modal (Add & Change any content of stories)
// -----------------------------------------------------------------------
function StoryContentModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Story | null;
  onSave: (data: Story) => void;
  onClose: () => void;
}) {
  const isNew = !initial;
  const [title, setTitle] = useState(initial?.title || '');
  const [tag, setTag] = useState(initial?.tag || 'Oral Heritage');
  const [minutes, setMinutes] = useState(initial?.minutes || 3);
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '');
  const [quote, setQuote] = useState(initial?.quote || '');
  const [colors, setColors] = useState<[string, string]>(initial?.colors || ['#3a2410', '#8a5a1c']);

  // Body paragraphs
  const [body, setBody] = useState<string[]>(initial?.body || []);
  const [newParagraph, setNewParagraph] = useState('');
  const [error, setError] = useState('');

  const handleAddParagraph = () => {
    if (!newParagraph.trim()) return;
    setBody([...body, newParagraph.trim()]);
    setNewParagraph('');
  };

  const handleRemoveParagraph = (index: number) => {
    setBody(body.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a story title.');
      return;
    }
    const id =
      initial?.id ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') ||
      `story-${Date.now()}`;

    const storyData: Story = {
      id,
      title: title.trim(),
      tag: tag.trim(),
      minutes: Number(minutes) || 3,
      excerpt: excerpt.trim(),
      quote: quote.trim(),
      body: body.length ? body : ['Story body text in development.'],
      colors,
    };

    onSave(storyData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md overflow-y-auto p-4 flex items-center justify-center">
      <div className="glass rounded-3xl max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <BookOpen size={22} className="text-[var(--gold)]" />
            {isNew ? 'Add New Heritage Story' : `Edit Content: ${initial.title}`}
          </h2>
          <button onClick={onClose} className="btn p-2">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold block mb-1">Story Title *</label>
              <input
                className="field text-sm"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. The Akan Roots of Oware"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Read Time (Mins)</label>
              <input
                type="number"
                min={1}
                max={30}
                className="field text-sm"
                value={minutes}
                onChange={e => setMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold block mb-1">Theme Tag</label>
              <input
                className="field text-sm"
                value={tag}
                onChange={e => setTag(e.target.value)}
                placeholder="e.g. Board & Strategy, Courtyard Sisterhood"
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Proverb / Pull Quote</label>
              <input
                className="field text-sm"
                value={quote}
                onChange={e => setQuote(e.target.value)}
                placeholder="e.g. Count twice before you sow."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Story Excerpt (Card Summary)</label>
            <textarea
              className="field text-sm min-h-[60px]"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="A captivating 1-2 sentence preview of the oral tradition..."
            />
          </div>

          {/* Body Paragraphs */}
          <div className="space-y-2 pt-2 border-t border-[var(--line)]">
            <label className="text-xs font-bold block">Story Narrative ({body.length} paragraphs)</label>
            <div className="space-y-2">
              {body.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-3 rounded-xl bg-[var(--bg3)] border border-[var(--line)] leading-relaxed">
                  <span className="font-bold text-[var(--gold)] shrink-0 mt-0.5">¶{i + 1}</span>
                  <span className="flex-1">{p}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveParagraph(i)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete paragraph"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <textarea
                className="field text-xs min-h-[70px]"
                placeholder="Write new paragraph for this heritage story..."
                value={newParagraph}
                onChange={e => setNewParagraph(e.target.value)}
              />
              <button type="button" onClick={handleAddParagraph} className="btn text-xs">
                <Plus size={13} />
                Add Paragraph
              </button>
            </div>
          </div>

          {/* Theme Palette */}
          <div className="pt-2 border-t border-[var(--line)]">
            <label className="text-xs font-bold block mb-1.5">Art Background Colors</label>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((p, i) => (
                <button
                  type="button"
                  key={i}
                  className={`w-9 h-9 rounded-lg border transition ${
                    colors[0] === p[0] && colors[1] === p[1] ? 'ring-2 ring-[var(--gold)] scale-110' : 'hover:scale-105'
                  }`}
                  style={{
                    borderColor: 'var(--line)',
                    backgroundImage: `url("${art(...p)}")`,
                    backgroundSize: 'cover',
                  }}
                  onClick={() => setColors(p)}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--line)]">
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-gold">
              <Check size={15} />
              {isNew ? 'Create Story' : 'Save Content Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Main Admin Component
// -----------------------------------------------------------------------
export default function Admin() {
  const { assets, live, reload } = useAssetsCtx();
  const {
    games,
    stories,
    addGame,
    updateGame,
    deleteGame,
    resetGames,
    addStory,
    updateStory,
    deleteStory,
    resetStories,
  } = useContent();

  const [ok, setOk] = useState(() => sessionStorage.getItem('gg-admin') === '1');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState<string | null>(null);

  // Active main tab
  const [mainTab, setMainTab] = useState<'games-content' | 'stories-content' | 'artwork' | 'sync'>('games-content');
  const [artworkSubtab, setArtworkSubtab] = useState<'site' | 'games' | 'stories'>('site');

  // Modal states for Content Editing
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isAddingGame, setIsAddingGame] = useState(false);

  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isAddingStory, setIsAddingStory] = useState(false);

  // Delete confirmations
  const [confirmDeleteGame, setConfirmDeleteGame] = useState<Game | null>(null);
  const [confirmDeleteStory, setConfirmDeleteStory] = useState<Story | null>(null);

  // Notifications
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Auth & Sync state
  const [authEmail, setAuthEmail] = useState('boatengsamuel6957@gmail.com');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'magic' | 'password'>('magic');
  const [authMsg, setAuthMsg] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error=')) {
      try {
        const parts = hash.split('?')[1] || hash.split('&')[1] || hash.replace(/^#\/admin\??/, '');
        const params = new URLSearchParams(parts);
        const desc = params.get('error_description') || params.get('error') || '';
        if (desc.toLowerCase().includes('provider is not enabled') || desc.toLowerCase().includes('unsupported provider')) {
          setAuthError('Google Sign-In is not enabled yet in your Supabase project. You can sign in using Email / Magic Link below, or enable Google under Authentication > Providers > Google.');
        } else if (desc) {
          setAuthError(decodeURIComponent(desc.replace(/\+/g, ' ')));
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ok) {
    return (
      <div className="max-w-sm mx-auto px-5 py-16 space-y-4">
        <h1 className="font-display text-3xl">Curator Console</h1>
        <p className="text-sm text-[var(--mute)]">Enter the curator passcode to manage games, content, stories and lore.</p>
        <input
          className="field"
          type="password"
          placeholder="Passcode (Default: 12341234)"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (code === PASSCODE) {
                sessionStorage.setItem('gg-admin', '1');
                setOk(true);
              } else {
                setCode('');
              }
            }
          }}
          aria-label="Passcode"
        />
        <button
          className="btn btn-gold w-full justify-center"
          onClick={() => {
            if (code === PASSCODE) {
              sessionStorage.setItem('gg-admin', '1');
              setOk(true);
            } else {
              setCode('');
            }
          }}
        >
          Unlock Console
        </button>
      </div>
    );
  }

  const canWrite = true;
  const now = () => new Date().toISOString();

  const handleSaveWrapper = async (
    type: 'hero' | 'avatar' | 'game' | 'story',
    id: string,
    image: string | null,
    supabaseAction: () => PromiseLike<{ error: any }>
  ) => {
    saveLocalAsset(type, id, image);
    reload();

    if (supabase) {
      try {
        const { error } = await supabaseAction();
        if (error) {
          return 'Saved locally on this device.';
        }
        return 'Saved to Supabase & Live Sync!';
      } catch {
        return 'Saved locally.';
      }
    }
    return 'Saved locally on this device.';
  };

  const site = (col: 'hero_image' | 'elder_avatar') => ({
    onSave: (v: string) =>
      handleSaveWrapper(col === 'hero_image' ? 'hero' : 'avatar', 'site', v, () =>
        supabase!.from('site_settings').upsert({ id: 'site', [col]: v, updated_at: now() })
      ),
    onReset: () =>
      handleSaveWrapper(col === 'hero_image' ? 'hero' : 'avatar', 'site', null, () =>
        supabase!.from('site_settings').update({ [col]: null, updated_at: now() }).eq('id', 'site')
      ),
  });

  const row = (table: 'game_assets' | 'story_assets', id: string, name: string) => ({
    onSave: (v: string) =>
      handleSaveWrapper(table === 'game_assets' ? 'game' : 'story', id, v, () =>
        supabase!.from(table).upsert({ id, image: v, [table === 'game_assets' ? 'name' : 'title']: name, updated_at: now() })
      ),
    onReset: () =>
      handleSaveWrapper(table === 'game_assets' ? 'game' : 'story', id, null, () =>
        supabase!.from(table).delete().eq('id', id)
      ),
  });

  const handleSaveGameContent = (gameData: Game) => {
    if (editingGame) {
      updateGame(editingGame.id, gameData);
      notify(`Updated "${gameData.name}" successfully!`);
      setEditingGame(null);
    } else {
      addGame(gameData);
      notify(`Added "${gameData.name}" to Games Sanctuary!`);
      setIsAddingGame(false);
    }
  };

  const handleDeleteGameContent = (id: string, name: string) => {
    deleteGame(id);
    notify(`Removed "${name}" from games.`);
    setConfirmDeleteGame(null);
  };

  const handleSaveStoryContent = (storyData: Story) => {
    if (editingStory) {
      updateStory(editingStory.id, storyData);
      notify(`Updated "${storyData.title}" successfully!`);
      setEditingStory(null);
    } else {
      addStory(storyData);
      notify(`Added "${storyData.title}" to Heritage Stories!`);
      setIsAddingStory(false);
    }
  };

  const handleDeleteStoryContent = (id: string, title: string) => {
    deleteStory(id);
    notify(`Removed "${title}" from stories.`);
    setConfirmDeleteStory(null);
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname + '#/admin' },
      });
      if (error) setAuthError(error.message);
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to start Google sign in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!supabase || !authEmail) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail,
        options: { emailRedirectTo: window.location.origin + window.location.pathname + '#/admin' },
      });
      if (error) setAuthError(error.message);
      else setAuthMsg(`Magic sign-in link sent to ${authEmail}!`);
    } catch (err: any) {
      setAuthError(err?.message || 'Error sending magic link.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordSignIn = async (isSignUp = false) => {
    if (!supabase || !authEmail || !authPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) setAuthError(error.message);
        else if (data.session) setAuthMsg(`Signed up and logged in as ${authEmail}!`);
        else setAuthMsg(`Confirmation email sent to ${authEmail}.`);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) setAuthError(error.message);
        else setAuthMsg(`Signed in as ${authEmail}!`);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_INIT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 space-y-6">
      {/* Toast message */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 glass border border-[var(--gold)] text-amber-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-[var(--gold)]" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Curator Content Management</h1>
          <p className="text-sm text-[var(--mute)]">
            Change, add, or remove games & heritage stories, or update artwork & photos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill flex items-center gap-2">
            {live ? <Cloud size={14} className="text-green-400" /> : <CloudOff size={14} className="text-[var(--mute)]" />}
            {live ? 'Live Cloud Sync' : 'Active Local Mode'}
          </span>
          <button
            className="btn text-xs py-1.5"
            onClick={() => {
              sessionStorage.removeItem('gg-admin');
              go('/');
            }}
          >
            Lock & Exit
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex gap-2 flex-wrap border-b border-[var(--line)] pb-4">
        {[
          ['games-content', 'Games Content', Gamepad2, games.length],
          ['stories-content', 'Stories Content', BookOpen, stories.length],
          ['artwork', 'Artwork & Imagery', ImageIcon, undefined],
          ['sync', 'Curator Auth & Cloud', Database, undefined],
        ].map(([k, label, Icon, count]: any) => (
          <button
            key={k}
            className={`pill flex items-center gap-2 px-4 py-2 font-medium transition ${
              mainTab === k ? 'border-[var(--gold)] text-[var(--gold)] shadow-md' : ''
            }`}
            aria-pressed={mainTab === k}
            onClick={() => setMainTab(k)}
          >
            <Icon size={16} />
            <span>{label}</span>
            {count !== undefined && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-[var(--bg3)] text-[var(--mute)]">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ================================================================= */}
      {/* 1. GAMES CONTENT MANAGER TAB */}
      {/* ================================================================= */}
      {mainTab === 'games-content' && (
        <div className="space-y-6">
          <div className="glass rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl">Games Sanctuary Content</h2>
              <p className="text-xs text-[var(--mute)]">
                Add new traditional Ghanaian games, edit rules and lore, or delete games.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn text-xs"
                onClick={() => {
                  if (window.confirm('Reset all games to the original Ghanaian archive? Any custom added games will be restored to defaults.')) {
                    resetGames();
                    notify('Reset games to default.');
                  }
                }}
              >
                <RotateCcw size={13} />
                Reset Defaults
              </button>
              <button
                className="btn btn-gold text-xs"
                onClick={() => setIsAddingGame(true)}
              >
                <Plus size={14} />
                Add New Game
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map(g => {
              const img = assets.games[g.id] || art(...g.colors);
              return (
                <div key={g.id} className="glass rounded-3xl overflow-hidden flex flex-col justify-between p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="relative h-32 rounded-2xl overflow-hidden border border-[var(--line)]">
                      <img src={img} alt={g.name} className="w-full h-full object-cover sepia" />
                      <span className="absolute top-2 left-2 pill text-[10px] glass">
                        {g.category}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-lg">{g.name}</h3>
                      <p className="text-xs text-[var(--mute)] line-clamp-2">{g.summary}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 text-[10px] text-[var(--mute)]">
                      <span className="pill py-0.5">{g.players}</span>
                      <span className="pill py-0.5">{g.level}</span>
                      <span className="pill py-0.5">{g.rules.length} rules</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[var(--line)]">
                    <button
                      className="btn btn-gold text-xs flex-1 justify-center py-1.5"
                      onClick={() => setEditingGame(g)}
                    >
                      <Edit3 size={13} />
                      Edit Content
                    </button>
                    <button
                      className="btn text-xs text-red-400 hover:text-red-300 py-1.5 px-3"
                      onClick={() => setConfirmDeleteGame(g)}
                      title="Delete game"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. STORIES CONTENT MANAGER TAB */}
      {/* ================================================================= */}
      {mainTab === 'stories-content' && (
        <div className="space-y-6">
          <div className="glass rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl">Heritage Stories Content</h2>
              <p className="text-xs text-[var(--mute)]">
                Add new folklore narratives, edit essays and proverbs, or delete stories.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn text-xs"
                onClick={() => {
                  if (window.confirm('Reset all stories to original cultural essays? Custom stories will be restored.')) {
                    resetStories();
                    notify('Reset stories to default.');
                  }
                }}
              >
                <RotateCcw size={13} />
                Reset Defaults
              </button>
              <button
                className="btn btn-gold text-xs"
                onClick={() => setIsAddingStory(true)}
              >
                <Plus size={14} />
                Add New Story
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map(s => {
              const img = assets.stories[s.id] || art(...s.colors);
              return (
                <div key={s.id} className="glass rounded-3xl overflow-hidden flex flex-col justify-between p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="relative h-32 rounded-2xl overflow-hidden border border-[var(--line)]">
                      <img src={img} alt={s.title} className="w-full h-full object-cover sepia" />
                      <span className="absolute top-2 left-2 pill text-[10px] glass">
                        {s.tag}
                      </span>
                      <span className="absolute bottom-2 right-2 pill text-[10px] glass">
                        {s.minutes} min
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-lg">{s.title}</h3>
                      <p className="text-xs text-[var(--mute)] line-clamp-2">{s.excerpt}</p>
                    </div>
                    {s.quote && (
                      <p className="text-xs italic text-[var(--gold)] border-l-2 pl-2" style={{ borderColor: 'var(--gold)' }}>
                        "{s.quote}"
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[var(--line)]">
                    <button
                      className="btn btn-gold text-xs flex-1 justify-center py-1.5"
                      onClick={() => setEditingStory(s)}
                    >
                      <Edit3 size={13} />
                      Edit Content
                    </button>
                    <button
                      className="btn text-xs text-red-400 hover:text-red-300 py-1.5 px-3"
                      onClick={() => setConfirmDeleteStory(s)}
                      title="Delete story"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. ARTWORK & IMAGERY TAB */}
      {/* ================================================================= */}
      {mainTab === 'artwork' && (
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {(
              [
                ['site', 'Hero & Nana Kwame Avatar'],
                ['games', 'Game Card Artwork'],
                ['stories', 'Story Background Art'],
              ] as const
            ).map(([k, n]) => (
              <button
                key={k}
                className="pill text-xs"
                aria-pressed={artworkSubtab === k}
                onClick={() => setArtworkSubtab(k)}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {artworkSubtab === 'site' && (
              <>
                <ArtworkEditor
                  label="Homepage hero banner image"
                  current={assets.hero}
                  canWrite={canWrite}
                  {...site('hero_image')}
                />
                <ArtworkEditor
                  label="Nana Kwame elder avatar"
                  current={assets.avatar}
                  canWrite={canWrite}
                  {...site('elder_avatar')}
                />
              </>
            )}
            {artworkSubtab === 'games' &&
              games.map(g => (
                <ArtworkEditor
                  key={g.id}
                  label={`${g.name} Artwork`}
                  current={assets.games[g.id] || art(...g.colors)}
                  canWrite={canWrite}
                  {...row('game_assets', g.id, g.name)}
                />
              ))}
            {artworkSubtab === 'stories' &&
              stories.map(s => (
                <ArtworkEditor
                  key={s.id}
                  label={`${s.title} Artwork`}
                  current={assets.stories[s.id] || art(...s.colors)}
                  canWrite={canWrite}
                  {...row('story_assets', s.id, s.title)}
                />
              ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. CURATOR AUTH & CLOUD SYNC TAB */}
      {/* ================================================================= */}
      {mainTab === 'sync' && (
        <div className="space-y-6">
          {/* Supabase status and SQL setup button */}
          <div className="glass rounded-3xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold">Supabase Cloud Database & Auth</h3>
                <p className="text-xs text-[var(--mute)]">
                  Connect cloud storage to sync changes in realtime across all devices.
                </p>
              </div>
              <button className="btn text-xs py-1.5" onClick={() => setShowSql(!showSql)}>
                <Database size={13} />
                {showSql ? 'Hide SQL Script' : 'View SQL Setup Script'}
              </button>
            </div>

            {showSql && (
              <div className="p-4 rounded-2xl bg-black/50 border border-[var(--gold)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--gold)] font-bold">Copy into Supabase SQL Editor:</span>
                  <button className="btn btn-gold text-xs py-1" onClick={copySql}>
                    {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                    {copiedSql ? 'Copied!' : 'Copy SQL'}
                  </button>
                </div>
                <pre className="text-xs text-amber-200 overflow-x-auto max-h-56 font-mono leading-relaxed">
                  {SQL_INIT}
                </pre>
              </div>
            )}
          </div>

          {/* Authentication card */}
          <div className="glass rounded-3xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${email ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="font-semibold text-sm">
                  {email ? `Authenticated: ${email}` : 'Curator Session Active'}
                </span>
              </div>
              {email ? (
                <button className="btn text-xs" onClick={() => supabase!.auth.signOut()}>
                  <LogOut size={14} />
                  Sign out
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    className="pill text-xs"
                    aria-pressed={authMode === 'magic'}
                    onClick={() => setAuthMode('magic')}
                  >
                    <Mail size={12} className="inline mr-1" />
                    Magic Link
                  </button>
                  <button
                    className="pill text-xs"
                    aria-pressed={authMode === 'password'}
                    onClick={() => setAuthMode('password')}
                  >
                    <Key size={12} className="inline mr-1" />
                    Password
                  </button>
                </div>
              )}
            </div>

            {!email && (
              <div className="space-y-3 pt-2 border-t border-[var(--line)]">
                {authError && (
                  <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                    <p>{authError}</p>
                  </div>
                )}
                {authMsg && (
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2">
                    <Check size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                    <p>{authMsg}</p>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <input
                    className="field text-sm"
                    type="email"
                    placeholder="Curator email"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    aria-label="Email address"
                  />
                  {authMode === 'password' && (
                    <input
                      className="field text-sm"
                      type="password"
                      placeholder="Password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      aria-label="Password"
                    />
                  )}
                  <div className="flex gap-2">
                    {authMode === 'magic' ? (
                      <button
                        className="btn btn-gold text-xs flex-1 justify-center"
                        disabled={!supabase || authLoading}
                        onClick={handleMagicLink}
                      >
                        <Mail size={14} />
                        {authLoading ? 'Sending...' : 'Send Magic Link'}
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-gold text-xs flex-1 justify-center"
                          disabled={!supabase || authLoading}
                          onClick={() => handlePasswordSignIn(false)}
                        >
                          <LogIn size={14} />
                          Sign In
                        </button>
                        <button
                          className="btn text-xs justify-center"
                          disabled={!supabase || authLoading}
                          onClick={() => handlePasswordSignIn(true)}
                        >
                          Sign Up
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 text-xs text-[var(--mute)]">
                  <span>Alternative:</span>
                  <button
                    className="btn text-xs py-1"
                    disabled={!supabase || authLoading}
                    onClick={handleGoogleSignIn}
                  >
                    <LogIn size={13} />
                    Sign in with Google
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Content Modals */}
      {/* ================================================================= */}
      {(isAddingGame || editingGame) && (
        <GameContentModal
          initial={editingGame}
          onSave={handleSaveGameContent}
          onClose={() => {
            setIsAddingGame(false);
            setEditingGame(null);
          }}
        />
      )}

      {(isAddingStory || editingStory) && (
        <StoryContentModal
          initial={editingStory}
          onSave={handleSaveStoryContent}
          onClose={() => {
            setIsAddingStory(false);
            setEditingStory(null);
          }}
        />
      )}

      {/* Game Delete Confirmation */}
      {confirmDeleteGame && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass rounded-3xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/50 text-red-400 mx-auto grid place-items-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="font-display text-xl">Delete Game?</h3>
              <p className="text-sm text-[var(--mute)] mt-1">
                Are you sure you want to remove <strong className="text-white">"{confirmDeleteGame.name}"</strong>? It will no longer appear in the Games Sanctuary.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn flex-1 justify-center"
                onClick={() => setConfirmDeleteGame(null)}
              >
                Cancel
              </button>
              <button
                className="btn bg-red-600 hover:bg-red-500 text-white flex-1 justify-center border-none"
                onClick={() => handleDeleteGameContent(confirmDeleteGame.id, confirmDeleteGame.name)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Delete Confirmation */}
      {confirmDeleteStory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass rounded-3xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/50 text-red-400 mx-auto grid place-items-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="font-display text-xl">Delete Story?</h3>
              <p className="text-sm text-[var(--mute)] mt-1">
                Are you sure you want to remove <strong className="text-white">"{confirmDeleteStory.title}"</strong>? It will be removed from Heritage Stories.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn flex-1 justify-center"
                onClick={() => setConfirmDeleteStory(null)}
              >
                Cancel
              </button>
              <button
                className="btn bg-red-600 hover:bg-red-500 text-white flex-1 justify-center border-none"
                onClick={() => handleDeleteStoryContent(confirmDeleteStory.id, confirmDeleteStory.title)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

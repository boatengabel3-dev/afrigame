import { useEffect, useRef, useState } from 'react';
import { Cloud, CloudOff, LogIn, LogOut, Upload } from 'lucide-react';
import { GAMES, STORIES, art } from './data';
import { go, useAssetsCtx } from './hooks';
import { supabase } from './lib/supabase';

const PASSCODE = '12341234'; // UI gate only. Real write protection is the admins table + RLS in Supabase.
const PRESETS: [string, string][] = [['#3a2410', '#8a5a1c'], ['#10432a', '#1F9D55'], ['#4a1219', '#c0392b'], ['#2C261F', '#E5A93C'], ['#0f2a4a', '#2f6fbf'], ['#1C1914', '#F7D070']];

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
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.82));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(file);
  });
}

function Editor({ label, current, canWrite, onSave, onReset }: { label: string; current?: string; canWrite: boolean; onSave: (v: string) => Promise<string | null>; onReset: () => Promise<string | null> }) {
  const [draft, setDraft] = useState('');
  const [url, setUrl] = useState('');
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);
  const shown = draft || current;
  const run = async (f: () => Promise<string | null>, ok: string) => { setMsg(''); const e = await f(); setMsg(e ? 'Error: ' + e : ok); if (!e) { setDraft(''); setUrl(''); } };
  return (
    <div className="glass rounded-3xl p-4 space-y-3">
      <h3 className="font-bold">{label}</h3>
      <div className="h-32 rounded-lg overflow-hidden" style={{ background: 'var(--bg3)' }}>{shown && <img src={shown} alt="" className="w-full h-full object-cover" />}</div>
      <div className="flex gap-2">
        <input ref={file} type="file" accept="image/*" hidden onChange={async e => { const f = e.target.files?.[0]; if (f) try { setDraft(await downscale(f)); } catch { setMsg('Error: could not read that image.'); } }} />
        <button className="btn" onClick={() => file.current?.click()}><Upload size={14} />Upload from device</button>
      </div>
      <div className="flex gap-2"><input className="field" placeholder="https://image-url" value={url} onChange={e => { setUrl(e.target.value); setDraft(e.target.value); }} aria-label="Image URL" /></div>
      <div className="flex gap-2 flex-wrap">{PRESETS.map((p, i) => <button key={i} className="w-10 h-10 rounded-lg border" style={{ borderColor: 'var(--line)', backgroundImage: `url("${art(...p)}")`, backgroundSize: 'cover' }} aria-label={`Preset ${i + 1}`} onClick={() => setDraft(art(...p))} />)}</div>
      <div className="flex gap-2">
        <button className="btn btn-gold" disabled={!draft || !canWrite} onClick={() => run(() => onSave(draft), 'Saved.')}>Save changes</button>
        <button className="btn" disabled={!canWrite} onClick={() => run(onReset, 'Reset to default.')}>Reset to default</button>
      </div>
      {msg && <p className="text-sm" role="status">{msg}</p>}
    </div>
  );
}

export default function Admin() {
  const { assets, live, reload } = useAssetsCtx();
  const [ok, setOk] = useState(() => sessionStorage.getItem('gg-admin') === '1');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<'site' | 'games' | 'stories'>('site');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ok) return (
    <div className="max-w-sm mx-auto px-5 py-16 space-y-4">
      <h1 className="font-display text-3xl">Curator Console</h1>
      <input className="field" type="password" placeholder="Passcode" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && (code === PASSCODE ? (sessionStorage.setItem('gg-admin', '1'), setOk(true)) : setCode(''))} aria-label="Passcode" />
      <button className="btn btn-gold" onClick={() => code === PASSCODE ? (sessionStorage.setItem('gg-admin', '1'), setOk(true)) : setCode('')}>Unlock</button>
    </div>
  );

  const canWrite = !!supabase && !!email;
  const done = async (p: PromiseLike<{ error: any }>) => { const { error } = await p; if (!error) reload(); return error ? error.message as string : null; };
  const now = () => new Date().toISOString();
  const site = (col: 'hero_image' | 'elder_avatar') => ({
    onSave: (v: string) => done(supabase!.from('site_settings').upsert({ id: 'site', [col]: v, updated_at: now() })),
    onReset: () => done(supabase!.from('site_settings').update({ [col]: null, updated_at: now() }).eq('id', 'site')),
  });
  const row = (table: 'game_assets' | 'story_assets', id: string, name: string) => ({
    onSave: (v: string) => done(supabase!.from(table).upsert({ id, image: v, [table === 'game_assets' ? 'name' : 'title']: name, updated_at: now() })),
    onReset: () => done(supabase!.from(table).delete().eq('id', id)),
  });

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Curator Console</h1>
        <span className="pill flex items-center gap-2">{live ? <Cloud size={14} /> : <CloudOff size={14} />}{live ? 'Live sync on (Supabase Realtime)' : 'Not connected'}</span>
      </div>
      <div className="glass rounded-3xl p-4 flex flex-wrap items-center gap-3">
        {email ? <><span className="text-sm">Signed in as {email}</span><button className="btn" onClick={() => supabase!.auth.signOut()}><LogOut size={14} />Sign out</button></>
          : <><span className="text-sm text-[var(--mute)]">Sign in with an admin Google account to save changes.</span>
            <button className="btn btn-gold" disabled={!supabase} onClick={() => supabase!.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname + '#/admin' } })}><LogIn size={14} />Sign in with Google</button></>}
      </div>
      {!supabase && <p className="text-sm text-[var(--mute)]">Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable saving.</p>}
      <div className="flex gap-2 flex-wrap">
        {([['site', 'Home Hero & Avatars'], ['games', 'Game Artwork Registry'], ['stories', 'Stories Imagery']] as const).map(([k, n]) => <button key={k} className="pill" aria-pressed={tab === k} onClick={() => setTab(k)}>{n}</button>)}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {tab === 'site' && <>
          <Editor label="Homepage hero banner" current={assets.hero} canWrite={canWrite} {...site('hero_image')} />
          <Editor label="Nana Kwame avatar" current={assets.avatar} canWrite={canWrite} {...site('elder_avatar')} />
        </>}
        {tab === 'games' && GAMES.map(g => <Editor key={g.id} label={g.name} current={assets.games[g.id] || art(...g.colors)} canWrite={canWrite} {...row('game_assets', g.id, g.name)} />)}
        {tab === 'stories' && STORIES.map(s => <Editor key={s.id} label={s.title} current={assets.stories[s.id] || art(...s.colors)} canWrite={canWrite} {...row('story_assets', s.id, s.title)} />)}
      </div>
      <button className="btn" onClick={() => { sessionStorage.removeItem('gg-admin'); go('/'); }}>Lock and leave</button>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Cloud, CloudOff, LogIn, LogOut, Upload, Mail, Key, Check, AlertCircle, Database, Copy } from 'lucide-react';
import { GAMES, STORIES, art } from './data';
import { go, useAssetsCtx, saveLocalAsset } from './hooks';
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

function Editor({
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

export default function Admin() {
  const { assets, live, reload } = useAssetsCtx();
  const [ok, setOk] = useState(() => sessionStorage.getItem('gg-admin') === '1');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<'site' | 'games' | 'stories'>('site');

  // Authentication UI state
  const [authEmail, setAuthEmail] = useState('boatengsamuel6957@gmail.com');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'magic' | 'password'>('magic');
  const [authMsg, setAuthMsg] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    // Check if redirected with an error in URL hash
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
      } catch {
        // ignore parsing
      }
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
        <p className="text-sm text-[var(--mute)]">Enter the curator passcode to manage games, artwork and lore.</p>
        <input
          className="field"
          type="password"
          placeholder="Passcode"
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
          Unlock
        </button>
      </div>
    );
  }

  // Once unlocked with curator passcode, edits are authorized
  const canWrite = true;
  const now = () => new Date().toISOString();

  const handleSaveWrapper = async (
    type: 'hero' | 'avatar' | 'game' | 'story',
    id: string,
    image: string | null,
    supabaseAction: () => PromiseLike<{ error: any }>
  ) => {
    // 1. Save locally first so it applies immediately on this browser
    saveLocalAsset(type, id, image);
    reload();

    // 2. If Supabase is connected, attempt sync
    if (supabase) {
      try {
        const { error } = await supabaseAction();
        if (error) {
          if (error.message?.includes('schema cache') || error.code === 'PGRST205') {
            return 'Saved locally on this device. (Note: Supabase tables not created yet. Run the SQL Migration to enable cloud sync.)';
          }
          if (error.code === '42501' || error.message?.includes('policy') || error.message?.includes('row-level security')) {
            return `Saved locally on this device. (Supabase cloud sync requires adding ${email || 'your email'} to public.admins).`;
          }
          return `Saved locally. (Supabase notice: ${error.message})`;
        }
        return 'Saved to Supabase & Live Sync!';
      } catch (e: any) {
        return `Saved locally. (Supabase offline: ${e?.message})`;
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

  const handleGoogleSignIn = async () => {
    if (!supabase) return;
    setAuthLoading(true);
    setAuthError(null);
    setAuthMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname + '#/admin' },
      });
      if (error) {
        if (error.message.includes('not enabled') || error.message.includes('Unsupported provider')) {
          setAuthError(
            'Google Sign-In is not enabled yet in your Supabase project. You can sign in using Email / Magic Link below, or enable Google under Authentication > Providers > Google.'
          );
        } else {
          setAuthError(error.message);
        }
      }
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
    setAuthMsg('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail,
        options: { emailRedirectTo: window.location.origin + window.location.pathname + '#/admin' },
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthMsg(`Magic sign-in link sent to ${authEmail}! Check your inbox to complete sign in.`);
      }
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
    setAuthMsg('');
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) {
          setAuthError(error.message);
        } else if (data.session) {
          setAuthMsg(`Signed up and logged in as ${authEmail}!`);
        } else {
          setAuthMsg(`Confirmation email sent to ${authEmail}. Please confirm your email to sign in.`);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) {
          setAuthError(error.message);
        } else {
          setAuthMsg(`Signed in as ${authEmail}!`);
        }
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Curator Console</h1>
          <p className="text-sm text-[var(--mute)]">Manage homepage hero, Nana Kwame's avatar, and traditional game artwork.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill flex items-center gap-2">
            {live ? <Cloud size={14} className="text-green-400" /> : <CloudOff size={14} className="text-[var(--mute)]" />}
            {live ? 'Live sync on (Supabase Realtime)' : 'Supabase configured'}
          </span>
          <button className="btn text-xs py-1.5" onClick={() => setShowSql(!showSql)}>
            <Database size={13} />
            {showSql ? 'Hide SQL Script' : 'Supabase SQL Setup'}
          </button>
        </div>
      </div>

      {showSql && (
        <div className="glass rounded-3xl p-5 space-y-3 border border-[var(--gold)]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--gold)] flex items-center gap-2">
              <Database size={15} />
              Run in Supabase SQL Editor to Initialize Tables & Realtime
            </h3>
            <button className="btn btn-gold text-xs py-1" onClick={copySql}>
              {copiedSql ? <Check size={14} /> : <Copy size={14} />}
              {copiedSql ? 'Copied!' : 'Copy SQL'}
            </button>
          </div>
          <pre className="text-xs p-3 rounded-xl bg-black/50 text-amber-200 overflow-x-auto max-h-56 leading-relaxed font-mono">
            {SQL_INIT}
          </pre>
        </div>
      )}

      {/* Authentication and cloud sync card */}
      <div className="glass rounded-3xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-sm">
              {email ? `Signed in as: ${email}` : 'Local Curator Mode Active (Changes save locally immediately)'}
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
                Email & Password
              </button>
            </div>
          )}
        </div>

        {!email && (
          <div className="space-y-3 pt-2 border-t border-[var(--line)]">
            {authError && (
              <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                <div>
                  <p className="font-semibold">{authError}</p>
                </div>
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

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[var(--mute)]">
              <span>Or:</span>
              <button
                className="btn text-xs py-1"
                disabled={!supabase || authLoading}
                onClick={handleGoogleSignIn}
              >
                <LogIn size={13} />
                Sign in with Google
              </button>
              <span>(Requires Google OAuth enabled in Supabase Authentication &gt; Providers)</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {(
          [
            ['site', 'Home Hero & Avatars'],
            ['games', 'Game Artwork Registry'],
            ['stories', 'Stories Imagery'],
          ] as const
        ).map(([k, n]) => (
          <button
            key={k}
            className="pill"
            aria-pressed={tab === k}
            onClick={() => setTab(k)}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {tab === 'site' && (
          <>
            <Editor
              label="Homepage hero banner"
              current={assets.hero}
              canWrite={canWrite}
              {...site('hero_image')}
            />
            <Editor
              label="Nana Kwame avatar"
              current={assets.avatar}
              canWrite={canWrite}
              {...site('elder_avatar')}
            />
          </>
        )}
        {tab === 'games' &&
          GAMES.map(g => (
            <Editor
              key={g.id}
              label={g.name}
              current={assets.games[g.id] || art(...g.colors)}
              canWrite={canWrite}
              {...row('game_assets', g.id, g.name)}
            />
          ))}
        {tab === 'stories' &&
          STORIES.map(s => (
            <Editor
              key={s.id}
              label={s.title}
              current={assets.stories[s.id] || art(...s.colors)}
              canWrite={canWrite}
              {...row('story_assets', s.id, s.title)}
            />
          ))}
      </div>

      <div className="pt-4 flex justify-between items-center">
        <button
          className="btn"
          onClick={() => {
            sessionStorage.removeItem('gg-admin');
            go('/');
          }}
        >
          Lock and leave
        </button>
        <p className="text-xs text-[var(--mute)]">All changes take effect immediately on your app.</p>
      </div>
    </div>
  );
}

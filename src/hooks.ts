import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export function useRoute() {
  const get = () => location.hash.replace(/^#/, '') || '/';
  const [r, setR] = useState(get);
  useEffect(() => { const f = () => setR(get()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return r;
}
export const go = (p: string) => { location.hash = p; };

export type Assets = { hero?: string; avatar?: string; games: Record<string, string>; stories: Record<string, string> };
const KEY = 'gg-assets';
export const AssetsCtx = createContext<{ assets: Assets; live: boolean; reload: () => void }>({ assets: { games: {}, stories: {} }, live: false, reload: () => {} });
export const useAssetsCtx = () => useContext(AssetsCtx);

export function saveLocalAsset(type: 'hero' | 'avatar' | 'game' | 'story', id: string, image: string | null) {
  try {
    const current: Assets = JSON.parse(localStorage.getItem(KEY) || '{"games":{},"stories":{}}');
    if (type === 'hero') current.hero = image || undefined;
    else if (type === 'avatar') current.avatar = image || undefined;
    else if (type === 'game') {
      if (image) current.games[id] = image; else delete current.games[id];
    } else if (type === 'story') {
      if (image) current.stories[id] = image; else delete current.stories[id];
    }
    localStorage.setItem(KEY, JSON.stringify(current));
    return current;
  } catch {
    return null;
  }
}

export function useAssets() {
  const [assets, setAssets] = useState<Assets>(() => { try { return JSON.parse(localStorage.getItem(KEY) || ''); } catch { return { games: {}, stories: {} }; } });
  const [live, setLive] = useState(false);
  const reload = useCallback(async () => {
    let next: Assets = { games: {}, stories: {} };
    try { next = JSON.parse(localStorage.getItem(KEY) || '') || next; } catch {}
    if (!supabase) {
      setAssets({ ...next });
      return;
    }
    try {
      const [s, g, st] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 'site').maybeSingle(),
        supabase.from('game_assets').select('id,image'),
        supabase.from('story_assets').select('id,image'),
      ]);
      if (!s.error && s.data) {
        if (s.data.hero_image !== undefined) next.hero = s.data.hero_image || undefined;
        if (s.data.elder_avatar !== undefined) next.avatar = s.data.elder_avatar || undefined;
      }
      if (!g.error && g.data) {
        next.games = { ...next.games, ...Object.fromEntries(g.data.map((r: any) => [r.id, r.image])) };
      }
      if (!st.error && st.data) {
        next.stories = { ...next.stories, ...Object.fromEntries(st.data.map((r: any) => [r.id, r.image])) };
      }
    } catch {
      // offline or tables not yet migrated
    }
    setAssets({ ...next });
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota */ }
  }, []);
  useEffect(() => {
    if (!supabase) return;
    reload();
    const ch = supabase.channel('assets').on('postgres_changes', { event: '*', schema: 'public' }, () => reload()).subscribe(s => setLive(s === 'SUBSCRIBED'));
    return () => { supabase!.removeChannel(ch); };
  }, [reload]);
  return { assets, live, reload };
}

let ctx: AudioContext | null = null;
export function beep(freq = 520, ms = 120, type: OscillatorType = 'triangle') {
  try {
    ctx = ctx || new AudioContext();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = 0.08;
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + ms / 1000);
  } catch { /* audio unavailable */ }
}

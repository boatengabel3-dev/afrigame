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

export function useAssets() {
  const [assets, setAssets] = useState<Assets>(() => { try { return JSON.parse(localStorage.getItem(KEY) || ''); } catch { return { games: {}, stories: {} }; } });
  const [live, setLive] = useState(false);
  const reload = useCallback(async () => {
    if (!supabase) return;
    const [s, g, st] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 'site').maybeSingle(),
      supabase.from('game_assets').select('id,image'),
      supabase.from('story_assets').select('id,image'),
    ]);
    const next: Assets = {
      hero: s.data?.hero_image || undefined, avatar: s.data?.elder_avatar || undefined,
      games: Object.fromEntries((g.data || []).map((r: any) => [r.id, r.image])),
      stories: Object.fromEntries((st.data || []).map((r: any) => [r.id, r.image])),
    };
    setAssets(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota: realtime still keeps state fresh */ }
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

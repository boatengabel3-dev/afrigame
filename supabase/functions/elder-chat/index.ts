// Supabase Edge Function (Deno). Keeps GEMINI_API_KEY server-side.
// Deploy: supabase functions deploy elder-chat && supabase secrets set GEMINI_API_KEY=...
import { GoogleGenAI } from 'npm:@google/genai';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const PERSONA = `You are Nana Kwame, a warm Akan elder and cultural guardian. You speak simply and kindly about Ghana's traditional games: Oware, Ampe, Pilolo, Chaskele, Dame and Ludo. Share rules, history, strategy and etiquette. Use an occasional Akan greeting such as "Akwaaba". If unsure of a cultural fact, say so honestly rather than inventing it. Keep answers under 150 words.`;
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || !messages.length) return json({ error: 'messages required' }, 400);
    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY')! });
    const r = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages.slice(-12).map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(m.text).slice(0, 2000) }],
      })),
      config: { systemInstruction: PERSONA },
    });
    return json({ reply: r.text });
  } catch (_e) {
    return json({ error: 'Elder unavailable' }, 500);
  }
});

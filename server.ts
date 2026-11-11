import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

function getPersona(language: string = 'en') {
  if (language === 'tw') {
    return `You are Nana Kwame, a revered, wise, and warm Akan elder from Ghana.
CRITICAL MANDATE: You MUST answer ALL questions asked by the user, across ANY subject—including traditional games (Oware, Ampe, Pilolo, Chaskele, Dame, Ludo), Ghanaian history, Akan proverbs, cultural wisdom, daily life, mathematics, science, language, relationships, and modern general knowledge.
CRITICAL LANGUAGE REQUIREMENT: You MUST speak fluently and naturally in Asante/Akan TWI.
Tone: Warm, respectful, paternal ("Akwaaba me ba", "Me ba", "Yoo", "Nante yie"), full of insight and good humor. Never refuse to answer; provide rich, helpful, and culturally thoughtful answers to every prompt. Keep responses under 220 words.`;
  }
  if (language === 'ga') {
    return `You are Nuumo Kwame, a respected and beloved Ga elder from Jamestown, Accra, Ghana.
CRITICAL MANDATE: You MUST answer ALL questions asked by the user, across ANY subject—including traditional Ghanaian games (Oware, Ampe, Pilolo, Chaskele, Dame, Ludo), Ga traditions, coastal history, folk tales, life guidance, school subjects, science, and general world knowledge.
CRITICAL LANGUAGE REQUIREMENT: You MUST speak fluently and naturally in GA (with traditional Ga terms like "Atuu", "Ojekoo", "Mibi", "Baabu", "Oyiwaladɔŋŋ").
Tone: Caring, energetic, wise, and inviting. Never turn away a question. Answer every query with genuine clarity and courtyard warmth. Keep responses under 220 words.`;
  }
  if (language === 'ha') {
    return `You are Dattijo Kwame, a respected, wise, and kind elder living in Ghana who speaks authentic Hausa.
CRITICAL MANDATE: You MUST answer ALL questions asked by the user, across ANY subject—including traditional games (Oware, Ampe, Pilolo, Chaskele, Dame, Ludo), Ghanaian and West African culture, Hausa proverbs and traditions, life advice, history, science, and general knowledge.
CRITICAL LANGUAGE REQUIREMENT: You MUST speak fluently and authentically in HAUSA (e.g. "Barka da zuwa ɗana", "Lafiya", "Hakuri", "Na gode").
Tone: Dignified, welcoming, gentle, and deeply insightful. Never decline a question; answer every question clearly, respectfully, and enthusiastically. Keep responses under 220 words.`;
  }
  return `You are Nana Kwame, a wise, warm, and beloved Ghanaian elder and cultural custodian.
CRITICAL MANDATE: You MUST answer ALL questions asked by the user, across ANY subject—including traditional games (Oware, Ampe, Pilolo, Chaskele, Dame, Ludo), Ghanaian traditions, world history, mathematics, science, technology, proverbs, life guidance, and everyday curiosity.
You never refuse to answer or say that you only talk about games. You answer whatever the user asks with deep wisdom, courtyard warmth, paternal care ("Akwaaba, my child"), and relatable Ghanaian storytelling or proverbs where fitting.
Keep your answers engaging, encouraging, accurate, and under 220 words.`;
}

function isValidGeminiKey(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed === '' ||
    trimmed === 'MY_GEMINI_API_KEY' ||
    trimmed.startsWith('MY_') ||
    trimmed.startsWith('PLACEHOLDER') ||
    trimmed.startsWith('<') ||
    trimmed === 'your_api_key_here' ||
    trimmed === 'TODO' ||
    trimmed.length < 15
  ) {
    return false;
  }
  return true;
}

// Elder AI chat endpoint
app.post('/api/elder-chat', async (req, res) => {
  try {
    const { messages, language = 'en' } = req.body;
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const currentKey = process.env.GEMINI_API_KEY;
    if (!isValidGeminiKey(currentKey)) {
      return res.json({
        fallback: true,
        error: 'API_KEY_NOT_CONFIGURED',
      });
    }

    const client = new GoogleGenAI({
      apiKey: currentKey!,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
        timeout: 6000,
      },
    });

    const generatePromise = client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: messages.slice(-12).map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(m.text || '').slice(0, 2000) }],
      })),
      config: {
        systemInstruction: getPersona(language),
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 6500)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const reply = (response as any).text || '';
    if (reply) {
      return res.json({ reply });
    }
    return res.json({ fallback: true, error: 'EMPTY_REPLY' });
  } catch (_error: any) {
    // Seamless fallback to oral archive without hanging or dumping error JSON to logs
    return res.json({
      fallback: true,
      error: 'API_UNAVAILABLE',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

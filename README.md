# Ghana Games

React 19 + TypeScript + Vite + Tailwind v4, backed by **Supabase** (Postgres, Realtime, Auth, Edge Function). No Firebase.

## Run locally
```
npm install
cp .env.example .env        # add your Supabase URL + anon key
npm run dev                 # http://localhost:3000
```
Without `.env` the app still runs with default artwork and the offline Elder.

## Supabase setup
1. Create a project (pick a region near your users, e.g. London).
2. Run `supabase/migrations/0001_init.sql` in the SQL editor (tables, RLS, realtime).
3. Auth > Providers > enable Google. Add your site URL to Auth > URL Configuration redirect URLs.
4. Sign in once at `#/admin`, then run: `insert into public.admins (email) values ('you@example.com');`
5. Deploy the Elder: `supabase functions deploy elder-chat` and `supabase secrets set GEMINI_API_KEY=...`

## Notes
- Admin passcode (`12341234`) is only a UI gate in `src/Admin.tsx`. Real protection is RLS: only emails in `public.admins` can write.
- Routing uses hash paths (`#/games`) so it works on any static host.
- Uploaded images are downscaled to 1440px JPEG and stored as text in Postgres. Move to Supabase Storage if you expect many large images.
- Pilolo has no Ga voice prompts yet; those need recordings from a native speaker. Have cultural content (rules, glossary, stories) reviewed by community elders before launch.

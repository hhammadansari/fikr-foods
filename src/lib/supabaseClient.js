import { createClient } from "@supabase/supabase-js";

// To make reviews persist for every visitor (not just the person who posted them),
// this project uses Supabase — a free-tier Postgres + API backend.
//
// SETUP:
// 1. Create a free project at https://supabase.com
// 2. In the SQL editor, run the contents of supabase-setup.sql (included in this project)
// 3. Copy your Project URL and anon/public API key from Settings -> API
// 4. Create a file named .env in the project root (copy .env.example) and fill in:
//      VITE_SUPABASE_URL=your-project-url
//      VITE_SUPABASE_ANON_KEY=your-anon-key
// 5. Restart the dev server
//
// If these env vars are not set, the app still runs — reviews just won't persist
// across page reloads or between visitors (a warning is logged to the console).

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

if (!isSupabaseConfigured) {
  console.warn(
    "[Fikr Foods] Supabase is not configured — reviews will not persist. See src/lib/supabaseClient.js for setup steps."
  );
}

export const supabase = isSupabaseConfigured ? createClient(url, key) : null;

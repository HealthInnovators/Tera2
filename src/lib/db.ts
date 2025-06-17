// src/lib/db.ts
import { createClient } from '@supabase/supabase-js';

// Ensure that environment variables are loaded. 
// Next.js typically handles .env.local, .env.development, etc.
// For non-NEXT_PUBLIC variables, they are only available server-side.

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Supabase environment variables are not set');
  throw new Error('Supabase environment variables are not set');
}

console.log('Using Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Export a function to get the client
export function getSupabaseClient() {
  return supabase;
}

// Add connection test on startup
(async () => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection test successful');
    }
  } catch (error) {
    console.error('Supabase connection test failed:', error);
  }
})();

export default supabase;

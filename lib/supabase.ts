import { createClient } from '@supabase/supabase-js';

// This securely connects to your Supabase project using your environment variables
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
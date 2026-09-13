import { createClient } from '@supabase/supabase-js';

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// التأكد من أن الرابط يبدأ بـ http أو https
const supabaseUrl = (envUrl && envUrl.startsWith('http')) 
  ? envUrl 
  : 'https://dummy-project.supabase.co';

const supabaseAnonKey = (envKey && envKey.length > 5) 
  ? envKey 
  : 'dummy-key-for-build';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

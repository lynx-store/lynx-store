import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'رابط_السูปابيس_الخاص_بك';
const supabaseAnonKey = 'مفتاح_الـ_anon_العام_الخاص_بك';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

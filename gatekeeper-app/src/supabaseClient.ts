import { createClient } from '@supabase/supabase-js';

const supabaseURL = 'https://vzwnnvlzlyuwvtwgdovr.supabase.co';

const supabaseAnonKey = 'sb_publishable_TnJmPDsW-CZV3VV5cHtiDA_QnJHHP7U';

export const supabase = createClient(supabaseURL, supabaseAnonKey);
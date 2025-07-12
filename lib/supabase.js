import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kteaktpvivgsosabtgdj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZWFrdHB2aXZnc29zYWJ0Z2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDM4MDIsImV4cCI6MjA2NzMxOTgwMn0.RncfN2n2RWPjpUlYqBTGyMYbL_0Jur0D2EkTljn2oBo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

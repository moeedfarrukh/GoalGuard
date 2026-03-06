import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://prtmhhgfyoqbubeeoznr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydG1oaGdmeW9xYnViZWVvem5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODk0MDEsImV4cCI6MjA4NzI2NTQwMX0.90ql_e7v1r7f8RSzOpp3wDUH1Ae5fXeoLkjan2aUh_Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
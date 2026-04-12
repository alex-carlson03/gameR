import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qouuvvtelxsyujmlygrd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdXV2dnRlbHhzeXVqbWx5Z3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTE1NDgsImV4cCI6MjA5MTUyNzU0OH0.tXnmv3p2fHOf-xLxwLBPZsuuEqRFiY3H1fM0eAguwHg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

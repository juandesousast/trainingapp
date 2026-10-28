import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ogyhduxtfnrxhmqktcpm.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neWhkdXh0Zm5yeGhtcWt0Y3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMDcwODQsImV4cCI6MjEwODc4MzA4NH0.Y4uCn0voQJ-HH2dR1vbId16HCjpSnvFneV56TS3kVJ8";

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bqgwpqxddhfueugbtstg.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Lazy singleton — avoids crashing at build time when the key isn't set yet.
let _client: SupabaseClient | null = null;

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) {
      if (!supabaseAnonKey) {
        throw new Error(
          "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Add it to .env.local.",
        );
      }
      _client = createClient(supabaseUrl, supabaseAnonKey);
    }
    return (_client as any)[prop];
  },
});

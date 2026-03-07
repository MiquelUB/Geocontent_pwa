import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createClient = (cookieStore: any) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  return createServerClient(
    url,
    key,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component context
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component context
          }
        },
      },
    }
  )
}

// Admin client for specialized tasks (bypassing RLS)
export const getSupabaseAdmin = () => {
  const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!adminUrl || !adminKey) {
    console.error("⚠️ [Supabase Admin] Missing Env Vars. URL:", !!adminUrl, "Key:", !!adminKey);
    // Return a dummy client to avoid crashing on import, will error on call
    return createSupabaseClient(
      adminUrl || 'https://placeholder.supabase.co',
      adminKey || 'placeholder'
    );
  }

  return createSupabaseClient(adminUrl, adminKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}


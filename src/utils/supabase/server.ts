import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase environment variables!')
    // Return a mock client that doesn't throw when called
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error('Configuración insuficiente') }),
        getSession: async () => ({ data: { session: null }, error: new Error('Configuración insuficiente') }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Configuración insuficiente') }),
            order: () => ({ 
              limit: async () => ({ data: [], error: new Error('Configuración insuficiente') }),
              gte: () => ({ order: async () => ({ data: [], error: new Error('Configuración insuficiente') }) }),
            }),
          }),
          order: () => ({ limit: async () => ({ data: [], error: new Error('Configuración insuficiente') }) }),
        }),
      }),
      rpc: async () => ({ data: null, error: new Error('Configuración insuficiente') }),
    } as any
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}

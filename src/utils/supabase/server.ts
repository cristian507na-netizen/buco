import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase environment variables!')
    
    // Recursive Proxy to handle ANY method call chain without crashing
    const createSafeMock = (target: any = {}): any => {
      return new Proxy(target, {
        get(t, prop) {
          if (prop === 'then') return undefined; // Avoid infinite recursion with awaits
          if (typeof prop === 'string') {
            // Return a function that returns the proxy again (for chaining)
            // but also acts as an async function that returns an error object
            const mockFn = () => createSafeMock();
            mockFn.then = (resolve: any) => resolve({ data: null, error: new Error('Configuracion insuficiente') });
            mockFn.single = () => createSafeMock();
            mockFn.maybeSingle = () => createSafeMock();
            mockFn.select = () => createSafeMock();
            mockFn.insert = () => createSafeMock();
            mockFn.update = () => createSafeMock();
            mockFn.delete = () => createSafeMock();
            mockFn.eq = () => createSafeMock();
            mockFn.neq = () => createSafeMock();
            mockFn.order = () => createSafeMock();
            mockFn.limit = () => createSafeMock();
            mockFn.rpc = () => createSafeMock();
            return mockFn;
          }
          return t[prop];
        }
      });
    };

    return createSafeMock({
      auth: createSafeMock({
        getUser: async () => ({ data: { user: null }, error: new Error('Configuracion insuficiente') }),
        getSession: async () => ({ data: { session: null }, error: new Error('Configuracion insuficiente') }),
      })
    });
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

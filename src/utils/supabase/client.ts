import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase environment variables!')
    
    const createSafeMock = (target: any = {}): any => {
      return new Proxy(target, {
        get(t, prop) {
          if (prop === 'then') return undefined;
          if (typeof prop === 'string') {
            const mockFn = () => createSafeMock();
            mockFn.then = (resolve: any) => resolve({ data: null, error: new Error('Configuracion insuficiente') });
            // Add common methods for chaining
            ['single', 'maybeSingle', 'select', 'insert', 'update', 'delete', 'eq', 'neq', 'order', 'limit', 'rpc'].forEach(m => {
              (mockFn as any)[m] = () => createSafeMock();
            });
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

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
  )
}

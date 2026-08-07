import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
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
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    // query ringan, jangan select * dari tabel besar
    const { error } = await supabase.from('buku').select('id').limit(1)
    
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 })
    }
    return Response.json({ ok: true, timestamp: new Date().toISOString() })
  }
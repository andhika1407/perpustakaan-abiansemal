'use server'

import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  // query ringan, jangan select * dari tabel besar
  const { data, error } = await supabase.from('buku').select('id').limit(1)
  
  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }
  return Response.json({ ok: true, timestamp: new Date().toISOString() })
}
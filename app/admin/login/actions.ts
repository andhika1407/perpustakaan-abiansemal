'use server'

import { createClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Return custom message or localized message
      if (error.message === 'Invalid login credentials') {
        return { error: 'Email atau password salah.' }
      }
      return { error: error.message }
    }
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem. Silakan coba lagi.' }
  }

  // We return a success flag so the client component can handle client-side redirection safely,
  // or we can redirect directly outside the try/catch.
  // Actually, Next.js redirect throws a special redirect error that should be allowed to propagate.
  // So returning success: true is extremely safe and clean for client handling.
  return { success: true }
}

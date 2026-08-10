'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getKategori() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('kategori')
    .select('*')
    .order('nama', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function createKategori(nama: string) {
  if (!nama || nama.trim() === '') {
    return { error: 'Nama kategori wajib diisi.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('kategori').insert({ nama: nama.trim() })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Nama kategori sudah ada.' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/kategori')
  return { success: true }
}

export async function updateKategori(id: string, nama: string) {
  if (!nama || nama.trim() === '') {
    return { error: 'Nama kategori wajib diisi.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('kategori')
    .update({ nama: nama.trim() })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'Nama kategori sudah ada.' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/kategori')
  return { success: true }
}

export async function deleteKategori(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('kategori').delete().eq('id', id)

  if (error) {
    if (error.code === '23503') {
      return { error: 'Kategori tidak dapat dihapus karena ada buku dengan kategori ini.' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/kategori')
  return { success: true }
}

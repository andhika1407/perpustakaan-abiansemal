'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type BukuData = {
  judul: string
  pengarang: string | null
  tahun: number | null
  kategori_id: string | null
  jumlah_eksemplar: number
  keterangan: string | null
}

export async function getBuku() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buku')
    .select(`
      *,
      kategori:kategori_id (
        id,
        nama
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function createBuku(data: BukuData) {
  if (!data.judul || data.judul.trim() === '') {
    return { error: 'Judul buku wajib diisi.' }
  }
  if (data.jumlah_eksemplar < 0) {
    return { error: 'Jumlah eksemplar tidak boleh negatif.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('buku').insert({
    judul: data.judul.trim(),
    pengarang: data.pengarang?.trim() || null,
    tahun: data.tahun || null,
    kategori_id: data.kategori_id || null,
    jumlah_eksemplar: data.jumlah_eksemplar,
    jumlah_tersedia: data.jumlah_eksemplar, // Initially all copies are available
    keterangan: data.keterangan
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/buku')
  revalidatePath('/')
  return { success: true }
}

export async function updateBuku(id: string, data: BukuData) {
  if (!data.judul || data.judul.trim() === '') {
    return { error: 'Judul buku wajib diisi.' }
  }
  if (data.jumlah_eksemplar < 0) {
    return { error: 'Jumlah eksemplar tidak boleh negatif.' }
  }

  const supabase = await createClient()

  // Get current book state to check borrowings and update ketersediaan
  const { data: currentBuku, error: fetchError } = await supabase
    .from('buku')
    .select('jumlah_eksemplar, jumlah_tersedia')
    .eq('id', id)
    .single()

  if (fetchError || !currentBuku) {
    return { error: 'Buku tidak ditemukan.' }
  }

  const sedangDipinjam = currentBuku.jumlah_eksemplar - currentBuku.jumlah_tersedia

  if (data.jumlah_eksemplar < sedangDipinjam) {
    return {
      error: `Jumlah eksemplar tidak boleh kurang dari jumlah buku yang sedang dipinjam (${sedangDipinjam} buku).`,
    }
  }

  // Calculate new ketersediaan
  const newJumlahTersedia = data.jumlah_eksemplar - sedangDipinjam

  const { error } = await supabase
    .from('buku')
    .update({
      judul: data.judul.trim(),
      pengarang: data.pengarang?.trim() || null,
      tahun: data.tahun || null,
      kategori_id: data.kategori_id || null,
      jumlah_eksemplar: data.jumlah_eksemplar,
      jumlah_tersedia: newJumlahTersedia,
      keterangan: data.keterangan,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/buku')
  revalidatePath('/')
  return { success: true }
}

export async function deleteBuku(id: string) {
  const supabase = await createClient()

  // First check if the book has any active borrowings
  const { data: activeBorrowings, error: checkError } = await supabase
    .from('peminjaman')
    .select('id')
    .eq('buku_id', id)
    .is('tanggal_kembali', null)

  if (checkError) {
    return { error: checkError.message }
  }

  if (activeBorrowings && activeBorrowings.length > 0) {
    return { error: 'Buku tidak dapat dihapus karena masih ada peminjaman aktif.' }
  }

  const { error } = await supabase.from('buku').delete().eq('id', id)

  if (error) {
    if (error.code === '23503') {
      return { error: 'Buku tidak dapat dihapus karena tercatat dalam riwayat peminjaman.' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/buku')
  revalidatePath('/')
  return { success: true }
}

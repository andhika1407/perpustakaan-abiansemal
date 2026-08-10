'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PeminjamanData = {
  buku_id: string
  nama_siswa: string
  kelas: string
  tanggal_jatuh_tempo: string
}

// Automatically update overdue status to 'telat' for unreturned books whose due date is past today
async function checkAndUpdateOverdueStatus() {
  const supabase = await createClient()
  const todayStr = new Date().toLocaleDateString('en-CA') // Format YYYY-MM-DD in local time

  const { error } = await supabase
    .from('peminjaman')
    .update({ status: 'telat' })
    .is('tanggal_kembali', null)
    .lt('tanggal_jatuh_tempo', todayStr)
    .eq('status', 'dipinjam')

  if (error) {
    console.error('Error updating overdue status:', error.message)
  }
}

export async function getPeminjaman() {
  // Update status before fetching to ensure live representation
  await checkAndUpdateOverdueStatus()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('peminjaman')
    .select(`
      *,
      buku:buku_id (
        id,
        judul,
        pengarang
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function getBooksAvailable() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buku')
    .select('id, judul, pengarang, jumlah_tersedia')
    .gt('jumlah_tersedia', 0)
    .order('judul', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function createPeminjaman(data: PeminjamanData) {
  if (!data.buku_id) {
    return { error: 'Silakan pilih buku.' }
  }
  if (!data.nama_siswa || data.nama_siswa.trim() === '') {
    return { error: 'Nama siswa wajib diisi.' }
  }
  if (!data.kelas || data.kelas.trim() === '') {
    return { error: 'Kelas wajib diisi.' }
  }
  if (!data.tanggal_jatuh_tempo) {
    return { error: 'Tanggal jatuh tempo wajib diisi.' }
  }

  const supabase = await createClient()

  // 1. Check maximum 3 active books per student (same name and class)
  // const { data: activeBorrowings, error: checkError } = await supabase
  //   .from('peminjaman')
  //   .select('id')
  //   .eq('nama_siswa', data.nama_siswa.trim())
  //   .eq('kelas', data.kelas.trim())
  //   .is('tanggal_kembali', null)

  // if (checkError) {
  //   return { error: checkError.message }
  // }

  // if (activeBorrowings && activeBorrowings.length >= 3) {
  //   return {
  //     error: `Siswa ${data.nama_siswa.trim()} (Kelas ${data.kelas.trim()}) sudah meminjam ${activeBorrowings.length} buku yang belum dikembalikan. Batas maksimum peminjaman aktif adalah 3 buku.`,
  //   }
  // }

  // 2. Check if the book is available
  const { data: buku, error: bukuError } = await supabase
    .from('buku')
    .select('jumlah_tersedia')
    .eq('id', data.buku_id)
    .single()

  if (bukuError || !buku) {
    return { error: 'Data buku tidak ditemukan.' }
  }

  if (buku.jumlah_tersedia <= 0) {
    return { error: 'Buku ini sudah habis dipinjam.' }
  }

  // 3. Perform borrowing (trigger handles stock decrement)
  const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
  const { error: insertError } = await supabase.from('peminjaman').insert({
    buku_id: data.buku_id,
    nama_siswa: data.nama_siswa.trim(),
    kelas: data.kelas.trim(),
    tanggal_pinjam: todayStr,
    tanggal_jatuh_tempo: data.tanggal_jatuh_tempo,
    status: 'dipinjam',
  })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/admin/peminjaman')
  revalidatePath('/admin/buku')
  revalidatePath('/')
  return { success: true }
}

export async function kembalikanBuku(id: string) {
  const supabase = await createClient()
  const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

  // Set tanggal_kembali to today and update status to 'dikembalikan'
  const { error } = await supabase
    .from('peminjaman')
    .update({
      tanggal_kembali: todayStr,
      status: 'dikembalikan',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/peminjaman')
  revalidatePath('/admin/buku')
  revalidatePath('/')
  return { success: true }
}

export async function deletePeminjaman(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('peminjaman')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/peminjaman')
  revalidatePath('/admin/buku')
  revalidatePath('/')
  return { success: true }
}

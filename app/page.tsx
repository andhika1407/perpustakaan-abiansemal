import React from 'react'
import { createClient } from '@/lib/supabase/server'
import PublicLibraryContent from './PublicLibraryContent'

type SearchParams = Promise<{
  search?: string
  category?: string
  availability?: string
  page?: string
}>

export const dynamic = 'force-dynamic'

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const resolvedParams = await searchParams
  const search = resolvedParams.search || ''
  const category = resolvedParams.category || 'all'
  const availability = resolvedParams.availability || 'all'
  const page = Number(resolvedParams.page) || 1
  const limit = 9 // 9 items per page (3 columns x 3 rows grid)
  const offset = (page - 1) * limit

  const supabase = await createClient()

  // 1. Fetch Categories for filter dropdown
  const { data: categories } = await supabase
    .from('kategori')
    .select('id, nama')
    .order('nama', { ascending: true })

  // 2. Fetch Books with details and counts based on query params
  let query = supabase
    .from('buku')
    .select(`
      *,
      kategori:kategori_id (
        id,
        nama
      )
    `, { count: 'exact' })

  // Search filter
  if (search.trim() !== '') {
    query = query.or(`judul.ilike.%${search.trim()}%,pengarang.ilike.%${search.trim()}%`)
  }

  // Category filter
  if (category !== 'all') {
    query = query.eq('kategori_id', category)
  }

  // Availability filter
  if (availability === 'available') {
    query = query.gt('jumlah_tersedia', 0)
  } else if (availability === 'empty') {
    query = query.eq('jumlah_tersedia', 0)
  }

  // Execute pagination and ordering
  const { data: books, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching public books:', error.message)
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)

  return (
    <PublicLibraryContent
      books={books || []}
      categories={categories || []}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      filters={{
        search,
        category,
        availability,
      }}
    />
  )
}

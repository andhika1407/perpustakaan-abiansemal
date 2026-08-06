'use client'

import React, { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, BookOpen, User, Calendar, Tag, ShieldCheck, ChevronLeft, ChevronRight, LogIn, Filter, AlertCircle } from 'lucide-react'
import Link from 'next/link'

type Kategori = {
  id: string
  nama: string
}

type Buku = {
  id: string
  judul: string
  pengarang: string | null
  tahun: number | null
  kategori_id: string | null
  jumlah_eksemplar: number
  jumlah_tersedia: number
  kategori: Kategori | null
}

export default function PublicLibraryContent({
  books,
  categories,
  currentPage,
  totalPages,
  totalCount,
  filters,
}: {
  books: Buku[]
  categories: Kategori[]
  currentPage: number
  totalPages: number
  totalCount: number
  filters: {
    search: string
    category: string
    availability: string
  }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [searchInput, setSearchInput] = useState(filters.search)

  // Trigger search params update
  const updateParams = (newFilters: { search?: string; category?: string; availability?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newFilters.search !== undefined) {
      if (newFilters.search) params.set('search', newFilters.search)
      else params.delete('search')
    }
    if (newFilters.category !== undefined) {
      if (newFilters.category && newFilters.category !== 'all') params.set('category', newFilters.category)
      else params.delete('category')
    }
    if (newFilters.availability !== undefined) {
      if (newFilters.availability && newFilters.availability !== 'all') params.set('availability', newFilters.availability)
      else params.delete('availability')
    }
    if (newFilters.page !== undefined) {
      if (newFilters.page > 1) params.set('page', newFilters.page.toString())
      else params.delete('page')
    } else {
      // Reset page to 1 when filters change
      params.delete('page')
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ search: searchInput })
  }

  // Get cover gradient based on book category/title to make it look premium
  const getCoverGradient = (title: string, category: string | null) => {
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-violet-500 to-purple-600',
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600',
      'from-cyan-500 to-blue-600',
    ]
    return gradients[hash % gradients.length]
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      {/* Header / Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-bold font-headline text-slate-900 leading-tight">Perpustakaan Digital</h1>
              <p className="text-xxs sm:text-xs text-neutral">SDN Abiansemal</p>
            </div>
          </div>

          <Link
            href="/admin/buku"
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold font-headline rounded-xl text-sm transition-all shadow-sm cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-slate-500" />
            <span>Masuk Admin</span>
          </Link>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center sm:text-left sm:px-6 lg:px-8">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Selamat Datang
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline mt-3">Katalog Buku SDN Abiansemal</h2>
          <p className="text-blue-100 mt-2 text-sm sm:text-base max-w-2xl">
            Cari dan periksa ketersediaan buku favoritmu sebelum meminjam di perpustakaan sekolah.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="font-bold font-headline text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              Saring Buku
            </h3>

            {/* Filter Kategori */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kategori</label>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => updateParams({ category: 'all' })}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer font-medium ${
                    filters.category === 'all'
                      ? 'bg-blue-50 text-primary font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Semua Kategori
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParams({ category: cat.id })}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer font-medium truncate ${
                      filters.category === cat.id
                        ? 'bg-blue-50 text-primary font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.nama}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Filter Status Ketersediaan */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status Ketersediaan</label>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'all', label: 'Tampilkan Semua' },
                  { value: 'available', label: 'Hanya yang Tersedia' },
                  { value: 'empty', label: 'Habis Dipinjam' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      value={opt.value}
                      checked={filters.availability === opt.value}
                      onChange={() => updateParams({ availability: opt.value })}
                      className="w-4.5 h-4.5 text-primary border-slate-300 focus:ring-primary rounded-full cursor-pointer"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Catalog List */}
        <section className="lg:col-span-3 space-y-6">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan judul buku atau pengarang..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold font-headline rounded-xl text-sm transition-all shadow-sm cursor-pointer"
            >
              Cari
            </button>
          </form>

          {/* Result Stats / Spinner */}
          <div className="flex items-center justify-between text-xs text-neutral font-medium">
            <span>Menampilkan {books.length} dari {totalCount} buku</span>
            {isPending && <span className="text-primary font-bold animate-pulse">Memuat...</span>}
          </div>

          {/* Book Grid */}
          {books.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h4 className="text-slate-900 font-bold font-headline text-lg">Buku tidak ditemukan</h4>
              <p className="text-neutral text-sm mt-1 max-w-sm mx-auto">
                Coba sesuaikan pencarian Anda atau bersihkan filter untuk melihat semua koleksi.
              </p>
              {(filters.search || filters.category !== 'all' || filters.availability !== 'all') && (
                <button
                  onClick={() => {
                    setSearchInput('')
                    router.push('/')
                  }}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-headline rounded-lg text-xs transition-all cursor-pointer"
                >
                  Bersihkan Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {books.map((buku) => {
                const gradient = getCoverGradient(buku.judul, buku.kategori?.nama || null)
                return (
                  <div key={buku.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                    {/* Visual Geometric Cover */}
                    <div className={`h-40 bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between text-white relative overflow-hidden shrink-0`}>
                      {/* Decorative Shapes */}
                      <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-6 -mt-6"></div>
                      <div className="absolute left-1/3 bottom-0 w-16 h-16 bg-black/10 rounded-full blur-lg"></div>

                      <div className="flex justify-between items-start z-10">
                        <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {buku.kategori?.nama || 'Umum'}
                        </span>
                        {buku.tahun && (
                          <span className="text-[10px] font-bold text-white/80 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {buku.tahun}
                          </span>
                        )}
                      </div>

                      <div className="z-10 mt-auto">
                        <h4 className="font-bold font-headline text-sm line-clamp-2 drop-shadow-sm group-hover:underline">
                          {buku.judul}
                        </h4>
                      </div>
                    </div>

                    {/* Book Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-neutral flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span className="truncate">{buku.pengarang || 'Pengarang tidak dicantumkan'}</span>
                        </div>
                      </div>

                      {/* Stock availability status badge */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="text-xxs font-bold text-neutral uppercase tracking-wider">
                          Stok: {buku.jumlah_tersedia} / {buku.jumlah_eksemplar}
                        </div>
                        {buku.jumlah_tersedia > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xxs font-bold bg-green-50 text-secondary border border-green-100">
                            <ShieldCheck className="w-3 h-3" />
                            Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xxs font-bold bg-red-50 text-red-600 border border-red-100">
                            <AlertCircle className="w-3 h-3" />
                            Dipinjam
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={currentPage <= 1 || isPending}
                onClick={() => updateParams({ page: currentPage - 1 })}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>

              <div className="text-sm font-bold text-slate-700">
                Halaman {currentPage} dari {totalPages}
              </div>

              <button
                disabled={currentPage >= totalPages || isPending}
                onClick={() => updateParams({ page: currentPage + 1 })}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-neutral">
          &copy; {new Date().getFullYear()} Perpustakaan SDN Abiansemal. Seluruh hak cipta dilindungi.
        </div>
      </footer>
    </div>
  )
}

'use client'

import React, { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Search, Filter, BookOpen } from 'lucide-react'
import { createBuku, updateBuku, deleteBuku, type BukuData } from './actions'

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
  keterangan: string | null
}

export default function BukuContent({
  initialBuku,
  categories,
}: {
  initialBuku: Buku[]
  categories: Kategori[]
}) {
  const [bukuList, setBukuList] = useState<Buku[]>(initialBuku)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState<BukuData>({
    judul: '',
    pengarang: '',
    tahun: null,
    kategori_id: '',
    jumlah_eksemplar: 1,
    keterangan: '',
  })

  // Open modal for Create
  const handleOpenCreate = () => {
    setError(null)
    setEditingId(null)
    setFormData({
      judul: '',
      pengarang: '',
      tahun: new Date().getFullYear(),
      kategori_id: categories[0]?.id || '',
      jumlah_eksemplar: 1,
      keterangan: '',
    })
    setIsOpen(true)
  }

  // Open modal for Edit
  const handleOpenEdit = (buku: Buku) => {
    setError(null)
    setEditingId(buku.id)
    setFormData({
      judul: buku.judul,
      pengarang: buku.pengarang || '',
      tahun: buku.tahun,
      kategori_id: buku.kategori_id || '',
      jumlah_eksemplar: buku.jumlah_eksemplar,
      keterangan: buku.keterangan
    })
    setIsOpen(true)
  }

  // Submit Form (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      let res
      if (editingId) {
        res = await updateBuku(editingId, formData)
      } else {
        res = await createBuku(formData)
      }

      if (res.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
        window.location.reload()
      }
    })
  }

  // Delete Book
  const handleDelete = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus buku ini?')) return
    setError(null)
    startTransition(async () => {
      const res = await deleteBuku(id)
      if (res.error) {
        setError(res.error)
      } else {
        window.location.reload()
      }
    })
  }

  // Filter & Search Logic
  const filteredBuku = bukuList.filter((buku) => {
    const matchesSearch =
      buku.judul.toLowerCase().includes(search.toLowerCase()) ||
      (buku.pengarang && buku.pengarang.toLowerCase().includes(search.toLowerCase())) // || 
      // (buku.keterangan && buku.keterangan.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory =
      selectedCategory === 'all' || buku.kategori_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-headline text-slate-900">Daftar Koleksi Buku</h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-primary hover:bg-blue-700 text-white font-bold font-headline rounded-xl shadow-md hover:shadow-primary/20 transition-all flex items-center gap-2 text-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Buku</span>
        </button>
      </div>

      {/* Global Error message */}
      {error && !isOpen && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Cari judul buku atau pengarang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-200 border border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-slate-900 text-base"
          />
        </div>

        <div className="flex w-full md:w-auto items-center gap-2">
          <Filter className="w-7 h-5 text-neutral shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-64 px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-slate-700 text-base font-headline font-semibold cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredBuku.length === 0 ? (
          <div className="p-16 text-center text-neutral">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm">Belum ada koleksi buku yang terdaftar atau cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm font-bold font-headline uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6 w-[20%] text-center">Detail Buku</th>
                  <th className="p-4 w-[18%] text-center">Keterangan</th>
                  <th className="p-4 w-[12%] text-center">Kategori</th>
                  <th className="p-4 w-[9%] text-center">Tahun</th>
                  <th className="p-4 w-[9%] text-center">Eksemplar</th>
                  <th className="p-4 w-[9%] text-center">Tersedia</th>
                  <th className="p-4 w-[9%] text-center">Status</th>
                  <th className="p-4 w-[14%] pr-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredBuku.map((buku) => {
                  const sedangDipinjam = buku.jumlah_eksemplar - buku.jumlah_tersedia
                  let statusBadge = (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700">
                      Tersedia
                    </span>
                  )
                  if (buku.jumlah_tersedia === 0) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-red-50 text-red-700">
                        Habis
                      </span>
                    )
                  } else if (sedangDipinjam > 0) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700">
                        Dipinjam sebagian
                      </span>
                    )
                  }

                  return (
                    <tr key={buku.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div>
                          <div className="font-bold text-slate-900 text-base font-headline">{buku.judul}</div>
                          <div className="text-sm mt-0.5">{buku.pengarang || 'Anonim'}</div>
                        </div>
                      </td>
                      <td className="p-4 text-center text-slate-600 font-medium">
                        <div className="text-slate-900 text-sm font-headline">{buku.keterangan}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold">
                          {buku.kategori?.nama || 'Tanpa Kategori'}
                        </span>
                      </td>
                      <td className="p-4 text-center text-sm text-slate-600 font-medium">
                        {buku.tahun || '-'}
                      </td>
                      <td className="p-4 text-center text-sm text-slate-900 font-semibold">
                        {buku.jumlah_eksemplar}
                      </td>
                      <td className="p-4 text-center text-sm text-primary font-bold">
                        {buku.jumlah_tersedia}
                      </td>
                      <td className="p-4 text-center">
                        {statusBadge}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(buku)}
                            className="p-2 bg-blue-50 text-primary hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Buku"
                          >
                            <Pencil className="w-8 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(buku.id)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Buku"
                          >
                            <Trash2 className="w-8 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over or Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <h2 className="text-lg font-bold font-headline text-slate-900">
                {editingId ? 'Edit Data Buku' : 'Tambah Buku Baru'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-neutral transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-body">
                  {error}
                </div>
              )}

              {/* Judul */}
              <div className="space-y-1">
                <label className="text-sm font-bold font-headline uppercase tracking-wider text-slate-700 block">
                  Judul Buku
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laskar Pelangi"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-base text-slate-900"
                />
              </div>

              {/* Pengarang & Tahun */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-base font-bold font-headline uppercase tracking-wider text-slate-700 block">
                    Pengarang
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Andrea Hirata"
                    value={formData.pengarang || ''}
                    onChange={(e) => setFormData({ ...formData, pengarang: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-base text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-base font-bold font-headline uppercase tracking-wider text-slate-700 block">
                    Tahun Terbit
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 2005"
                    value={formData.tahun || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, tahun: e.target.value ? parseInt(e.target.value) : null })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-base text-slate-900"
                  />
                </div>
              </div>

              {/* Kategori & Eksemplar */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-base font-bold font-headline uppercase tracking-wider text-slate-700 block">
                    Kategori
                  </label>
                  <select
                    value={formData.kategori_id || ''}
                    onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value || null })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-base text-slate-700 font-headline font-semibold cursor-pointer"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-base font-bold font-headline uppercase tracking-wider text-slate-700 block">
                    Jumlah Eksemplar
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.jumlah_eksemplar}
                    onChange={(e) =>
                      setFormData({ ...formData, jumlah_eksemplar: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-base text-slate-900"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div className="space-y-1">
                <label className="text-base font-bold font-headline uppercase tracking-wider text-slate-700 block">
                  Keterangan
                </label>
                <textarea
                  placeholder="Sumber dana, jumlah judul, kondisi, dll"
                  value={formData.keterangan || ''}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-base text-slate-900"
                  rows="5"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 font-bold font-headline text-slate-700 rounded-xl transition-all text-base cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold font-headline rounded-xl shadow-md hover:shadow-primary/20 transition-all flex items-center gap-2 text-base cursor-pointer"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingId ? 'Simpan Perubahan' : 'Tambah Buku'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

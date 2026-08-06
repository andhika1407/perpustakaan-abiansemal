'use client'

import React, { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import { createKategori, updateKategori, deleteKategori } from './actions'

type Kategori = {
  id: string
  nama: string
}

export default function KategoriContent({ initialData }: { initialData: Kategori[] }) {
  const [kategoriList, setKategoriList] = useState<Kategori[]>(initialData)
  const [search, setSearch] = useState('')
  const [newNama, setNewNama] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNama, setEditingNama] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Filter list
  const filteredList = kategoriList.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = () => {
    if (!newNama.trim()) return
    setError(null)
    startTransition(async () => {
      const res = await createKategori(newNama)
      if (res.error) {
        setError(res.error)
      } else {
        setNewNama('')
        // Optimistic / Local update since we revalidated, or we can just append/fetch.
        // Let's refetch or update state dynamically. Since revalidatePath was called,
        // we can update local state to reflect changes instantly.
        window.location.reload()
      }
    })
  }

  const handleSaveEdit = (id: string) => {
    if (!editingNama.trim()) return
    setError(null)
    startTransition(async () => {
      const res = await updateKategori(id, editingNama)
      if (res.error) {
        setError(res.error)
      } else {
        setEditingId(null)
        setEditingNama('')
        window.location.reload()
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return
    setError(null)
    startTransition(async () => {
      const res = await deleteKategori(id)
      if (res.error) {
        setError(res.error)
      } else {
        window.location.reload()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-headline text-slate-900">Kategori Buku</h1>
          <p className="text-sm text-neutral mt-1">Kelola kategori untuk mengklasifikasikan koleksi buku perpustakaan.</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Add Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 h-fit shadow-sm">
          <h2 className="text-lg font-bold font-headline text-slate-900 mb-4">Tambah Kategori Baru</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold font-headline uppercase tracking-wider text-slate-700 block mb-1.5">
                Nama Kategori
              </label>
              <input
                type="text"
                placeholder="Contoh: Fiksi, Sains, Sejarah"
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-slate-900 text-sm"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={isPending || !newNama.trim()}
              className="w-full py-3 bg-primary hover:bg-blue-700 text-white font-bold font-headline rounded-xl transition-all shadow-md hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Tambah Kategori</span>
            </button>
          </div>
        </div>

        {/* Right Side: List Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Search and Metadata */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <input
                type="text"
                placeholder="Cari kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-slate-900 text-sm max-w-xs"
              />
              <span className="text-xs font-semibold text-neutral">
                Menampilkan {filteredList.length} kategori
              </span>
            </div>

            {/* List */}
            {filteredList.length === 0 ? (
              <div className="p-10 text-center text-neutral text-sm">
                Tidak ada kategori ditemukan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold font-headline uppercase tracking-wider text-slate-500">
                      <th className="p-4 pl-6">Nama Kategori</th>
                      <th className="p-4 pr-6 text-right w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {filteredList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          {editingId === item.id ? (
                            <input
                              type="text"
                              value={editingNama}
                              onChange={(e) => setEditingNama(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg outline-none text-slate-900 text-sm"
                            />
                          ) : (
                            <span className="font-medium text-slate-900">{item.nama}</span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {editingId === item.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  disabled={isPending || !editingNama.trim()}
                                  className="p-2 bg-emerald-50 text-secondary hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                                  title="Simpan"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-2 bg-slate-100 text-neutral hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                  title="Batal"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(item.id)
                                    setEditingNama(item.nama)
                                  }}
                                  className="p-2 bg-blue-50 text-primary hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

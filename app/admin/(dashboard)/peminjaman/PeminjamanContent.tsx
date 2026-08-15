'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { Plus, X, Search, BookOpen, Calendar, User, BookMarked, Clock, CheckCircle2, AlertCircle, Loader2, Trash2, FileDown } from 'lucide-react'
import Select from 'react-select';
import { createPeminjaman, kembalikanBuku, deletePeminjaman, type PeminjamanData } from './actions'

type BukuInfo = {
  id: string
  judul: string
  pengarang: string | null
  jumlah_tersedia: number
}

type Peminjaman = {
  id: string
  buku_id: string
  nama_siswa: string
  kelas: string
  tanggal_pinjam: string
  tanggal_jatuh_tempo: string
  tanggal_kembali: string | null
  status: 'dipinjam' | 'dikembalikan' | 'telat'
  created_at: string
  buku: {
    id: string
    judul: string
    pengarang: string | null
  } | null
}

export default function PeminjamanContent({
  initialPeminjaman,
  availableBooks,
}: {
  initialPeminjaman: Peminjaman[]
  availableBooks: BukuInfo[]
}) {
  const [peminjamanList, setPeminjamanList] = useState<Peminjaman[]>(initialPeminjaman)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'dipinjam' | 'dikembalikan' | 'telat'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isPDFLoading, setIsPDFLoading] = useState(false)

  // Modal State
  const [isOpen, setIsOpen] = useState(false)

  // Form State
  const getDefaultDueDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7) // Default 7 days from now
    return date.toLocaleDateString('en-CA') // YYYY-MM-DD
  }

  const [formData, setFormData] = useState<PeminjamanData>({
    buku_id: '',
    nama_siswa: '',
    kelas: '',
    tanggal_jatuh_tempo: getDefaultDueDate(),
  })

  // Open modal for Create
  const handleOpenCreate = () => {
    setError(null)
    setFormData({
      buku_id: availableBooks[0]?.id || '',
      nama_siswa: '',
      kelas: '',
      tanggal_jatuh_tempo: getDefaultDueDate(),
    })
    setIsOpen(true)
  }

  // Submit Form (Create Peminjaman)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const res = await createPeminjaman(formData)

      if (res.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
        window.location.reload()
      }
    })
  }

  // Delete Peminjaman
  const handleDelete = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data peminjaman ini? Tindakan ini tidak dapat dibatalkan.')) return
    setError(null)
    startTransition(async () => {
      const res = await deletePeminjaman(id)
      if (res.error) {
        setError(res.error)
      } else {
        window.location.reload()
      }
    })
  }

  // Process Return Book
  const handleReturn = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menandai buku ini telah dikembalikan?')) return
    setError(null)
    startTransition(async () => {
      const res = await kembalikanBuku(id)
      if (res.error) {
        setError(res.error)
      } else {
        window.location.reload()
      }
    })
  }

  // Download PDF (lazy-load @react-pdf/renderer only on click)
  const handleDownloadPDF = async () => {
    if (isPDFLoading) return
    setIsPDFLoading(true)
    try {
      const [{ pdf }, { default: PeminjamanPDFDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./PeminjamanPDFDocument'),
      ])
      const blob = await pdf(
        <PeminjamanPDFDocument
          data={filteredPeminjaman}
          stats={pdfStats}
          filterLabel={filterLabel}
          searchQuery={search}
          printDate={printDate}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = pdfFileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Gagal membuat PDF:', err)
    } finally {
      setIsPDFLoading(false)
    }
  }

  // Filter & Search Logic
  const filteredPeminjaman = peminjamanList.filter((item) => {
    const matchesSearch =
      item.nama_siswa.toLowerCase().includes(search.toLowerCase()) ||
      item.kelas.toLowerCase().includes(search.toLowerCase()) ||
      (item.buku && item.buku.judul.toLowerCase().includes(search.toLowerCase()))

    // const matchesStatus =
    //   statusFilter === 'all' || item.status === statusFilter

    const matchesDate = 
      !startDate && !endDate ? true :
      !startDate ? new Date(item.tanggal_pinjam) <= new Date(endDate) :
      !endDate ? new Date(item.tanggal_pinjam) >= new Date(startDate) :
      new Date(item.tanggal_pinjam) >= new Date(startDate) && 
      new Date(item.tanggal_pinjam) <= new Date(endDate)

    // return matchesSearch && matchesStatus
    return matchesSearch && matchesDate
  })

  // Statistics
  const totalPinjam = filteredPeminjaman.length
  const sedangDipinjam = filteredPeminjaman.filter((i) => i.status === 'dipinjam').length
  const terlambat = filteredPeminjaman.filter((i) => i.status === 'telat').length
  const selesai = filteredPeminjaman.filter((i) => i.status === 'dikembalikan').length

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Books option
  const options = availableBooks.map((buku) => ({
    value: buku.id,
    label: `${buku.judul} — Stok: ${buku.jumlah_tersedia}`,
  }));

  // ── PDF helpers ──────────────────────────────────────────────────────────
  const filterLabel = useMemo(() => {
    switch (statusFilter) {
      case 'all': return 'Semua'
      case 'dipinjam': return 'Dipinjam'
      case 'telat': return 'Terlambat'
      case 'dikembalikan': return 'Dikembalikan'
      default: return 'Semua'
    }
  }, [statusFilter])

  const pdfStats = useMemo(() => ({
    total: totalPinjam,
    dipinjam: sedangDipinjam,
    terlambat: terlambat,
    selesai: selesai,
  }), [totalPinjam, sedangDipinjam, terlambat, selesai])

  const printDate = useMemo(() => {
    const now = new Date()
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ]
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
  }, [])

  const pdfFileName = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const hr = String(now.getHours()).padStart(2, '0')
    const mnt = String(now.getMinutes()).padStart(2, '0')
    const sec = String(now.getSeconds()).padStart(2, '0')
    return `laporan-peminjaman-${y}${m}${d}-${hr}${mnt}${sec}.pdf`
  }, [statusFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-headline text-slate-900">Modul Peminjaman Buku</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Cetak PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isPDFLoading}
            className="px-5 py-3 bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-700 font-bold font-headline rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-base cursor-pointer"
          >
            {isPDFLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : (
              <FileDown className="w-5 h-5 text-slate-500" />
            )}
            <span>{isPDFLoading ? 'Menyiapkan...' : 'Cetak ke PDF'}</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 bg-primary hover:bg-blue-700 text-white font-bold font-headline rounded-xl shadow-md hover:shadow-primary/20 transition-all flex items-center gap-2 text-base cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Pinjamkan Buku</span>
          </button>
        </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-primary rounded-xl">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base text-neutral font-medium">Total Peminjaman</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalPinjam}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base text-neutral font-medium">Sedang Dipinjam</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{sedangDipinjam}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base text-neutral font-medium">Terlambat</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{terlambat}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-secondary rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base text-neutral font-medium">Sudah Kembali</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{selesai}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa, kelas, atau judul buku..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-200 border border-slate-400 rounded-xl text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
        </div>

        {/* Status Filters */}
        {/* <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 rounded-xl self-start md:self-auto">
          {[
            { value: 'all', label: 'Semua' },
            { value: 'dipinjam', label: 'Dipinjam' },
            { value: 'telat', label: 'Terlambat' },
            { value: 'dikembalikan', label: 'Dikembalikan' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value as any)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div> */}

        {/* Date Filters */}
        <div className="inline-flex gap-4">
          <div>
            <label className="bg-white text-sm text-slate-500">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              placeholder='Tanggal Mulai'
            />
          </div>
          <div>
            <label className="bg-white text-sm text-slate-500">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              placeholder='Tanggal Akhir'
            />
          </div>
        </div>

      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full lg:table-fixed min-w-[800px] border-collapse text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-headline font-bold text-sm text-center uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 lg:w-[20%]">Nama Siswa</th>
                <th className="px-6 py-4 lg:w-[15%]">Buku</th>
                <th className="px-6 py-4 lg:w-[15%]">Tanggal Pinjam</th>
                <th className="px-6 py-4 lg:w-[15%]">Tenggat Waktu</th>
                <th className="px-6 py-4 lg:w-[15%]">Tanggal Kembali</th>
                <th className="px-6 py-4 lg:w-[10%]">Status</th>
                <th className="px-6 py-4 lg:w-[10%]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-body">
              {filteredPeminjaman.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral">
                    Tidak ada data peminjaman yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPeminjaman.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Siswa */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-base">{item.nama_siswa}</div>
                        <div className="text-sm text-neutral mt-0.5">Kelas {item.kelas}</div>
                      </td>
                      {/* Buku */}
                      <td className="px-6 py-4">
                        <div className="text-base font-medium text-slate-900 max-w-xs">
                          {item.buku?.judul || 'Buku Terhapus'}
                        </div>
                      </td>
                      {/* Tanggal Pinjam */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {formatDate(item.tanggal_pinjam)}
                      </td>
                      {/* Tanggal Jatuh Tempo */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                        {formatDate(item.tanggal_jatuh_tempo)}
                      </td>
                      {/* Tanggal Kembali */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {formatDate(item.tanggal_kembali)}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === 'dipinjam' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold bg-blue-50 text-primary border border-blue-100">
                            <Clock className="w-3.5 h-3.5" />
                            Dipinjam
                          </span>
                        )}
                        {item.status === 'telat' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold bg-red-50 text-red-600 border border-red-100 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Terlambat
                          </span>
                        )}
                        {item.status === 'dikembalikan' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold bg-green-50 text-secondary border border-green-100">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Kembali
                          </span>
                        )}
                      </td>
                      {/* Aksi */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex flex-col items-center justify-end gap-4">
                          {(item.status === 'dipinjam' || item.status === 'telat') && (
                            <button
                              onClick={() => handleReturn(item.id)}
                              disabled={isPending}
                              className="px-3.5 py-1.5 bg-secondary hover:bg-green-600 disabled:bg-slate-200 text-white text-sm font-bold font-headline rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              {isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>Kembalikan</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isPending}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-sm font-bold font-headline rounded-lg border border-red-200 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog Form */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold font-headline text-slate-900">Form Peminjaman Buku</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-600 hover:text-slate-800 rounded-lg p-1 hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Pilih Buku */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BookMarked className="w-4 h-4 text-neutral" />
                  Pilih Buku
                </label>
                {availableBooks.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl">
                    Tidak ada buku yang saat ini tersedia (stok kosong). Silakan tambah atau update buku di modul Daftar Buku.
                  </div>
                ) : (
                  <Select
                    options={options}
                    value={options.find((o) => o.value === formData.buku_id) || null}
                    onChange={(selected) => setFormData({ ...formData, buku_id: selected?.value || '' })}
                    placeholder="-- Cari Buku --"
                    isClearable
                    classNames={{
                      control: () => 'border border-slate-200 rounded-xl',
                    }}
                  />
                )}
              </div>

              {/* Nama Siswa */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-neutral" />
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  placeholder="Contoh: I Putu Gede"
                  value={formData.nama_siswa}
                  onChange={(e) => setFormData({ ...formData, nama_siswa: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Kelas */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-neutral" />
                  Kelas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: IV A"
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Tanggal Jatuh Tempo */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral" />
                  Tanggal Jatuh Tempo (Kembali)
                </label>
                <input
                  type="date"
                  value={formData.tanggal_jatuh_tempo}
                  onChange={(e) => setFormData({ ...formData, tanggal_jatuh_tempo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold font-headline rounded-xl text-base transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending || availableBooks.length === 0}
                  className="px-5 py-2.5 bg-primary hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold font-headline rounded-xl shadow-md hover:shadow-primary/20 transition-all flex items-center gap-2 text-base cursor-pointer"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Pinjamkan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

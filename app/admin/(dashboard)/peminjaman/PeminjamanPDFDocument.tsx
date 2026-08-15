import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'

// ─── Type Definitions ────────────────────────────────────────────────────────

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

type PDFStats = {
  total: number
  dipinjam: number
  terlambat: number
  selesai: number
}

type PeminjamanPDFDocumentProps = {
  data: Peminjaman[]
  stats: PDFStats
  filterLabel: string
  searchQuery: string
  printDate: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDatePDF = (dateString: string | null): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des',
  ]
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

const getStatusLabel = (status: Peminjaman['status']): string => {
  switch (status) {
    case 'dipinjam':
      return 'Dipinjam'
    case 'telat':
      return 'TERLAMBAT'
    case 'dikembalikan':
      return 'Dikembalikan'
    default:
      return status
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 36,
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerMeta: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
  },
  headerMetaBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
  },
  filterInfo: {
    marginBottom: 14,
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  filterInfoText: {
    fontSize: 8,
    color: '#475569',
  },
  filterInfoBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statCardBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  statCardAmber: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  statCardRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  statCardGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  statLabel: {
    fontSize: 7,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  statValueBlue: { color: '#2563eb' },
  statValueAmber: { color: '#d97706' },
  statValueRed: { color: '#dc2626' },
  statValueGreen: { color: '#16a34a' },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a8a',
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableRowLate: {
    backgroundColor: '#fff5f5',
  },
  tableCell: {
    fontSize: 8,
    color: '#334155',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  tableCellLeft: {
    textAlign: 'left',
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  tableCellLate: {
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626',
  },
  tableCellGreen: {
    color: '#16a34a',
    fontFamily: 'Helvetica-Bold',
  },
  tableCellBlue: {
    color: '#2563eb',
    fontFamily: 'Helvetica-Bold',
  },
  colNo: { width: '4%' },
  colSiswa: { width: '20%' },
  colKelas: { width: '8%' },
  colBuku: { width: '24%' },
  colPinjam: { width: '12%' },
  colTempo: { width: '12%' },
  colKembali: { width: '12%' },
  colStatus: { width: '8%' },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
  footerPageNumber: {
    fontSize: 7,
    color: '#94a3b8',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})

// ─── Document Component ────────────────────────────────────────────────────────

export default function PeminjamanPDFDocument({
  data,
  stats,
  filterLabel,
  searchQuery,
  printDate,
}: PeminjamanPDFDocumentProps) {
  const hasFilter = filterLabel !== 'Semua' || searchQuery.trim() !== ''

  return (
    <Document
      title="Laporan Peminjaman Buku"
      author="Perpustakaan SD Negeri 4 Abiansemal"
      subject="Laporan Data Peminjaman Buku"
      creator="Sistem Perpustakaan"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Laporan Peminjaman Buku</Text>
            <Text style={styles.headerSubtitle}>
              Perpustakaan SD Negeri 4 Abiansemal
            </Text>
            <Text style={styles.headerMeta}>
              Kecamatan Abiansemal, Kabupaten Badung, Bali
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMeta}>Tanggal Cetak:</Text>
            <Text style={styles.headerMetaBold}>{printDate}</Text>
            <Text style={[styles.headerMeta, { marginTop: 4 }]}>
              Total Data Ditampilkan:
            </Text>
            <Text style={styles.headerMetaBold}>{data.length} peminjaman</Text>
          </View>
        </View>

        {/* ── Active Filter Info ── */}
        {hasFilter && (
          <View style={styles.filterInfo}>
            <Text style={styles.filterInfoText}>
              {'Filter Aktif: '}
              <Text style={styles.filterInfoBold}>{filterLabel}</Text>
              {searchQuery.trim() !== '' && (
                <Text>
                  {'  |  Pencarian: '}
                  <Text style={styles.filterInfoBold}>
                    "{searchQuery}"
                  </Text>
                </Text>
              )}
              {'  —  Menampilkan '}
              <Text style={styles.filterInfoBold}>{data.length}</Text>
              {' dari '}
              <Text style={styles.filterInfoBold}>{stats.total}</Text>
              {' total peminjaman'}
            </Text>
          </View>
        )}

        {/* ── Statistics ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statLabel}>Total Peminjaman</Text>
            <Text style={[styles.statValue, styles.statValueBlue]}>
              {stats.total}
            </Text>
          </View>
          <View style={[styles.statCard, styles.statCardAmber]}>
            <Text style={styles.statLabel}>Sedang Dipinjam</Text>
            <Text style={[styles.statValue, styles.statValueAmber]}>
              {stats.dipinjam}
            </Text>
          </View>
          <View style={[styles.statCard, styles.statCardRed]}>
            <Text style={styles.statLabel}>Terlambat</Text>
            <Text style={[styles.statValue, styles.statValueRed]}>
              {stats.terlambat}
            </Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statLabel}>Sudah Kembali</Text>
            <Text style={[styles.statValue, styles.statValueGreen]}>
              {stats.selesai}
            </Text>
          </View>
        </View>

        {/* ── Section Title ── */}
        <Text style={styles.sectionTitle}>Daftar Peminjaman</Text>

        {/* ── Table ── */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNo]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colSiswa, { textAlign: 'left' }]}>
              Nama Siswa
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colKelas]}>Kelas</Text>
            <Text style={[styles.tableHeaderCell, styles.colBuku, { textAlign: 'left' }]}>
              Judul Buku
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colPinjam]}>Tgl. Pinjam</Text>
            <Text style={[styles.tableHeaderCell, styles.colTempo]}>Jatuh Tempo</Text>
            <Text style={[styles.tableHeaderCell, styles.colKembali]}>Tgl. Kembali</Text>
            <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
          </View>

          {/* Table Body */}
          {data.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Tidak ada data peminjaman yang sesuai filter.
              </Text>
            </View>
          ) : (
            data.map((item, index) => {
              const isLate = item.status === 'telat'
              const isDone = item.status === 'dikembalikan'
              const rowStyle: Style[] = [
                styles.tableRow as Style,
                ...(index % 2 !== 0 ? [styles.tableRowAlt as Style] : []),
                ...(isLate ? [styles.tableRowLate as Style] : []),
              ]

              return (
                <View key={item.id} style={rowStyle}>
                  <Text style={[styles.tableCell, styles.colNo]}>
                    {index + 1}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableCellLeft,
                      styles.tableCellBold,
                      styles.colSiswa,
                    ]}
                  >
                    {item.nama_siswa}
                  </Text>
                  <Text style={[styles.tableCell, styles.colKelas]}>
                    {item.kelas}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableCellLeft,
                      styles.colBuku,
                    ]}
                  >
                    {item.buku?.judul ?? 'Buku Terhapus'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colPinjam]}>
                    {formatDatePDF(item.tanggal_pinjam)}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.colTempo,
                      ...(isLate ? [styles.tableCellLate] : []),
                    ]}
                  >
                    {formatDatePDF(item.tanggal_jatuh_tempo)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colKembali]}>
                    {formatDatePDF(item.tanggal_kembali)}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.colStatus,
                      ...(isLate
                        ? [styles.tableCellLate]
                        : isDone
                          ? [styles.tableCellGreen]
                          : [styles.tableCellBlue]),
                    ]}
                  >
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
              )
            })
          )}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Perpustakaan SD Negeri 4 Abiansemal — Dicetak: {printDate}
          </Text>
          <Text
            style={styles.footerPageNumber}
            render={({ pageNumber, totalPages }) =>
              `Halaman ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}

import React from 'react'
import { getPeminjaman, getBooksAvailable } from './actions'
import PeminjamanContent from './PeminjamanContent'

export const dynamic = 'force-dynamic'

export default async function PeminjamanPage() {
  const [peminjamanData, availableBooks] = await Promise.all([
    getPeminjaman(),
    getBooksAvailable(),
  ])

  return (
    <PeminjamanContent
      initialPeminjaman={peminjamanData || []}
      availableBooks={availableBooks || []}
    />
  )
}

import React from 'react'
import { getBuku } from './actions'
import { getKategori } from '../kategori/actions'
import BukuContent from './BukuContent'

export const dynamic = 'force-dynamic'

export default async function BukuPage() {
  const [bukuData, kategoriData] = await Promise.all([
    getBuku(),
    getKategori(),
  ])

  return (
    <BukuContent
      initialBuku={bukuData || []}
      categories={kategoriData || []}
    />
  )
}

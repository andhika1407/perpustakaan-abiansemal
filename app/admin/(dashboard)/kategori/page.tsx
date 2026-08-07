import React from 'react'
import { getKategori } from './actions'
import KategoriContent from './KategoriContent'

export const dynamic = 'force-dynamic'

export default async function KategoriPage() {
  const data = await getKategori()
  return <KategoriContent initialData={data || []} />
}

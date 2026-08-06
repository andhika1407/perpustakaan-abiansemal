import React from 'react'
import { BookOpen, FolderHeart, BookMarked, LogOut } from 'lucide-react'
import Link from 'next/link'
import { logout } from './actions'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-body">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand/Logo Header */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold font-headline text-slate-900 leading-tight">Perpustakaan</h2>
              <p className="text-xs text-neutral">SDN Abiansemal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link
              href="/admin/buku"
              className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-primary rounded-xl transition-all duration-200 group font-headline font-semibold text-sm"
            >
              <BookMarked className="w-5 h-5 text-neutral group-hover:text-primary transition-colors" />
              <span>Daftar Buku</span>
            </Link>
            <Link
              href="/admin/kategori"
              className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-primary rounded-xl transition-all duration-200 group font-headline font-semibold text-sm"
            >
              <FolderHeart className="w-5 h-5 text-neutral group-hover:text-primary transition-colors" />
              <span>Kategori Buku</span>
            </Link>
            <Link
              href="/admin/peminjaman"
              className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-primary rounded-xl transition-all duration-200 group font-headline font-semibold text-sm"
            >
              <BookOpen className="w-5 h-5 text-neutral group-hover:text-primary transition-colors" />
              <span>Peminjaman</span>
            </Link>
          </nav>
        </div>

        {/* Footer/Logout Action */}
        <div className="p-4 border-t border-slate-100">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-headline font-semibold text-sm cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}

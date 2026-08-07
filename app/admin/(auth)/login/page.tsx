'use client'

import React, { useActionState, useEffect } from 'react'
import { login } from './actions'
import { BookOpen, Mail, Lock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(login, null)

  useEffect(() => {
    if (state?.success) {
      router.push('/admin/buku')
      router.refresh()
    }
  }, [state, router])

  return (
    <div className="h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden font-body">
      {/* Decorative gradient blur background elements */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main glassmorphism card */}
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header/Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4 transform hover:scale-105 transition-transform duration-300">
            <BookOpen className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold font-headline tracking-tight text-slate-900">
            Admin Perpustakaan
          </h1>
          <p className="text-base text-neutral mt-1">
            SD Negeri 4 Abiansemal
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl animate-shake font-body">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-bold font-headline uppercase tracking-wider text-slate-700 block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-6 h-6" />
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@sekolah.sch.id"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all placeholder:text-slate-400 text-base text-slate-900 font-body"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold font-headline uppercase tracking-wider text-slate-700 block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-6 h-6" />
              </span>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all placeholder:text-slate-400 text-base text-slate-900 font-body"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-primary hover:bg-blue-700 text-white font-bold font-headline rounded-xl transition-all shadow-md hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2 text-base cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk Ke Dashboard</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

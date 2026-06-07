'use client'

import { useState } from 'react'
import { Menu, Sprout } from 'lucide-react'
import Sidebar from './Sidebar'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#F2EFE8] overflow-hidden">

      {/* ── Mobile header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#111D0B]/97 backdrop-blur-md flex items-center px-4 gap-3 border-b border-white/[0.06]">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150 cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#C49A3C]/15 ring-1 ring-[#C49A3C]/20 flex items-center justify-center">
            <Sprout className="h-3.5 w-3.5 text-[#C49A3C]" />
          </div>
          <span className="text-[14px] font-semibold text-white tracking-wide">
            Campo<span className="text-[#C49A3C]">Net</span>
          </span>
        </div>
      </div>

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0 scrollbar-thin">
        <div className="p-6 md:p-8 xl:p-10 max-w-[1200px] mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}

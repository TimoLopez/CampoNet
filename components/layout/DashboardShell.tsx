'use client'

import { useState } from 'react'
import { Menu, Sprout } from 'lucide-react'
import Sidebar from './Sidebar'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#F2EFE8] overflow-hidden">
      {/* Mobile header — hidden on md+ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#1C3311] flex items-center px-4 gap-3 border-b border-white/10">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white/70 hover:text-white transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#C49A3C]/20 flex items-center justify-center">
            <Sprout className="h-3.5 w-3.5 text-[#C49A3C]" />
          </div>
          <span className="text-[14px] font-semibold text-white tracking-wide">
            Campo<span className="text-[#C49A3C]">Net</span>
          </span>
        </div>
      </div>

      {/* Backdrop — mobile only, shown when sidebar open */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

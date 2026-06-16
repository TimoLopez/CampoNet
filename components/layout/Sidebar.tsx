'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, MapPin, Users, User, LogOut, Sprout, X, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/campos', label: 'Mis Campos', icon: MapPin, exact: false },
  { href: '/dashboard/crm', label: 'CRM', icon: Users, exact: false },
  { href: '/dashboard/inteligencia', label: 'Inteligencia', icon: BarChart3, exact: false },
  { href: '/dashboard/perfil', label: 'Mi Perfil', icon: User, exact: false },
]

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className={cn(
      'w-[220px] xl:w-[240px] flex flex-col h-screen shrink-0',
      'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out',
      'md:static md:translate-x-0',
      mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      // Dark forest green sidebar
      'bg-[#111D0B]',
    )}>

      {/* Subtle grain texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Close button — mobile only */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all duration-150 cursor-pointer"
        aria-label="Cerrar menú"
      >
        <X className="h-4 w-4" />
      </button>

      {/* ── Logo ── */}
      <div className="relative z-10 px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-[#C49A3C]/12 ring-1 ring-[#C49A3C]/20 flex items-center justify-center shrink-0">
            <Sprout className="h-4.5 w-4.5 text-[#C49A3C]" />
            <div className="absolute inset-0 rounded-xl bg-[#C49A3C]/5 blur-sm" aria-hidden />
          </div>
          <div className="leading-none">
            <span className="text-[15px] font-semibold text-white tracking-wide">
              Campo<span className="text-[#C49A3C]">Net</span>
            </span>
            <p className="text-[10px] text-white/25 mt-0.5 tracking-widest uppercase">Uruguay</p>
          </div>
        </div>
      </div>

      {/* Thin separator */}
      <div className="relative z-10 mx-5 h-px bg-white/[0.06]" />

      {/* ── Nav ── */}
      <nav className="relative z-10 flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.14em] px-3 pb-3">
          Gestión
        </p>

        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 cursor-pointer',
                isActive
                  ? 'bg-[#C49A3C]/10 text-white'
                  : 'text-white/40 hover:bg-white/[0.05] hover:text-white/80',
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#C49A3C]" aria-hidden />
              )}
              <Icon className={cn(
                'h-4 w-4 shrink-0 transition-colors duration-150',
                isActive ? 'text-[#C49A3C]' : 'text-white/30 group-hover:text-white/60',
              )} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="relative z-10 px-3 pb-5">
        <div className="h-px bg-white/[0.06] mb-3" />
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[13.5px] font-medium text-white/30 hover:bg-red-950/40 hover:text-red-400/90 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0 text-white/20 group-hover:text-red-400/70 transition-colors duration-150" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

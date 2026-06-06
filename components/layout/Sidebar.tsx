'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, MapPin, Users, User, LogOut, Sprout, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/campos', label: 'Mis Campos', icon: MapPin, exact: false },
  { href: '/dashboard/crm', label: 'CRM', icon: Users, exact: false },
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
      'w-64 bg-[#1C3311] flex flex-col h-screen shrink-0',
      'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out',
      'md:static md:translate-x-0',
      mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    )}>
      {/* Close button — mobile only */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/8 transition-all duration-150 cursor-pointer"
        aria-label="Cerrar menú"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C49A3C]/20 ring-1 ring-[#C49A3C]/20 flex items-center justify-center shrink-0">
            <Sprout className="h-4 w-4 text-[#C49A3C]" />
          </div>
          <div>
            <span className="text-[15px] font-semibold text-white tracking-wide">
              Campo<span className="text-[#C49A3C]">Net</span>
            </span>
            <p className="text-[10px] text-white/30 leading-none mt-0.5">Uruguay</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[11px] font-semibold text-white/25 uppercase tracking-widest px-3 pb-2.5">
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer group relative',
                isActive
                  ? 'bg-[#C49A3C]/10 text-[#E8C96A] border-l-2 border-[#C49A3C] pl-[10px]'
                  : 'text-white/55 hover:bg-white/8 hover:text-white border-l-2 border-transparent pl-[10px]'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors duration-150',
                  isActive ? 'text-[#C49A3C]' : 'group-hover:text-white/80'
                )}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="px-3 py-4 border-t border-white/8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 pl-[10px] w-full rounded-lg text-sm font-medium text-white/35 hover:bg-red-950/30 hover:text-red-400 transition-all duration-200 cursor-pointer border-l-2 border-transparent"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

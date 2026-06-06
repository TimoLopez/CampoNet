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
        className="md:hidden absolute top-3 right-3 text-white/50 hover:text-white transition-colors cursor-pointer"
        aria-label="Cerrar menú"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C49A3C]/20 flex items-center justify-center shrink-0">
            <Sprout className="h-4 w-4 text-[#C49A3C]" />
          </div>
          <span className="text-[15px] font-semibold text-white tracking-wide">
            Campo<span className="text-[#C49A3C]">Net</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 pb-2">
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer group',
                isActive
                  ? 'bg-[#C49A3C]/12 text-[#E8C96A] border border-[#C49A3C]/20'
                  : 'text-white/55 hover:bg-white/6 hover:text-white/90 border border-transparent'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors duration-150',
                  isActive ? 'text-[#C49A3C]' : 'group-hover:text-white/80'
                )}
              />
              <span>{label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C49A3C] shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

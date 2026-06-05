'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, MapPin, Users, User, LogOut, Sprout } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/campos', label: 'Mis Campos', icon: MapPin, exact: false },
  { href: '/dashboard/crm', label: 'CRM', icon: Users, exact: false },
  { href: '/dashboard/perfil', label: 'Mi Perfil', icon: User, exact: false },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-[#1C3311] flex flex-col shrink-0 h-screen">
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

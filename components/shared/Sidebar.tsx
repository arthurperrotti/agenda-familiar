'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import {
  CalendarDays,
  Target,
  Settings,
  LogOut,
  Sun,
  Moon,
  CalendarRange,
  X,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/agenda/semana', label: 'Semana', icon: CalendarDays },
  { href: '/agenda/mes',    label: 'Mês',    icon: CalendarRange },
  { href: '/objetivos',     label: 'Objetivos', icon: Target },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  // Fecha a sidebar ao navegar no mobile
  useEffect(() => { setOpen(false) }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navContent = (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Agenda Familiar</span>
        </div>
        {/* Botão fechar — só aparece no mobile */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href)
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          href="/configuracoes"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/configuracoes'
              ? 'bg-primary text-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Configurações
        </Link>

        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {theme === 'dark' ? (
              <><Sun className="w-4 h-4 shrink-0" />Tema claro</>
            ) : (
              <><Moon className="w-4 h-4 shrink-0" />Tema escuro</>
            )}
          </button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent px-3"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Botão hamburguer — só aparece no mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 p-2 rounded-lg bg-background border border-border shadow-sm hover:bg-muted transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay escuro — só no mobile quando sidebar aberta */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar desktop — sempre visível */}
      <aside className="hidden md:flex w-60 shrink-0 h-screen sticky top-0 flex-col border-r border-border bg-sidebar">
        {navContent}
      </aside>

      {/* Sidebar mobile — slide-in */}
      <aside
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-border bg-sidebar transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {navContent}
      </aside>
    </>
  )
}

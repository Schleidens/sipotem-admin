import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Activity,
  BadgeDollarSign,
  BarChart3,
  Bell,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Shield,
  Sun,
  Users,
  Wallet,
  X,
  Award,
  ArrowLeftRight,
  Eye,
  Banknote,
  UserCircle,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'
import { ActionModal } from '@/components/shared/ActionModal'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/theme/ThemeProvider'
import { cn } from '@/lib/utils'
import { useMemo, useState, type ComponentType } from 'react'

type NavItem = {
  to: string
  label: string
  end?: boolean
  superuserOnly?: boolean
  icon: ComponentType<{ className?: string }>
}

type NavGroup = { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { to: '/', label: 'Dashboard', end: true, icon: LayoutDashboard },
      { to: '/users', label: 'Users', icon: Users },
      { to: '/verification', label: 'Verification', icon: Shield },
      { to: '/payouts', label: 'Payouts', icon: Wallet },
      { to: '/transactions', label: 'Transactions', icon: BadgeDollarSign },
      { to: '/fundraisers', label: 'Fundraisers', icon: Activity },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/catalog/categories', label: 'Categories', icon: FolderTree },
      { to: '/catalog/profile-items', label: 'Profile items', icon: Award },
      { to: '/catalog/badges', label: 'Badges', icon: Award },
      { to: '/exchange-rates', label: 'Exchange rates', icon: ArrowLeftRight },
      { to: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Stats',
    items: [
      { to: '/stats/users', label: 'Users', icon: BarChart3 },
      { to: '/stats/transactions', label: 'Transactions', icon: BarChart3 },
      { to: '/stats/visits', label: 'Visits', icon: Eye },
      { to: '/stats/money', label: 'Money', icon: Banknote, superuserOnly: true },
      { to: '/stats/money-by-user', label: 'Money by user', icon: UserCircle, superuserOnly: true },
    ],
  },
  {
    label: 'System',
    items: [{ to: '/audit', label: 'Audit log', icon: ClipboardList }],
  },
]

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/verification': 'Verification',
  '/payouts': 'Payouts',
  '/transactions': 'Transactions',
  '/fundraisers': 'Fundraisers',
  '/catalog/categories': 'Categories',
  '/catalog/profile-items': 'Profile items',
  '/catalog/badges': 'Badges',
  '/exchange-rates': 'Exchange rates',
  '/notifications': 'Notifications',
  '/stats/users': 'Stats · Users',
  '/stats/transactions': 'Stats · Transactions',
  '/stats/visits': 'Stats · Visits',
  '/stats/money': 'Stats · Money',
  '/stats/money-by-user': 'Stats · Money by user',
  '/audit': 'Audit log',
}

function titleForPath(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  for (const [base, title] of Object.entries(PAGE_TITLES)) {
    if (base !== '/' && pathname.startsWith(`${base}/`)) return title
  }
  return 'Admin'
}

export function AdminShell() {
  const { adminUser, firebaseUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [logoutBusy, setLogoutBusy] = useState(false)
  const isSuper = Boolean(adminUser?.is_superuser)
  const displayName = adminUser?.username || adminUser?.email || 'Staff'
  const pageTitle = titleForPath(location.pathname)
  const photoUrl =
    adminUser?.profile_picture || firebaseUser?.photoURL || null

  const groups = useMemo(
    () =>
      NAV_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((item) => !item.superuserOnly || isSuper),
      })).filter((g) => g.items.length > 0),
    [isSuper],
  )

  async function confirmLogout() {
    setLogoutBusy(true)
    try {
      await logout()
    } finally {
      setLogoutBusy(false)
      setLogoutOpen(false)
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Desktop / drawer sidebar — own scroll, fixed height */}
      <aside
        className={cn(
          'admin-sidebar fixed inset-y-0 left-0 z-40 flex h-dvh w-64 flex-col overflow-hidden transition-transform lg:static lg:z-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
          <img
            src="/sipotem-app-icon.png"
            alt="SipòteM"
            className="size-8 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">SipòteM</div>
            <div className="admin-sidebar-muted text-[11px]">Admin</div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 pb-4">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="admin-sidebar-muted mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'admin-sidebar-link flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors',
                          isActive && 'admin-sidebar-link-active',
                        )
                      }
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="admin-sidebar-link admin-sidebar-logout flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      {/* Main column — scrolls independently */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/80 bg-canvas px-4 lg:px-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
          <h1 className="text-lg font-semibold text-text lg:hidden">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-text">{displayName}</div>
              <div className="text-xs text-text-muted">{adminUser?.email}</div>
            </div>
            {isSuper ? <Badge tone="brand">Superuser</Badge> : <Badge>Staff</Badge>}
            <Avatar name={displayName} src={photoUrl} size="md" />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <ActionModal
        open={logoutOpen}
        title="Log out"
        confirmLabel="Log out"
        variant="dark"
        busy={logoutBusy}
        onClose={() => !logoutBusy && setLogoutOpen(false)}
        onConfirm={() => void confirmLogout()}
      >
        You will be signed out of SipòteM Admin. Your session token will be cleared.
      </ActionModal>
    </div>
  )
}

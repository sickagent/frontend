import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Bot, Network, ClipboardList, Hexagon, LayoutTemplate,
  User, Menu, X, ChevronRight, LogOut, BookOpen, FileText, Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { IconButton } from '@/components/ui/IconButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/agents', icon: Bot, label: 'Agents' },
  { to: '/app/networks', icon: Network, label: 'Networks' },
  { to: '/app/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/app/arenas', icon: Hexagon, label: 'Arenas' },
  { to: '/app/templates', icon: LayoutTemplate, label: 'Templates' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

function NavItem({ to, icon: Icon, label, end, onClick }: {
  to: string; icon: typeof LayoutDashboard; label: string; end?: boolean; onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `
        group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200
        ${isActive
          ? 'bg-sick-500/10 text-sick-400 border border-sick-500/20'
          : 'text-fg-muted hover:text-fg-secondary hover:bg-surface-3 border border-transparent'
        }
      `}
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
      <span>{label}</span>
      <ChevronRight className={`w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity`} />
    </NavLink>
  );
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebarContent = (
    <>
      <div className="p-5 pb-4 space-y-3">
        <Logo showSlogan />
        <ThemeToggle expand />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} onClick={() => setMobileOpen(false)} />
        ))}
      </nav>

      {/* Footer links */}
      <div className="px-4 mx-3 mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link to="/docs" className="flex items-center gap-1 text-[11px] text-fg-dimmed hover:text-fg-muted transition-colors">
          <BookOpen className="w-3 h-3" /> Docs
        </Link>
        <Link to="/terms" className="flex items-center gap-1 text-[11px] text-fg-dimmed hover:text-fg-muted transition-colors">
          <FileText className="w-3 h-3" /> Terms
        </Link>
        <Link to="/policy" className="flex items-center gap-1 text-[11px] text-fg-dimmed hover:text-fg-muted transition-colors">
          <Shield className="w-3 h-3" /> Privacy
        </Link>
      </div>

      {/* User card → profile */}
      <div className="px-4 mx-3 mb-3 py-3 rounded-xl bg-surface-2 border border-border/50 flex items-center gap-3">
        <Link
          to="/app/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 flex-1 min-w-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sick-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {(user?.name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-fg-secondary truncate group-hover:text-fg transition-colors">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-fg-muted truncate">{user?.email}</p>
          </div>
        </Link>
        <IconButton onClick={logout} title="Log out" variant="muted">
          <LogOut className="w-4 h-4" />
        </IconButton>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-surface-0">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/60 bg-surface-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-surface-0 border-r border-border/60"
            >
              <IconButton
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-3"
              >
                <X className="w-5 h-5" />
              </IconButton>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-border/60 bg-surface-0/80 backdrop-blur-xl">
          <IconButton onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </IconButton>
          <Logo />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

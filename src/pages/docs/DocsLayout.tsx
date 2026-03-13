import { NavLink, Outlet } from 'react-router-dom';
import {
  BookOpen, Bot, Network, ClipboardList, Hexagon, Rocket,
  Code2, Layers, ChevronRight, Home, Cpu,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const NAV = [
  { to: '/docs', label: 'Overview', icon: BookOpen, end: true },
  { to: '/docs/concepts', label: 'Core concepts', icon: Layers },
  { to: '/docs/agents', label: 'Agents', icon: Bot },
  { to: '/docs/networks', label: 'Networks', icon: Network },
  { to: '/docs/tasks', label: 'Tasks', icon: ClipboardList },
  { to: '/docs/arenas', label: 'Arenas', icon: Hexagon },
  { to: '/docs/api', label: 'API Reference', icon: Code2 },
  { to: '/docs/mcp', label: 'MCP Reference', icon: Cpu },
  { to: '/docs/getting-started', label: 'Getting started', icon: Rocket },
];

export function DocsLayout() {
  return (
    <div className="min-h-screen bg-surface-0 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/60 sticky top-0 h-screen overflow-y-auto">
        <div className="px-5 py-5 border-b border-border/60">
          <a href="/" className="block">
            <Logo className="scale-90 origin-left" />
          </a>
          <p className="text-[10px] uppercase tracking-widest text-fg-dimmed mt-2">Documentation</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-sick-500/10 text-sick-400 font-medium'
                    : 'text-fg-muted hover:text-fg-secondary hover:bg-surface-2'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-border/60">
          <a
            href="/login"
            className="flex items-center gap-2 text-sm text-fg-muted hover:text-sick-400 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to app
            <ChevronRight className="w-3 h-3 ml-auto" />
          </a>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-[#09090b]/95 backdrop-blur-sm border-b border-border/60 px-4 py-3 flex items-center gap-3">
        <a href="/" className="block">
          <Logo className="scale-90 origin-left" />
        </a>
        <span className="text-[10px] uppercase tracking-widest text-fg-dimmed">Docs</span>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#09090b]/95 backdrop-blur-sm border-t border-border/60 overflow-x-auto">
        <div className="flex gap-1 px-3 py-2 min-w-max">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sick-500/10 text-sick-400 font-medium'
                    : 'text-fg-muted'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 min-w-0 lg:pt-0 pt-14 pb-16 lg:pb-0">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

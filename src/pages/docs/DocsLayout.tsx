import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Bot,
  ChevronRight,
  Code2,
  Cpu,
  Home,
  Layers,
  Menu,
  Network,
  Rocket,
  ClipboardList,
  Hexagon,
  X,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { docsRoutes } from '@/seo/site';

const ICONS = {
  '/docs': BookOpen,
  '/docs/concepts': Layers,
  '/docs/agents': Bot,
  '/docs/networks': Network,
  '/docs/tasks': ClipboardList,
  '/docs/arenas': Hexagon,
  '/docs/api': Code2,
  '/docs/mcp': Cpu,
  '/docs/getting-started': Rocket,
} as const;

export function DocsLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const activeRoute = useMemo(
    () => docsRoutes.find((route) => route.path === location.pathname) ?? docsRoutes[0],
    [location.pathname],
  );

  return (
    <div className="min-h-screen bg-surface-0">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-80 flex-col border-r border-border/60 bg-surface-1/80 backdrop-blur xl:flex">
          <div className="border-b border-border/60 px-6 py-6">
            <a href="/" className="block">
              <Logo className="origin-left scale-95" />
            </a>
            <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-fg-dimmed">Documentation</p>
            <p className="mt-3 text-sm leading-7 text-fg-muted">
              Learn the platform from first principles to API and MCP execution details.
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5" aria-label="Documentation sections">
            <div className="space-y-1">
              {docsRoutes.map((route) => {
                const Icon = ICONS[route.path as keyof typeof ICONS] ?? BookOpen;
                return (
                  <NavLink
                    key={route.path}
                    to={route.path}
                    end={route.path === '/docs'}
                    className={({ isActive }) =>
                      `group flex items-start gap-3 rounded-2xl px-4 py-3 transition-all ${
                        isActive
                          ? 'bg-sick-500/10 text-sick-400'
                          : 'text-fg-muted hover:bg-surface-2 hover:text-fg-secondary'
                      }`
                    }
                  >
                    <span className="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/50 bg-surface-0/80 text-current">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{route.label}</span>
                      <span className="mt-1 block text-xs leading-6 text-fg-dimmed group-[.active]:text-sick-300/80">
                        {route.description}
                      </span>
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-border/60 px-6 py-4">
            <a
              href="/login"
              className="flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-sick-400"
            >
              <Home className="h-4 w-4" />
              Go to app
              <ChevronRight className="ml-auto h-3 w-3" />
            </a>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border/60 bg-surface-0/92 backdrop-blur-xl xl:hidden">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
              <button
                type="button"
                aria-expanded={mobileMenuOpen}
                aria-controls="docs-mobile-drawer"
                aria-label={mobileMenuOpen ? 'Close documentation navigation' : 'Open documentation navigation'}
                onClick={() => setMobileMenuOpen((current) => !current)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-surface-1 text-fg-secondary"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
              <a href="/" className="block">
                <Logo className="origin-left scale-90" />
              </a>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.28em] text-fg-dimmed">Documentation</p>
                <p className="truncate text-sm font-medium text-fg">{activeRoute.label}</p>
              </div>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-30 xl:hidden">
              <button
                type="button"
                aria-label="Close navigation overlay"
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileMenuOpen(false)}
              />
              <aside
                id="docs-mobile-drawer"
                className="absolute left-0 top-0 h-full w-[88vw] max-w-sm overflow-y-auto border-r border-border/60 bg-surface-0 px-4 pb-8 pt-20 shadow-2xl"
              >
                <nav className="space-y-2" aria-label="Documentation mobile sections">
                  {docsRoutes.map((route) => {
                    const Icon = ICONS[route.path as keyof typeof ICONS] ?? BookOpen;
                    return (
                      <NavLink
                        key={route.path}
                        to={route.path}
                        end={route.path === '/docs'}
                        className={({ isActive }) =>
                          `flex items-start gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                            isActive
                              ? 'border-sick-500/30 bg-sick-500/10 text-sick-400'
                              : 'border-border/60 bg-surface-1 text-fg-secondary'
                          }`
                        }
                      >
                        <Icon className="mt-1 h-4 w-4 flex-shrink-0" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{route.label}</span>
                          <span className="mt-1 block text-xs leading-6 text-fg-muted">{route.description}</span>
                        </span>
                      </NavLink>
                    );
                  })}
                </nav>
              </aside>
            </div>
          )}

          <main className="min-w-0">
            <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-10 xl:px-14">
              <div className="rounded-[2rem] border border-border/50 bg-gradient-to-br from-surface-1 via-surface-0 to-sick-500/5 px-5 py-6 sm:px-8 sm:py-8">
                <p className="text-[11px] uppercase tracking-[0.28em] text-sick-400">{activeRoute.eyebrow}</p>
                <h1 className="mt-3 text-2xl font-display font-bold text-fg sm:text-3xl">{activeRoute.label}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-fg-muted sm:text-base">
                  {activeRoute.description}
                </p>
              </div>

              <div className="docs-prose mt-8 rounded-[2rem] border border-border/50 bg-surface-0/80 px-5 py-6 shadow-sm sm:px-8 sm:py-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

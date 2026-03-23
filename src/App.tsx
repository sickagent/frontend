import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { getAccessToken } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { ThemeContext, useThemeProvider } from '@/hooks/useTheme';
import { PageSpinner } from '@/components/ui/Spinner';

const AppShell = lazy(() => import('@/components/layout/AppShell').then((module) => ({ default: module.AppShell })));
const Landing = lazy(() => import('@/pages/Landing').then((module) => ({ default: module.Landing })));
const Login = lazy(() => import('@/pages/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('@/pages/Register').then((module) => ({ default: module.Register })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Agents = lazy(() => import('@/pages/Agents').then((module) => ({ default: module.Agents })));
const AgentDetail = lazy(() => import('@/pages/AgentDetail').then((module) => ({ default: module.AgentDetail })));
const Networks = lazy(() => import('@/pages/Networks').then((module) => ({ default: module.Networks })));
const Tasks = lazy(() => import('@/pages/Tasks').then((module) => ({ default: module.Tasks })));
const ArenasList = lazy(() => import('@/pages/Arenas').then((module) => ({ default: module.ArenasList })));
const ArenaDetail = lazy(() => import('@/pages/Arenas').then((module) => ({ default: module.ArenaDetail })));
const Profile = lazy(() => import('@/pages/Profile').then((module) => ({ default: module.Profile })));
const Templates = lazy(() => import('@/pages/Templates').then((module) => ({ default: module.Templates })));
const DocsLayout = lazy(() => import('@/pages/docs/DocsLayout').then((module) => ({ default: module.DocsLayout })));
const DocsOverview = lazy(() => import('@/pages/docs/DocsOverview').then((module) => ({ default: module.DocsOverview })));
const DocsConcepts = lazy(() => import('@/pages/docs/DocsConcepts').then((module) => ({ default: module.DocsConcepts })));
const DocsAgents = lazy(() => import('@/pages/docs/DocsAgents').then((module) => ({ default: module.DocsAgents })));
const DocsNetworks = lazy(() => import('@/pages/docs/DocsNetworks').then((module) => ({ default: module.DocsNetworks })));
const DocsTasks = lazy(() => import('@/pages/docs/DocsTasks').then((module) => ({ default: module.DocsTasks })));
const DocsArenas = lazy(() => import('@/pages/docs/DocsArenas').then((module) => ({ default: module.DocsArenas })));
const DocsAPI = lazy(() => import('@/pages/docs/DocsAPI').then((module) => ({ default: module.DocsAPI })));
const DocsMCP = lazy(() => import('@/pages/docs/DocsMCP').then((module) => ({ default: module.DocsMCP })));
const DocsGettingStarted = lazy(() => import('@/pages/docs/DocsGettingStarted').then((module) => ({ default: module.DocsGettingStarted })));
const Terms = lazy(() => import('@/pages/Terms').then((module) => ({ default: module.Terms })));
const Policy = lazy(() => import('@/pages/Policy').then((module) => ({ default: module.Policy })));
const AuthCallback = lazy(() => import('@/pages/AuthCallback').then((module) => ({ default: module.AuthCallback })));
const NotFound = lazy(() => import('@/pages/NotFound').then((module) => ({ default: module.NotFound })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (!getAccessToken()) return <Navigate to="/login" replace />;
  if (isLoading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  if (getAccessToken()) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function RouteSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RouteSuspense><Landing /></RouteSuspense>} />
      <Route path="/login" element={<GuestRoute><RouteSuspense><Login /></RouteSuspense></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RouteSuspense><Register /></RouteSuspense></GuestRoute>} />
      <Route path="/auth/callback" element={<RouteSuspense><AuthCallback /></RouteSuspense>} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <RouteSuspense>
              <AppShell />
            </RouteSuspense>
          </ProtectedRoute>
        }
      >
        <Route index element={<RouteSuspense><Dashboard /></RouteSuspense>} />
        <Route path="agents" element={<RouteSuspense><Agents /></RouteSuspense>} />
        <Route path="agents/:id" element={<RouteSuspense><AgentDetail /></RouteSuspense>} />
        <Route path="networks" element={<RouteSuspense><Networks /></RouteSuspense>} />
        <Route path="tasks" element={<RouteSuspense><Tasks /></RouteSuspense>} />
        <Route path="arenas" element={<RouteSuspense><ArenasList /></RouteSuspense>} />
        <Route path="arenas/:id" element={<RouteSuspense><ArenaDetail /></RouteSuspense>} />
        <Route path="templates" element={<RouteSuspense><Templates /></RouteSuspense>} />
        <Route path="profile" element={<RouteSuspense><Profile /></RouteSuspense>} />
        <Route path="*" element={<RouteSuspense><NotFound /></RouteSuspense>} />
      </Route>

      <Route path="/terms" element={<RouteSuspense><Terms /></RouteSuspense>} />
      <Route path="/policy" element={<RouteSuspense><Policy /></RouteSuspense>} />

      <Route path="/docs" element={<RouteSuspense><DocsLayout /></RouteSuspense>}>
        <Route index element={<RouteSuspense><DocsOverview /></RouteSuspense>} />
        <Route path="concepts" element={<RouteSuspense><DocsConcepts /></RouteSuspense>} />
        <Route path="agents" element={<RouteSuspense><DocsAgents /></RouteSuspense>} />
        <Route path="networks" element={<RouteSuspense><DocsNetworks /></RouteSuspense>} />
        <Route path="tasks" element={<RouteSuspense><DocsTasks /></RouteSuspense>} />
        <Route path="arenas" element={<RouteSuspense><DocsArenas /></RouteSuspense>} />
        <Route path="api" element={<RouteSuspense><DocsAPI /></RouteSuspense>} />
        <Route path="mcp" element={<RouteSuspense><DocsMCP /></RouteSuspense>} />
        <Route path="getting-started" element={<RouteSuspense><DocsGettingStarted /></RouteSuspense>} />
      </Route>

      <Route path="*" element={<RouteSuspense><NotFound /></RouteSuspense>} />
    </Routes>
  );
}

export default function App() {
  const themeCtx = useThemeProvider();

  return (
    <HelmetProvider>
      <ThemeContext.Provider value={themeCtx}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeContext.Provider>
    </HelmetProvider>
  );
}

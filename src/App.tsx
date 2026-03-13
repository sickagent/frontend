import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAccessToken } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { ThemeContext, useThemeProvider } from '@/hooks/useTheme';
import { AppShell } from '@/components/layout/AppShell';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Agents } from '@/pages/Agents';
import { AgentDetail } from '@/pages/AgentDetail';
import { Networks } from '@/pages/Networks';
import { Tasks } from '@/pages/Tasks';
import { ArenasList, ArenaDetail } from '@/pages/Arenas';
import { Profile } from '@/pages/Profile';
import { Templates } from '@/pages/Templates';
import {
  DocsLayout, DocsOverview, DocsConcepts, DocsAgents,
  DocsNetworks, DocsTasks, DocsArenas, DocsAPI, DocsMCP, DocsGettingStarted,
} from '@/pages/docs';
import { Terms } from '@/pages/Terms';
import { Policy } from '@/pages/Policy';
import { PageSpinner } from '@/components/ui/Spinner';

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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="agents" element={<Agents />} />
        <Route path="agents/:id" element={<AgentDetail />} />
        <Route path="networks" element={<Networks />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="arenas" element={<ArenasList />} />
        <Route path="arenas/:id" element={<ArenaDetail />} />
        <Route path="templates" element={<Templates />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/terms" element={<Terms />} />
      <Route path="/policy" element={<Policy />} />

      <Route path="/docs" element={<DocsLayout />}>
        <Route index element={<DocsOverview />} />
        <Route path="concepts" element={<DocsConcepts />} />
        <Route path="agents" element={<DocsAgents />} />
        <Route path="networks" element={<DocsNetworks />} />
        <Route path="tasks" element={<DocsTasks />} />
        <Route path="arenas" element={<DocsArenas />} />
        <Route path="api" element={<DocsAPI />} />
        <Route path="mcp" element={<DocsMCP />} />
        <Route path="getting-started" element={<DocsGettingStarted />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const themeCtx = useThemeProvider();

  return (
    <ThemeContext.Provider value={themeCtx}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeContext.Provider>
  );
}

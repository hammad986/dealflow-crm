import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AppShell } from '@/components/layout/app-shell';
import { CommandPalette } from '@/components/layout/command-palette';
import { ErrorBoundary } from '@/components/error-boundary';
import { DashboardPage } from '@/pages/dashboard';
import { PipelinePage } from '@/pages/pipeline';
import { ClientsPage } from '@/pages/clients';
import { ClientDetailPage } from '@/pages/clients/detail';
import { CalendarPage } from '@/pages/calendar';
import { AnalyticsPage } from '@/pages/analytics';
import { SettingsPage } from '@/pages/settings';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useAppStore } from '@/lib/store';

function App() {
  const [commandOpen, setCommandOpen] = useState(false);
  const setHydrated = useAppStore((s) => s.setHydrated);

  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), 100);
    return () => clearTimeout(timer);
  }, [setHydrated]);

  useKeyboardShortcuts({
    'ctrl+k': () => setCommandOpen(true),
    'cmd+k': () => setCommandOpen(true),
  });

  // Callbacks for command palette quick actions
  const handleCreateDeal = useCallback(() => {
    // Dispatch a custom event that the pipeline page listens to
    window.dispatchEvent(new CustomEvent('dealflow:create-deal'));
  }, []);

  const handleCreateClient = useCallback(() => {
    window.dispatchEvent(new CustomEvent('dealflow:create-client'));
  }, []);

  const handleCreateTask = useCallback(() => {
    window.dispatchEvent(new CustomEvent('dealflow:create-task'));
  }, []);

  return (
    <ErrorBoundary>
      <>
        <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#6366f1] focus:text-white focus:text-sm"
      >
        Skip to content
      </a>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onCreateDeal={handleCreateDeal}
        onCreateClient={handleCreateClient}
        onCreateTask={handleCreateTask}
      />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          },
          className: '!text-sm',
        }}
        richColors
      />
      </>
    </ErrorBoundary>
  );
}

export default App;
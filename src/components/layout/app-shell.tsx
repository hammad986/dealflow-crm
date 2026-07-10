import { Sidebar } from './sidebar';
import { Outlet } from 'react-router';

export function AppShell() {
  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar />
      <main id="main-content" className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

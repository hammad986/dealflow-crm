import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Kanban,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  Menu,
  X,
  GitBranch,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Pipeline', path: '/pipeline', icon: Kanban },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-[#18181b] border border-white/10 flex items-center justify-center text-white"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-[220px] bg-[#0c0c10] border-r border-white/5 flex flex-col transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#6366f1] flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gradient">DealFlow</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#6366f1]/15 text-[#6366f1]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="text-[10px] text-white/20 px-3">Aetherion Labs</div>
        </div>
      </aside>
    </>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Command } from 'cmdk';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  Kanban,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  Plus,
  Search,
  UserCircle,
  FileText,
  Zap,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDeal?: () => void;
  onCreateClient?: () => void;
  onCreateTask?: () => void;
}

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Pipeline', path: '/pipeline', icon: Kanban },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function CommandPalette({ open, onOpenChange, onCreateDeal, onCreateClient, onCreateTask }: CommandPaletteProps) {
  const navigate = useNavigate();
  const clients = useAppStore((s) => s.clients);
  const deals = useAppStore((s) => s.deals);
  const [query, setQuery] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset search when palette opens
    setQuery('');
  }, [open]);

  // Close on ESC key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  const filteredClients = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return clients
      .filter((c) => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q))
      .slice(0, 5);
  }, [query, clients]);

  const filteredDeals = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return deals
      .filter((d) => d.title.toLowerCase().includes(q))
      .slice(0, 5);
  }, [query, deals]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const handleAction = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <Command
        className="relative w-full max-w-xl mx-4 rounded-xl border border-white/10 bg-[#18181b] shadow-2xl overflow-hidden animate-scale-in"
        loop
      >
        <div className="flex items-center border-b border-white/5 px-4">
          <Search className="w-4 h-4 text-white/40 shrink-0" />
          <Command.Input
            placeholder="Search clients, deals, or navigate..."
            value={query}
            onValueChange={setQuery}
            className="flex-1 h-12 bg-transparent text-sm text-white placeholder:text-white/40 outline-none px-3"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 h-6 rounded border border-white/10 bg-white/5 text-[10px] text-white/40 font-mono">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-white/40">
            No results found
          </Command.Empty>

          {/* Go to */}
          <Command.Group heading="Go to" className="text-[10px] text-white/30 uppercase tracking-wider px-2 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Command.Item
                  key={item.path}
                  onSelect={() => handleNavigate(item.path)}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 cursor-pointer aria-selected:bg-white/5 aria-selected:text-white data-[selected=true]:bg-white/5"
                >
                  <Icon className="w-4 h-4 text-white/40" />
                  {item.label}
                </Command.Item>
              );
            })}
          </Command.Group>

          {/* Quick actions */}
          <Command.Group heading="Quick actions" className="text-[10px] text-white/30 uppercase tracking-wider px-2 py-1.5 mt-1">
            <Command.Item
              onSelect={() => onCreateDeal ? handleAction(onCreateDeal) : handleNavigate('/pipeline')}
              className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 cursor-pointer aria-selected:bg-white/5 aria-selected:text-white data-[selected=true]:bg-white/5"
            >
              <Plus className="w-4 h-4 text-emerald-500" />
              New Deal
            </Command.Item>
            <Command.Item
              onSelect={() => onCreateClient ? handleAction(onCreateClient) : handleNavigate('/clients')}
              className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 cursor-pointer aria-selected:bg-white/5 aria-selected:text-white data-[selected=true]:bg-white/5"
            >
              <UserCircle className="w-4 h-4 text-blue-500" />
              New Client
            </Command.Item>
            <Command.Item
              onSelect={() => onCreateTask ? handleAction(onCreateTask) : handleNavigate('/calendar')}
              className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 cursor-pointer aria-selected:bg-white/5 aria-selected:text-white data-[selected=true]:bg-white/5"
            >
              <CalendarDays className="w-4 h-4 text-amber-500" />
              New Task
            </Command.Item>
            <Command.Item
              onSelect={() => handleNavigate('/analytics')}
              className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 cursor-pointer aria-selected:bg-white/5 aria-selected:text-white data-[selected=true]:bg-white/5"
            >
              <Zap className="w-4 h-4 text-[#6366f1]" />
              Open Analytics
            </Command.Item>
          </Command.Group>

          {/* Clients */}
          {filteredClients.length > 0 && (
            <Command.Group heading="Clients" className="text-[10px] text-white/30 uppercase tracking-wider px-2 py-1.5 mt-1">
              {filteredClients.map((client) => (
                <Command.Item
                  key={client.id}
                  onSelect={() => handleNavigate(`/clients/${client.id}`)}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 cursor-pointer aria-selected:bg-white/5 aria-selected:text-white data-[selected=true]:bg-white/5"
                >
                  <UserCircle className="w-4 h-4 text-white/40" />
                  <div className="flex flex-col">
                    <span>{client.name}</span>
                    <span className="text-xs text-white/40">{client.company}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Deals */}
          {filteredDeals.length > 0 && (
            <Command.Group heading="Deals" className="text-[10px] text-white/30 uppercase tracking-wider px-2 py-1.5 mt-1">
              {filteredDeals.map((deal) => {
                const client = clients.find((c) => c.id === deal.clientId);
                return (
                  <Command.Item
                    key={deal.id}
                    onSelect={() => handleNavigate('/pipeline')}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 cursor-pointer aria-selected:bg-white/5 aria-selected:text-white data-[selected=true]:bg-white/5"
                  >
                    <FileText className="w-4 h-4 text-white/40" />
                    <div className="flex flex-col">
                      <span>{deal.title}</span>
                      <span className="text-xs text-white/40">
                        {client?.name} · {new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency, maximumFractionDigits: 0 }).format(deal.value)}
                      </span>
                    </div>
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
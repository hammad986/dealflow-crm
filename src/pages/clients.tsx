import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '@/lib/store';
import { Topbar } from '@/components/layout/topbar';
import { ClientTable } from '@/components/clients/client-table';
import { ClientGridCard } from '@/components/clients/client-grid-card';
import { ClientFormModal } from '@/components/clients/client-form-modal';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutGrid, Table2, Users } from 'lucide-react';
import type { ViewMode, Client } from '@/lib/types';

export function ClientsPage() {
  const navigate = useNavigate();
  const hydrated = useAppStore((s) => s.hydrated);
  const clients = useAppStore((s) => s.clients);
  const deals = useAppStore((s) => s.deals);
  const activities = useAppStore((s) => s.activities);

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  // Listen for command palette create-client event
  useEffect(() => {
    const handler = () => { setEditClient(null); setFormOpen(true); };
    window.addEventListener('dealflow:create-client', handler);
    return () => window.removeEventListener('dealflow:create-client', handler);
  }, []);

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.leadSource.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  if (!hydrated) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Topbar title="Clients" />
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar
        title="Clients"
        searchPlaceholder="Search clients..."
        onSearch={setSearchQuery}
        actionLabel="New Client"
        onAction={() => { setEditClient(null); setFormOpen(true); }}
      >
        <div className="flex items-center gap-1 h-9 rounded-lg bg-white/5 border border-white/10 p-0.5">
          <button
            onClick={() => setViewMode('table')}
            className={`h-8 px-2 rounded-md transition-colors focus:outline-none ${
              viewMode === 'table' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
            }`}
            aria-label="Table view"
          >
            <Table2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`h-8 px-2 rounded-md transition-colors focus:outline-none ${
              viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </Topbar>

      <div className="p-6">
        {clients.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No clients yet"
            description="Add your first client to start tracking deals and building relationships."
            action={
              <button
                onClick={() => { setEditClient(null); setFormOpen(true); }}
                className="px-4 py-2 rounded-lg bg-[#6366f1] hover:bg-[#5558e0] text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40"
              >
                Add Your First Client
              </button>
            }
          />
        ) : viewMode === 'table' ? (
          <ClientTable
            clients={filteredClients}
            deals={deals}
            activities={activities}
            onRowClick={(client) => navigate(`/clients/${client.id}`)}
            onEditClient={(client) => { setEditClient(client); setFormOpen(true); }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <ClientGridCard
                key={client.id}
                client={client}
                deals={deals}
                onClick={() => navigate(`/clients/${client.id}`)}
                onEditClient={(c) => { setEditClient(c); setFormOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      <ClientFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditClient(null);
        }}
        editClient={editClient}
      />
    </div>
  );
}
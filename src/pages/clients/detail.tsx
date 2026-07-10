import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppStore } from '@/lib/store';
import { Topbar } from '@/components/layout/topbar';
import { ClientHeader } from '@/components/clients/detail/client-header';
import { ContactInfoCard } from '@/components/clients/detail/contact-info-card';
import { DealsList } from '@/components/clients/detail/deals-list';
import { ActivityTimeline } from '@/components/clients/detail/activity-timeline';
import { TasksList } from '@/components/clients/detail/tasks-list';
import { ClientFormModal } from '@/components/clients/client-form-modal';
import { NewDealModal } from '@/components/pipeline/new-deal-modal';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ArrowLeft, Pencil } from 'lucide-react';

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clients = useAppStore((s) => s.clients);
  const deals = useAppStore((s) => s.deals);
  const activities = useAppStore((s) => s.activities);
  const tasks = useAppStore((s) => s.tasks);
  const deleteClient = useAppStore((s) => s.deleteClient);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newDealOpen, setNewDealOpen] = useState(false);

  const client = clients.find((c) => c.id === id);
  const clientDeals = deals.filter((d) => d.clientId === id);
  const clientActivities = activities.filter((a) => a.clientId === id);
  const clientTasks = tasks.filter((t) => t.clientId === id);

  if (!client) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 mb-3">Client not found</p>
          <button
            onClick={() => navigate('/clients')}
            className="text-sm text-[#6366f1] hover:text-[#5558e0] transition-colors"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteClient(client.id);
    navigate('/clients');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar
        title={client.name}
        actionLabel="New Deal"
        onAction={() => setNewDealOpen(true)}
      >
        <button
          onClick={() => setEditModalOpen(true)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit Client</span>
        </button>
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center gap-1 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </Topbar>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[35%] space-y-4">
            <ClientHeader client={client} />
            <ContactInfoCard client={client} />
            <button
              onClick={() => setDeleteOpen(true)}
              className="w-full h-10 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              Delete Client
            </button>
          </div>

          <div className="lg:w-[65%] space-y-6">
            <DealsList clientId={client.id} deals={clientDeals} onNewDeal={() => setNewDealOpen(true)} />
            <ActivityTimeline clientId={client.id} activities={clientActivities} />
            <TasksList clientId={client.id} tasks={clientTasks} />
          </div>
        </div>
      </div>

      <ClientFormModal open={editModalOpen} onOpenChange={setEditModalOpen} editClient={client} />
      <NewDealModal open={newDealOpen} onOpenChange={setNewDealOpen} prefillClientId={client.id} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Client"
        description={`This will also delete ${clientDeals.length} deals, ${clientActivities.length} activities, and ${clientTasks.length} tasks. This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
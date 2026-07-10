import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillClientId?: string;
  prefillDealId?: string;
}

export function NewTaskModal({ open, onOpenChange, prefillClientId, prefillDealId }: NewTaskModalProps) {
  const clients = useAppStore((s) => s.clients);
  const deals = useAppStore((s) => s.deals);
  const addTask = useAppStore((s) => s.addTask);

  const [clientId, setClientId] = useState(prefillClientId || '');
  const [dealId, setDealId] = useState(prefillDealId || '');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const clientDeals = clientId
    ? deals.filter((d) => d.clientId === clientId)
    : [];

  // Sync dealId when prefillDealId is cleared
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync state with prop change on dialog open
    if (!prefillDealId) setDealId('');
  }, [clientId, prefillDealId]);

  const reset = () => {
    setClientId(prefillClientId || '');
    setDealId(prefillDealId || '');
    setTitle('');
    setDueDate('');
  };

  const handleSubmit = () => {
    if (!title.trim() || !dueDate || !clientId) return;
    addTask({
      clientId,
      dealId: dealId || undefined,
      title: title.trim(),
      dueDate,
    });
    toast.success('Task created successfully');
    reset();
    onOpenChange(false);
  };

  const isValid = title.trim() && dueDate && clientId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#18181b] border border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
            >
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {clientId && clientDeals.length > 0 && (
            <div>
              <label className="text-xs text-white/50 mb-1 block">Associated Deal (optional)</label>
              <select
                value={dealId}
                onChange={(e) => setDealId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
              >
                <option value="">No deal</option>
                {clientDeals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-white/50 mb-1 block">Title *</label>
            <input
              placeholder="e.g., Send follow-up email"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block">Due Date *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full h-10 rounded-lg bg-[#6366f1] hover:bg-[#5558e0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            Create Task
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
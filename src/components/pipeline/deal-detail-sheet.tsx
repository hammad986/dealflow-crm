import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAppStore } from '@/lib/store';
import type { Deal } from '@/lib/types';
import { Avatar } from '@/components/shared/avatar';
import { CurrencyText } from '@/components/shared/currency-text';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Trash2, Save } from 'lucide-react';
import { ACTIVITY_ICONS, ACTIVITY_COLORS } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';

interface DealDetailSheetProps {
  deal: Deal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DealDetailSheet({ deal: initialDeal, open, onOpenChange }: DealDetailSheetProps) {
  const navigate = useNavigate();
  const clients = useAppStore((s) => s.clients);
  const activities = useAppStore((s) => s.activities);
  const updateDeal = useAppStore((s) => s.updateDeal);
  const deleteDeal = useAppStore((s) => s.deleteDeal);
  const addActivity = useAppStore((s) => s.addActivity);

  const [deal, setDeal] = useState<Deal>(initialDeal);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);

  const client = clients.find((c) => c.id === deal.clientId);
  const dealActivities = activities
    .filter((a) => a.dealId === deal.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleUpdate = (field: keyof Deal, value: string | number) => {
    const updates: Partial<Deal> = { [field]: value };
    if (field === 'value') updates.value = Number(value);
    setDeal((prev) => ({ ...prev, ...updates }));
    updateDeal(deal.id, updates);
    setEditingField(null);
  };

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    addActivity({
      clientId: deal.clientId,
      dealId: deal.id,
      type: 'note',
      content: noteInput.trim(),
    });
    setNoteInput('');
  };

  const handleDelete = () => {
    deleteDeal(deal.id);
    setDeleteOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md bg-[#0f0f13] border-l border-white/10 p-0 overflow-y-auto">
          <SheetHeader className="px-6 py-4 border-b border-white/5">
            <SheetTitle className="text-white">Deal Details</SheetTitle>
          </SheetHeader>

          <div className="p-6 space-y-6">
            {/* Client Card */}
            <div
              className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.05] transition-colors"
              onClick={() => client && navigate(`/clients/${client.id}`)}
            >
              <Avatar name={client?.name || 'Unknown'} size={40} />
              <div>
                <p className="text-sm font-medium text-white">{client?.name}</p>
                <p className="text-xs text-white/50">{client?.company}</p>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs text-white/50 mb-1 block">Title</label>
                {editingField === 'title' ? (
                  <input
                    autoFocus
                    defaultValue={deal.title}
                    onBlur={(e) => handleUpdate('title', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate('title', (e.target as HTMLInputElement).value)}
                    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
                  />
                ) : (
                  <p
                    className="text-sm text-white cursor-pointer hover:text-[#6366f1] transition-colors"
                    onClick={() => setEditingField('title')}
                  >
                    {deal.title}
                  </p>
                )}
              </div>

              {/* Value */}
              <div>
                <label className="text-xs text-white/50 mb-1 block">Value</label>
                {editingField === 'value' ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      type="number"
                      defaultValue={deal.value}
                      onBlur={(e) => handleUpdate('value', Number(e.target.value))}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate('value', Number((e.target as HTMLInputElement).value))}
                      className="flex-1 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
                    />
                    <select
                      defaultValue={deal.currency}
                      onChange={(e) => handleUpdate('currency', e.target.value)}
                      className="h-9 px-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none"
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                ) : (
                  <p
                    className="text-sm text-white font-medium cursor-pointer hover:text-[#6366f1] transition-colors"
                    onClick={() => setEditingField('value')}
                  >
                    <CurrencyText value={deal.value} currency={deal.currency} />
                  </p>
                )}
              </div>

              {/* Expected Close Date */}
              <div>
                <label className="text-xs text-white/50 mb-1 block">Expected Close</label>
                {editingField === 'expectedCloseDate' ? (
                  <input
                    autoFocus
                    type="date"
                    defaultValue={deal.expectedCloseDate.split('T')[0]}
                    onBlur={(e) => handleUpdate('expectedCloseDate', e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
                  />
                ) : (
                  <p
                    className="text-sm text-white cursor-pointer hover:text-[#6366f1] transition-colors"
                    onClick={() => setEditingField('expectedCloseDate')}
                  >
                    {new Date(deal.expectedCloseDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Activity Log */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Activity Log</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dealActivities.length === 0 ? (
                  <p className="text-xs text-white/40">No activity yet</p>
                ) : (
                  dealActivities.map((activity) => {
                    const color = ACTIVITY_COLORS[activity.type] || '#71717a';
                    const icon = ACTIVITY_ICONS[activity.type];
                    const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });

                    return (
                      <div key={activity.id} className="flex items-start gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {icon}
                        </div>
                        <div>
                          <p className="text-xs text-white/70">{activity.content}</p>
                          <p className="text-[10px] text-white/40">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Add Note */}
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Add Note</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  placeholder="Type a note..."
                  className="flex-1 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50"
                />
                <button
                  onClick={handleAddNote}
                  className="h-9 px-3 rounded-lg bg-[#6366f1] hover:bg-[#5558e0] text-white transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => setDeleteOpen(true)}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Deal
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Deal"
        description="Are you sure you want to delete this deal? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}

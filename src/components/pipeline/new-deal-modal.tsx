import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import type { Currency, StageId } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NewDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillClientId?: string;
}

export function NewDealModal({ open, onOpenChange, prefillClientId }: NewDealModalProps) {
  const clients = useAppStore((s) => s.clients);
  const stages = useAppStore((s) => s.stages);
  const addDeal = useAppStore((s) => s.addDeal);
  const addClient = useAppStore((s) => s.addClient);

  const [showNewClient, setShowNewClient] = useState(false);
  const [clientId, setClientId] = useState(prefillClientId || '');
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [stageId, setStageId] = useState<StageId>('new_lead');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // New client form
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const reset = () => {
    setClientId(prefillClientId || '');
    setTitle('');
    setValue('');
    setCurrency('INR');
    setExpectedCloseDate('');
    setStageId('new_lead');
    setShowNewClient(false);
    setNewName('');
    setNewCompany('');
    setNewEmail('');
    setErrors({});
    setTouched({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!showNewClient && !clientId) {
      newErrors.clientId = 'Please select a client or create a new one';
    }
    if (!title.trim()) {
      newErrors.title = 'Deal title is required';
    }
    if (!value || Number(value) <= 0) {
      newErrors.value = 'A valid deal value is required';
    }
    if (!expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required';
    }
    if (showNewClient) {
      if (!newName.trim()) newErrors.newName = 'Name is required';
      if (!newCompany.trim()) newErrors.newCompany = 'Company is required';
      if (!newEmail.trim()) newErrors.newEmail = 'Email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    let finalClientId = clientId;

    if (showNewClient && newName.trim() && newCompany.trim() && newEmail.trim()) {
      const client = addClient({
        name: newName.trim(),
        company: newCompany.trim(),
        email: newEmail.trim(),
        phone: '',
        leadSource: 'Other',
        tags: [],
        notes: '',
      });
      finalClientId = client.id;
    }

    if (!finalClientId) return;

    addDeal({
      clientId: finalClientId,
      title: title.trim(),
      value: Number(value),
      currency,
      stageId,
      expectedCloseDate: new Date(expectedCloseDate).toISOString(),
    });

    toast.success('Deal created successfully');
    reset();
    onOpenChange(false);
  };

  const isValid =
    title.trim() &&
    value &&
    expectedCloseDate &&
    (showNewClient ? newName.trim() && newCompany.trim() && newEmail.trim() : clientId);

  const inputErrorClass = (field: string) =>
    cn(
      'w-full h-10 px-3 rounded-lg bg-white/5 border text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors',
      touched[field] && errors[field]
        ? 'border-red-500/50 focus:border-red-500/70'
        : 'border-white/10 focus:border-[#6366f1]/50'
    );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="bg-[#18181b] border border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">New Deal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Client Select */}
          {!showNewClient ? (
            <div>
              <label className="text-xs text-white/50 mb-1 block">Client</label>
              <select
                value={clientId}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setShowNewClient(true);
                    setClientId('');
                  } else {
                    setClientId(e.target.value);
                  }
                  setTouched((t) => ({ ...t, clientId: true }));
                }}
                onBlur={() => setTouched((t) => ({ ...t, clientId: true }))}
                className={cn(
                  'w-full h-10 px-3 rounded-lg bg-white/5 border text-sm text-white focus:outline-none transition-colors',
                  touched.clientId && errors.clientId
                    ? 'border-red-500/50 focus:border-red-500/70'
                    : 'border-white/10 focus:border-[#6366f1]/50'
                )}
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.company}
                  </option>
                ))}
                <option value="__new__">+ Create new client</option>
              </select>
              {touched.clientId && errors.clientId && (
                <p className="text-xs text-red-400 mt-1">{errors.clientId}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">New Client</span>
                <button
                  onClick={() => setShowNewClient(false)}
                  className="text-xs text-[#6366f1] hover:text-[#5558e0]"
                >
                  Cancel
                </button>
              </div>
              <div>
                <input
                  placeholder="Name *"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, newName: true }))}
                  className={cn(
                    'w-full h-9 px-3 rounded-lg bg-white/5 border text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors',
                    touched.newName && errors.newName
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : 'border-white/10 focus:border-[#6366f1]/50'
                  )}
                />
                {touched.newName && errors.newName && (
                  <p className="text-xs text-red-400 mt-1">{errors.newName}</p>
                )}
              </div>
              <div>
                <input
                  placeholder="Company *"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, newCompany: true }))}
                  className={cn(
                    'w-full h-9 px-3 rounded-lg bg-white/5 border text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors',
                    touched.newCompany && errors.newCompany
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : 'border-white/10 focus:border-[#6366f1]/50'
                  )}
                />
                {touched.newCompany && errors.newCompany && (
                  <p className="text-xs text-red-400 mt-1">{errors.newCompany}</p>
                )}
              </div>
              <div>
                <input
                  placeholder="Email *"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, newEmail: true }))}
                  className={cn(
                    'w-full h-9 px-3 rounded-lg bg-white/5 border text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors',
                    touched.newEmail && errors.newEmail
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : 'border-white/10 focus:border-[#6366f1]/50'
                  )}
                />
                {touched.newEmail && errors.newEmail && (
                  <p className="text-xs text-red-400 mt-1">{errors.newEmail}</p>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs text-white/50 mb-1 block">Deal Title *</label>
            <input
              placeholder="e.g., Website Redesign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, title: true }))}
              className={inputErrorClass('title')}
            />
            {touched.title && errors.title && (
              <p className="text-xs text-red-400 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Value + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Value *</label>
              <input
                type="number"
                placeholder="25000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, value: true }))}
                className={inputErrorClass('value')}
              />
              {touched.value && errors.value && (
                <p className="text-xs text-red-400 mt-1">{errors.value}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          {/* Expected Close + Stage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Expected Close *</label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, expectedCloseDate: true }))}
                className={inputErrorClass('expectedCloseDate')}
              />
              {touched.expectedCloseDate && errors.expectedCloseDate && (
                <p className="text-xs text-red-400 mt-1">{errors.expectedCloseDate}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Stage</label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value as StageId)}
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full h-10 rounded-lg bg-[#6366f1] hover:bg-[#5558e0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            Create Deal
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
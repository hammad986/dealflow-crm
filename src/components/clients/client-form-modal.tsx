import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';
import type { Client, LeadSource } from '@/lib/types';
import { toast } from 'sonner';

interface ClientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editClient?: Client | null;
}

const LEAD_SOURCES: LeadSource[] = ['Referral', 'LinkedIn', 'WhatsApp', 'Website', 'Cold Outreach', 'Other'];

export function ClientFormModal({ open, onOpenChange, editClient }: ClientFormModalProps) {
  const addClient = useAppStore((s) => s.addClient);
  const updateClient = useAppStore((s) => s.updateClient);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [leadSource, setLeadSource] = useState<LeadSource>('Other');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!editClient;

  const reset = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setLeadSource('Other');
    setTags('');
    setNotes('');
    setErrors({});
  };

  useEffect(() => {
    if (editClient && open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- populate form when editing existing client
      setName(editClient.name);
      setCompany(editClient.company);
      setEmail(editClient.email);
      setPhone(editClient.phone);
      setLeadSource(editClient.leadSource);
      setTags(editClient.tags.join(', '));
      setNotes(editClient.notes);
      setErrors({});
    } else if (!editClient && open) {
      reset();
    }
  }, [editClient, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!company.trim()) newErrors.company = 'Company is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (phone && phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Phone must be at least 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const clientData = {
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      leadSource,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: notes.trim(),
    };

    if (isEditing && editClient) {
      updateClient(editClient.id, clientData);
      toast.success('Client updated successfully');
    } else {
      addClient(clientData);
      toast.success('Client created successfully');
    }

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#18181b] border border-white/10 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{isEditing ? 'Edit Client' : 'New Client'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-white/50 mb-1 block" htmlFor="client-name">Name *</label>
            <input
              id="client-name"
              placeholder="Full name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: '' })); }}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50 transition-colors"
              autoFocus
            />
            {errors.name && <p className="text-xs text-red-400 mt-1" role="alert">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block" htmlFor="client-company">Company *</label>
            <input
              id="client-company"
              placeholder="Company name"
              value={company}
              onChange={(e) => { setCompany(e.target.value); if (errors.company) setErrors((p) => ({ ...p, company: '' })); }}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50 transition-colors"
            />
            {errors.company && <p className="text-xs text-red-400 mt-1" role="alert">{errors.company}</p>}
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block" htmlFor="client-email">Email *</label>
            <input
              id="client-email"
              type="email"
              placeholder="email@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50 transition-colors"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1" role="alert">{errors.email}</p>}
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block" htmlFor="client-phone">Phone</label>
            <input
              id="client-phone"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors((p) => ({ ...p, phone: '' })); }}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50 transition-colors"
            />
            {errors.phone && <p className="text-xs text-red-400 mt-1" role="alert">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block" htmlFor="client-source">Lead Source</label>
            <select
              id="client-source"
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value as LeadSource)}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50 transition-colors"
            >
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block" htmlFor="client-tags">Tags (comma separated)</label>
            <input
              id="client-tags"
              placeholder="SaaS, Enterprise, Premium"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block" htmlFor="client-notes">Notes</label>
            <textarea
              id="client-notes"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50 resize-none transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => { reset(); onOpenChange(false); }}
              className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 h-10 rounded-lg bg-[#6366f1] hover:bg-[#5558e0] active:bg-[#4f46e5] text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40 focus:ring-offset-2 focus:ring-offset-[#18181b]"
            >
              {isEditing ? 'Save Changes' : 'Create Client'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
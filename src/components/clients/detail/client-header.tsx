import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { Client } from '@/lib/types';
import { Avatar } from '@/components/shared/avatar';
import { LeadSourceBadge } from '@/components/shared/status-badge';
import { Pencil, Check, X } from 'lucide-react';

interface ClientHeaderProps {
  client: Client;
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const updateClient = useAppStore((s) => s.updateClient);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(client.name);
  const [company, setCompany] = useState(client.company);

  const handleSave = () => {
    if (name.trim() && company.trim()) {
      updateClient(client.id, { name: name.trim(), company: company.trim() });
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setName(client.name);
    setCompany(client.company);
    setEditing(false);
  };

  return (
    <div className="p-4 rounded-xl bg-[#18181b] border border-white/5">
      <div className="flex items-center gap-4">
        <Avatar name={client.name} size={64} />
        <div className="flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-8 px-2 rounded bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
              />
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full h-8 px-2 rounded bg-white/5 border border-white/10 text-sm text-white/70 focus:outline-none focus:border-[#6366f1]/50"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="text-[#6366f1] hover:text-[#5558e0]">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={handleCancel} className="text-white/40 hover:text-white/60">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">{client.name}</h2>
                <button
                  onClick={() => setEditing(true)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-white/50">{client.company}</p>
              <div className="mt-2">
                <LeadSourceBadge source={client.leadSource} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import type { Client, Deal } from '@/lib/types';
import { LEAD_SOURCE_COLORS } from '@/lib/types';
import { Avatar } from '@/components/shared/avatar';
import { CurrencyText } from '@/components/shared/currency-text';
import { LeadSourceBadge } from '@/components/shared/status-badge';
import { Pencil } from 'lucide-react';

interface ClientGridCardProps {
  client: Client;
  deals: Deal[];
  onClick: () => void;
  onEditClient?: (client: Client) => void;
}

export function ClientGridCard({ client, deals, onClick, onEditClient }: ClientGridCardProps) {
  const clientDeals = deals.filter((d) => d.clientId === client.id);
  const openDeals = clientDeals.filter((d) => d.stageId !== 'won' && d.stageId !== 'lost');
  const totalValue = clientDeals.reduce((sum, d) => sum + d.value, 0);
  const leadSourceColor = LEAD_SOURCE_COLORS[client.leadSource] || '#71717a';

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-xl bg-[#18181b] border border-white/5 border-l-2 hover:border-white/10 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
      style={{ borderLeftColor: leadSourceColor }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={client.name} size={40} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{client.name}</p>
          <p className="text-xs text-white/50 truncate">{client.company}</p>
        </div>
      </div>
      <div className="mb-3">
        <LeadSourceBadge source={client.leadSource} />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/50">{openDeals.length} open deals</span>
        <div className="flex items-center gap-2">
          {onEditClient && (
            <button
              onClick={(e) => { e.stopPropagation(); onEditClient(client); }}
              className="p-1 rounded-md hover:bg-white/10 text-white/30 hover:text-[#6366f1] transition-colors"
              aria-label="Edit client"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
          <CurrencyText value={totalValue} className="text-white/70 font-medium" />
        </div>
      </div>
    </div>
  );
}
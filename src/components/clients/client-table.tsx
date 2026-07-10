import { formatDistanceToNow } from 'date-fns';
import type { Client, Deal, Activity } from '@/lib/types';
import { Avatar } from '@/components/shared/avatar';
import { CurrencyText } from '@/components/shared/currency-text';
import { LeadSourceBadge } from '@/components/shared/status-badge';
import { Eye, Pencil } from 'lucide-react';

interface ClientTableProps {
  clients: Client[];
  deals: Deal[];
  activities: Activity[];
  onRowClick: (client: Client) => void;
  onEditClient?: (client: Client) => void;
}

export function ClientTable({ clients, deals, activities, onRowClick, onEditClient }: ClientTableProps) {
  return (
    <div className="rounded-xl bg-[#18181b] border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-white/50 px-4 py-3">Name</th>
              <th className="text-left text-xs font-medium text-white/50 px-4 py-3">Company</th>
              <th className="text-left text-xs font-medium text-white/50 px-4 py-3">Source</th>
              <th className="text-left text-xs font-medium text-white/50 px-4 py-3">Open Deals</th>
              <th className="text-left text-xs font-medium text-white/50 px-4 py-3">Total Value</th>
              <th className="text-left text-xs font-medium text-white/50 px-4 py-3">Last Activity</th>
              <th className="text-left text-xs font-medium text-white/50 px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const clientDeals = deals.filter((d) => d.clientId === client.id);
              const openDeals = clientDeals.filter((d) => d.stageId !== 'won' && d.stageId !== 'lost');
              const totalValue = clientDeals.reduce((sum, d) => sum + d.value, 0);
              const lastActivity = activities
                .filter((a) => a.clientId === client.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

              return (
                <tr
                  key={client.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3" onClick={() => onRowClick(client)}>
                    <div className="flex items-center gap-3">
                      <Avatar name={client.name} size={28} />
                      <span className="text-sm text-white font-medium">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/70" onClick={() => onRowClick(client)}>{client.company}</td>
                  <td className="px-4 py-3" onClick={() => onRowClick(client)}>
                    <LeadSourceBadge source={client.leadSource} />
                  </td>
                  <td className="px-4 py-3 text-sm text-white/70 tabular-nums" onClick={() => onRowClick(client)}>{openDeals.length}</td>
                  <td className="px-4 py-3" onClick={() => onRowClick(client)}>
                    <CurrencyText value={totalValue} className="text-sm text-white/70" />
                  </td>
                  <td className="px-4 py-3 text-xs text-white/40" onClick={() => onRowClick(client)}>
                    {lastActivity ? formatDistanceToNow(new Date(lastActivity.createdAt), { addSuffix: true }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEditClient && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditClient(client); }}
                          className="p-1.5 rounded-md hover:bg-white/5 text-white/30 hover:text-[#6366f1] transition-colors"
                          aria-label="Edit client"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onRowClick(client); }}
                        className="p-1.5 rounded-md hover:bg-white/5 text-white/30 hover:text-[#6366f1] transition-colors"
                        aria-label="View client"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
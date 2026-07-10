import { useMemo } from 'react';
import type { Client, Deal } from '@/lib/types';
import { Avatar } from '@/components/shared/avatar';
import { CurrencyText } from '@/components/shared/currency-text';

interface TopClientsTableProps {
  clients: Client[];
  deals: Deal[];
}

export function TopClientsTable({ clients, deals }: TopClientsTableProps) {
  const topClients = useMemo(() => {
    const clientStats = clients
      .map((client) => {
        const clientDeals = deals.filter((d) => d.clientId === client.id && d.stageId === 'won');
        const totalWon = clientDeals.reduce((sum, d) => sum + d.value, 0);
        return {
          client,
          totalWon,
          dealCount: clientDeals.length,
          avgDealSize: clientDeals.length > 0 ? Math.round(totalWon / clientDeals.length) : 0,
        };
      })
      .filter((c) => c.dealCount > 0)
      .sort((a, b) => b.totalWon - a.totalWon)
      .slice(0, 5);

    return clientStats;
  }, [clients, deals]);

  if (topClients.length === 0) {
    return (
      <div className="rounded-xl bg-[#18181b] border border-white/5 p-4">
        <h3 className="text-sm font-medium text-white mb-4">Top Clients by Value</h3>
        <p className="text-sm text-white/40">No won deals yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#18181b] border border-white/5 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-medium text-white">Top Clients by Value</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-white/50 px-4 py-2 w-12">#</th>
              <th className="text-left text-xs font-medium text-white/50 px-4 py-2">Client</th>
              <th className="text-left text-xs font-medium text-white/50 px-4 py-2">Total Won</th>
              <th className="text-left text-xs font-medium text-white/50 px-4 py-2">Deals</th>
              <th className="text-left text-xs font-medium text-white/50 px-4 py-2">Avg Size</th>
            </tr>
          </thead>
          <tbody>
            {topClients.map((item, index) => (
              <tr key={item.client.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-white/40">{index + 1}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={item.client.name} size={28} />
                    <div>
                      <p className="text-sm text-white font-medium">{item.client.name}</p>
                      <p className="text-xs text-white/40">{item.client.company}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <CurrencyText value={item.totalWon} className="text-sm text-white/80" />
                </td>
                <td className="px-4 py-3 text-sm text-white/60">{item.dealCount}</td>
                <td className="px-4 py-3">
                  <CurrencyText value={item.avgDealSize} className="text-sm text-white/60" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

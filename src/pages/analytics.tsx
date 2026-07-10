import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Topbar } from '@/components/layout/topbar';
import { ConversionFunnel } from '@/components/analytics/conversion-funnel';
import { LeadSourceChart } from '@/components/analytics/lead-source-chart';
import { CycleTimeCard } from '@/components/analytics/cycle-time-card';
import { TopClientsTable } from '@/components/analytics/top-clients-table';
import { Skeleton } from '@/components/ui/skeleton';
import type { DateRange } from '@/lib/types';
import { subMonths, subDays } from 'date-fns';

export function AnalyticsPage() {
  const hydrated = useAppStore((s) => s.hydrated);
  const clients = useAppStore((s) => s.clients);
  const deals = useAppStore((s) => s.deals);
  const [dateRange, setDateRange] = useState<DateRange>('90d');

  const filteredDeals = useMemo(() => {
    const now = new Date();
    let cutoff: Date;

    switch (dateRange) {
      case '30d':
        cutoff = subDays(now, 30);
        break;
      case '90d':
        cutoff = subDays(now, 90);
        break;
      case '6m':
        cutoff = subMonths(now, 6);
        break;
      case 'all':
      default:
        return deals;
    }

    return deals.filter((d) => new Date(d.createdAt) >= cutoff);
  }, [deals, dateRange]);

  if (!hydrated) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Topbar title="Analytics" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-64 rounded-xl bg-white/5" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-xl bg-white/5" />
            <Skeleton className="h-64 rounded-xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar title="Analytics">
        <div className="flex items-center h-9 rounded-lg bg-white/5 border border-white/10 p-0.5">
          {(['30d', '90d', '6m', 'all'] as DateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${
                dateRange === range
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              {range === '30d' ? '30 days' : range === '90d' ? '90 days' : range === '6m' ? '6 months' : 'All time'}
            </button>
          ))}
        </div>
      </Topbar>

      <div className="p-6 space-y-6">
        {/* Conversion Funnel */}
        <ConversionFunnel deals={filteredDeals} />

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LeadSourceChart clients={clients} />
          <CycleTimeCard deals={filteredDeals} />
        </div>

        {/* Top Clients */}
        <TopClientsTable clients={clients} deals={filteredDeals} />
      </div>
    </div>
  );
}

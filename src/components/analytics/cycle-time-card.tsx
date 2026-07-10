import { useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import type { Deal } from '@/lib/types';

interface CycleTimeCardProps {
  deals: Deal[];
}

export function CycleTimeCard({ deals }: CycleTimeCardProps) {
  const stats = useMemo(() => {
    const wonDeals = deals.filter((d) => d.wonAt && d.createdAt);
    if (wonDeals.length === 0) return null;

    const cycleTimes = wonDeals.map((d) =>
      differenceInDays(new Date(d.wonAt!), new Date(d.createdAt))
    );

    const avg = Math.round(cycleTimes.reduce((sum, t) => sum + t, 0) / cycleTimes.length);
    const fastest = Math.min(...cycleTimes);
    const slowest = Math.max(...cycleTimes);

    return { avg, fastest, slowest, count: wonDeals.length };
  }, [deals]);

  return (
    <div className="rounded-xl bg-[#18181b] border border-white/5 p-6">
      <h3 className="text-sm font-medium text-white mb-4">Average Deal Cycle Time</h3>

      {stats ? (
        <div className="space-y-6">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{stats.avg}</span>
              <span className="text-sm text-white/50">days</span>
            </div>
            <p className="text-xs text-white/40 mt-1">Across {stats.count} won deals</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-xs text-white/50 mb-1">Fastest</p>
              <p className="text-lg font-semibold text-emerald-400">{stats.fastest}d</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-xs text-white/50 mb-1">Slowest</p>
              <p className="text-lg font-semibold text-amber-400">{stats.slowest}d</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/40">No won deals in selected period</p>
      )}
    </div>
  );
}

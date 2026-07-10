import { useMemo } from 'react';
import type { Deal } from '@/lib/types';
import { STAGE_COLORS, STAGE_LABELS } from '@/lib/types';

interface ConversionFunnelProps {
  deals: Deal[];
}

export function ConversionFunnel({ deals }: ConversionFunnelProps) {
  const funnelData = useMemo(() => {
    const stages = ['new_lead', 'contacted', 'proposal_sent', 'negotiation', 'won'] as const;
    const baseCount = deals.filter((d) => d.stageId === 'new_lead').length || 1;

    return stages.map((stageId) => {
      const count = deals.filter((d) => d.stageId === stageId).length;
      const percentage = Math.round((count / baseCount) * 100);
      return {
        stage: stageId,
        name: STAGE_LABELS[stageId],
        count,
        percentage,
        color: STAGE_COLORS[stageId],
      };
    });
  }, [deals]);

  return (
    <div className="rounded-xl bg-[#18181b] border border-white/5 p-6">
      <h3 className="text-sm font-medium text-white mb-6">Conversion Funnel</h3>
      <div className="space-y-3">
        {funnelData.map((item, index) => {
          const prevCount = index > 0 ? funnelData[index - 1].count : item.count;
          const conversion = index > 0 && prevCount > 0
            ? Math.round((item.count / prevCount) * 100)
            : 100;

          return (
            <div key={item.stage} className="flex items-center gap-4">
              <div className="w-28 text-right shrink-0">
                <span className="text-xs text-white/60">{item.name}</span>
              </div>
              <div className="flex-1">
                <div className="h-8 rounded-lg overflow-hidden bg-white/5 relative">
                  <div
                    className="h-full flex items-center px-3 transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: `${item.color}25`,
                      borderLeft: `3px solid ${item.color}`,
                    }}
                  >
                    <span className="text-sm font-medium text-white whitespace-nowrap">
                      {item.count}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-20 shrink-0">
                {index > 0 && (
                  <span className="text-[10px] text-white/40">{conversion}% conversion</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

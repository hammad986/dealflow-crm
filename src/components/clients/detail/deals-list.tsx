import { useNavigate } from 'react-router';
import type { Deal } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { CurrencyText } from '@/components/shared/currency-text';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Plus } from 'lucide-react';

interface DealsListProps {
  clientId: string;
  deals: Deal[];
  onNewDeal?: () => void;
}

export function DealsList(props: DealsListProps) {
  const { deals, onNewDeal } = props;
  const navigate = useNavigate();
  const stages = useAppStore((s) => s.stages);

  const getStageInfo = (stageId: Deal['stageId']) => {
    const stage = stages.find((s) => s.id === stageId);
    return stage ? { name: stage.name, color: stage.color } : undefined;
  };

  return (
    <div className="p-4 rounded-xl bg-[#18181b] border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Deals ({deals.length})</h3>
        <button
          onClick={() => onNewDeal?.()}
          className="flex items-center gap-1 text-xs text-[#6366f1] hover:text-[#5558e0] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Deal
        </button>
      </div>

      {deals.length === 0 ? (
        <EmptyState title="No deals yet" description="Add deals for this client from the Pipeline." />
      ) : (
        <div className="space-y-2">
          {deals.map((deal) => {
            const stageInfo = getStageInfo(deal.stageId);
            return (
              <div
                key={deal.id}
                onClick={() => navigate('/pipeline')}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.05] hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge
                    stageId={deal.stageId}
                    name={stageInfo?.name}
                    color={stageInfo?.color}
                  />
                  <span className="text-sm text-white/80">{deal.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <CurrencyText value={deal.value} currency={deal.currency} className="text-sm text-white/60" />
                  <span className="text-xs text-white/40">
                    {new Date(deal.expectedCloseDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
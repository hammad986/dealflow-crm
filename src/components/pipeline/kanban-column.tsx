import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import type { PipelineStage, Deal } from '@/lib/types';
import { DealCard } from './deal-card';
import { EmptyState } from '@/components/shared/empty-state';
import { CurrencyText } from '@/components/shared/currency-text';
import { Kanban } from 'lucide-react';

interface KanbanColumnProps {
  stage: PipelineStage;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

export function KanbanColumn({ stage, deals, onDealClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      className={cn(
        'flex-shrink-0 w-[280px] flex flex-col rounded-xl bg-[#18181b]/50 border border-white/5 overflow-hidden transition-colors',
        isOver && 'bg-[#6366f1]/5 border-[#6366f1]/20'
      )}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b border-white/5"
        style={{ borderTop: `3px solid ${stage.color}` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{stage.name}</span>
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium tabular-nums"
            style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
          >
            {deals.length}
          </span>
        </div>
        <span className="text-[10px] text-white/40 tabular-nums">
          <CurrencyText value={totalValue} />
        </span>
      </div>

      {/* Column Body */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]"
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onClick={() => onDealClick(deal)} />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <EmptyState
            icon={<Kanban className="w-5 h-5" />}
            title="No deals"
            description="Drag deals here"
            className="py-8"
          />
        )}
      </div>
    </div>
  );
}
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { Deal } from '@/lib/types';
import { Avatar } from '@/components/shared/avatar';
import { CurrencyText } from '@/components/shared/currency-text';
import { differenceInDays } from 'date-fns';
import { useAppStore } from '@/lib/store';
import { LEAD_SOURCE_COLORS, STAGE_COLORS } from '@/lib/types';

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
  isOverlay?: boolean;
}

const STAGE_PROBABILITY: Record<string, number> = {
  new_lead: 10,
  contacted: 20,
  proposal_sent: 40,
  negotiation: 60,
  won: 100,
  lost: 0,
};

export function DealCard({ deal, onClick, isOverlay }: DealCardProps) {
  const clients = useAppStore((s) => s.clients);
  const stages = useAppStore((s) => s.stages);
  const tasks = useAppStore((s) => s.tasks);
  const client = clients.find((c) => c.id === deal.clientId);
  const stage = stages.find((s) => s.id === deal.stageId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id, data: { deal } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const daysInStage = differenceInDays(new Date(), new Date(deal.stageEnteredAt));
  const daysColor = daysInStage > 10 ? 'bg-red-500/15 text-red-400' : daysInStage >= 5 ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-white/40';

  const hasOverdueTask = tasks.some(
    (t) => t.clientId === deal.clientId && !t.completed && new Date(t.dueDate) < new Date()
  );

  const probability = STAGE_PROBABILITY[deal.stageId] ?? 0;
  const stageColor = stage?.color || STAGE_COLORS[deal.stageId];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging && onClick) onClick();
      }}
      className={cn(
        'bg-[#0f0f13] rounded-lg border border-white/5 p-3 cursor-grab active:cursor-grabbing transition-all hover:border-white/10 hover:shadow-lg hover:shadow-[#6366f1]/5 hover:-translate-y-0.5',
        isDragging && 'opacity-30',
        isOverlay && 'scale-[1.02] shadow-2xl shadow-black/40 rotate-2 cursor-grabbing opacity-95'
      )}
    >
      {/* Client row */}
      <div className="flex items-center gap-2 mb-2">
        <Avatar name={client?.name || 'Unknown'} size={22} />
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: LEAD_SOURCE_COLORS[client?.leadSource || 'Other'] || '#71717a' }}
        />
        <span className="text-[13px] font-medium text-white truncate">
          {client?.name || 'Unknown'}
        </span>
      </div>

      {/* Deal title + source badge */}
      <p className="text-xs text-white/50 truncate mb-1">{deal.title}</p>
      {client && (
        <span
          className="inline-flex items-center px-1.5 py-[1px] rounded text-[9px] font-medium mb-2.5"
          style={{
            backgroundColor: `${LEAD_SOURCE_COLORS[client.leadSource] || '#71717a'}15`,
            color: LEAD_SOURCE_COLORS[client.leadSource] || '#71717a',
          }}
        >
          {client.leadSource}
        </span>
      )}

      {/* Value */}
      <div className="text-sm font-semibold text-white mb-3 tracking-tight">
        <CurrencyText value={deal.value} currency={deal.currency} />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium tabular-nums', daysColor)}>
            {daysInStage}d
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-medium tabular-nums"
            style={{ backgroundColor: `${stageColor}15`, color: stageColor }}
          >
            {probability}%
          </span>
        </div>
        {hasOverdueTask && (
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Has overdue follow-up" />
        )}
      </div>
    </div>
  );
}
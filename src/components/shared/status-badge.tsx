import { cn } from '@/lib/utils';
import type { StageId, LeadSource } from '@/lib/types';
import { STAGE_COLORS, STAGE_LABELS, LEAD_SOURCE_COLORS } from '@/lib/types';

interface StatusBadgeProps {
  stageId: StageId;
  name?: string;
  color?: string;
  className?: string;
}

export function StatusBadge({ stageId, name, color, className }: StatusBadgeProps) {
  const fallbackColor = STAGE_COLORS[stageId];
  const fallbackLabel = STAGE_LABELS[stageId];
  const badgeColor = color || fallbackColor;
  const label = name || fallbackLabel;

  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', className)}
      style={{
        backgroundColor: `${badgeColor}20`,
        color: badgeColor,
        border: `1px solid ${badgeColor}40`,
      }}
    >
      {label}
    </span>
  );
}

interface LeadSourceBadgeProps {
  source: string;
  className?: string;
}

export function LeadSourceBadge({ source, className }: LeadSourceBadgeProps) {
  const color = LEAD_SOURCE_COLORS[source as LeadSource] || '#71717a';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {source}
    </span>
  );
}
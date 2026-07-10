import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'Get started by adding your first item.',
  action,
  icon,
  className,
  animated = false,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 text-center',
      animated && 'animate-fade-in',
      className
    )}>
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
        {icon || <Inbox className="w-6 h-6 text-white/25" />}
      </div>
      <p className="text-sm font-medium text-white/60 mb-1.5">{title}</p>
      <p className="text-xs text-white/35 mb-5 max-w-[260px] leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
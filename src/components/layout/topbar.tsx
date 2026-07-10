import { Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function Topbar({
  title,
  searchPlaceholder = 'Search...',
  onSearch,
  actionLabel,
  onAction,
  children,
  className,
}: TopbarProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-14 px-4 sm:px-6 border-b border-white/5 shrink-0 gap-2 sm:gap-0', className)}>
      <h1 className="text-base font-semibold text-white truncate">{title}</h1>

      {/* Mobile search (visible on small screens) */}
      {onSearch && (
        <div className="relative w-full sm:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#6366f1]/50 focus:ring-1 focus:ring-[#6366f1]/20 transition-all"
            aria-label="Search"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        {onSearch && (
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
              className="w-64 h-9 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#6366f1]/50 focus:ring-1 focus:ring-[#6366f1]/20 transition-all"
              aria-label="Search"
            />
          </div>
        )}

        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#6366f1] hover:bg-[#5558e0] active:bg-[#4f46e5] text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
          >
            <Plus className="w-4 h-4" />
            {actionLabel}
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
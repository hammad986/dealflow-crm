import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#60a5fa',
  ];
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = 32, className }: AvatarProps) {
  const bgColor = stringToColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={cn('flex items-center justify-center rounded-full text-white font-medium shrink-0', className)}
      style={{ width: size, height: size, backgroundColor: bgColor, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

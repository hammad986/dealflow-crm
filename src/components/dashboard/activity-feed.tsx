import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ACTIVITY_ICONS, ACTIVITY_COLORS } from '@/lib/constants';
import type { Activity, Client } from '@/lib/types';
import { EmptyState } from '@/components/shared/empty-state';

interface ActivityFeedProps {
  activities: Activity[];
  clients: Client[];
}

export function ActivityFeed({ activities, clients }: ActivityFeedProps) {
  const recentActivities = useMemo(() => {
    return [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
  }, [activities]);

  if (recentActivities.length === 0) {
    return (
      <div className="rounded-xl bg-[#18181b] border border-white/5 p-4">
        <h3 className="text-sm font-medium text-white mb-4">Recent Activity</h3>
        <EmptyState title="No activity yet" description="Activities will appear here as you work with clients." />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#18181b] border border-white/5 p-4">
      <h3 className="text-sm font-medium text-white mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {recentActivities.map((activity) => {
          const client = clients.find((c) => c.id === activity.clientId);
          const color = ACTIVITY_COLORS[activity.type] || '#71717a';
          const icon = ACTIVITY_ICONS[activity.type];
          const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80">
                  <span className="font-medium text-white">{client?.name || 'Unknown'}</span>{' '}
                  <span className="text-white/60">{activity.content}</span>
                </p>
                <p className="text-xs text-white/40 mt-0.5">{timeAgo}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

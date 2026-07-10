import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { Activity } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { ACTIVITY_ICONS, ACTIVITY_COLORS } from '@/lib/constants';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

interface ActivityTimelineProps {
  clientId: string;
  activities: Activity[];
}

export function ActivityTimeline({ clientId, activities }: ActivityTimelineProps) {
  const addActivity = useAppStore((s) => s.addActivity);
  const deleteActivity = useAppStore((s) => s.deleteActivity);
  const [activityType, setActivityType] = useState<string>('note');
  const [content, setContent] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sorted = [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmit = () => {
    if (!content.trim()) return;
    addActivity({
      clientId,
      type: activityType as Activity['type'],
      content: content.trim(),
    });
    setContent('');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteActivity(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#18181b] border border-white/5">
      <h3 className="text-sm font-medium text-white mb-4">Activity Timeline</h3>

      {/* Add Activity Form */}
      <div className="flex flex-col gap-2 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
        <div className="flex gap-1">
          {(['call', 'email', 'meeting', 'note'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActivityType(type)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                activityType === type
                  ? 'bg-[#6366f1]/15 text-[#6366f1]'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {ACTIVITY_ICONS[type]}
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={`Log a ${activityType}...`}
            className="flex-1 h-8 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50"
          />
          <button
            onClick={handleSubmit}
            className="h-8 px-3 rounded-md bg-[#6366f1] hover:bg-[#5558e0] text-white text-xs font-medium transition-colors"
          >
            Log
          </button>
        </div>
      </div>

      {/* Timeline */}
      {sorted.length === 0 ? (
        <EmptyState title="No activity" description="Log your first activity above." />
      ) : (
        <div className="relative space-y-0 pl-6">
          {/* Vertical line */}
          <div className="absolute left-[9px] top-1 bottom-1 w-px bg-gradient-to-b from-white/15 via-white/10 to-transparent" />

          {sorted.map((activity) => {
            const color = ACTIVITY_COLORS[activity.type] || '#71717a';
            const icon = ACTIVITY_ICONS[activity.type];
            const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });

            return (
              <div key={activity.id} className="group relative flex items-start gap-3 py-3 animate-in fade-in-0 slide-in-from-left-1 duration-300">
                <div
                  className="absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-[#18181b]"
                  style={{ backgroundColor: `${color}30`, color }}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 leading-relaxed">{activity.content}</p>
                  <p className="text-[11px] text-white/35 mt-1">{timeAgo}</p>
                </div>
                <button
                  onClick={() => setDeleteId(activity.id)}
                  className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  aria-label="Delete activity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Activity"
        description="Are you sure you want to delete this activity? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
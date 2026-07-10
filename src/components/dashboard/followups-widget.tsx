import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { isBefore, isToday, isTomorrow } from 'date-fns';
import { Check } from 'lucide-react';
import type { FollowUpTask, Client } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { EmptyState } from '@/components/shared/empty-state';
import { ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';

interface FollowupsWidgetProps {
  tasks: FollowUpTask[];
  clients: Client[];
}

export function FollowupsWidget({ tasks, clients }: FollowupsWidgetProps) {
  const navigate = useNavigate();
  const completeTask = useAppStore((s) => s.completeTask);
  const uncompleteTask = useAppStore((s) => s.uncompleteTask);

  const upcomingTasks = useMemo(() => {
    const incomplete = tasks.filter((t) => !t.completed);
    return [...incomplete]
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [tasks]);

  const getDueLabel = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isBefore(date, new Date()) && !isToday(date)) return { label: 'Overdue', color: 'text-red-400', border: 'border-l-red-500' };
    if (isToday(date)) return { label: 'Today', color: 'text-amber-400', border: 'border-l-amber-500' };
    if (isTomorrow(date)) return { label: 'Tomorrow', color: 'text-blue-400', border: 'border-l-transparent' };
    const days = Math.ceil((date.getTime() - new Date().getTime()) / 86400000);
    return { label: `in ${days} days`, color: 'text-white/50', border: 'border-l-transparent' };
  };

  if (upcomingTasks.length === 0) {
    return (
      <div className="rounded-xl bg-[#18181b] border border-white/5 p-4">
        <h3 className="text-sm font-medium text-white mb-4">Upcoming Follow-ups</h3>
        <EmptyState
          icon={<ClipboardCheck className="w-5 h-5" />}
          title="No pending tasks"
          description="All caught up! New tasks will appear here."
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#18181b] border border-white/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Upcoming Follow-ups</h3>
        <button
          onClick={() => navigate('/calendar')}
          className="text-xs text-[#6366f1] hover:text-[#5558e0] transition-colors focus:outline-none"
        >
          View all
        </button>
      </div>
      <div className="space-y-2">
        {upcomingTasks.map((task) => {
          const client = clients.find((c) => c.id === task.clientId);
          const due = getDueLabel(task.dueDate);

          return (
            <div
              key={task.id}
              className={`group flex items-center gap-3 p-2 rounded-lg border-l-2 bg-white/[0.02] ${due.border}`}
            >
              <button
                onClick={() => {
                  completeTask(task.id);
                  toast.success('Task completed', {
                    action: { label: 'Undo', onClick: () => uncompleteTask(task.id) },
                    duration: 5000,
                  });
                }}
                className="w-5 h-5 rounded border border-white/20 flex items-center justify-center shrink-0 hover:border-[#6366f1] hover:bg-[#6366f1]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30"
                aria-label="Complete task"
              >
                <Check className="w-3 h-3 text-white/0 group-hover:text-[#6366f1]" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 truncate">{task.title}</p>
                <button
                  onClick={() => client && navigate(`/clients/${client.id}`)}
                  className="text-xs text-[#6366f1] hover:underline focus:outline-none"
                >
                  {client?.name || 'Unknown'}
                </button>
              </div>
              <span className={`text-xs font-medium shrink-0 ${due.color}`}>{due.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { FollowUpTask } from '@/lib/types';
import { Check, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

interface TasksListProps {
  clientId: string;
  tasks: FollowUpTask[];
}

export function TasksList({ clientId, tasks }: TasksListProps) {
  const addTask = useAppStore((s) => s.addTask);
  const completeTask = useAppStore((s) => s.completeTask);
  const uncompleteTask = useAppStore((s) => s.uncompleteTask);
  const deleteTask = useAppStore((s) => s.deleteTask);

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleAdd = () => {
    if (!title.trim() || !dueDate) return;
    addTask({
      clientId,
      title: title.trim(),
      dueDate,
    });
    setTitle('');
    setDueDate('');
  };

  const handleComplete = (id: string) => {
    completeTask(id);
    toast.success('Task completed', {
      action: {
        label: 'Undo',
        onClick: () => uncompleteTask(id),
      },
      duration: 5000,
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTask(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#18181b] border border-white/5">
      <h3 className="text-sm font-medium text-white mb-4">Follow-up Tasks</h3>

      {/* Add Task */}
      <div className="flex gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title..."
          className="flex-1 h-8 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="h-8 px-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
        />
        <button
          onClick={handleAdd}
          className="h-8 px-3 rounded-md bg-[#6366f1] hover:bg-[#5558e0] text-white text-xs font-medium transition-colors"
        >
          Add
        </button>
      </div>

      {/* Tasks */}
      {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
        <EmptyState title="No tasks" description="Add follow-up tasks for this client." />
      ) : (
        <div className="space-y-2">
          {incompleteTasks.map((task) => (
            <div key={task.id} className="group flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
              <button
                onClick={() => handleComplete(task.id)}
                className="w-5 h-5 rounded border border-white/20 flex items-center justify-center shrink-0 hover:border-[#6366f1] hover:bg-[#6366f1]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30"
                aria-label="Complete task"
              >
                <Check className="w-3 h-3 text-transparent group-hover:text-[#6366f1]" />
              </button>
              <span className="flex-1 text-sm text-white/70">{task.title}</span>
              <span className="text-xs text-white/40">{new Date(task.dueDate).toLocaleDateString()}</span>
              <button
                onClick={() => setDeleteId(task.id)}
                className="text-white/20 hover:text-red-400 transition-colors"
                aria-label="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {completedTasks.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-white/40 mb-2">Completed</p>
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg opacity-50">
                  <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="flex-1 text-sm text-white/50 line-through">{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task?"
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

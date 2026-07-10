import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '@/lib/store';
import { Topbar } from '@/components/layout/topbar';
import { Calendar } from '@/components/ui/calendar';
import { NewTaskModal } from '@/components/calendar/new-task-modal';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  Check,
  Trash2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
} from 'lucide-react';
import {
  format,
  isBefore,
  isToday,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';
import { toast } from 'sonner';
import type { FollowUpTask, Client } from '@/lib/types';
import type { ModifiersClassNames } from 'react-day-picker';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getClientName(clientId: string, clients: Client[]): string {
  return clients.find((c) => c.id === clientId)?.name || 'Unknown';
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function CalendarPage() {
  const navigate = useNavigate();
  const tasks = useAppStore((s) => s.tasks);
  const clients = useAppStore((s) => s.clients);
  const completeTask = useAppStore((s) => s.completeTask);
  const uncompleteTask = useAppStore((s) => s.uncompleteTask);
  const deleteTask = useAppStore((s) => s.deleteTask);

  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Listen for command palette create-task event
  useEffect(() => {
    const handler = () => setNewTaskOpen(true);
    window.addEventListener('dealflow:create-task', handler);
    return () => window.removeEventListener('dealflow:create-task', handler);
  }, []);

  // Build a map of date string → tasks for quick lookup
  const tasksByDate = useMemo(() => {
    const map = new Map<string, FollowUpTask[]>();
    for (const task of tasks) {
      const key = format(new Date(task.dueDate), 'yyyy-MM-dd');
      const existing = map.get(key);
      if (existing) {
        existing.push(task);
      } else {
        map.set(key, [task]);
      }
    }
    return map;
  }, [tasks]);

  // Get tasks for the currently viewed month (for modifier dots)
  const monthTasks = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return tasks.filter((t) =>
      isWithinInterval(new Date(t.dueDate), { start, end })
    );
  }, [tasks, currentMonth]);

  // Set of date strings that have tasks (for the modifier)
  const hasTasksDates = useMemo(() => {
    const set = new Set<string>();
    for (const task of monthTasks) {
      set.add(format(new Date(task.dueDate), 'yyyy-MM-dd'));
    }
    return set;
  }, [monthTasks]);

  // Tasks for the selected day
  const selectedDayTasks = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return tasksByDate.get(key) ?? [];
  }, [selectedDate, tasksByDate]);

  // Group selected day's tasks
  const groupedTasks = useMemo(() => {
    if (!selectedDate) return { overdue: [], today: [], upcoming: [], completed: [] };
    const now = new Date();

    const overdue: FollowUpTask[] = [];
    const today: FollowUpTask[] = [];
    const upcoming: FollowUpTask[] = [];
    const completed: FollowUpTask[] = [];

    for (const task of selectedDayTasks) {
      if (task.completed) {
        completed.push(task);
      } else if (isBefore(new Date(task.dueDate), now) && !isToday(new Date(task.dueDate))) {
        overdue.push(task);
      } else if (isToday(new Date(task.dueDate))) {
        today.push(task);
      } else {
        upcoming.push(task);
      }
    }

    return { overdue, today, upcoming, completed };
  }, [selectedDayTasks, selectedDate]);

  // Modifiers for react-day-picker
  const hasTasksModifier = useCallback(
    (date: Date) => {
      return hasTasksDates.has(format(date, 'yyyy-MM-dd'));
    },
    [hasTasksDates]
  );

  const modifiersClassNames: ModifiersClassNames = {
    hasTasks: 'has-tasks-day',
  };

  const modifiers = {
    hasTasks: hasTasksModifier,
  };

  // Navigation
  const goToPrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const goToNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    setSelectedDate(today);
  };

  // Task actions
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

  const handleUncomplete = (id: string) => {
    uncompleteTask(id);
    toast.success('Task reopened');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTask(deleteId);
      setDeleteId(null);
      toast.success('Task deleted');
    }
  };

  const selectedDateLabel = selectedDate
    ? format(selectedDate, 'EEEE, MMMM d, yyyy')
    : 'Select a day';

  const totalMonthTasks = monthTasks.filter((t) => !t.completed).length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar
        title="Calendar"
        actionLabel="New Task"
        onAction={() => setNewTaskOpen(true)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          {/* Month Navigation Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-semibold text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              {totalMonthTasks > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/20">
                  <CircleDot className="w-3 h-3" />
                  {totalMonthTasks} open task{totalMonthTasks !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 px-3 text-xs font-medium"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevMonth}
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar + Detail Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Calendar Grid */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <div className="rounded-xl border border-white/5 bg-[#18181b] p-3 md:p-4 calendar-dark">
                <style>{`
                  .calendar-dark .rdp-root {
                    --cell-size: 2.75rem;
                    width: 100%;
                  }
                  @media (min-width: 640px) {
                    .calendar-dark .rdp-root {
                      --cell-size: 3.25rem;
                    }
                  }
                  .calendar-dark .rdp-day_button {
                    color: rgba(255, 255, 255, 0.85);
                    font-size: 0.8125rem;
                    position: relative;
                  }
                  .calendar-dark .rdp-day_button:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                  }
                  .calendar-dark .rdp-day_button[data-selected-single="true"] {
                    background: #6366f1;
                    color: #fff;
                    font-weight: 600;
                  }
                  .calendar-dark .rdp-day_button[data-selected-single="true"]:hover {
                    background: #5558e6;
                  }
                  .calendar-dark .rdp-today .rdp-day_button:not([data-selected-single="true"]) {
                    background: rgba(99, 102, 241, 0.15);
                    color: #a5b4fc;
                    font-weight: 600;
                  }
                  .calendar-dark .rdp-outside .rdp-day_button {
                    color: rgba(255, 255, 255, 0.2);
                  }
                  .calendar-dark .rdp-outside .rdp-day_button:hover {
                    color: rgba(255, 255, 255, 0.4);
                    background: rgba(255, 255, 255, 0.04);
                  }
                  .calendar-dark .rdp-weekday {
                    color: rgba(255, 255, 255, 0.35);
                    font-size: 0.6875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding-bottom: 0.25rem;
                  }
                  .calendar-dark .rdp-nav {
                    display: none;
                  }
                  .calendar-dark .rdp-month_caption {
                    display: none;
                  }
                  .calendar-dark .has-tasks-day .rdp-day_button::after {
                    content: '';
                    position: absolute;
                    bottom: 2px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 9999px;
                    background: #6366f1;
                  }
                  .calendar-dark .has-tasks-day .rdp-day_button[data-selected-single="true"]::after {
                    background: rgba(255, 255, 255, 0.7);
                  }
                  .calendar-dark .has-tasks-day.rdp-today .rdp-day_button::after {
                    background: #6366f1;
                  }
                  .calendar-dark .rdp-months,
                  .calendar-dark .rdp-month {
                    width: 100%;
                  }
                `}</style>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  showOutsideDays
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  fixedWeeks
                  className="w-full"
                />
              </div>
            </div>

            {/* Day Detail Panel */}
            <div className="flex-1 min-w-0">
              <div className="rounded-xl border border-white/5 bg-[#18181b] overflow-hidden">
                {/* Panel Header */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="w-4 h-4 text-[#6366f1]" />
                    <span className="text-sm font-medium text-white">
                      {selectedDateLabel}
                    </span>
                  </div>
                  {selectedDayTasks.length > 0 && (
                    <span className="text-xs text-white/40">
                      {selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Panel Content */}
                <div className="p-4 max-h-[60vh] lg:max-h-[calc(100vh-220px)] overflow-y-auto">
                  {selectedDayTasks.length === 0 ? (
                    <CalendarDayEmptyState
                      onNewTask={() => setNewTaskOpen(true)}
                      isToday={selectedDate ? isToday(selectedDate) : false}
                    />
                  ) : (
                    <div className="space-y-5">
                      {/* Overdue */}
                      {groupedTasks.overdue.length > 0 && (
                        <TaskGroup
                          label="Overdue"
                          icon={<AlertTriangle className="w-3.5 h-3.5" />}
                          color="text-red-400"
                          dotColor="bg-red-500"
                          tasks={groupedTasks.overdue}
                          clients={clients}
                          onComplete={handleComplete}
                          onDelete={setDeleteId}
                          onUncomplete={handleUncomplete}
                          onClientClick={(id) => navigate(`/clients/${id}`)}
                        />
                      )}

                      {/* Today */}
                      {groupedTasks.today.length > 0 && (
                        <TaskGroup
                          label="Due Today"
                          icon={<CalendarClock className="w-3.5 h-3.5" />}
                          color="text-amber-400"
                          dotColor="bg-amber-500"
                          tasks={groupedTasks.today}
                          clients={clients}
                          onComplete={handleComplete}
                          onDelete={setDeleteId}
                          onUncomplete={handleUncomplete}
                          onClientClick={(id) => navigate(`/clients/${id}`)}
                        />
                      )}

                      {/* Upcoming (future tasks on this day) */}
                      {groupedTasks.upcoming.length > 0 && (
                        <TaskGroup
                          label="Upcoming"
                          icon={<CircleDot className="w-3.5 h-3.5" />}
                          color="text-[#818cf8]"
                          dotColor="bg-[#6366f1]"
                          tasks={groupedTasks.upcoming}
                          clients={clients}
                          onComplete={handleComplete}
                          onDelete={setDeleteId}
                          onUncomplete={handleUncomplete}
                          onClientClick={(id) => navigate(`/clients/${id}`)}
                        />
                      )}

                      {/* Completed */}
                      {groupedTasks.completed.length > 0 && (
                        <TaskGroup
                          label="Completed"
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          color="text-emerald-400"
                          dotColor="bg-emerald-500"
                          tasks={groupedTasks.completed}
                          clients={clients}
                          onComplete={handleComplete}
                          onDelete={setDeleteId}
                          onUncomplete={handleUncomplete}
                          onClientClick={(id) => navigate(`/clients/${id}`)}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewTaskModal open={newTaskOpen} onOpenChange={setNewTaskOpen} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

// ─── Calendar Day Empty State ──────────────────────────────────────────────
// Note: This is a calendar-specific empty state with custom CTA, separate from the shared EmptyState component.

function CalendarDayEmptyState({ onNewTask, isToday }: { onNewTask: () => void; isToday: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <CalendarDays className="w-7 h-7 text-white/20" />
      </div>
      <h3 className="text-sm font-medium text-white/60 mb-1">
        {isToday ? 'No tasks for today' : 'No tasks for this day'}
      </h3>
      <p className="text-xs text-white/30 mb-5 max-w-[220px]">
        {isToday
          ? 'You\'re all caught up! Enjoy your day or add a new task.'
          : 'This day is clear. Click below to schedule a follow-up.'}
      </p>
      <Button
        onClick={onNewTask}
        size="sm"
        className="bg-[#6366f1] hover:bg-[#5558e6] text-white text-xs h-8 px-4"
      >
        <CircleDot className="w-3.5 h-3.5 mr-1.5" />
        Add Task
      </Button>
    </div>
  );
}

// ─── Task Group ─────────────────────────────────────────────────────────────

interface TaskGroupProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  dotColor: string;
  tasks: FollowUpTask[];
  clients: Client[];
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onDelete: (id: string) => void;
  onClientClick: (id: string) => void;
}

function TaskGroup({
  label,
  icon,
  color,
  dotColor,
  tasks,
  clients,
  onComplete,
  onUncomplete,
  onDelete,
  onClientClick,
}: TaskGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className={color}>{icon}</span>
        <h4 className={`text-xs font-semibold uppercase tracking-wide ${color}`}>
          {label}
        </h4>
        <span className="text-[0.625rem] text-white/30 font-medium">
          ({tasks.length})
        </span>
      </div>
      <div className="space-y-1.5">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            clientName={getClientName(task.clientId, clients)}
            dotColor={dotColor}
            completed={task.completed}
            onComplete={() => onComplete(task.id)}
            onUncomplete={() => onUncomplete(task.id)}
            onDelete={() => onDelete(task.id)}
            onClientClick={() => onClientClick(task.clientId)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Task Item ──────────────────────────────────────────────────────────────

interface TaskItemProps {
  task: FollowUpTask;
  clientName: string;
  dotColor: string;
  completed: boolean;
  onComplete: () => void;
  onUncomplete: () => void;
  onDelete: () => void;
  onClientClick: () => void;
}

function TaskItem({
  task,
  clientName,
  dotColor,
  completed,
  onComplete,
  onUncomplete,
  onDelete,
  onClientClick,
}: TaskItemProps) {
  return (
    <div
      className={`group flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
        completed
          ? 'bg-white/[0.02] border-white/[0.03]'
          : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
      }`}
    >
      {/* Complete Checkbox */}
      <button
        onClick={completed ? onUncomplete : onComplete}
        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
          completed
            ? 'bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30'
            : 'border-white/20 hover:border-[#6366f1] hover:bg-[#6366f1]/10'
        }`}
        aria-label={completed ? 'Reopen task' : 'Complete task'}
      >
        {completed ? (
          <Check className="w-3 h-3 text-emerald-400" />
        ) : (
          <Check className="w-3 h-3 text-transparent group-hover:text-[#6366f1]" />
        )}
      </button>

      {/* Task Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm truncate transition-colors ${
            completed ? 'text-white/30 line-through' : 'text-white/80'
          }`}
        >
          {task.title}
        </p>
        <button
          onClick={onClientClick}
          className="text-xs text-[#6366f1] hover:text-[#818cf8] hover:underline transition-colors truncate block max-w-full"
        >
          {clientName}
        </button>
      </div>

      {/* Status Dot */}
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor} opacity-60`} />

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
        aria-label="Delete task"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
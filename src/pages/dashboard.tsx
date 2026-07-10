import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '@/lib/store';
import { Topbar } from '@/components/layout/topbar';
import { CurrencyText } from '@/components/shared/currency-text';
import { RevenueTrendChart } from '@/components/dashboard/revenue-trend-chart';
import { PipelineByStageChart } from '@/components/dashboard/pipeline-by-stage-chart';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { FollowupsWidget } from '@/components/dashboard/followups-widget';
import { AIInsights } from '@/components/dashboard/ai-insights';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Trophy, Target, Users, Sparkles } from 'lucide-react';
import { isSameMonth, subMonths, isToday, isBefore } from 'date-fns';

export function DashboardPage() {
  const navigate = useNavigate();
  const hydrated = useAppStore((s) => s.hydrated);
  const clients = useAppStore((s) => s.clients);
  const deals = useAppStore((s) => s.deals);
  const activities = useAppStore((s) => s.activities);
  const tasks = useAppStore((s) => s.tasks);

  const stats = useMemo(() => {
    const openDeals = deals.filter((d) => d.stageId !== 'won' && d.stageId !== 'lost');
    const totalPipeline = openDeals.reduce((sum, d) => sum + d.value, 0);

    const now = new Date();
    const wonThisMonth = deals.filter((d) => d.wonAt && isSameMonth(new Date(d.wonAt), now));
    const wonThisMonthValue = wonThisMonth.reduce((sum, d) => sum + d.value, 0);

    const ninetyDaysAgo = subMonths(now, 3);
    const wonLast90 = deals.filter((d) => d.wonAt && new Date(d.wonAt) >= ninetyDaysAgo);
    const lostLast90 = deals.filter((d) => d.lostAt && new Date(d.lostAt) >= ninetyDaysAgo);
    const winRate = wonLast90.length + lostLast90.length > 0
      ? Math.round((wonLast90.length / (wonLast90.length + lostLast90.length)) * 100)
      : 0;

    const activeClientIds = new Set(openDeals.map((d) => d.clientId));
    const activeClients = activeClientIds.size;

    const todayTasks = tasks.filter((t) => !t.completed && isToday(new Date(t.dueDate))).length;
    const overdueTasks = tasks.filter((t) => !t.completed && isBefore(new Date(t.dueDate), new Date()) && !isToday(new Date(t.dueDate))).length;

    const negotDeals = deals.filter((d) => d.stageId === 'negotiation').length;
    const proposalDeals = deals.filter((d) => d.stageId === 'proposal_sent').length;

    return { totalPipeline, wonCount: wonThisMonth.length, wonValue: wonThisMonthValue, winRate, activeClients, todayTasks, overdueTasks, negotDeals, proposalDeals };
  }, [deals, tasks]);

  if (!hydrated) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Topbar title="Dashboard" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-32 rounded-xl bg-white/5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-80 rounded-xl bg-white/5" />
            <Skeleton className="h-80 rounded-xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Topbar title="Dashboard" />
        <div className="p-6">
          <EmptyState
            icon={<Sparkles className="w-6 h-6" />}
            title="Welcome to DealFlow"
            description="Add your first client to get started with tracking deals and managing your pipeline."
            action={
              <button
                onClick={() => navigate('/clients')}
                className="px-4 py-2 rounded-lg bg-[#6366f1] hover:bg-[#5558e0] text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40"
              >
                Add Your First Client
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Hero Section */}
        <div aria-live="polite" className="rounded-xl bg-gradient-to-br from-[#6366f1]/10 via-[#18181b] to-[#18181b] border border-white/5 p-6 animate-fade-in-up relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1.5">Welcome back</h2>
              <p className="text-sm text-white/50 leading-relaxed">
                {stats.todayTasks > 0 ? (
                  <>You have <span className="text-amber-400 font-medium">{stats.todayTasks} task{stats.todayTasks !== 1 ? 's' : ''}</span> due today{stats.overdueTasks > 0 && <>, <span className="text-red-400 font-medium">{stats.overdueTasks} overdue</span></>}</>
                ) : stats.overdueTasks > 0 ? (
                  <>You have <span className="text-red-400 font-medium">{stats.overdueTasks} overdue task{stats.overdueTasks !== 1 ? 's' : ''}</span></>
                ) : (
                  <>You're all caught up! No tasks due today.</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm bg-white/[0.03] rounded-xl px-5 py-3 border border-white/5">
              <div className="text-center px-3">
                <div className="text-xl font-bold text-white">{stats.activeClients}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">Active</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center px-3">
                <div className="text-xl font-bold text-emerald-400">{stats.wonCount}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">Won</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center px-3">
                <div className="text-xl font-bold text-gradient">{stats.winRate}%</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">Win Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedStatCard
            title="Total Pipeline"
            value={<CurrencyText value={stats.totalPipeline} />}
            subtitle={`${deals.filter((d) => d.stageId !== 'won' && d.stageId !== 'lost').length} open deals`}
            icon={<TrendingUp className="w-4 h-4 text-[#6366f1]" />}
            className="animate-fade-in-up stagger-1"
          />
          <AnimatedStatCard
            title="Won This Month"
            value={stats.wonCount}
            subtitle={<CurrencyText value={stats.wonValue} />}
            icon={<Trophy className="w-4 h-4 text-emerald-500" />}
            className="animate-fade-in-up stagger-2"
          />
          <AnimatedStatCard
            title="Win Rate"
            value={`${stats.winRate}%`}
            subtitle="Last 90 days"
            icon={<Target className="w-4 h-4 text-amber-500" />}
            className="animate-fade-in-up stagger-3"
          />
          <AnimatedStatCard
            title="Active Clients"
            value={stats.activeClients}
            subtitle={`of ${clients.length} total`}
            icon={<Users className="w-4 h-4 text-blue-500" />}
            className="animate-fade-in-up stagger-4"
          />
        </div>

        {/* AI Insights */}
        <AIInsights stats={stats} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up stagger-5">
          <RevenueTrendChart deals={deals} />
          <PipelineByStageChart deals={deals} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up stagger-6">
          <FollowupsWidget tasks={tasks} clients={clients} />
          <ActivityFeed activities={activities} clients={clients} />
        </div>
      </div>
    </div>
  );
}

// Animated Stat Card wrapper with count-up
function AnimatedStatCard({ title, value, subtitle, icon, className }: {
  title: string;
  value: React.ReactNode;
  subtitle: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  const numericValue = typeof value === 'number' ? value : null;

  useEffect(() => {
    if (numericValue === null) return;
    const duration = 800;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * numericValue));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [numericValue]);

  return (
    <div className={`rounded-xl bg-[#18181b] border border-white/5 p-4 hover:border-white/10 hover:shadow-lg hover:shadow-[#6366f1]/5 transition-all duration-300 ${className || ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/50 font-medium">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center" aria-hidden="true">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold text-white mb-1 tracking-tight tabular-nums">
        {numericValue !== null ? displayed : value}
      </div>
      <div className="text-xs text-white/40">{subtitle}</div>
    </div>
  );
}
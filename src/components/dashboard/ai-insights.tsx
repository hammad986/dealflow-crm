import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { differenceInDays } from 'date-fns';
import { Sparkles, AlertTriangle, TrendingUp, Clock, DollarSign, Users, Hourglass } from 'lucide-react';
import { CURRENCY_LOCALES } from '@/lib/constants';

interface AIInsightsProps {
  stats: {
    totalPipeline: number;
    wonCount: number;
    wonValue: number;
    winRate: number;
    activeClients: number;
    todayTasks: number;
    overdueTasks: number;
    negotDeals: number;
    proposalDeals: number;
  };
}

export function AIInsights({ stats }: AIInsightsProps) {
  const deals = useAppStore((s) => s.deals);
  const clients = useAppStore((s) => s.clients);
  const defaultCurrency = useAppStore((s) => s.defaultCurrency);
  const locale = CURRENCY_LOCALES[defaultCurrency] || 'en-US';

  const insights = useMemo(() => {
    const items: { icon: React.ReactNode; color: string; text: string; priority: 'high' | 'medium' | 'low' }[] = [];

    // Overdue tasks
    if (stats.overdueTasks > 0) {
      items.push({
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        color: 'text-red-400 bg-red-500/10 border-red-500/20',
        text: `${stats.overdueTasks} overdue task${stats.overdueTasks !== 1 ? 's' : ''} require immediate attention.`,
        priority: 'high',
      });
    }

    // Negotiation overload
    if (stats.negotDeals >= 3) {
      items.push({
        icon: <Clock className="w-3.5 h-3.5" />,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        text: `Negotiation stage has ${stats.negotDeals} deals — consider accelerating closures.`,
        priority: 'high',
      });
    }

    // Win rate insight
    if (stats.winRate >= 50) {
      items.push({
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        text: `Win rate is ${stats.winRate}% — performing above average. Great momentum!`,
        priority: 'low',
      });
    } else if (stats.winRate > 0 && stats.winRate < 30) {
      items.push({
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        text: `Win rate is ${stats.winRate}% — review lost deals for improvement opportunities.`,
        priority: 'medium',
      });
    }

    // Highest value client
    const clientValues = clients.map((c) => ({
      name: c.name,
      value: deals.filter((d) => d.clientId === c.id && d.stageId === 'won').reduce((sum, d) => sum + d.value, 0),
    })).sort((a, b) => b.value - a.value);
    if (clientValues[0]?.value > 0) {
      const topClientValue = new Intl.NumberFormat(locale, { style: 'currency', currency: defaultCurrency, maximumFractionDigits: 0 }).format(clientValues[0].value);
      items.push({
        icon: <DollarSign className="w-3.5 h-3.5" />,
        color: 'text-[#818cf8] bg-[#6366f1]/10 border-[#6366f1]/20',
        text: `Top client: ${clientValues[0].name} — won deals worth ${topClientValue}.`,
        priority: 'low',
      });
    }

    // Proposal conversion
    if (stats.proposalDeals > 0) {
      items.push({
        icon: <Users className="w-3.5 h-3.5" />,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        text: `${stats.proposalDeals} proposal${stats.proposalDeals !== 1 ? 's' : ''} sent — follow up to increase conversion.`,
        priority: 'medium',
      });
    }

    // Today's tasks
    if (stats.todayTasks > 0) {
      items.push({
        icon: <Clock className="w-3.5 h-3.5" />,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        text: `${stats.todayTasks} task${stats.todayTasks !== 1 ? 's' : ''} scheduled for today. Stay focused!`,
        priority: 'medium',
      });
    }

    // Pipeline health
    const openDeals = deals.filter((d) => d.stageId !== 'won' && d.stageId !== 'lost');
    if (openDeals.length === 0 && clients.length > 0) {
      items.push({
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        color: 'text-red-400 bg-red-500/10 border-red-500/20',
        text: 'Pipeline is empty. Create new deals to keep revenue flowing.',
        priority: 'high',
      });
    }

    // Stale deals: deals in a stage for more than 14 days
    const staleDeals = openDeals.filter((d) => differenceInDays(new Date(), new Date(d.stageEnteredAt)) > 14);
    if (staleDeals.length > 0) {
      const staleClientNames = [...new Set(staleDeals.map((d) => {
        const client = clients.find((c) => c.id === d.clientId);
        return client?.name || 'Unknown';
      }))].slice(0, 3);
      items.push({
        icon: <Hourglass className="w-3.5 h-3.5" />,
        color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        text: `${staleDeals.length} deal${staleDeals.length !== 1 ? 's' : ''} stale (14+ days). Review: ${staleClientNames.join(', ')}.`,
        priority: 'high',
      });
    }

    // High value in negotiation: any negotiation deal > 50000
    const highValueNegotiationDeals = deals.filter(
      (d) => d.stageId === 'negotiation' && d.value > 50000
    );
    if (highValueNegotiationDeals.length > 0) {
      const dealNames = highValueNegotiationDeals
        .map((d) => {
          const client = clients.find((c) => c.id === d.clientId);
          return client ? `${client.name} (${d.title})` : d.title;
        })
        .slice(0, 2);
      const totalValue = new Intl.NumberFormat(locale, { style: 'currency', currency: defaultCurrency, maximumFractionDigits: 0 }).format(
        highValueNegotiationDeals.reduce((sum, d) => sum + d.value, 0)
      );
      items.push({
        icon: <DollarSign className="w-3.5 h-3.5" />,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        text: `High-value deals in negotiation (${totalValue}): ${dealNames.join(', ')}. Prioritize closing!`,
        priority: 'high',
      });
    }

    return items.slice(0, 4);
  }, [stats, deals, clients, defaultCurrency, locale]);

  if (insights.length === 0) return null;

  return (
    <div className="rounded-xl bg-[#18181b] border border-white/5 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/5 via-transparent to-[#6366f1]/5 animate-pulse pointer-events-none" />

      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#6366f1]" />
        <h3 className="text-sm font-medium text-white">AI Insights</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 p-3 rounded-lg border ${insight.color}`}
          >
            <div className="shrink-0 mt-0.5">{insight.icon}</div>
            <p className="text-xs text-white/70 leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
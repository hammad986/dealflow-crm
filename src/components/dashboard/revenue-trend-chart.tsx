import { useMemo } from 'react';
import { format, subMonths, startOfMonth, isSameMonth } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Deal } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { CURRENCY_LOCALES } from '@/lib/constants';

interface RevenueTrendChartProps {
  deals: Deal[];
}

export function RevenueTrendChart({ deals }: RevenueTrendChartProps) {
  const defaultCurrency = useAppStore((s) => s.defaultCurrency);
  const locale = CURRENCY_LOCALES[defaultCurrency] || 'en-US';

  const data = useMemo(() => {
    const now = new Date();
    const months: { month: string; value: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(startOfMonth(now), i);
      const monthDeals = deals.filter(
        (d) => d.wonAt && isSameMonth(new Date(d.wonAt), monthDate)
      );
      const value = monthDeals.reduce((sum, d) => sum + d.value, 0);
      months.push({
        month: format(monthDate, 'MMM yyyy'),
        value,
      });
    }
    return months;
  }, [deals]);

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return `${value}`;
  };

  return (
    <div className="rounded-xl bg-[#18181b] border border-white/5 p-4">
      <h3 className="text-sm font-medium text-white mb-4">Revenue Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value: number) => [
                new Intl.NumberFormat(locale, { style: 'currency', currency: defaultCurrency, maximumFractionDigits: 0 }).format(value),
                'Revenue',
              ]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#6366f1' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
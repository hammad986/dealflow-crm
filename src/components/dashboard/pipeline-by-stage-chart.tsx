import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Deal } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { CURRENCY_LOCALES } from '@/lib/constants';

interface PipelineByStageChartProps {
  deals: Deal[];
}

export function PipelineByStageChart({ deals }: PipelineByStageChartProps) {
  const stages = useAppStore((s) => s.stages);
  const defaultCurrency = useAppStore((s) => s.defaultCurrency);
  const locale = CURRENCY_LOCALES[defaultCurrency] || 'en-US';

  const data = useMemo(() => {
    const openStages = stages.filter((s) => s.id !== 'won' && s.id !== 'lost');
    return openStages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stageId === stage.id);
      return {
        stage: stage.name,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + d.value, 0),
        color: stage.color,
      };
    });
  }, [deals, stages]);

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return `${value}`;
  };

  return (
    <div className="rounded-xl bg-[#18181b] border border-white/5 p-4">
      <h3 className="text-sm font-medium text-white mb-4">Pipeline by Stage</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCurrency}
            />
            <YAxis
              type="category"
              dataKey="stage"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(_value: number, _name: string, props: { payload?: { count: number; value: number } }) => {
                const p = props?.payload;
                if (!p) return ['', ''];
                return [
                  `${p.count} deals · ${new Intl.NumberFormat(locale, { style: 'currency', currency: defaultCurrency, maximumFractionDigits: 0 }).format(p.value)}`,
                  'Pipeline',
                ];
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
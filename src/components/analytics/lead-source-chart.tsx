import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Client } from '@/lib/types';

interface LeadSourceChartProps {
  clients: Client[];
}

const COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444'];

export function LeadSourceChart({ clients }: LeadSourceChartProps) {
  const data = useMemo(() => {
    const sourceCount: Record<string, number> = {};
    clients.forEach((c) => {
      sourceCount[c.leadSource] = (sourceCount[c.leadSource] || 0) + 1;
    });

    return Object.entries(sourceCount).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [clients]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-[#18181b] border border-white/5 p-4">
        <h3 className="text-sm font-medium text-white mb-4">Lead Source Breakdown</h3>
        <p className="text-sm text-white/40">No data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#18181b] border border-white/5 p-4">
      <h3 className="text-sm font-medium text-white mb-4">Lead Source Breakdown</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [`${value} clients`, name]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => <span className="text-xs text-white/60">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

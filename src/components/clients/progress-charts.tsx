'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ProgressPoint {
  date: string;
  weight: number | null;
  bodyFat: number | null;
}

function MiniChart({
  data,
  dataKey,
  unit,
  color,
}: {
  data: ProgressPoint[];
  dataKey: 'weight' | 'bodyFat';
  unit: string;
  color: string;
}) {
  const hasData = data.some((d) => d[dataKey] != null);
  if (!hasData) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} domain={['auto', 'auto']} />
        <Tooltip
          formatter={(v: number) => [`${v} ${unit}`, dataKey === 'weight' ? 'Weight' : 'Body fat']}
          contentStyle={{ borderRadius: 8, border: '1px solid hsl(214 32% 91%)', fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ProgressCharts({ data }: { data: ProgressPoint[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weight (kg)</CardTitle>
        </CardHeader>
        <CardContent>
          <MiniChart data={data} dataKey="weight" unit="kg" color="hsl(142 71% 45%)" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Body fat (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <MiniChart data={data} dataKey="bodyFat" unit="%" color="hsl(221 83% 53%)" />
        </CardContent>
      </Card>
    </div>
  );
}

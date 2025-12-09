import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Brush
} from 'recharts';
import { FundDataPoint } from '../types';

interface ChartProps {
  data: FundDataPoint[];
  color: string;
  simple?: boolean;
}

export const MainLineChart: React.FC<ChartProps> = ({ data, color, simple }) => {
  // Format date for axis
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
  };

  const formatTooltipDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className={`w-full ${simple ? 'h-32' : 'h-96'}`}>
      <ResponsiveContainer width="100%" height="100%">
        {simple ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`colorGradient${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area 
                type="monotone" 
                dataKey="price" 
                stroke={color} 
                fillOpacity={1} 
                fill={`url(#colorGradient${color})`} 
                strokeWidth={2}
            />
          </AreaChart>
        ) : (
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
             <defs>
              <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatDate} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              minTickGap={50}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val.toFixed(2)}
            />
            <Tooltip
              labelFormatter={formatTooltipDate}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
                type="monotone" 
                dataKey="price" 
                stroke={color} 
                strokeWidth={3}
                fill="url(#colorMain)"
                activeDot={{ r: 6 }}
            />
            <Brush 
                dataKey="timestamp" 
                height={30} 
                stroke={color} 
                tickFormatter={() => ''}
                travellerWidth={10}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

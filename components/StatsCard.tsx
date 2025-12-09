import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  trend?: number; // percentage
  icon?: React.ReactNode;
  subtext?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, icon, subtext }) => {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-indigo-500 bg-indigo-50 p-2 rounded-lg">{icon}</div>}
      </div>
      
      <div>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        {trend !== undefined && (
          <div className={`flex items-center mt-2 text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
            <span>{Math.abs(trend).toFixed(2)}%</span>
            <span className="text-slate-400 font-normal ml-2">{subtext || 'vs last period'}</span>
          </div>
        )}
        {!trend && subtext && (
            <div className="mt-2 text-sm text-slate-400">{subtext}</div>
        )}
      </div>
    </div>
  );
};

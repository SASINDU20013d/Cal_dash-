import React, { useState, useEffect } from 'react';
import { FundDataPoint } from '../types';
import { Calculator, DollarSign, Calendar } from 'lucide-react';
import * as d3 from 'd3';

interface Props {
  data: FundDataPoint[];
  fundName: string;
}

export const InvestmentCalculator: React.FC<Props> = ({ data, fundName }) => {
  const [amount, setAmount] = useState<number>(100000);
  const [startDate, setStartDate] = useState<string>('');
  const [result, setResult] = useState<{ finalValue: number; profit: number; percent: number } | null>(null);

  // Set default start date to 1 year ago or min date
  useEffect(() => {
    if (data.length > 0 && !startDate) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const minDate = new Date(data[0].timestamp);
      // Ensure we don't pick a date before data exists
      const defaultDate = oneYearAgo < minDate ? minDate : oneYearAgo;
      setStartDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [data, startDate]);

  useEffect(() => {
    if (!startDate || data.length === 0) return;

    const startTimestamp = new Date(startDate).getTime();
    
    // Find closest data point to selected start date
    // Use bisector from d3 for efficiency if array is large, or just find
    const startIndex = data.findIndex(d => d.timestamp >= startTimestamp);
    
    if (startIndex !== -1) {
      const startPrice = data[startIndex].price;
      const endPrice = data[data.length - 1].price;
      
      const units = amount / startPrice;
      const finalVal = units * endPrice;
      const profit = finalVal - amount;
      const percent = (profit / amount) * 100;

      setResult({
        finalValue: finalVal,
        profit: profit,
        percent: percent
      });
    }
  }, [amount, startDate, data]);

  if (data.length === 0) return null;

  const minDateStr = new Date(data[0].timestamp).toISOString().split('T')[0];
  const maxDateStr = new Date(data[data.length - 1].timestamp).toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center mb-6">
        <div className="bg-emerald-50 p-2 rounded-lg mr-3">
          <Calculator className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Investment Simulator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Investment Amount (LKR)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                min={minDateStr}
                max={maxDateStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 flex flex-col justify-center">
            {result ? (
                <>
                    <div className="mb-4">
                        <span className="text-sm text-slate-500 font-medium">Projected Value</span>
                        <div className="text-3xl font-bold text-emerald-700">
                            {result.finalValue.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}
                        </div>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                        <div>
                            <span className="text-sm text-slate-500 font-medium block">Total Profit</span>
                            <span className={`text-lg font-bold ${result.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {result.profit >= 0 ? '+' : ''}{result.profit.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}
                            </span>
                        </div>
                         <div className={`px-3 py-1 rounded-full text-sm font-bold ${result.percent >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {result.percent.toFixed(2)}% Return
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center text-slate-400">
                    Enter details to simulate investment
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

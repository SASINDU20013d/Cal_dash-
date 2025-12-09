import React, { useState, useEffect, useMemo } from 'react';
import { FundCollection, FundDataPoint, ViewMode, AiAnalysisResult } from '../types';
import { fetchFundData } from '../services/dataService';
import { analyzeFundPerformance } from '../services/geminiService';
import { MainLineChart } from './Charts';
import { StatsCard } from './StatsCard';
import { InvestmentCalculator } from './InvestmentCalculator';
import { TrendingUp, PieChart, AlertCircle, Bot, Loader2, DollarSign, Activity } from 'lucide-react';
import * as d3 from 'd3';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<FundCollection | null>(null);
  const [selectedFund, setSelectedFund] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MANAGER);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const fundData = await fetchFundData();
      setData(fundData);
      const funds = Object.keys(fundData);
      if (funds.length > 0) {
        setSelectedFund(funds[0]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const currentFundData = useMemo(() => {
    if (!data || !selectedFund) return [];
    return data[selectedFund];
  }, [data, selectedFund]);

  const stats = useMemo(() => {
    if (currentFundData.length === 0) return null;
    
    const latest = currentFundData[currentFundData.length - 1];
    const prev = currentFundData.length > 1 ? currentFundData[currentFundData.length - 2] : latest;
    
    // Calculate YTD
    const currentYear = new Date(latest.timestamp).getFullYear();
    const startOfYearIndex = currentFundData.findIndex(d => new Date(d.timestamp).getFullYear() === currentYear);
    const startOfYear = startOfYearIndex >= 0 ? currentFundData[startOfYearIndex] : currentFundData[0];
    
    const ytdReturn = ((latest.price - startOfYear.price) / startOfYear.price) * 100;
    const dailyChange = ((latest.price - prev.price) / prev.price) * 100;

    // Calculate volatility (std dev of daily returns over last 30 days)
    const last30 = currentFundData.slice(-30);
    const returns = last30.map((d, i, arr) => {
        if (i === 0) return 0;
        return (d.price - arr[i-1].price) / arr[i-1].price;
    }).slice(1);
    const volatility = d3.deviation(returns) || 0;

    return {
      price: latest.price.toFixed(4),
      date: new Date(latest.timestamp).toLocaleDateString(),
      dailyChange,
      ytdReturn,
      volatility: volatility * Math.sqrt(252) * 100 // Annualized volatility
    };
  }, [currentFundData]);

  const handleAiAnalysis = async () => {
    if (!currentFundData.length) return;
    setAnalyzing(true);
    try {
      const result = await analyzeFundPerformance(selectedFund, currentFundData);
      setAiAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
               <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                 <TrendingUp className="w-5 h-5 text-white" />
               </div>
               <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600">
                 CAL Analytics
               </span>
            </div>
            
            <div className="hidden md:flex space-x-4">
               <button 
                onClick={() => setViewMode(ViewMode.MANAGER)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === ViewMode.MANAGER ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
               >
                 Fund Manager
               </button>
               <button 
                onClick={() => setViewMode(ViewMode.INVESTOR)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === ViewMode.INVESTOR ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
               >
                 Investor
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Market Overview</h1>
                <p className="text-slate-500">Track and analyze historical unit trust performance.</p>
            </div>
            <div className="relative">
                <select 
                    value={selectedFund}
                    onChange={(e) => {
                        setSelectedFund(e.target.value);
                        setAiAnalysis(null);
                    }}
                    className="appearance-none bg-white border border-slate-300 text-slate-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-sm w-full md:w-80"
                >
                    {data && Object.keys(data).map(f => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard 
                title="Current NAV" 
                value={`LKR ${stats?.price || '0.00'}`} 
                trend={stats?.dailyChange}
                subtext={`Updated ${stats?.date}`}
                icon={<DollarSign className="w-5 h-5" />}
            />
            <StatsCard 
                title="YTD Return" 
                value={`${stats?.ytdReturn.toFixed(2)}%`}
                trend={stats?.ytdReturn}
                subtext="Since Jan 1st"
                icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatsCard 
                title="Volatility (Annual)" 
                value={`${stats?.volatility.toFixed(2)}%`} 
                subtext="Risk Metric"
                icon={<Activity className="w-5 h-5" />}
            />
             <StatsCard 
                title="Fund Type" 
                value={selectedFund.includes('Equity') ? 'Equity' : selectedFund.includes('Income') ? 'Fixed Income' : 'Balanced'}
                subtext="Asset Class"
                icon={<PieChart className="w-5 h-5" />}
            />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart Column */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800">NAV Performance History</h2>
                        <div className="flex space-x-2">
                             {/* Simple time range buttons could go here */}
                             <span className="text-xs font-semibold text-slate-400 uppercase">All Time</span>
                        </div>
                    </div>
                    <MainLineChart data={currentFundData} color="#4f46e5" />
                </div>

                {viewMode === ViewMode.INVESTOR && (
                    <InvestmentCalculator data={currentFundData} fundName={selectedFund} />
                )}
            </div>

            {/* Sidebar / AI Column */}
            <div className="space-y-6">
                
                {/* AI Analyst Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Bot className="w-32 h-32" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center mb-4">
                            <Bot className="w-6 h-6 mr-2 text-indigo-300" />
                            <h3 className="text-lg font-bold text-indigo-100">AI Market Analyst</h3>
                        </div>
                        
                        {!aiAnalysis ? (
                            <div className="text-center py-8">
                                <p className="text-indigo-200 mb-6 text-sm">
                                    Generate an instant technical analysis of {selectedFund} using Gemini 2.5.
                                </p>
                                <button 
                                    onClick={handleAiAnalysis}
                                    disabled={analyzing}
                                    className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center"
                                >
                                    {analyzing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Analyzing Market...
                                        </>
                                    ) : (
                                        'Generate Insight'
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center mb-4 space-x-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                        aiAnalysis.sentiment === 'bullish' ? 'bg-emerald-500/20 text-emerald-300' : 
                                        aiAnalysis.sentiment === 'bearish' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-500/20 text-slate-300'
                                    }`}>
                                        {aiAnalysis.sentiment}
                                    </span>
                                    <span className="text-xs text-indigo-300">Based on recent data</span>
                                </div>
                                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                                    {aiAnalysis.summary}
                                </p>
                                <div className="space-y-2">
                                    {aiAnalysis.keyPoints.map((point, i) => (
                                        <div key={i} className="flex items-start text-xs text-indigo-200">
                                            <div className="min-w-[4px] h-[4px] rounded-full bg-indigo-400 mt-1.5 mr-2"></div>
                                            {point}
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setAiAnalysis(null)}
                                    className="mt-6 text-xs text-indigo-400 hover:text-white underline"
                                >
                                    Clear Analysis
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Sidebar Info */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-slate-400" />
                        Fund Details
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Inception Date</span>
                            <span className="font-medium text-slate-700">
                                {currentFundData.length > 0 ? new Date(currentFundData[0].timestamp).getFullYear() : 'N/A'}
                            </span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Data Points</span>
                            <span className="font-medium text-slate-700">{currentFundData.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Min Price (All-time)</span>
                            <span className="font-medium text-slate-700">
                                {d3.min(currentFundData, d => d.price)?.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Max Price (All-time)</span>
                            <span className="font-medium text-slate-700">
                                {d3.max(currentFundData, d => d.price)?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Activity, PoundSterling, AlertCircle } from 'lucide-react';
import api from '../api';

const KPICard = ({ title, value, subtext, icon: Icon, trend }) => (
  <div className="relative p-6 overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl group hover:bg-white/[0.04] transition-all duration-300">
    <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-400 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
      <Icon size={80} />
    </div>
    <div className="flex items-center space-x-4 mb-4">
      <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-medium tracking-wider text-slate-400 uppercase">{title}</h3>
    </div>
    <div className="flex items-baseline space-x-3">
      <span className="text-4xl font-light tracking-tight text-white">{value}</span>
      <span className={`text-sm font-medium ${trend === 'down' ? 'text-emerald-400' : 'text-rose-400'}`}>
        {subtext}
      </span>
    </div>
  </div>
);

const UkEconomyDashboard = () => {
  const [activeTab, setActiveTab] = useState('headline');
  const [liveKpis, setLiveKpis] = useState(null);
  const [chartData, setChartData] = useState({ trend: [], category: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/economy/kpis/');

        if (response.status === 202 || response.data.status === 'loading') {
          if (isMounted) {
            console.log("Dashboard is syncing... retrying in 3 seconds.");
            timeoutId = setTimeout(fetchDashboardData, 3000);
          }
          return;
        }

        if (response.data.status === 'success' && isMounted) {
          setLiveKpis(response.data.kpis);
          setChartData({
            trend: response.data.charts.inflation_trend || [],
            category: response.data.charts.category_breakdown || []
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="min-h-screen px-6 py-12 lg:px-12 bg-[#0b0e14] text-slate-200">
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Live Economic Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-white mb-2">
              Macroeconomic <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Pulse</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl">
              Real-time monitoring of United Kingdom Consumer Prices Index metrics, powered by automated ONS data pipelines.
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-4 md:mt-0 font-mono tracking-wider">LAST UPDATED: LIVE</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading || !liveKpis ? (
            <>
              <div className="h-40 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse flex items-center justify-center">
                <span className="text-slate-500 text-sm">Syncing Data...</span>
              </div>
              <div className="h-40 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse"></div>
              <div className="h-40 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse"></div>
            </>
          ) : (
            <>
              <KPICard
                title={liveKpis.headline_inflation.title}
                value={liveKpis.headline_inflation.value}
                subtext={liveKpis.headline_inflation.subtitle}
                icon={Activity}
                trend="down"
              />
              <KPICard
                title={liveKpis.economic_trajectory.title}
                value={liveKpis.economic_trajectory.value}
                subtext={liveKpis.economic_trajectory.subtitle}
                icon={liveKpis.economic_trajectory.value.includes('-') ? TrendingUp : AlertCircle}
                trend={liveKpis.economic_trajectory.value.includes('-') ? "down" : "up"}
              />
              <KPICard
                title={liveKpis.wallet_squeeze.title}
                value={liveKpis.wallet_squeeze.value}
                subtext={liveKpis.wallet_squeeze.subtitle}
                icon={PoundSterling}
                trend="up"
              />
            </>
          )}
        </div>

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-medium text-slate-200">Inflation Trajectory (12-Month)</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('headline')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${activeTab === 'headline' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'}`}>
                    Headline
                  </button>
                  <button
                    onClick={() => setActiveTab('core')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${activeTab === 'core' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'}`}>
                    Core
                  </button>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.trend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                    <XAxis dataKey="period" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f1f5f9' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Area
                      type="monotone"
                      dataKey={activeTab}
                      stroke="#818cf8"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm flex flex-col">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-slate-200">Sector Breakdown</h2>
                <p className="text-xs text-slate-400 mt-1">YoY Change by Top Weighted Divisions</p>
              </div>

              <div className="flex-grow w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.category} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={false} />
                    <XAxis type="number" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <YAxis dataKey="name" type="category" width={110} stroke="#475569" tick={{fill: '#94a3b8', fontSize: 11}} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{fill: '#ffffff05'}}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1500}>
                      {chartData.category.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#f43f5e' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UkEconomyDashboard;

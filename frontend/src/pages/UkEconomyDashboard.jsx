import React, { useState, useEffect, useRef } from 'react';
import { Activity, Target, TrendingDown, TrendingUp, AlertCircle, Calendar, Search, SlidersHorizontal, Zap, Coins } from 'lucide-react';

// Standard HTTP API wrapper
const api = {
  get: async (path) => {
    const response = await fetch(`https://api.franciscodes.com${path}`);
    const data = await response.json();
    return { status: response.status, data };
  }
};

// --- UX/UI HELPERS ---
const getHeatmapColor = (value) => {
  if (value === null || value === undefined) return 'bg-slate-800/50 text-slate-500';
  if (value >= 8.0) return 'bg-rose-600 text-white';
  if (value >= 5.0) return 'bg-rose-500/80 text-white';
  if (value >= 3.0) return 'bg-rose-400/60 text-white';
  if (value >= 2.0) return 'bg-orange-400/40 text-orange-100';
  if (value > 0.0) return 'bg-amber-400/20 text-amber-200';
  return 'bg-emerald-500/40 text-emerald-100';
};

const KPICard = ({ title, value, subtext, icon: Icon, trendColor }) => (
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
      <span className={`text-sm font-medium ${trendColor}`}>
        {subtext}
      </span>
    </div>
  </div>
);

// 🌟 NEW: The Live Flashing Ticker Component
const LivePriceCard = ({ symbol, title, price, icon: Icon }) => {
  const prevPriceRef = useRef(price);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    if (price && prevPriceRef.current) {
      if (price > prevPriceRef.current) {
        setFlashClass('bg-emerald-500/20 border-emerald-500/50'); // Tick Up
      } else if (price < prevPriceRef.current) {
        setFlashClass('bg-rose-500/20 border-rose-500/50'); // Tick Down
      }
      
      // Remove the flash after 300ms
      const timer = setTimeout(() => setFlashClass('bg-white/[0.02] border-indigo-500/30'), 300);
      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    }
  }, [price]);

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-colors duration-300 ${flashClass || 'bg-white/[0.02] border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'}`}>
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{symbol}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-2xl font-mono tracking-tight text-white">
          {price ? Number(price).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : 'Connecting...'}
        </span>
        <div className="flex items-center justify-end space-x-1 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">Live</span>
        </div>
      </div>
    </div>
  );
};


const UkEconomyDashboard = () => {
  // Static Data State
  const [liveKpis, setLiveKpis] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interactivity State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('alphabetical'); 
  const [severityFilter, setSeverityFilter] = useState('all');

  // 🌟 NEW: Live Streaming State
  const [livePrices, setLivePrices] = useState({});

  // 1. Fetch Static Historical Data (Postgres -> Superset)
  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/economy/kpis/');
        if (response.status === 202 || response.data.status === 'loading') {
          if (isMounted) timeoutId = setTimeout(fetchDashboardData, 3000);
          return;
        }
        if (response.data.status === 'success' && isMounted) {
          setLiveKpis(response.data.kpis);
          setHeatmapData(response.data.charts?.heatmap_array || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // 🌟 NEW 2. Connect to the Real-Time WebSocket (Finnhub -> Redis -> Channels)
  useEffect(() => {
    // Note: We use WSS (WebSocket Secure) to match your HTTPS API domain
    const ws = new WebSocket('wss://api.franciscodes.com/ws/live-prices/');

    ws.onopen = () => console.log('🟢 React Connected to Live Stream!');
    
    ws.onmessage = (event) => {
      const tick = JSON.parse(event.data);
      // Instantly update the state with the newest price
      setLivePrices((prev) => ({
        ...prev,
        [tick.symbol]: tick.price
      }));
    };

    ws.onerror = (error) => console.error('WebSocket Error:', error);
    ws.onclose = () => console.log('🔴 React Disconnected from Live Stream');

    // Clean up the connection if the user leaves the page
    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, []);

  // --- HEATMAP MATRIX PROCESSING & FILTERING ---
  const periods = [...new Set(heatmapData.map(d => d.period))].sort((a, b) => new Date(a) - new Date(b));
  const latestPeriod = periods[periods.length - 1];
  let rawDivisions = [...new Set(heatmapData.map(d => d.division_name))];

  let divisionStats = rawDivisions.map(div => {
    const latestRecord = heatmapData.find(d => d.division_name === div && d.period === latestPeriod);
    const latestValue = latestRecord ? latestRecord.yoy_pct : -999;
    const maxValue = Math.max(...heatmapData.filter(d => d.division_name === div).map(d => d.yoy_pct || -999));
    return { name: div, latestValue, maxValue };
  });

  if (searchTerm) divisionStats = divisionStats.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  if (severityFilter === 'hot') divisionStats = divisionStats.filter(d => d.maxValue >= 3.0);
  else if (severityFilter === 'extreme') divisionStats = divisionStats.filter(d => d.maxValue >= 5.0);

  if (sortOrder === 'hottest') divisionStats.sort((a, b) => b.latestValue - a.latestValue);
  else if (sortOrder === 'coldest') divisionStats.sort((a, b) => a.latestValue - b.latestValue);
  else divisionStats.sort((a, b) => a.name.localeCompare(b.name));

  const matrix = divisionStats.map(divStat => {
    return {
      division: divStat.name,
      values: periods.map(period => {
        const record = heatmapData.find(d => d.division_name === divStat.name && d.period === period);
        return record ? record.yoy_pct : null;
      })
    };
  });

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-12 bg-[#0b0e14] text-slate-200">

      {/* HEADER */}
      <div className="max-w-[1400px] mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Live Economic Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-white mb-2">
              Inflation <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Command Center</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0 text-slate-500 text-sm font-mono bg-white/[0.02] px-4 py-2 rounded-lg border border-white/[0.05]">
            <Calendar size={16} />
            <span>UK CPIH | Trailing 12 Months</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* 🌟 NEW: LIVE MARKET STREAM ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <LivePriceCard 
              title="British Pound (Forex)" 
              symbol="GBP/USD" 
              price={livePrices['OANDA:GBP_USD']} 
              icon={Activity} 
            />
           <LivePriceCard 
              title="Bitcoin (Crypto)" 
              symbol="BTC/USDT" 
              price={livePrices['BINANCE:BTCUSDT']} 
              icon={Coins} 
            />
        </div>

        {/* STATIC KPI ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading || !liveKpis ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse flex items-center justify-center">
                <span className="text-slate-600 text-sm font-medium">Syncing...</span>
              </div>
            ))
          ) : (
            <>
              <KPICard title={liveKpis.headline_inflation?.title} value={liveKpis.headline_inflation?.value} subtext={liveKpis.headline_inflation?.subtitle} icon={Activity} trendColor="text-slate-400" />
              <KPICard title={liveKpis.core_inflation?.title} value={liveKpis.core_inflation?.value} subtext={liveKpis.core_inflation?.subtitle} icon={Target} trendColor="text-slate-400" />
              <KPICard title={liveKpis.economic_trajectory?.title} value={liveKpis.economic_trajectory?.value} subtext={liveKpis.economic_trajectory?.subtitle} icon={String(liveKpis.economic_trajectory?.value).includes('-') ? TrendingDown : TrendingUp} trendColor={String(liveKpis.economic_trajectory?.value).includes('-') ? "text-emerald-400" : "text-rose-400"} />
              <KPICard title={liveKpis.wallet_squeeze?.title} value={liveKpis.wallet_squeeze?.value} subtext={liveKpis.wallet_squeeze?.subtitle} icon={AlertCircle} trendColor="text-rose-400 truncate max-w-[180px] inline-block align-bottom" />
            </>
          )}
        </div>

        {/* MASSIVE HEATMAP WITH CONTROLS */}
        {!loading && heatmapData.length > 0 && (
          <div className="p-6 md:p-8 rounded-3xl bg-[#11151e] border border-white/[0.05] shadow-2xl overflow-hidden flex flex-col">

            {/* Heatmap Header & Legend */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 space-y-4 md:space-y-0">
              <div>
                <h2 className="text-xl font-semibold text-white">Division Inflation Heatmap</h2>
                <p className="text-sm text-slate-400 mt-1">Year-over-Year percentage change across all 12 COICOP divisions.</p>
              </div>

              <div className="flex items-center space-x-3 bg-black/20 p-3 rounded-xl border border-white/5">
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Cool</span>
                <div className="flex space-x-1">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/40"></div>
                  <div className="w-6 h-6 rounded-md bg-amber-400/20"></div>
                  <div className="w-6 h-6 rounded-md bg-orange-400/40"></div>
                  <div className="w-6 h-6 rounded-md bg-rose-400/60"></div>
                  <div className="w-6 h-6 rounded-md bg-rose-500/80"></div>
                  <div className="w-6 h-6 rounded-md bg-rose-600"></div>
                </div>
                <span className="text-xs font-medium text-rose-500 uppercase tracking-wider">Hot</span>
              </div>
            </div>

            {/* --- INTERACTIVE CONTROL BAR --- */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-500" />
                </div>
                <input
                  type="text"
                  className="w-full bg-[#0b0e14] border border-white/10 text-sm rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  placeholder="Search division (e.g. Food)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <SlidersHorizontal size={16} className="text-slate-500" />
                <select
                  className="bg-[#0b0e14] border border-white/10 text-sm rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="alphabetical">Sort: Alphabetical (A-Z)</option>
                  <option value="hottest">Sort: Highest Current Rate</option>
                  <option value="coldest">Sort: Lowest Current Rate</option>
                </select>
              </div>

               <div className="flex items-center space-x-2">
                <select
                  className="bg-[#0b0e14] border border-white/10 text-sm rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">Show All Divisions</option>
                  <option value="hot">Show Only Running Hot (&gt; 3%)</option>
                  <option value="extreme">Show Only Extreme (&gt; 5%)</option>
                </select>
              </div>
            </div>

            {/* Scrollable Grid Container */}
            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <div className="min-w-[900px]">
                <div className="flex mb-3">
                  <div className="w-64 flex-shrink-0"></div>
                  <div className="flex-grow grid grid-cols-12 gap-2">
                    {periods.map((period, idx) => (
                      <div key={idx} className="text-center text-xs font-semibold tracking-wider text-slate-500 uppercase">
                        {period}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 min-h-[300px]">
                  {matrix.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 italic">No divisions match your current filters.</div>
                  ) : (
                    matrix.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex items-center group">
                        <div className="w-64 flex-shrink-0 text-sm font-medium text-slate-400 truncate pr-6 group-hover:text-white transition-colors duration-300">
                          {row.division}
                        </div>
                        <div className="flex-grow grid grid-cols-12 gap-2">
                          {row.values.map((val, colIdx) => (
                            <div
                              key={colIdx}
                              className={`relative h-12 rounded-lg flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:scale-[1.15] hover:z-10 hover:shadow-xl hover:shadow-black/50 hover:ring-2 hover:ring-white/40 ${getHeatmapColor(val)}`}
                            >
                              <span className="text-[13px] font-bold tracking-tight">
                                {val !== null ? `${val.toFixed(1)}` : '-'}
                              </span>
                              <div className="absolute opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none bottom-full mb-2 bg-[#0f172a] border border-slate-700 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl z-20">
                                <p className="font-semibold text-indigo-300 mb-1">{row.division}</p>
                                <p>{periods[colIdx]}: <span className="font-bold">{val}% YoY</span></p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UkEconomyDashboard;

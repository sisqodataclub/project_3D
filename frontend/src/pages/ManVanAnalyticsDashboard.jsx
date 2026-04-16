import React, { useState, useEffect } from 'react';
import { Users, Eye, ShoppingCart, CreditCard, CheckCircle, TrendingDown, Loader2 } from 'lucide-react';

const EcommerceFunnel = () => {
  const [funnelData, setFunnelData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map the event names from BigQuery to their UI icons and friendly labels
  const stepConfig = {
    'session_start': { icon: Users, label: 'Total Visitors' },
    'view_item': { icon: Eye, label: 'Viewed Product' },
    'add_to_cart': { icon: ShoppingCart, label: 'Added to Cart' },
    'begin_checkout': { icon: CreditCard, label: 'Began Checkout' },
    'purchase': { icon: CheckCircle, label: 'Purchased' }
  };

  useEffect(() => {
    const fetchFunnel = async () => {
      try {
        // Hit your new Django API!
        const response = await fetch('https://api.franciscodes.com/api/ecommerce/funnel/');
        const data = await response.json();
        
        // Merge the BigQuery numbers with our UI icons/labels
        const formattedData = data.map(item => ({
          ...item,
          icon: stepConfig[item.event_name]?.icon || Users, // Fallback icon
          label: stepConfig[item.event_name]?.label || item.event_name // Fallback label
        }));
        
        setFunnelData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch BigQuery data:", error);
        setLoading(false);
      }
    };

    fetchFunnel();
  }, []);

  // Show a professional loading state while waiting for the data warehouse
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center text-indigo-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="tracking-widest uppercase text-sm font-medium">Querying Data Warehouse...</p>
      </div>
    );
  }

  // Calculate the max users based on the first step to scale the background progress bars
  const maxUsers = funnelData.length > 0 ? funnelData[0].unique_users : 0;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 border-b border-white/10 pb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>GA4 E-Commerce Analytics</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extralight tracking-tight text-white">
            Customer <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Conversion Funnel</span>
          </h1>
          <p className="text-slate-500 mt-2">Tracking user drop-off from initial visit to final purchase.</p>
        </div>

        {/* Funnel Visualization */}
        <div className="space-y-6">
          {funnelData.map((step, index) => {
            const Icon = step.icon;
            const percentageOfTotal = maxUsers > 0 ? (step.unique_users / maxUsers) * 100 : 0;
            
            // Calculate drop-off strictly from the PREVIOUS step
            let dropOff = null;
            if (index > 0) {
              const prevUsers = funnelData[index - 1].unique_users;
              if (prevUsers > 0) {
                  const dropPercentage = ((prevUsers - step.unique_users) / prevUsers) * 100;
                  dropOff = dropPercentage.toFixed(1);
              }
            }

            return (
              <div key={step.event_name} className="relative">
                
                {/* Drop-off Indicator (Between Steps) */}
                {dropOff && (
                  <div className="absolute -top-5 right-4 md:right-1/4 flex items-center space-x-1 text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20 z-10 text-xs font-mono shadow-lg">
                    <TrendingDown size={14} />
                    <span>-{dropOff}% loss</span>
                  </div>
                )}

                {/* Main Step Card */}
                <div className="flex items-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                  
                  {/* Background Progress Bar */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 transition-all duration-1000 ease-out"
                    style={{ width: `${percentageOfTotal}%` }}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-slate-800/80 text-indigo-400 border border-white/5 shadow-lg">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{step.label}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{step.event_name}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-2xl font-light tracking-tight text-white">
                        {step.unique_users.toLocaleString()}
                      </span>
                      <p className="text-sm font-medium text-slate-400">
                        {percentageOfTotal.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Metric */}
        {funnelData.length > 0 && (
            <div className="mt-12 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-1">Overall Conversion Rate</p>
              <p className="text-4xl font-light text-white">
                  {((funnelData[funnelData.length - 1].unique_users / maxUsers) * 100).toFixed(2)}%
              </p>
            </div>
        )}

      </div>
    </div>
  );
};

export default EcommerceFunnel;

import React from 'react';
import { Users, Eye, ShoppingCart, CreditCard, CheckCircle, TrendingDown } from 'lucide-react';

const EcommerceFunnel = () => {
  // This mimics the exact output of your BigQuery SQL!
  const rawData = [
    { event_name: 'session_start', unique_users: 142053, icon: Users, label: 'Total Visitors' },
    { event_name: 'view_item', unique_users: 85402, icon: Eye, label: 'Viewed Product' },
    { event_name: 'add_to_cart', unique_users: 28930, icon: ShoppingCart, label: 'Added to Cart' },
    { event_name: 'begin_checkout', unique_users: 12405, icon: CreditCard, label: 'Began Checkout' },
    { event_name: 'purchase', unique_users: 3204, icon: CheckCircle, label: 'Purchased' }
  ];

  const maxUsers = rawData[0].unique_users;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 border-b border-white/10 pb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-4">
            <span>GA4 E-Commerce Analytics</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extralight tracking-tight text-white">
            Customer <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Conversion Funnel</span>
          </h1>
          <p className="text-slate-500 mt-2">Tracking user drop-off from initial visit to final purchase.</p>
        </div>

        {/* Funnel Visualization */}
        <div className="space-y-6">
          {rawData.map((step, index) => {
            const Icon = step.icon;
            const percentageOfTotal = (step.unique_users / maxUsers) * 100;
            
            // Calculate drop-off from the PREVIOUS step
            let dropOff = null;
            if (index > 0) {
              const prevUsers = rawData[index - 1].unique_users;
              const dropPercentage = ((prevUsers - step.unique_users) / prevUsers) * 100;
              dropOff = dropPercentage.toFixed(1);
            }

            return (
              <div key={step.event_name} className="relative">
                
                {/* Drop-off Indicator (Between Steps) */}
                {dropOff && (
                  <div className="absolute -top-5 right-4 md:right-1/4 flex items-center space-x-1 text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20 z-10 text-xs font-mono">
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
        <div className="mt-12 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-1">Overall Conversion Rate</p>
          <p className="text-4xl font-light text-white">
            {((rawData[rawData.length - 1].unique_users / maxUsers) * 100).toFixed(2)}%
          </p>
        </div>

      </div>
    </div>
  );
};

export default EcommerceFunnel;

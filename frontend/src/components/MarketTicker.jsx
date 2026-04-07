import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// This is a mockup of the data from your Python Pipeline
const MOCK_ECON_DATA = [
  { label: "UK CPI (Headline)", value: "111.4", change: "+0.4%", trend: "up" },
  { label: "GBP/USD", value: "1.26", change: "-0.12%", trend: "down" },
  { label: "FTSE 100", value: "7,935", change: "+0.54%", trend: "up" },
  { label: "UK 10Y Gilt", value: "4.12%", change: "+0.02", trend: "up" },
];

export default function MarketTicker() {
  return (
    <div className="w-full bg-[#05070a] border-b border-slate-800 py-2 overflow-hidden flex items-center select-none">
      {/* "LIVE" Indicator */}
      <div className="px-4 bg-[#05070a] z-10 flex items-center border-r border-slate-800">
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Market Live</span>
      </div>

      {/* Scrolling Container */}
      <motion.div 
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap items-center"
      >
        {[...MOCK_ECON_DATA, ...MOCK_ECON_DATA].map((item, idx) => (
          <div key={idx} className="flex items-center px-8 border-r border-slate-900">
            <span className="text-[11px] font-medium text-slate-500 mr-2 uppercase tracking-wide">
              {item.label}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-100 mr-2">
              {item.value}
            </span>
            <span className={`text-[10px] font-bold ${item.trend === 'up' ? 'text-emerald-400' : 'text-rose-500'}`}>
              {item.trend === 'up' ? '▲' : '▼'} {item.change}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}


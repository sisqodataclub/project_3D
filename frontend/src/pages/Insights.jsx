import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCVData } from '../hooks/useCVData';
import { useHVT } from '../context/HVTContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const STATUS_COLORS = {
  saved: '#60a5fa',       // blue
  applied: '#fbbf24',     // yellow
  interviewing: '#f97316', // orange
  offered: '#34d399',     // green
  rejected: '#f87171',    // red
};

export default function Insights() {
  const { isAuthenticated, loading: authLoading } = useHVT();
  const { applications, loading: dataLoading } = useCVData();

  // Compute statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter((a) => a.status === 'applied').length;
    const interviewing = applications.filter((a) => a.status === 'interviewing').length;
    const offered = applications.filter((a) => a.status === 'offered').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    const saved = applications.filter((a) => a.status === 'saved').length;

    // Data for chart (exclude 'saved' to focus on active statuses)
    const chartData = [
      { name: 'Applied', value: applied, color: STATUS_COLORS.applied },
      { name: 'Interviewing', value: interviewing, color: STATUS_COLORS.interviewing },
      { name: 'Offered', value: offered, color: STATUS_COLORS.offered },
      { name: 'Rejected', value: rejected, color: STATUS_COLORS.rejected },
    ].filter((item) => item.value > 0);

    return {
      total,
      saved,
      applied,
      interviewing,
      offered,
      rejected,
      chartData,
      responseRate: total > 0 ? Math.round(((interviewing + offered + rejected) / total) * 100) : 0,
    };
  }, [applications]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">
        <div>
          <p className="text-red-400">Please log in to view insights.</p>
          <Link to="/cv" className="mt-4 inline-block px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
            Back to CV Manager
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">📊 Insights</h1>
          <Link
            to="/cv"
            className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2"
          >
            ← Back to CV Manager
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Apps" value={stats.total} color="#60a5fa" />
          <StatCard label="Applied" value={stats.applied} color="#fbbf24" />
          <StatCard label="Interviewing" value={stats.interviewing} color="#f97316" />
          <StatCard label="Offered" value={stats.offered} color="#34d399" />
          <StatCard label="Rejected" value={stats.rejected} color="#f87171" />
          <StatCard label="Saved" value={stats.saved} color="#94a3b8" />
        </div>

        {/* Response Rate */}
        <div className="bg-gray-800 p-4 rounded-lg mb-8">
          <p className="text-sm text-gray-400">Response Rate</p>
          <p className="text-2xl font-bold text-white">{stats.responseRate}%</p>
          <p className="text-xs text-gray-500">
            ({stats.interviewing + stats.offered + stats.rejected} responses / {stats.total} applications)
          </p>
        </div>

        {/* Chart */}
        {stats.chartData.length > 0 ? (
          <div className="bg-gray-800 p-4 rounded-lg h-64">
            <h3 className="text-lg font-semibold text-white mb-4">Application Status Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" barSize={30}>
                  {stats.chartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-400">No applications to display yet.</p>
        )}
      </div>
    </div>
  );
}

// Helper component for stat cards
function StatCard({ label, value, color }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-white" style={{ color: color }}>
        {value}
      </p>
    </div>
  );
}

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
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const STATUS_COLORS = {
  saved: '#60a5fa',
  applied: '#fbbf24',
  follow_up: '#a78bfa',
  interviewing: '#f97316',
  offered: '#34d399',
  rejected: '#f87171',
};

// ===== Funnel Chart Component =====
const FunnelChart = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((item, idx) => {
        // Skip Rejected – we show it as a separate bar at the bottom
        if (item.stage === 'Rejected') {
          return null;
        }
        return (
          <div key={item.stage}>
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm text-gray-400 text-right">{item.stage}</div>
              <div className="flex-1 flex items-center gap-2">
                <div
                  className="h-8 bg-blue-500 rounded transition-all"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
                <span className="text-sm font-semibold text-white">{item.count}</span>
                <span className="text-xs text-gray-400">({item.percentage}%)</span>
                {idx < data.filter(d => d.stage !== 'Rejected').length - 1 && (
                  <span className="text-xs text-gray-500 ml-2">
                    – {Math.round(((data[idx].count - data[idx+1].count) / data[idx].count) * 100)}%
                  </span>
                )}
              </div>
            </div>
            {idx < data.filter(d => d.stage !== 'Rejected').length - 1 && (
              <div className="ml-28 text-gray-500 text-xs">↓</div>
            )}
          </div>
        );
      })}
      {/* Rejected bar (always at the bottom) */}
      {data.some(d => d.stage === 'Rejected') && (
        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-700">
          <div className="w-24 text-sm text-gray-400 text-right">Rejected</div>
          <div className="flex-1 flex items-center gap-2">
            <div
              className="h-8 bg-red-500 rounded transition-all"
              style={{
                width: `${(data.find(d => d.stage === 'Rejected').count / maxCount) * 100}%`,
              }}
            />
            <span className="text-sm font-semibold text-white">
              {data.find(d => d.stage === 'Rejected').count}
            </span>
            <span className="text-xs text-gray-400">
              ({data.find(d => d.stage === 'Rejected').percentage}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Insights() {
  const { isAuthenticated, loading: authLoading } = useHVT();
  const { applications, resumes, loading: dataLoading } = useCVData();

  // Compute statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter((a) => a.status === 'applied').length;
    const follow_up = applications.filter((a) => a.status === 'follow_up').length;
    const interviewing = applications.filter((a) => a.status === 'interviewing').length;
    const offered = applications.filter((a) => a.status === 'offered').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    const saved = applications.filter((a) => a.status === 'saved').length;

    const pieData = [
      { name: 'Saved', value: saved, color: STATUS_COLORS.saved },
      { name: 'Applied', value: applied, color: STATUS_COLORS.applied },
      { name: 'Follow-up', value: follow_up, color: STATUS_COLORS.follow_up },
      { name: 'Interviewing', value: interviewing, color: STATUS_COLORS.interviewing },
      { name: 'Offered', value: offered, color: STATUS_COLORS.offered },
      { name: 'Rejected', value: rejected, color: STATUS_COLORS.rejected },
    ].filter((item) => item.value > 0);

    const barData = [
      { name: 'Applied', value: applied, color: STATUS_COLORS.applied },
      { name: 'Follow-up', value: follow_up, color: STATUS_COLORS.follow_up },
      { name: 'Interviewing', value: interviewing, color: STATUS_COLORS.interviewing },
      { name: 'Offered', value: offered, color: STATUS_COLORS.offered },
      { name: 'Rejected', value: rejected, color: STATUS_COLORS.rejected },
    ].filter((item) => item.value > 0);

    const responded = interviewing + offered + rejected + follow_up;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
    const successRate = total > 0 ? Math.round((offered / total) * 100) : 0;

    const appsWithDates = applications.filter(
      (a) =>
        a.date_applied &&
        a.status_updated_at &&
        ['interviewing', 'offered'].includes(a.status)
    );
    const totalDays = appsWithDates.reduce((sum, a) => {
      const applied = new Date(a.date_applied);
      const updated = new Date(a.status_updated_at);
      const days = Math.max(0, (updated - applied) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    const avgDaysToInterview = appsWithDates.length > 0 ? Math.round(totalDays / appsWithDates.length) : 0;

    const monthMap = {};
    applications.forEach((a) => {
      if (a.date_applied) {
        const month = a.date_applied.slice(0, 7);
        monthMap[month] = (monthMap[month] || 0) + 1;
      }
    });
    const timelineData = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    return {
      total,
      saved,
      applied,
      follow_up,
      interviewing,
      offered,
      rejected,
      pieData,
      barData,
      responseRate,
      successRate,
      avgDaysToInterview,
      timelineData,
    };
  }, [applications]);

  // ===== Funnel Data using highest_stage_reached =====
  const funnelData = useMemo(() => {
    const total = applications.filter(a => a.status !== 'saved').length;
    if (total === 0) return [];

    const stageCounts = {};
    applications.forEach(app => {
      const stage = app.highest_stage_reached || 0;
      if (stage > 0) {
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      }
    });

    const stageMap = {
      1: 'Applied',
      2: 'Follow-up',
      3: 'Interviewing',
      4: 'Offered',
    };

    const data = Object.entries(stageCounts).map(([stage, count]) => ({
      stage: stageMap[stage] || `Stage ${stage}`,
      count,
      percentage: Math.round((count / total) * 100),
    }));

    // Add rejected count (rejected applications, regardless of highest stage)
    const rejectedCount = applications.filter(a => a.status === 'rejected').length;
    if (rejectedCount > 0) {
      data.push({
        stage: 'Rejected',
        count: rejectedCount,
        percentage: Math.round((rejectedCount / total) * 100),
      });
    }

    return data;
  }, [applications]);

  // CV Performance
  const cvPerformance = useMemo(() => {
    return resumes.map((resume) => {
      const cvApps = applications.filter((app) => app.resume_used === resume.id);
      const total = cvApps.length;
      const interviews = cvApps.filter((a) => a.status === 'interviewing' || a.status === 'offered').length;
      const offers = cvApps.filter((a) => a.status === 'offered').length;
      const rejections = cvApps.filter((a) => a.status === 'rejected').length;
      const responses = interviews + offers + rejections;
      return {
        ...resume,
        total,
        interviews,
        offers,
        rejections,
        responseRate: total > 0 ? Math.round((responses / total) * 100) : 0,
        successRate: total > 0 ? Math.round((offers / total) * 100) : 0,
      };
    }).filter((cv) => cv.total > 0);
  }, [resumes, applications]);

  // Tag frequency
  const tagFrequency = useMemo(() => {
    const tags = {};
    applications.forEach((app) => {
      if (app.tags) {
        app.tags.forEach((tag) => {
          tags[tag.name] = (tags[tag.name] || 0) + 1;
        });
      }
    });
    return Object.entries(tags)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
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
          <StatCard label="Follow-up" value={stats.follow_up} color="#a78bfa" />
          <StatCard label="Interviewing" value={stats.interviewing} color="#f97316" />
          <StatCard label="Offered" value={stats.offered} color="#34d399" />
          <StatCard label="Rejected" value={stats.rejected} color="#f87171" />
        </div>

        {/* Rates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Response Rate</p>
            <p className="text-2xl font-bold text-white">{stats.responseRate}%</p>
            <p className="text-xs text-gray-500">
              {stats.interviewing + stats.offered + stats.rejected + stats.follow_up} responses / {stats.total} apps
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Success Rate (Offers)</p>
            <p className="text-2xl font-bold text-green-400">{stats.successRate}%</p>
            <p className="text-xs text-gray-500">
              {stats.offered} offers / {stats.total} apps
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Avg. Days to Interview</p>
            <p className="text-2xl font-bold text-orange-400">{stats.avgDaysToInterview} days</p>
            <p className="text-xs text-gray-500">
              Based on {stats.interviewing + stats.offered} responses
            </p>
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="bg-gray-800 p-4 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">📈 Application Funnel</h3>
          {funnelData.length > 0 ? (
            <FunnelChart data={funnelData} />
          ) : (
            <p className="text-gray-400">No applications to display.</p>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg h-80">
            <h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3>
            {stats.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No data</p>
            )}
          </div>
          <div className="bg-gray-800 p-4 rounded-lg h-80">
            <h3 className="text-lg font-semibold text-white mb-4">Status Counts</h3>
            {stats.barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.barData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" barSize={30}>
                    {stats.barData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No data</p>
            )}
          </div>
        </div>

        {/* Timeline */}
        {stats.timelineData.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg h-64 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Applications Over Time</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.timelineData} margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tag Frequency */}
        {tagFrequency.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">🏷️ Tag Frequency</h3>
            <div className="flex flex-wrap gap-3">
              {tagFrequency.map(({ name, count }) => (
                <div key={name} className="bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-300 flex items-center gap-2">
                  <span>#{name}</span>
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CV Performance */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">📄 CV Performance</h3>
          {cvPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                  <tr>
                    <th className="px-4 py-2">CV</th>
                    <th className="px-4 py-2 text-center">Apps</th>
                    <th className="px-4 py-2 text-center">Interviews</th>
                    <th className="px-4 py-2 text-center">Offers</th>
                    <th className="px-4 py-2 text-center">Rejections</th>
                    <th className="px-4 py-2 text-center">Response Rate</th>
                    <th className="px-4 py-2 text-center">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {cvPerformance.map((cv) => (
                    <tr key={cv.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="px-4 py-2 font-medium text-white">
                        {cv.title || cv.full_name}
                      </td>
                      <td className="px-4 py-2 text-center">{cv.total}</td>
                      <td className="px-4 py-2 text-center text-orange-400">{cv.interviews}</td>
                      <td className="px-4 py-2 text-center text-green-400">{cv.offers}</td>
                      <td className="px-4 py-2 text-center text-red-400">{cv.rejections}</td>
                      <td className="px-4 py-2 text-center text-blue-400">{cv.responseRate}%</td>
                      <td className="px-4 py-2 text-center text-green-400">{cv.successRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">No CV usage data yet.</p>
          )}
        </div>
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

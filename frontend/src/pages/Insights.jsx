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

    // For pie chart
    const pieData = [
      { name: 'Saved', value: saved, color: STATUS_COLORS.saved },
      { name: 'Applied', value: applied, color: STATUS_COLORS.applied },
      { name: 'Follow-up', value: follow_up, color: STATUS_COLORS.follow_up },
      { name: 'Interviewing', value: interviewing, color: STATUS_COLORS.interviewing },
      { name: 'Offered', value: offered, color: STATUS_COLORS.offered },
      { name: 'Rejected', value: rejected, color: STATUS_COLORS.rejected },
    ].filter((item) => item.value > 0);

    // For bar chart (positive outcomes)
    const barData = [
      { name: 'Applied', value: applied, color: STATUS_COLORS.applied },
      { name: 'Follow-up', value: follow_up, color: STATUS_COLORS.follow_up },
      { name: 'Interviewing', value: interviewing, color: STATUS_COLORS.interviewing },
      { name: 'Offered', value: offered, color: STATUS_COLORS.offered },
      { name: 'Rejected', value: rejected, color: STATUS_COLORS.rejected },
    ].filter((item) => item.value > 0);

    // Response rate = all statuses except 'saved' and 'applied'
    const responded = interviewing + offered + rejected + follow_up;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

    // Success rate = offered / total
    const successRate = total > 0 ? Math.round((offered / total) * 100) : 0;

    // Average days to interview (for applications that reached interviewing or offered)
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

    // Monthly timeline
    const monthMap = {};
    applications.forEach((a) => {
      if (a.date_applied) {
        const month = a.date_applied.slice(0, 7); // YYYY-MM
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

        {/* Charts: Pie, Bar, Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
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

          {/* Bar Chart */}
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

        {/* Timeline Chart */}
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

        {/* CV Performance Table */}
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

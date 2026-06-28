import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE = 'https://api.franciscodes.com/cv/api';

export default function JobApplicationDetail() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/applications/${id}/`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch application');
        return res.json();
      })
      .then(data => {
        setApp(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching application:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-red-400">Error: {error}</div>;
  if (!app) return null;

  const statusColors = {
    saved: 'text-blue-400',
    applied: 'text-yellow-400',
    interviewing: 'text-orange-400',
    offered: 'text-green-400',
    rejected: 'text-red-400',
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/cv" className="inline-block mb-6 text-blue-400 hover:text-blue-300 transition">
          ← Back to CV Manager
        </Link>

        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{app.position}</h1>
              <p className="text-xl text-gray-400">{app.company}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[app.status] || 'text-gray-300'} border border-current`}>
              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </span>
          </div>

          <div className="space-y-4 text-gray-300">
            <div>
              <span className="font-semibold text-white">Job Link:</span>
              <a href={app.job_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-2">
                {app.job_link}
              </a>
            </div>
            {app.date_applied && (
              <div>
                <span className="font-semibold text-white">Date Applied:</span>
                <span className="ml-2">{new Date(app.date_applied).toLocaleDateString()}</span>
              </div>
            )}
            {app.resume_used && (
              <div>
                <span className="font-semibold text-white">Resume Used:</span>
                <span className="ml-2">ID: {app.resume_used}</span>
                {/* You could fetch the resume name here if you want */}
              </div>
            )}
            {app.notes && (
              <div>
                <span className="font-semibold text-white">Notes:</span>
                <p className="mt-1 bg-gray-800 p-3 rounded border border-gray-700">{app.notes}</p>
              </div>
            )}
            <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
              Created: {new Date(app.created_at).toLocaleString()} &middot; Updated: {new Date(app.updated_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

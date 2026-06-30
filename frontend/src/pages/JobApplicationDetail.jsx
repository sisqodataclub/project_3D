import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHVT } from '../context/HVTContext';

const API_BASE = 'https://api.franciscodes.com/cv/api';

export default function JobApplicationDetail() {
  const { id } = useParams();
  const { accessToken, isAuthenticated, loading: authLoading } = useHVT();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch job application data – waits for auth to be ready
  useEffect(() => {
    const fetchApplication = async () => {
      if (authLoading) return;

      if (!isAuthenticated || !accessToken) {
        setError('Please log in to view this application.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/applications/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setApp(data);
          setError(null);
        } else if (res.status === 404) {
          setError('Application not found.');
        } else {
          setError('Failed to load application.');
        }
      } catch (e) {
        setError('Network error.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, isAuthenticated, accessToken, authLoading]);

  // Show loading while auth is restoring OR data is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">
        Loading...
      </div>
    );
  }

  // If not authenticated (after auth loading is done), show login prompt
  if (!isAuthenticated || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">
        <div>
          <p className="text-red-400">{error || 'Please log in to view this application.'}</p>
          <Link
            to="/cv"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Back to CV Manager
          </Link>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">
        <p>No application data found.</p>
      </div>
    );
  }

  const statusColors = {
    saved: 'text-blue-400 border-blue-400',
    applied: 'text-yellow-400 border-yellow-400',
    interviewing: 'text-orange-400 border-orange-400',
    offered: 'text-green-400 border-green-400',
    rejected: 'text-red-400 border-red-400',
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/cv" className="inline-block mb-6 text-blue-400 hover:text-blue-300 transition">
          ← Back to CV Manager
        </Link>

        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">{app.position}</h1>
              <p className="text-xl text-gray-400">{app.company}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                statusColors[app.status] || 'text-gray-300 border-gray-300'
              }`}
            >
              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </span>
          </div>

          <div className="space-y-4 text-gray-300">
            <div>
              <span className="font-semibold text-white">Job Link:</span>
              <a
                href={app.job_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline ml-2 break-all"
              >
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
              </div>
            )}
            {app.notes && (
              <div>
                <span className="font-semibold text-white">Notes:</span>
                <p className="mt-1 bg-gray-800 p-3 rounded border border-gray-700 whitespace-pre-wrap">
                  {app.notes}
                </p>
              </div>
            )}
            <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
              Created: {new Date(app.created_at).toLocaleString()} &middot;
              Updated: {new Date(app.updated_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

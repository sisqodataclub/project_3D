import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useHVT } from '../context/HVTContext';
import { useCVData } from '../hooks/useCVData';

const API_BASE = 'https://api.franciscodes.com/cv/api';

export default function JobApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, isAuthenticated, loading: authLoading } = useHVT();
  const { updateApplication, resumes, loading: resumesLoading } = useCVData();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch application data
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
          setEditData(data);
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

  // ---- Edit mode handlers ----
  const enableEditing = () => {
    setEditData({ ...app });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleFieldChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const payload = {
        job_link: editData.job_link,
        company: editData.company,
        position: editData.position,
        date_applied: editData.date_applied || null,
        deadline_date: editData.deadline_date || null,
        status: editData.status,
        resume_used: editData.resume_used || null,
        notes: editData.notes,
      };
      const updated = await updateApplication(id, payload);
      setApp(updated);
      setEditData(updated);
      setIsEditing(false);
    } catch (err) {
      alert('Error updating application: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const statusColors = {
    saved: 'text-blue-400 border-blue-400',
    applied: 'text-yellow-400 border-yellow-400',
    interviewing: 'text-orange-400 border-orange-400',
    offered: 'text-green-400 border-green-400',
    rejected: 'text-red-400 border-red-400',
  };

  if (authLoading || loading || resumesLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">Loading...</div>;
  }

  if (!isAuthenticated || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">
        <div>
          <p className="text-red-400">{error || 'Please log in to view this application.'}</p>
          <Link to="/cv" className="mt-4 inline-block px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
            Back to CV Manager
          </Link>
        </div>
      </div>
    );
  }

  if (!app) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100"><p>No application data found.</p></div>;
  }

  // ---- View mode ----
  if (!isEditing) {
    // Find the resume name for display
    const usedResume = resumes.find(r => r.id === app.resume_used);
    const resumeDisplay = usedResume ? (usedResume.title || usedResume.full_name) : null;

    return (
      <div className="min-h-screen bg-[#0b0e14] text-slate-100 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link to="/cv" className="text-blue-400 hover:text-blue-300 transition">
              ← Back to CV Manager
            </Link>
            <button
              onClick={enableEditing}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
          </div>

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
              {app.deadline_date && (
                <div>
                  <span className="font-semibold text-white">Deadline:</span>
                  <span className="ml-2">{new Date(app.deadline_date).toLocaleDateString()}</span>
                </div>
              )}
              {resumeDisplay && (
                <div>
                  <span className="font-semibold text-white">Resume Used:</span>
                  <span className="ml-2">{resumeDisplay}</span>
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

  // ---- Edit mode ----
  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/cv" className="text-blue-400 hover:text-blue-300 transition">← Back to CV Manager</Link>
          <div className="flex gap-3">
            <button onClick={cancelEditing} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition">Cancel</button>
            <button onClick={handleSave} disabled={saveLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition">
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company *</label>
              <input
                type="text"
                value={editData.company || ''}
                onChange={(e) => handleFieldChange('company', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Position *</label>
              <input
                type="text"
                value={editData.position || ''}
                onChange={(e) => handleFieldChange('position', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Job Link *</label>
              <input
                type="url"
                value={editData.job_link || ''}
                onChange={(e) => handleFieldChange('job_link', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Applied</label>
              <input
                type="date"
                value={editData.date_applied || ''}
                onChange={(e) => handleFieldChange('date_applied', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deadline</label>
              <input
                type="date"
                value={editData.deadline_date || ''}
                onChange={(e) => handleFieldChange('deadline_date', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={editData.status || 'saved'}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Resume Used</label>
              <select
                value={editData.resume_used || ''}
                onChange={(e) => handleFieldChange('resume_used', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
              >
                <option value="">None</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title || r.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                rows="3"
                value={editData.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={cancelEditing} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg">Cancel</button>
            <button type="submit" disabled={saveLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

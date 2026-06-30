import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCVData } from '../hooks/useCVData';
import { useHVT } from '../context/HVTContext';
import AuthModal from '../components/AuthModal';

export default function CVManager() {
  const { isAuthenticated, logout, user, loading: authLoading } = useHVT();
  const {
    resumes,
    applications,
    loading: dataLoading,
    createResume,
    createApplication,
    migrateGuestData,
    hasGuestData,
  } = useCVData();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCVForm, setShowCVForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);

  // ---- CV Form state ----
  const [cvFormData, setCvFormData] = useState({
    full_name: '',
    about: '',
    email: '',
    phone: '',
    skills: '',
    languages: '',
    education1: '',
    project1: '',
    experience1: '',
    achievements: '',
  });

  // ---- Job Application Form state ----
  const [jobFormData, setJobFormData] = useState({
    job_link: '',
    company: '',
    position: '',
    date_applied: '',
    status: 'saved',
    resume_used: '',
    notes: '',
  });

  // ---- CV Handlers ----
  const handleCvChange = (e) => {
    setCvFormData({ ...cvFormData, [e.target.name]: e.target.value });
  };

  const handleCvSubmit = async (e) => {
    e.preventDefault();
    if (!cvFormData.full_name || !cvFormData.about || !cvFormData.email || !cvFormData.phone) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await createResume(cvFormData);
      setCvFormData({
        full_name: '',
        about: '',
        email: '',
        phone: '',
        skills: '',
        languages: '',
        education1: '',
        project1: '',
        experience1: '',
        achievements: '',
      });
      setShowCVForm(false);
    } catch (err) {
      alert('Error creating resume: ' + err.message);
    }
  };

  // ---- Job Application Handlers ----
  const handleJobChange = (e) => {
    setJobFormData({ ...jobFormData, [e.target.name]: e.target.value });
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobFormData.company || !jobFormData.position || !jobFormData.job_link) {
      alert('Please fill in company, position, and job link.');
      return;
    }
    try {
      await createApplication(jobFormData);
      setJobFormData({
        job_link: '',
        company: '',
        position: '',
        date_applied: '',
        status: 'saved',
        resume_used: '',
        notes: '',
      });
      setShowJobForm(false);
    } catch (err) {
      alert('Error creating application: ' + err.message);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Show loading while auth is being restored
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#0b0e14] text-slate-100">
      {/* Header with Auth Controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📄 CV Manager</h1>
        <div>
          {!isAuthenticated ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Login / Register
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm">Hi, {user?.email || 'User'}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Migration Banner */}
      {isAuthenticated && hasGuestData && (
        <div className="bg-yellow-800/50 border border-yellow-600 p-4 rounded-lg mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span className="text-sm">
            You have guest data ({resumes.length} resumes, {applications.length} applications).
            Would you like to save it to your account?
          </span>
          <button
            onClick={migrateGuestData}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition text-sm"
          >
            Migrate to Account
          </button>
        </div>
      )}

      {/* ---- RESUME SECTION ---- */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Resumes ({resumes.length})</h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowCVForm(!showCVForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              {showCVForm ? 'Cancel' : '+ Add New CV'}
            </button>
          )}
        </div>

        {!isAuthenticated && resumes.length === 0 && (
          <p className="text-gray-400">Please login or register to create and save your CVs.</p>
        )}

        {showCVForm && isAuthenticated && (
          <form onSubmit={handleCvSubmit} className="bg-gray-800 p-4 rounded-lg mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={cvFormData.full_name}
                  onChange={handleCvChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={cvFormData.email}
                  onChange={handleCvChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={cvFormData.phone}
                  onChange={handleCvChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">About *</label>
                <textarea
                  name="about"
                  rows="2"
                  value={cvFormData.about}
                  onChange={handleCvChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={cvFormData.skills}
                  onChange={handleCvChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Languages</label>
                <input
                  type="text"
                  name="languages"
                  value={cvFormData.languages}
                  onChange={handleCvChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Education</label>
                <input
                  type="text"
                  name="education1"
                  value={cvFormData.education1}
                  onChange={handleCvChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Project</label>
                <input
                  type="text"
                  name="project1"
                  value={cvFormData.project1}
                  onChange={handleCvChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Experience</label>
                <input
                  type="text"
                  name="experience1"
                  value={cvFormData.experience1}
                  onChange={handleCvChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Achievements</label>
                <input
                  type="text"
                  name="achievements"
                  value={cvFormData.achievements}
                  onChange={handleCvChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
            </div>
            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
              Create Resume
            </button>
          </form>
        )}

        {resumes.length === 0 ? (
          <p className="text-gray-400">No resumes yet. {isAuthenticated ? 'Create one above.' : 'Login to create one.'}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {resumes.map((r) => (
              <Link to={`/cv/${r.id}`} key={r.id} className="block transition hover:scale-[1.02]">
                <div className="bg-gray-800 p-4 rounded-lg shadow cursor-pointer">
                  <h3 className="text-lg font-bold">{r.full_name}</h3>
                  <p className="text-sm text-gray-300">{r.about}</p>
                  <p className="text-sm text-gray-400">📧 {r.email}</p>
                  <p className="text-sm text-gray-400">📞 {r.phone}</p>
                  <p className="text-xs text-gray-500 mt-2">Created: {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ---- JOB APPLICATION SECTION ---- */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Job Applications ({applications.length})</h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowJobForm(!showJobForm)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
            >
              {showJobForm ? 'Cancel' : '+ Add Job Application'}
            </button>
          )}
        </div>

        {!isAuthenticated && applications.length === 0 && (
          <p className="text-gray-400">Please login or register to track job applications.</p>
        )}

        {showJobForm && isAuthenticated && (
          <form onSubmit={handleJobSubmit} className="bg-gray-800 p-4 rounded-lg mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company *</label>
                <input
                  type="text"
                  name="company"
                  value={jobFormData.company}
                  onChange={handleJobChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position *</label>
                <input
                  type="text"
                  name="position"
                  value={jobFormData.position}
                  onChange={handleJobChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Link *</label>
                <input
                  type="url"
                  name="job_link"
                  value={jobFormData.job_link}
                  onChange={handleJobChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date Applied</label>
                <input
                  type="date"
                  name="date_applied"
                  value={jobFormData.date_applied}
                  onChange={handleJobChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={jobFormData.status}
                  onChange={handleJobChange}
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
                  name="resume_used"
                  value={jobFormData.resume_used}
                  onChange={handleJobChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                >
                  <option value="">None</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows="2"
                  value={jobFormData.notes}
                  onChange={handleJobChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
            </div>
            <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition">
              Create Application
            </button>
          </form>
        )}

        {applications.length === 0 ? (
          <p className="text-gray-400">No applications yet. {isAuthenticated ? 'Create one above.' : 'Login to track applications.'}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {applications.map((app) => (
              <Link to={`/cv/application/${app.id}`} key={app.id} className="block transition hover:scale-[1.02]">
                <div className="bg-gray-800 p-4 rounded-lg shadow cursor-pointer">
                  <h3 className="text-lg font-bold">
                    {app.position} at {app.company}
                  </h3>
                  <p className="text-sm text-gray-300">
                    Status:{' '}
                    <span
                      className={`font-semibold ${
                        app.status === 'rejected'
                          ? 'text-red-400'
                          : app.status === 'offered'
                          ? 'text-green-400'
                          : app.status === 'interviewing'
                          ? 'text-yellow-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {app.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    🔗{' '}
                    <a
                      href={app.job_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Job
                    </a>
                  </p>
                  {app.notes && <p className="text-sm text-gray-400 mt-1">📝 {app.notes}</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    Applied: {app.date_applied ? new Date(app.date_applied).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

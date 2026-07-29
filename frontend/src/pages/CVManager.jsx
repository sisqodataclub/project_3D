import React, { useState, useMemo } from 'react';
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
    updateApplication,
    migrateGuestData,
    hasGuestData,
    filterTag,
    setFilterTag,
  } = useCVData();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCVForm, setShowCVForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [formWarning, setFormWarning] = useState('');

  // ---- Resume Form State (nested) ----
  const [cvForm, setCvForm] = useState({
    title: '',
    full_name: '',
    about: '',
    email: '',
    phone: '',
    age: '',
    educations: [{ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' }],
    experiences: [{ company: '', position: '', start_date: '', end_date: '', description: '', location: '', is_current: false }],
    projects: [{ name: '', description: '', url: '', start_date: '', end_date: '' }],
    skills: [{ name: '', proficiency: '' }],
    languages: [{ name: '', proficiency: '' }],
    achievements: [{ description: '' }],
  });

  // ---- Helper: update a nested array field ----
  const updateArrayField = (section, index, field, value) => {
    const updated = [...cvForm[section]];
    if (field === 'is_current' && value === true) {
      updated[index].end_date = '';
    }
    updated[index][field] = value;
    setCvForm({ ...cvForm, [section]: updated });
    if (formWarning) setFormWarning('');
  };

  const addArrayItem = (section, emptyItem) => {
    setCvForm({ ...cvForm, [section]: [...cvForm[section], emptyItem] });
    if (formWarning) setFormWarning('');
  };

  const removeArrayItem = (section, index) => {
    if (cvForm[section].length <= 1) return;
    const updated = [...cvForm[section]];
    updated.splice(index, 1);
    setCvForm({ ...cvForm, [section]: updated });
  };

  // ---- Submit with smart validation ----
  const handleCvSubmit = async (e) => {
    e.preventDefault();
    setFormWarning('');

    if (!cvForm.full_name || !cvForm.about || !cvForm.email || !cvForm.phone) {
      alert('Please fill in all required fields (Name, About, Email, Phone).');
      return;
    }

    const filterValid = (items, requiredFields, sectionName) => {
      let skipped = 0;
      const valid = items
        .filter(item => {
          const hasAnyData = Object.values(item).some(v => v && v.trim() !== '');
          if (!hasAnyData) return false;
          const missing = requiredFields.filter(f => !item[f] || item[f].trim() === '');
          if (missing.length > 0) {
            skipped++;
            return false;
          }
          return true;
        })
        .map(item => {
          const cleaned = { ...item };
          Object.keys(cleaned).forEach(key => {
            if (key.includes('date') || key === 'url') {
              cleaned[key] = cleaned[key] || null;
            }
          });
          if (cleaned.is_current) {
            cleaned.end_date = null;
          }
          return cleaned;
        });

      if (skipped > 0) {
        setFormWarning(prev => `${prev} ${skipped} item(s) in ${sectionName} were skipped because required fields were missing.`);
      }
      return valid;
    };

    try {
      const payload = {
        title: cvForm.title || null,
        full_name: cvForm.full_name,
        about: cvForm.about,
        email: cvForm.email,
        phone: cvForm.phone,
        age: cvForm.age || null,
        educations: filterValid(cvForm.educations, ['institution'], 'Education'),
        experiences: filterValid(cvForm.experiences, ['company'], 'Experience'),
        projects: filterValid(cvForm.projects, ['name'], 'Project'),
        skills: filterValid(cvForm.skills, ['name'], 'Skill'),
        languages: filterValid(cvForm.languages, ['name'], 'Language'),
        achievements: filterValid(cvForm.achievements, ['description'], 'Achievement'),
      };

      await createResume(payload);

      if (formWarning) {
        alert(formWarning);
      }

      setShowCVForm(false);
      setFormWarning('');
      setCvForm({
        title: '',
        full_name: '',
        about: '',
        email: '',
        phone: '',
        age: '',
        educations: [{ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' }],
        experiences: [{ company: '', position: '', start_date: '', end_date: '', description: '', location: '', is_current: false }],
        projects: [{ name: '', description: '', url: '', start_date: '', end_date: '' }],
        skills: [{ name: '', proficiency: '' }],
        languages: [{ name: '', proficiency: '' }],
        achievements: [{ description: '' }],
      });
    } catch (err) {
      alert('Error creating resume: ' + err.message);
    }
  };

  // ---- Job Application Handlers ----
  const [jobFormData, setJobFormData] = useState({
    job_link: '',
    company: '',
    position: '',
    date_applied: '',
    deadline_date: '',
    status: 'saved',
    resume_used: '',
    notes: '',
    tag_names: '',
  });

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
      // Convert comma-separated tags to array
      const tagNames = jobFormData.tag_names
        ? jobFormData.tag_names.split(',').map(t => t.trim()).filter(Boolean)
        : [];
      const payload = {
        ...jobFormData,
        tag_names: tagNames,
      };
      await createApplication(payload);
      setJobFormData({
        job_link: '',
        company: '',
        position: '',
        date_applied: '',
        deadline_date: '',
        status: 'saved',
        resume_used: '',
        notes: '',
        tag_names: '',
      });
      setShowJobForm(false);
    } catch (err) {
      alert('Error creating application: ' + err.message);
    }
  };

  // ---- Quick follow-up action ----
  const handleMarkFollowUp = async (app) => {
    if (!window.confirm(`Mark "${app.position} at ${app.company}" as "Follow-up"?`)) return;
    try {
      await updateApplication(app.id, {
        ...app,
        status: 'follow_up',
      });
      // Reload data by refetching (the hook will update)
      // We can also manually update state, but the hook will re-fetch on filterTag change.
      // We'll trigger a re-fetch by toggling filterTag? 
      // Better: just call setFilterTag with the same value to force reload.
      setFilterTag(filterTag || '');
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // ---- Compute unique tags for filter ----
  const allTags = useMemo(() => {
    const tags = new Set();
    applications.forEach(app => {
      if (app.tags) {
        app.tags.forEach(tag => tags.add(tag.name));
      }
    });
    return Array.from(tags).sort();
  }, [applications]);

  const handleLogout = () => {
    logout();
  };

  if (authLoading || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#0b0e14] text-slate-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📄 CV Manager</h1>
        <div>
          {!isAuthenticated ? (
            <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
              Login / Register
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/cv/insights"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition text-sm"
              >
                📊 Insights
              </Link>
              <span className="text-gray-300 text-sm">Hi, {user?.email || 'User'}</span>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition text-sm">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tag Filter */}
      {isAuthenticated && allTags.length > 0 && (
        <div className="flex items-center gap-3 mb-6 bg-gray-800 p-3 rounded-lg">
          <label className="text-sm text-gray-400">Filter by tag:</label>
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="bg-gray-700 text-white rounded border border-gray-600 p-1 text-sm"
          >
            <option value="">All</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          {filterTag && (
            <button
              onClick={() => setFilterTag('')}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Migration Banner */}
      {isAuthenticated && hasGuestData && (
        <div className="bg-yellow-800/50 border border-yellow-600 p-4 rounded-lg mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span className="text-sm">
            You have guest data ({resumes.length} resumes, {applications.length} applications).
            Would you like to save it to your account?
          </span>
          <button onClick={migrateGuestData} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition text-sm">
            Migrate to Account
          </button>
        </div>
      )}

      {/* ---- RESUME SECTION ---- */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Resumes ({resumes.length})</h2>
          {isAuthenticated && (
            <button onClick={() => setShowCVForm(!showCVForm)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
              {showCVForm ? 'Cancel' : '+ Add New CV'}
            </button>
          )}
        </div>

        {!isAuthenticated && resumes.length === 0 && (
          <p className="text-gray-400">Please login or register to create and save your CVs.</p>
        )}

        {showCVForm && isAuthenticated && (
          <form onSubmit={handleCvSubmit} className="bg-gray-800 p-4 rounded-lg mb-4 space-y-4">
            {formWarning && (
              <div className="bg-yellow-800/50 border border-yellow-600 p-2 rounded text-sm text-yellow-200">
                ⚠️ {formWarning}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">CV Title (optional)</label>
                <input
                  type="text"
                  name="title"
                  value={cvForm.title}
                  onChange={(e) => setCvForm({...cvForm, title: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  placeholder="e.g., Data Analyst CV"
                />
              </div>
              <div><label className="block text-sm font-medium mb-1">Full Name *</label><input type="text" name="full_name" value={cvForm.full_name} onChange={(e) => setCvForm({...cvForm, full_name: e.target.value})} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required /></div>
              <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" name="email" value={cvForm.email} onChange={(e) => setCvForm({...cvForm, email: e.target.value})} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required /></div>
              <div><label className="block text-sm font-medium mb-1">Phone *</label><input type="text" name="phone" value={cvForm.phone} onChange={(e) => setCvForm({...cvForm, phone: e.target.value})} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required /></div>
              <div><label className="block text-sm font-medium mb-1">About *</label><textarea name="about" rows="2" value={cvForm.about} onChange={(e) => setCvForm({...cvForm, about: e.target.value})} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required /></div>
              <div><label className="block text-sm font-medium mb-1">Age</label><input type="number" name="age" value={cvForm.age} onChange={(e) => setCvForm({...cvForm, age: e.target.value})} className="w-full p-2 bg-gray-700 rounded border border-gray-600" /></div>
            </div>

            {/* Dynamic Sections - unchanged */}
            {['educations', 'experiences', 'projects', 'skills', 'languages', 'achievements'].map((section) => {
              const label = section.charAt(0).toUpperCase() + section.slice(1);
              const items = cvForm[section];
              const emptyItem = {
                educations: { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' },
                experiences: { company: '', position: '', start_date: '', end_date: '', description: '', location: '', is_current: false },
                projects: { name: '', description: '', url: '', start_date: '', end_date: '' },
                skills: { name: '', proficiency: '' },
                languages: { name: '', proficiency: '' },
                achievements: { description: '' },
              }[section];

              const requiredFields = {
                educations: ['institution'],
                experiences: ['company'],
                projects: ['name'],
                skills: ['name'],
                languages: ['name'],
                achievements: ['description'],
              }[section];

              return (
                <div key={section} className="border border-gray-700 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">
                      {label}
                      <span className="text-xs text-gray-400 ml-2">(required: {requiredFields.join(', ')})</span>
                    </h3>
                    <button type="button" onClick={() => addArrayItem(section, emptyItem)} className="text-sm text-blue-400 hover:text-blue-300">+ Add {label.slice(0, -1)}</button>
                  </div>
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start mb-2">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.keys(item).map((key) => {
                          const isRequired = requiredFields.includes(key);
                          let inputType = 'text';
                          if (key.includes('date')) inputType = 'date';
                          if (key === 'url') inputType = 'url';

                          if (key === 'is_current') {
                            return (
                              <div key={key} className="col-span-2 flex items-center gap-2 mt-1">
                                <input
                                  type="checkbox"
                                  checked={item.is_current || false}
                                  onChange={(e) => updateArrayField(section, idx, key, e.target.checked)}
                                  className="w-4 h-4"
                                />
                                <label className="text-sm text-gray-300">Currently working here</label>
                              </div>
                            );
                          }

                          return (
                            <div key={key} className="relative">
                              <input
                                type={inputType}
                                placeholder={`${key.replace(/_/g, ' ')}${isRequired ? ' *' : ''}`}
                                value={item[key] || ''}
                                onChange={(e) => updateArrayField(section, idx, key, e.target.value)}
                                disabled={key === 'end_date' && item.is_current}
                                className={`w-full p-1 bg-gray-700 rounded border ${isRequired ? 'border-blue-500' : 'border-gray-600'} text-sm ${key === 'end_date' && item.is_current ? 'opacity-50 cursor-not-allowed' : ''}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <button type="button" onClick={() => removeArrayItem(section, idx)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                    </div>
                  ))}
                </div>
              );
            })}

            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">Create Resume</button>
          </form>
        )}

        {resumes.length === 0 ? (
          <p className="text-gray-400">No resumes yet. {isAuthenticated ? 'Create one above.' : 'Login to create one.'}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {resumes.map((r) => (
              <Link to={`/cv/${r.id}`} key={r.id} className="block transition hover:scale-[1.02]">
                <div className="bg-gray-800 p-4 rounded-lg shadow cursor-pointer">
                  <h3 className="text-lg font-bold">{r.title || r.full_name}</h3>
                  <p className="text-sm text-gray-400">{r.full_name}</p>
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
            <button onClick={() => setShowJobForm(!showJobForm)} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition">
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
              <div><label className="block text-sm font-medium mb-1">Company *</label><input type="text" name="company" value={jobFormData.company} onChange={handleJobChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required /></div>
              <div><label className="block text-sm font-medium mb-1">Position *</label><input type="text" name="position" value={jobFormData.position} onChange={handleJobChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required /></div>
              <div><label className="block text-sm font-medium mb-1">Job Link *</label><input type="url" name="job_link" value={jobFormData.job_link} onChange={handleJobChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Date Applied</label>
                  <input type="date" name="date_applied" value={jobFormData.date_applied} onChange={handleJobChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deadline Date</label>
                  <input type="date" name="deadline_date" value={jobFormData.deadline_date} onChange={handleJobChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={jobFormData.status} onChange={handleJobChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600">
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resume Used</label>
                <select name="resume_used" value={jobFormData.resume_used} onChange={handleJobChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600">
                  <option value="">None</option>
                  {resumes.map((r) => <option key={r.id} value={r.id}>{r.title || r.full_name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tag_names"
                  value={jobFormData.tag_names}
                  onChange={handleJobChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  placeholder="e.g., Remote, Hybrid, Urgent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea name="notes" rows="2" value={jobFormData.notes} onChange={handleJobChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600" />
              </div>
            </div>
            <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition">Create Application</button>
          </form>
        )}

        {applications.length === 0 ? (
          <p className="text-gray-400">No applications yet. {isAuthenticated ? 'Create one above.' : 'Login to track applications.'}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {applications.map((app) => {
              const daysSinceApplied = app.date_applied
                ? Math.floor((new Date() - new Date(app.date_applied)) / (1000 * 60 * 60 * 24))
                : null;
              const needsFollowUp = app.status === 'applied' && daysSinceApplied !== null && daysSinceApplied > 21;

              return (
                <Link to={`/cv/application/${app.id}`} key={app.id} className="block transition hover:scale-[1.02]">
                  <div className="bg-gray-800 p-4 rounded-lg shadow cursor-pointer relative">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold">{app.position} at {app.company}</h3>
                      {needsFollowUp && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleMarkFollowUp(app);
                          }}
                          className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30 transition"
                        >
                          Follow-up
                        </button>
                      )}
                    </div>
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
                            : app.status === 'follow_up'
                            ? 'text-purple-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
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
                    {app.tags && app.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {app.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs bg-indigo-900/30 text-indigo-300 px-2 py-0.5 rounded-full"
                            onClick={(e) => {
                              e.preventDefault();
                              setFilterTag(tag.name);
                            }}
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {app.notes && <p className="text-sm text-gray-400 mt-1">📝 {app.notes}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      Applied: {app.date_applied ? new Date(app.date_applied).toLocaleDateString() : 'N/A'}
                      {app.deadline_date && ` · Deadline: ${new Date(app.deadline_date).toLocaleDateString()}`}
                      {needsFollowUp && ` · ${daysSinceApplied} days ago`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

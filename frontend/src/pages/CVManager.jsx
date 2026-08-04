// frontend/src/pages/CVManager.jsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCVData } from '../hooks/useCVData';
import { useProfileLibrary } from '../hooks/useProfileLibrary';
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

  // ---- Profile Library Hook ----
  const {
    experiences,
    educations,
    projects,
    skills,
    languages,
    achievements,
    loading: libraryLoading,
    addExperience,
    addEducation,
    addProject,
    addSkill,
    addLanguage,
    addAchievement,
  } = useProfileLibrary();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCVForm, setShowCVForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [formWarning, setFormWarning] = useState('');

  // ---- CV Form State (now uses IDs) ----
  const [cvForm, setCvForm] = useState({
    title: '',
    full_name: '',
    about: '',
    email: '',
    phone: '',
    age: '',
    // These will store arrays of IDs
    profile_education_ids: [],
    profile_experience_ids: [],
    profile_project_ids: [],
    profile_skill_ids: [],
    profile_language_ids: [],
    profile_achievement_ids: [],
  });

  // ---- Helper: update a specific ID list ----
  const setSectionIds = (section, ids) => {
    setCvForm(prev => ({ ...prev, [section]: ids }));
  };

  // ---- "Add New" flow state (inline forms) ----
  const [newSectionType, setNewSectionType] = useState(null);
  const [newSectionData, setNewSectionData] = useState({});
  const [addingSection, setAddingSection] = useState(false);

  const resetNewSection = () => {
    setNewSectionType(null);
    setNewSectionData({});
    setAddingSection(false);
  };

  // ---- Handlers for adding new section items ----
  const handleAddNewSection = async (type) => {
    setAddingSection(true);
    try {
      let result;
      switch (type) {
        case 'experience':
          result = await addExperience(newSectionData);
          break;
        case 'education':
          result = await addEducation(newSectionData);
          break;
        case 'project':
          result = await addProject(newSectionData);
          break;
        case 'skill':
          result = await addSkill(newSectionData);
          break;
        case 'language':
          result = await addLanguage(newSectionData);
          break;
        case 'achievement':
          result = await addAchievement(newSectionData);
          break;
        default:
          return;
      }
      // Add the new ID to the relevant list in cvForm
      const idKey = `profile_${type}_ids`;
      setCvForm(prev => ({
        ...prev,
        [idKey]: [...prev[idKey], result.id],
      }));
      resetNewSection();
    } catch (err) {
      alert(`Error adding ${type}: ${err.message}`);
    } finally {
      setAddingSection(false);
    }
  };

  // ---- Submit CV ----
  const handleCvSubmit = async (e) => {
    e.preventDefault();
    setFormWarning('');

    if (!cvForm.full_name || !cvForm.about || !cvForm.email || !cvForm.phone) {
      alert('Please fill in all required fields (Name, About, Email, Phone).');
      return;
    }

    try {
      const payload = {
        title: cvForm.title || null,
        full_name: cvForm.full_name,
        about: cvForm.about,
        email: cvForm.email,
        phone: cvForm.phone,
        age: cvForm.age || null,
        // Send only the ID lists
        profile_education_ids: cvForm.profile_education_ids,
        profile_experience_ids: cvForm.profile_experience_ids,
        profile_project_ids: cvForm.profile_project_ids,
        profile_skill_ids: cvForm.profile_skill_ids,
        profile_language_ids: cvForm.profile_language_ids,
        profile_achievement_ids: cvForm.profile_achievement_ids,
      };

      await createResume(payload);

      if (formWarning) {
        alert(formWarning);
      }

      setShowCVForm(false);
      setFormWarning('');
      // Reset form
      setCvForm({
        title: '',
        full_name: '',
        about: '',
        email: '',
        phone: '',
        age: '',
        profile_education_ids: [],
        profile_experience_ids: [],
        profile_project_ids: [],
        profile_skill_ids: [],
        profile_language_ids: [],
        profile_achievement_ids: [],
      });
    } catch (err) {
      alert('Error creating resume: ' + err.message);
    }
  };

  // ---- Job Application handlers (unchanged) ----
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

  const handleMarkFollowUp = async (app) => {
    if (!window.confirm(`Mark "${app.position} at ${app.company}" as "Follow-up"?`)) return;
    try {
      await updateApplication(app.id, {
        ...app,
        status: 'follow_up',
      });
      setFilterTag(filterTag || '');
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // ---- Compute unique tags ----
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

  // ---- Loading states ----
  if (authLoading || dataLoading || libraryLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">Loading...</div>;
  }

  // ---- Combobox render helper ----
  const renderLibraryCombobox = ({
    label,
    sectionKey, // e.g., 'profile_experience_ids'
    items,      // array of library items, e.g., [{id, company, position, ...}]
    displayKey, // how to display: e.g., (item) => `${item.position} at ${item.company}`
    placeholder,
    newSectionType, // e.g., 'experience'
    required = false,
  }) => {
    const selectedIds = cvForm[sectionKey] || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Filter items based on search
    const filteredItems = useMemo(() => {
      if (!searchTerm) return items;
      const lower = searchTerm.toLowerCase();
      return items.filter(item => {
        const label = displayKey(item).toLowerCase();
        return label.includes(lower);
      });
    }, [items, searchTerm, displayKey]);

    // Toggle selection
    const toggleItem = (id) => {
      const current = cvForm[sectionKey] || [];
      if (current.includes(id)) {
        setSectionIds(sectionKey, current.filter(i => i !== id));
      } else {
        setSectionIds(sectionKey, [...current, id]);
      }
      setIsOpen(false);
      setSearchTerm('');
    };

    // Click outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div ref={dropdownRef} className="mb-3">
        <label className="block text-sm font-medium mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="relative">
          {/* Selected items chips */}
          <div className="flex flex-wrap gap-1 p-2 bg-gray-700 rounded border border-gray-600 min-h-[42px]">
            {selectedIds.map(id => {
              const item = items.find(i => i.id === id);
              if (!item) return null;
              return (
                <span key={id} className="bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded flex items-center gap-1 text-sm">
                  {displayKey(item)}
                  <button
                    type="button"
                    onClick={() => toggleItem(id)}
                    className="text-xs hover:text-red-300"
                  >
                    ✕
                  </button>
                </span>
              );
            })}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={selectedIds.length === 0 ? placeholder : ''}
              className="flex-1 bg-transparent border-0 outline-none text-sm min-w-[100px]"
            />
          </div>
          {/* Dropdown list */}
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg max-h-48 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="p-2 text-sm text-gray-400">No items found</div>
              ) : (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`p-2 hover:bg-gray-700 cursor-pointer text-sm flex justify-between items-center ${
                      selectedIds.includes(item.id) ? 'bg-blue-900/30' : ''
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <span>{displayKey(item)}</span>
                    {selectedIds.includes(item.id) && <span className="text-blue-400">✓</span>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setNewSectionType(newSectionType);
            setNewSectionData({});
          }}
          className="mt-1 text-sm text-blue-400 hover:text-blue-300"
        >
          + Add new {label.toLowerCase()}
        </button>
      </div>
    );
  };

  // ---- Inline "Add New" modal ----
  const renderAddNewModal = () => {
    if (!newSectionType) return null;

    const fields = {
      experience: [
        { key: 'company', label: 'Company', required: true },
        { key: 'position', label: 'Position', required: true },
        { key: 'start_date', label: 'Start Date', type: 'date' },
        { key: 'end_date', label: 'End Date', type: 'date' },
        { key: 'is_current', label: 'Currently working', type: 'checkbox' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'location', label: 'Location' },
      ],
      education: [
        { key: 'institution', label: 'Institution', required: true },
        { key: 'degree', label: 'Degree' },
        { key: 'field_of_study', label: 'Field of Study' },
        { key: 'start_date', label: 'Start Date', type: 'date' },
        { key: 'end_date', label: 'End Date', type: 'date' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
      project: [
        { key: 'name', label: 'Project Name', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'url', label: 'URL', type: 'url' },
        { key: 'start_date', label: 'Start Date', type: 'date' },
        { key: 'end_date', label: 'End Date', type: 'date' },
      ],
      skill: [
        { key: 'name', label: 'Skill Name', required: true },
        { key: 'proficiency', label: 'Proficiency (e.g., Expert, Intermediate)' },
      ],
      language: [
        { key: 'name', label: 'Language', required: true },
        { key: 'proficiency', label: 'Proficiency (e.g., Native, Fluent)' },
      ],
      achievement: [
        { key: 'description', label: 'Achievement Description', required: true, type: 'textarea' },
      ],
    };

    const fieldDefs = fields[newSectionType];
    if (!fieldDefs) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Add New {newSectionType.charAt(0).toUpperCase() + newSectionType.slice(1)}</h3>
          <div className="space-y-3">
            {fieldDefs.map(({ key, label, type = 'text', required }) => {
              const value = newSectionData[key] || '';
              const onChange = (val) => {
                setNewSectionData(prev => ({ ...prev, [key]: val }));
              };
              if (type === 'checkbox') {
                return (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!value}
                      onChange={(e) => onChange(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                );
              }
              return (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  {type === 'textarea' ? (
                    <textarea
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                      rows="3"
                    />
                  ) : (
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={resetNewSection}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleAddNewSection(newSectionType)}
              disabled={addingSection}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
            >
              {addingSection ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  };

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
                  value={cvForm.title}
                  onChange={(e) => setCvForm({...cvForm, title: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  placeholder="e.g., Data Analyst CV"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={cvForm.full_name}
                  onChange={(e) => setCvForm({...cvForm, full_name: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={cvForm.email}
                  onChange={(e) => setCvForm({...cvForm, email: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="text"
                  value={cvForm.phone}
                  onChange={(e) => setCvForm({...cvForm, phone: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">About *</label>
                <textarea
                  rows="2"
                  value={cvForm.about}
                  onChange={(e) => setCvForm({...cvForm, about: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="number"
                  value={cvForm.age}
                  onChange={(e) => setCvForm({...cvForm, age: e.target.value})}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                />
              </div>
            </div>

            {/* ---- Library Comboboxes ---- */}
            <div className="border border-gray-700 p-3 rounded">
              <h3 className="text-lg font-medium mb-2">Sections from your profile library</h3>
              <p className="text-xs text-gray-400 mb-3">Select existing entries or add new ones.</p>

              {renderLibraryCombobox({
                label: 'Work Experience',
                sectionKey: 'profile_experience_ids',
                items: experiences,
                displayKey: (exp) => `${exp.position} at ${exp.company}`,
                placeholder: 'Search experiences...',
                newSectionType: 'experience',
              })}

              {renderLibraryCombobox({
                label: 'Education',
                sectionKey: 'profile_education_ids',
                items: educations,
                displayKey: (edu) => `${edu.degree} at ${edu.institution}`,
                placeholder: 'Search education...',
                newSectionType: 'education',
              })}

              {renderLibraryCombobox({
                label: 'Projects',
                sectionKey: 'profile_project_ids',
                items: projects,
                displayKey: (proj) => proj.name,
                placeholder: 'Search projects...',
                newSectionType: 'project',
              })}

              {renderLibraryCombobox({
                label: 'Skills',
                sectionKey: 'profile_skill_ids',
                items: skills,
                displayKey: (skill) => skill.name + (skill.proficiency ? ` (${skill.proficiency})` : ''),
                placeholder: 'Search skills...',
                newSectionType: 'skill',
              })}

              {renderLibraryCombobox({
                label: 'Languages',
                sectionKey: 'profile_language_ids',
                items: languages,
                displayKey: (lang) => lang.name + (lang.proficiency ? ` (${lang.proficiency})` : ''),
                placeholder: 'Search languages...',
                newSectionType: 'language',
              })}

              {renderLibraryCombobox({
                label: 'Achievements',
                sectionKey: 'profile_achievement_ids',
                items: achievements,
                displayKey: (ach) => ach.description.length > 60 ? ach.description.slice(0, 60) + '...' : ach.description,
                placeholder: 'Search achievements...',
                newSectionType: 'achievement',
              })}
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

      {/* ---- JOB APPLICATION SECTION (unchanged) ---- */}
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

      {/* ---- Add New Section Modal ---- */}
      {renderAddNewModal()}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

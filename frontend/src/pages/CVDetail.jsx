// frontend/src/pages/CVDetail.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useHVT } from '../context/HVTContext';
import { useCVData } from '../hooks/useCVData';
import { useProfileLibrary } from '../hooks/useProfileLibrary';
import LibraryCombobox from '../components/LibraryCombobox';

const API_BASE = 'https://api.franciscodes.com/cv/api';

const DEFAULT_SECTIONS = ['educations', 'experiences', 'projects', 'skills', 'languages', 'achievements'];
const SECTION_LABELS = {
  educations: 'Education',
  experiences: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  languages: 'Languages',
  achievements: 'Achievements',
};

const MarkdownContent = ({ children, className = '' }) => {
  if (!children) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={`prose prose-invert prose-sm max-w-none ${className}`}
      components={{
        ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
        li: ({ children }) => <li className="ml-4">{children}</li>,
        p: ({ children }) => <p className="mb-1">{children}</p>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export default function CVDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, isAuthenticated, loading: authLoading } = useHVT();
  const { getResume, updateResume, deleteResume, createResume } = useCVData();
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

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [previewStates, setPreviewStates] = useState({});

  // ---- AI Analysis state ----
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [progressMessage, setProgressMessage] = useState('');
  const pollingRef = useRef(null);

  // ---- "Add New" modal state ----
  const [newSectionType, setNewSectionType] = useState(null);
  const [newSectionData, setNewSectionData] = useState({});
  const [addingSection, setAddingSection] = useState(false);

  // ---- Ref to prevent concurrent fetches ----
  const fetchingRef = useRef(false);

  // ---- Helper: determine if resume uses profile library ----
  const usesProfile = (res) => {
    if (!res) return false;
    return (
      (res.profile_education_ids && res.profile_education_ids.length > 0) ||
      (res.profile_experience_ids && res.profile_experience_ids.length > 0) ||
      (res.profile_skill_ids && res.profile_skill_ids.length > 0)
    );
  };

  // ---- Fetch resume (memoized) ----
  const fetchResume = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setError('Please log in to view this resume.');
      setLoading(false);
      return;
    }
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const data = await getResume(id);
      if (!data.section_order || data.section_order.length === 0) {
        data.section_order = [...DEFAULT_SECTIONS];
      }
      setResume(data);
      setEditData(JSON.parse(JSON.stringify(data)));
      setAnalysisResult(null);
      setProgressMessage('');
      setError(null);
    } catch (e) {
      setError(e.message || 'Failed to load resume.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [id, isAuthenticated, accessToken, getResume]);

  // ---- Load resume on mount and when dependencies change ----
  useEffect(() => {
    fetchResume();
  }, [fetchResume]); // fetchResume is stable (useCallback)

  // ---- Cleanup polling on unmount ----
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  // ---- AI Analysis (unchanged) ----
  const handleAnalyze = async () => {
    if (!resume) return;
    if (pollingRef.current) clearTimeout(pollingRef.current);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setProgressMessage('Starting AI analysis...');

    try {
      const cvData = {
        full_name: resume.full_name,
        about: resume.about,
        email: resume.email,
        phone: resume.phone,
        age: resume.age,
        skills: resume.skills?.map(s => s.name).join(', ') || '',
        languages: resume.languages?.map(l => l.name).join(', ') || '',
        educations: resume.educations?.map(e => `${e.institution} – ${e.degree} (${e.field_of_study || ''})`).join('\n') || '',
        experiences: resume.experiences?.map(e => `${e.position} at ${e.company} (${e.start_date} - ${e.end_date || 'Present'})`).join('\n') || '',
        projects: resume.projects?.map(p => `${p.name} – ${p.description}`).join('\n') || '',
        achievements: resume.achievements?.map(a => a.description).join('\n') || '',
      };
      const payload = JSON.stringify(cvData);

      const startRes = await fetch(`${API_BASE}/ai/analyze-cv/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ resume_data: payload }),
      });
      if (!startRes.ok) throw new Error('Failed to start analysis');
      const { task_id } = await startRes.json();

      setProgressMessage('AI is analyzing your CV...');

      let attempts = 0;
      const maxAttempts = 120;
      const pollInterval = 5000;

      const poll = async () => {
        attempts++;
        try {
          const reportRes = await fetch(`${API_BASE}/ai/report/${task_id}/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (reportRes.ok) {
            const report = await reportRes.json();
            setAnalysisResult(report);
            setIsAnalyzing(false);
            setProgressMessage('');
            pollingRef.current = null;
            return;
          }

          if (reportRes.status === 404) {
            const messages = [
              'AI is analyzing your CV...',
              'DeepSeek is thinking...',
              'Almost there...',
              'Polishing the feedback...',
            ];
            setProgressMessage(messages[attempts % messages.length]);
          } else {
            throw new Error('Failed to fetch report');
          }

          if (attempts < maxAttempts) {
            pollingRef.current = setTimeout(poll, pollInterval);
          } else {
            throw new Error('Analysis timed out (10 minutes). Please try again.');
          }
        } catch (err) {
          console.error('Polling error:', err);
          setIsAnalyzing(false);
          setProgressMessage('');
          alert('Error during analysis: ' + err.message);
          pollingRef.current = null;
        }
      };

      pollingRef.current = setTimeout(poll, pollInterval);
    } catch (err) {
      console.error('Analysis start error:', err);
      setIsAnalyzing(false);
      setProgressMessage('');
      alert('Failed to start analysis: ' + err.message);
    }
  };

  // ---- Edit mode handlers ----
  const enableEditing = () => {
    const data = JSON.parse(JSON.stringify(resume));
    if (!data.section_order || data.section_order.length === 0) {
      data.section_order = [...DEFAULT_SECTIONS];
    }
    setEditData(data);
    setPreviewStates({});
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData(null);
    setPreviewStates({});
  };

  const handleFieldChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleNestedChange = (section, index, field, value) => {
    const updated = [...editData[section]];
    if (section === 'experiences' && field === 'is_current' && value === true) {
      updated[index].end_date = '';
    }
    updated[index][field] = value;
    setEditData({ ...editData, [section]: updated });
  };

  const addItem = (section, emptyItem) => {
    const newItem = { ...emptyItem, order: editData[section].length };
    setEditData({
      ...editData,
      [section]: [...editData[section], newItem],
    });
  };

  const removeItem = (section, index) => {
    if (editData[section].length <= 1) return;
    const updated = [...editData[section]];
    updated.splice(index, 1);
    setEditData({ ...editData, [section]: updated });
  };

  const moveItem = (section, index, direction) => {
    const items = [...editData[section]];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const temp = items[index].order;
    items[index].order = items[targetIndex].order;
    items[targetIndex].order = temp;
    [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
    setEditData({ ...editData, [section]: items });
  };

  const moveSection = (sectionName, direction) => {
    const order = editData.section_order || [...DEFAULT_SECTIONS];
    const index = order.indexOf(sectionName);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= order.length) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setEditData({ ...editData, section_order: newOrder });
  };

  // ---- Set section IDs (for profile library) ----
  const setSectionIds = (sectionKey, ids) => {
    setEditData(prev => ({ ...prev, [sectionKey]: ids }));
  };

  // ---- Add new section to library ----
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
      const idKey = `profile_${type}_ids`;
      setEditData(prev => ({
        ...prev,
        [idKey]: [...(prev[idKey] || []), result.id],
      }));
      setNewSectionType(null);
      setNewSectionData({});
    } catch (err) {
      alert(`Error adding ${type}: ${err.message}`);
    } finally {
      setAddingSection(false);
    }
  };

  // ---- Save (handles both legacy and profile) ----
  const handleSave = async () => {
    setSaveLoading(true);
    try {
      let payload;
      const usesProfileData = usesProfile(editData);

      if (usesProfileData) {
        payload = {
          title: editData.title || null,
          full_name: editData.full_name,
          about: editData.about,
          email: editData.email,
          phone: editData.phone,
          age: editData.age || null,
          profile_education_ids: editData.profile_education_ids || [],
          profile_experience_ids: editData.profile_experience_ids || [],
          profile_project_ids: editData.profile_project_ids || [],
          profile_skill_ids: editData.profile_skill_ids || [],
          profile_language_ids: editData.profile_language_ids || [],
          profile_achievement_ids: editData.profile_achievement_ids || [],
          section_order: editData.section_order || [...DEFAULT_SECTIONS],
        };
      } else {
        const filterValid = (items, requiredFields) => {
          return items
            .filter((item) => {
              const hasAnyData = Object.values(item).some((v) => v && v.toString().trim() !== '');
              if (!hasAnyData) return false;
              const missing = requiredFields.filter((f) => !item[f] || item[f].toString().trim() === '');
              return missing.length === 0;
            })
            .map((item) => {
              const cleaned = { ...item };
              Object.keys(cleaned).forEach((key) => {
                if (key.includes('date') || key === 'url') {
                  cleaned[key] = cleaned[key] || null;
                }
              });
              if (cleaned.is_current) {
                cleaned.end_date = null;
              }
              return cleaned;
            });
        };

        payload = {
          title: editData.title || null,
          full_name: editData.full_name,
          about: editData.about,
          email: editData.email,
          phone: editData.phone,
          age: editData.age || null,
          educations: filterValid(editData.educations || [], ['institution']),
          experiences: filterValid(editData.experiences || [], ['company']),
          projects: filterValid(editData.projects || [], ['name']),
          skills: filterValid(editData.skills || [], ['name']),
          languages: filterValid(editData.languages || [], ['name']),
          achievements: filterValid(editData.achievements || [], ['description']),
          section_order: editData.section_order || [...DEFAULT_SECTIONS],
        };
      }

      const updated = await updateResume(id, payload);
      setResume(updated);
      setEditData(updated);
      setIsEditing(false);
      setPreviewStates({});
      // Re-fetch to ensure consistency (optional)
      await fetchResume();
    } catch (err) {
      alert('Error updating resume: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // ---- Duplicate ----
  const handleDuplicate = async () => {
    const cleanNested = (items) => items.map(({ id, created_at, updated_at, ...rest }) => rest);
    const newTitle = resume.title ? `Copy of ${resume.title}` : `Copy of ${resume.full_name}`;
    const payload = {
      title: newTitle,
      full_name: resume.full_name,
      about: resume.about,
      email: resume.email,
      phone: resume.phone,
      age: resume.age || null,
      educations: cleanNested(resume.educations || []),
      experiences: cleanNested(resume.experiences || []),
      projects: cleanNested(resume.projects || []),
      skills: cleanNested(resume.skills || []),
      languages: cleanNested(resume.languages || []),
      achievements: cleanNested(resume.achievements || []),
      section_order: resume.section_order || [...DEFAULT_SECTIONS],
    };
    try {
      const newResume = await createResume(payload);
      navigate(`/cv/${newResume.id}`);
    } catch (err) {
      alert('Error duplicating resume: ' + err.message);
    }
  };

  // ---- Delete ----
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) return;
    try {
      await deleteResume(id);
      navigate('/cv');
    } catch (err) {
      alert('Error deleting resume: ' + err.message);
    }
  };

  // ---- PDF download ----
  const downloadPDF = async () => {
    if (!isAuthenticated || !accessToken) {
      alert('Please log in to download PDF.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/resumes/${id}/pdf/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error('Failed to download PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume?.title || resume?.full_name || 'resume'}_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  // ---- Add New Section Modal ----
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
              onClick={() => { setNewSectionType(null); setNewSectionData({}); }}
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

  // ---- Resolve display items for view mode ----
  const getDisplayItems = (sectionKey, libraryItems) => {
    if (!resume) return [];
    const useProfileData = usesProfile(resume);
    if (useProfileData) {
      const ids = resume[sectionKey] || [];
      return libraryItems.filter(item => ids.includes(item.id));
    } else {
      const legacyMap = {
        profile_education_ids: 'educations',
        profile_experience_ids: 'experiences',
        profile_project_ids: 'projects',
        profile_skill_ids: 'skills',
        profile_language_ids: 'languages',
        profile_achievement_ids: 'achievements',
      };
      const legacyKey = legacyMap[sectionKey];
      return resume[legacyKey] || [];
    }
  };

  // ---- Render a section in view mode ----
  const renderDisplaySection = (sectionName) => {
    const profileKeyMap = {
      educations: { key: 'profile_education_ids', items: educations },
      experiences: { key: 'profile_experience_ids', items: experiences },
      projects: { key: 'profile_project_ids', items: projects },
      skills: { key: 'profile_skill_ids', items: skills },
      languages: { key: 'profile_language_ids', items: languages },
      achievements: { key: 'profile_achievement_ids', items: achievements },
    };

    const useProfileData = usesProfile(resume);
    let items;
    if (useProfileData) {
      const mapping = profileKeyMap[sectionName];
      if (!mapping) return null;
      const ids = resume[mapping.key] || [];
      items = mapping.items.filter(item => ids.includes(item.id));
    } else {
      items = resume[sectionName] || [];
    }

    if (!items || items.length === 0) return null;
    const title = SECTION_LABELS[sectionName] || sectionName;
    const isFlex = ['skills', 'languages'].includes(sectionName);

    return (
      <div key={sectionName}>
        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2 mb-4">{title}</h2>
        {isFlex ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item, idx) => {
              if (sectionName === 'skills') {
                return (
                  <span key={idx} className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">
                    {item.name}
                    {item.proficiency && ` (${item.proficiency})`}
                  </span>
                );
              }
              if (sectionName === 'languages') {
                return (
                  <span key={idx} className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">
                    {item.name}
                    {item.proficiency && ` (${item.proficiency})`}
                  </span>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            {items.map((item, idx) => {
              if (sectionName === 'educations') {
                return (
                  <li key={idx}>
                    {item.institution}
                    {item.degree && ` – ${item.degree}`}
                    {item.field_of_study && ` (${item.field_of_study})`}
                    {item.start_date && ` (${item.start_date}${item.end_date ? ` - ${item.end_date}` : ''})`}
                    {item.description && (
                      <div className="ml-6 text-sm text-gray-400">
                        <MarkdownContent>{item.description}</MarkdownContent>
                      </div>
                    )}
                  </li>
                );
              }
              if (sectionName === 'experiences') {
                return (
                  <li key={idx}>
                    {item.position} at {item.company}
                    {item.location && ` (${item.location})`}
                    {item.start_date && (
                      <span>
                        {' '}
                        ({item.start_date}
                        {item.is_current ? ' – Present' : item.end_date ? ` – ${item.end_date}` : ''})
                      </span>
                    )}
                    {item.description && (
                      <div className="ml-6 text-sm text-gray-400">
                        <MarkdownContent>{item.description}</MarkdownContent>
                      </div>
                    )}
                  </li>
                );
              }
              if (sectionName === 'projects') {
                return (
                  <li key={idx}>
                    {item.name}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {' '}
                        🔗
                      </a>
                    )}
                    {item.start_date && ` (${item.start_date}${item.end_date ? ` - ${item.end_date}` : ''})`}
                    {item.description && (
                      <div className="ml-6 text-sm text-gray-400">
                        <MarkdownContent>{item.description}</MarkdownContent>
                      </div>
                    )}
                  </li>
                );
              }
              if (sectionName === 'achievements') {
                return (
                  <li key={idx}>
                    <MarkdownContent>{item.description}</MarkdownContent>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        )}
      </div>
    );
  };

  // ---- Loading / Error ----
  if (authLoading || loading || libraryLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">Loading...</div>;
  }

  if (!isAuthenticated || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">
        <div>
          <p className="text-red-400">{error || 'Please log in to view this resume.'}</p>
          <Link to="/cv" className="mt-4 inline-block px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Back to CV Manager</Link>
        </div>
      </div>
    );
  }

  if (!resume) return <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100"><p>No resume data found.</p></div>;

  // ---- View Mode ----
  if (!isEditing) {
    const sectionOrder = resume.section_order || DEFAULT_SECTIONS;
    return (
      <div className="min-h-screen bg-[#0b0e14] text-slate-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link to="/cv" className="text-blue-400 hover:text-blue-300 transition">← Back to CV Manager</Link>
            <div className="flex gap-2 flex-wrap">
              {/* AI Analysis Button */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  isAnalyzing
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <span className="animate-spin">⟳</span> Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 00-4.5 14.6l1.4-1.4A6 6 0 1116 10H10v2l3 3 3-3v-2h-4a8 8 0 00-8-8z" />
                    </svg>
                    Analyze with AI
                  </>
                )}
              </button>
              <button onClick={enableEditing} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition flex items-center gap-2">
                ✏️ Edit
              </button>
              <button onClick={handleDuplicate} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition flex items-center gap-2">
                📋 Duplicate
              </button>
              <button onClick={downloadPDF} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition flex items-center gap-2">
                📄 PDF
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition flex items-center gap-2">
                🗑️ Delete
              </button>
            </div>
          </div>

          {/* AI Analysis Results */}
          {isAnalyzing && (
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="animate-spin">⟳</span> {progressMessage}
              </h3>
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded transition-all duration-500" style={{ width: '60%' }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">This may take up to 10 minutes</p>
              </div>
            </div>
          )}

          {analysisResult && (
            <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-purple-500">
              <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                🤖 AI Feedback
              </h3>
              {analysisResult.rating && (
                <div className="mt-2">
                  <span className="text-2xl font-bold text-white">{analysisResult.rating}</span>
                  <span className="text-gray-400 text-sm"> / 10</span>
                </div>
              )}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-green-400">Strengths</h4>
                  <ul className="list-disc list-inside text-sm text-gray-300">
                    {analysisResult.strengths?.map((s, i) => <li key={i}>{s}</li>) || <li>No strengths listed</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-400">Areas for Improvement</h4>
                  <ul className="list-disc list-inside text-sm text-gray-300">
                    {analysisResult.weaknesses?.map((w, i) => <li key={i}>{w}</li>) || <li>No weaknesses listed</li>}
                  </ul>
                </div>
              </div>
              {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-blue-400">Suggestions</h4>
                  <ul className="list-disc list-inside text-sm text-gray-300">
                    {analysisResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              <button
                onClick={() => setAnalysisResult(null)}
                className="mt-4 text-xs text-gray-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
            <div className="bg-gradient-to-r from-blue-800 to-purple-800 px-8 py-10">
              <h1 className="text-4xl font-bold text-white">{resume.full_name}</h1>
              {resume.title && <p className="text-blue-300 text-lg italic">{resume.title}</p>}
              <p className="text-blue-200 text-lg mt-1">{resume.about}</p>
              <div className="flex flex-wrap gap-6 mt-4 text-sm text-blue-100">
                {resume.email && <span>📧 {resume.email}</span>}
                {resume.phone && <span>📞 {resume.phone}</span>}
                {resume.age && <span>🎂 {resume.age} years</span>}
              </div>
              {!usesProfile(resume) && (
                <div className="mt-4 bg-yellow-800/30 border border-yellow-600 p-2 rounded text-yellow-200 text-sm">
                  ⚠️ This resume uses legacy nested sections. To edit sections, please re‑create it using the "Add New CV" form.
                </div>
              )}
            </div>
            <div className="p-8 space-y-8">
              {sectionOrder.map((section) => renderDisplaySection(section))}
              <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
                Created: {new Date(resume.created_at).toLocaleDateString()} · Updated:{' '}
                {new Date(resume.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Edit Mode ----
  const isProfile = usesProfile(editData);
  const sectionOrder = editData.section_order || DEFAULT_SECTIONS;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/cv" className="text-blue-400 hover:text-blue-300 transition">← Back to CV Manager</Link>
          <div className="flex gap-3">
            <button onClick={cancelEditing} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition"
            >
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {!isProfile && (
          <div className="bg-yellow-800/30 border border-yellow-600 p-4 rounded-lg mb-4">
            <p className="text-yellow-200 text-sm">
              ⚠️ This resume uses legacy nested sections. Editing sections is limited to basic info and re‑ordering.
              To use the new profile library, please re‑create the resume using the "Add New CV" form.
            </p>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-800 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CV Title (optional)</label>
              <input
                type="text"
                value={editData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                placeholder="e.g., Data Analyst CV"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                value={editData.full_name || ''}
                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">About *</label>
              <textarea
                rows="2"
                value={editData.about || ''}
                onChange={(e) => handleFieldChange('about', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                value={editData.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                type="text"
                value={editData.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                value={editData.age || ''}
                onChange={(e) => handleFieldChange('age', e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>
          </div>

          {isProfile ? (
            // ---- Profile‑based edit ----
            <div className="border border-gray-700 p-4 rounded">
              <h3 className="text-lg font-medium mb-3">Sections from your profile library</h3>
              <p className="text-xs text-gray-400 mb-3">Select existing entries or add new ones.</p>

              <LibraryCombobox
                label="Work Experience"
                selectedIds={editData.profile_experience_ids || []}
                items={experiences}
                displayKey={(exp) => `${exp.position} at ${exp.company}`}
                placeholder="Search experiences..."
                onToggle={(id) => {
                  const current = editData.profile_experience_ids || [];
                  if (current.includes(id)) {
                    setSectionIds('profile_experience_ids', current.filter(i => i !== id));
                  } else {
                    setSectionIds('profile_experience_ids', [...current, id]);
                  }
                }}
                onAddNew={() => { setNewSectionType('experience'); setNewSectionData({}); }}
              />

              <LibraryCombobox
                label="Education"
                selectedIds={editData.profile_education_ids || []}
                items={educations}
                displayKey={(edu) => `${edu.degree} at ${edu.institution}`}
                placeholder="Search education..."
                onToggle={(id) => {
                  const current = editData.profile_education_ids || [];
                  if (current.includes(id)) {
                    setSectionIds('profile_education_ids', current.filter(i => i !== id));
                  } else {
                    setSectionIds('profile_education_ids', [...current, id]);
                  }
                }}
                onAddNew={() => { setNewSectionType('education'); setNewSectionData({}); }}
              />

              <LibraryCombobox
                label="Projects"
                selectedIds={editData.profile_project_ids || []}
                items={projects}
                displayKey={(proj) => proj.name}
                placeholder="Search projects..."
                onToggle={(id) => {
                  const current = editData.profile_project_ids || [];
                  if (current.includes(id)) {
                    setSectionIds('profile_project_ids', current.filter(i => i !== id));
                  } else {
                    setSectionIds('profile_project_ids', [...current, id]);
                  }
                }}
                onAddNew={() => { setNewSectionType('project'); setNewSectionData({}); }}
              />

              <LibraryCombobox
                label="Skills"
                selectedIds={editData.profile_skill_ids || []}
                items={skills}
                displayKey={(skill) => skill.name + (skill.proficiency ? ` (${skill.proficiency})` : '')}
                placeholder="Search skills..."
                onToggle={(id) => {
                  const current = editData.profile_skill_ids || [];
                  if (current.includes(id)) {
                    setSectionIds('profile_skill_ids', current.filter(i => i !== id));
                  } else {
                    setSectionIds('profile_skill_ids', [...current, id]);
                  }
                }}
                onAddNew={() => { setNewSectionType('skill'); setNewSectionData({}); }}
              />

              <LibraryCombobox
                label="Languages"
                selectedIds={editData.profile_language_ids || []}
                items={languages}
                displayKey={(lang) => lang.name + (lang.proficiency ? ` (${lang.proficiency})` : '')}
                placeholder="Search languages..."
                onToggle={(id) => {
                  const current = editData.profile_language_ids || [];
                  if (current.includes(id)) {
                    setSectionIds('profile_language_ids', current.filter(i => i !== id));
                  } else {
                    setSectionIds('profile_language_ids', [...current, id]);
                  }
                }}
                onAddNew={() => { setNewSectionType('language'); setNewSectionData({}); }}
              />

              <LibraryCombobox
                label="Achievements"
                selectedIds={editData.profile_achievement_ids || []}
                items={achievements}
                displayKey={(ach) => ach.description.length > 60 ? ach.description.slice(0, 60) + '...' : ach.description}
                placeholder="Search achievements..."
                onToggle={(id) => {
                  const current = editData.profile_achievement_ids || [];
                  if (current.includes(id)) {
                    setSectionIds('profile_achievement_ids', current.filter(i => i !== id));
                  } else {
                    setSectionIds('profile_achievement_ids', [...current, id]);
                  }
                }}
                onAddNew={() => { setNewSectionType('achievement'); setNewSectionData({}); }}
              />
            </div>
          ) : (
            // ---- Legacy nested edit ----
            sectionOrder.map((sectionName, idx) => {
              const label = SECTION_LABELS[sectionName] || sectionName;
              const items = editData[sectionName] || [];
              const emptyItem = {
                educations: {
                  institution: '',
                  degree: '',
                  field_of_study: '',
                  start_date: '',
                  end_date: '',
                  description: '',
                  order: items.length,
                },
                experiences: {
                  company: '',
                  position: '',
                  start_date: '',
                  end_date: '',
                  description: '',
                  location: '',
                  is_current: false,
                  order: items.length,
                },
                projects: {
                  name: '',
                  description: '',
                  url: '',
                  start_date: '',
                  end_date: '',
                  order: items.length,
                },
                skills: { name: '', proficiency: '', order: items.length },
                languages: { name: '', proficiency: '', order: items.length },
                achievements: { description: '', order: items.length },
              }[sectionName];
              const requiredFields = {
                educations: ['institution'],
                experiences: ['company'],
                projects: ['name'],
                skills: ['name'],
                languages: ['name'],
                achievements: ['description'],
              }[sectionName];

              return (
                <div key={sectionName} className="border border-gray-700 p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">
                        {label}{' '}
                        <span className="text-xs text-gray-400">(required: {requiredFields.join(', ')})</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => moveSection(sectionName, 'up')}
                        disabled={idx === 0}
                        className="text-gray-400 hover:text-white text-sm disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(sectionName, 'down')}
                        disabled={idx === sectionOrder.length - 1}
                        className="text-gray-400 hover:text-white text-sm disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => addItem(sectionName, { ...emptyItem, order: items.length })}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      + Add {label.slice(0, -1)}
                    </button>
                  </div>

                  {items.map((item, idx2) => {
                    const previewKey = `${sectionName}-${idx2}`;
                    const showPreview = previewStates[previewKey] || false;
                    const isExperience = sectionName === 'experiences';

                    return (
                      <div key={idx2} className="flex gap-2 items-start mb-2">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.keys(item)
                            .filter((key) => key !== 'id' && key !== 'order')
                            .map((key) => {
                              const isRequired = requiredFields.includes(key);
                              let inputType = 'text';
                              if (key.includes('date')) inputType = 'date';
                              if (key === 'url') inputType = 'url';

                              if (key === 'description') {
                                return (
                                  <div key={key} className="relative col-span-2">
                                    <div className="flex items-center gap-2 mb-1">
                                      <label className="text-xs text-gray-400">
                                        {key.replace(/_/g, ' ')}
                                        {isRequired ? ' *' : ''}
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => togglePreview(sectionName, idx2)}
                                        className="text-xs text-blue-400 hover:text-blue-300"
                                      >
                                        {showPreview ? 'Hide Preview' : 'Preview'}
                                      </button>
                                    </div>
                                    {showPreview ? (
                                      <div className="w-full p-2 bg-gray-800 rounded border border-gray-600 min-h-[60px] prose prose-invert prose-sm max-w-none">
                                        <MarkdownContent>{item[key] || ''}</MarkdownContent>
                                      </div>
                                    ) : (
                                      <textarea
                                        value={item[key] || ''}
                                        onChange={(e) => handleNestedChange(sectionName, idx2, key, e.target.value)}
                                        className="w-full p-1 bg-gray-700 rounded border border-gray-600 text-sm"
                                        rows="3"
                                        placeholder={`${key.replace(/_/g, ' ')} (Markdown supported)`}
                                      />
                                    )}
                                  </div>
                                );
                              }

                              if (isExperience && key === 'is_current') {
                                return (
                                  <div key={key} className="col-span-2 flex items-center gap-2 mt-1">
                                    <input
                                      type="checkbox"
                                      checked={item.is_current || false}
                                      onChange={(e) => handleNestedChange(sectionName, idx2, key, e.target.checked)}
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
                                    onChange={(e) => handleNestedChange(sectionName, idx2, key, e.target.value)}
                                    disabled={isExperience && key === 'end_date' && item.is_current}
                                    className={`w-full p-1 bg-gray-700 rounded border ${
                                      isRequired ? 'border-blue-500' : 'border-gray-600'
                                    } text-sm ${
                                      isExperience && key === 'end_date' && item.is_current
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                    }`}
                                  />
                                </div>
                              );
                            })}
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveItem(sectionName, idx2, 'up')}
                            className="text-gray-400 hover:text-white text-sm"
                            disabled={idx2 === 0}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(sectionName, idx2, 'down')}
                            className="text-gray-400 hover:text-white text-sm"
                            disabled={idx2 === items.length - 1}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(sectionName, idx2)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={cancelEditing} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold"
            >
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {renderAddNewModal()}
    </div>
  );
}

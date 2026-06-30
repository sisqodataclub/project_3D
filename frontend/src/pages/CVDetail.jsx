// Full CVDetail.jsx with section reordering
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useHVT } from '../context/HVTContext';
import { useCVData } from '../hooks/useCVData';

const DEFAULT_SECTIONS = ['educations', 'experiences', 'projects', 'skills', 'languages', 'achievements'];
const SECTION_LABELS = {
  educations: 'Education',
  experiences: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  languages: 'Languages',
  achievements: 'Achievements',
};

export default function CVDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, isAuthenticated, loading: authLoading } = useHVT();
  const { updateResume, deleteResume } = useCVData();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      if (authLoading) return;
      if (!isAuthenticated || !accessToken) {
        setError('Please log in to view this resume.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/resumes/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Ensure section_order is always an array
          if (!data.section_order || data.section_order.length === 0) {
            data.section_order = [...DEFAULT_SECTIONS];
          }
          setResume(data);
          setEditData(JSON.parse(JSON.stringify(data)));
        } else if (res.status === 404) {
          setError('Resume not found.');
        } else {
          setError('Failed to load resume.');
        }
      } catch (e) {
        setError('Network error.');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id, isAuthenticated, accessToken, authLoading]);

  // --- edit mode handlers (same as before, plus moveSection) ---
  const enableEditing = () => {
    const data = JSON.parse(JSON.stringify(resume));
    if (!data.section_order || data.section_order.length === 0) {
      data.section_order = [...DEFAULT_SECTIONS];
    }
    setEditData(data);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleFieldChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleNestedChange = (section, index, field, value) => {
    const updated = [...editData[section]];
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

  // --- Section reordering ---
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

  // --- Save changes ---
  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const filterValid = (items, requiredFields) => {
        return items
          .filter(item => {
            const hasAnyData = Object.values(item).some(v => v && v.toString().trim() !== '');
            if (!hasAnyData) return false;
            const missing = requiredFields.filter(f => !item[f] || item[f].toString().trim() === '');
            return missing.length === 0;
          })
          .map(item => {
            const cleaned = { ...item };
            Object.keys(cleaned).forEach(key => {
              if (key.includes('date') || key === 'url') {
                cleaned[key] = cleaned[key] || null;
              }
            });
            return cleaned;
          });
      };

      // Ensure section_order is included
      const payload = {
        full_name: editData.full_name,
        about: editData.about,
        email: editData.email,
        phone: editData.phone,
        age: editData.age || null,
        educations: filterValid(editData.educations, ['institution']),
        experiences: filterValid(editData.experiences, ['company']),
        projects: filterValid(editData.projects, ['name']),
        skills: filterValid(editData.skills, ['name']),
        languages: filterValid(editData.languages, ['name']),
        achievements: filterValid(editData.achievements, ['description']),
        section_order: editData.section_order || [...DEFAULT_SECTIONS],
      };

      const updated = await updateResume(id, payload);
      setResume(updated);
      setEditData(updated);
      setIsEditing(false);
    } catch (err) {
      alert('Error updating resume: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // --- Delete and PDF download (unchanged) ---
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) return;
    try {
      await deleteResume(id);
      navigate('/cv');
    } catch (err) {
      alert('Error deleting resume: ' + err.message);
    }
  };

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
      link.download = `${resume?.full_name || 'resume'}_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">Loading...</div>;
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

  // Helper to render display sections in order
  const renderDisplaySection = (sectionName) => {
    const items = resume[sectionName];
    if (!items || items.length === 0) return null;
    const title = SECTION_LABELS[sectionName] || sectionName;
    const isFlex = ['skills', 'languages'].includes(sectionName);
    return (
      <div key={sectionName}>
        <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2 mb-4">{title}</h2>
        {isFlex ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => {
              if (sectionName === 'skills') {
                return <span key={item.id} className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">{item.name}{item.proficiency && `(${item.proficiency})`}</span>;
              } else if (sectionName === 'languages') {
                return <span key={item.id} className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">{item.name}{item.proficiency && `(${item.proficiency})`}</span>;
              }
              return null;
            })}
          </div>
        ) : (
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            {items.map((item) => {
              if (sectionName === 'educations') {
                return <li key={item.id}>{item.institution}{item.degree && ` – ${item.degree}`}{item.field_of_study && ` (${item.field_of_study})`}{item.start_date && ` (${item.start_date}${item.end_date ? ` - ${item.end_date}` : ''})`}{item.description && <p className="ml-6 text-sm text-gray-400">{item.description}</p>}</li>;
              } else if (sectionName === 'experiences') {
                return <li key={item.id}>{item.position} at {item.company}{item.location && ` (${item.location})`}{item.start_date && ` (${item.start_date}${item.end_date ? ` - ${item.end_date}` : ''})`}{item.description && <p className="ml-6 text-sm text-gray-400">{item.description}</p>}</li>;
              } else if (sectionName === 'projects') {
                return <li key={item.id}>{item.name}{item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline"> 🔗</a>}{item.start_date && ` (${item.start_date}${item.end_date ? ` - ${item.end_date}` : ''})`}{item.description && <p className="ml-6 text-sm text-gray-400">{item.description}</p>}</li>;
              } else if (sectionName === 'achievements') {
                return <li key={item.id}>{item.description}</li>;
              }
              return null;
            })}
          </ul>
        )}
      </div>
    );
  };

  // ----- View mode -----
  if (!isEditing) {
    const sectionOrder = resume.section_order || DEFAULT_SECTIONS;
    return (
      <div className="min-h-screen bg-[#0b0e14] text-slate-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link to="/cv" className="text-blue-400 hover:text-blue-300 transition">← Back to CV Manager</Link>
            <div className="flex gap-3">
              <button onClick={enableEditing} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                Edit
              </button>
              <button onClick={downloadPDF} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-5-5H6zm8 13a1 1 0 01-1 1H7a1 1 0 01-1-1v-1a1 1 0 011-1h6a1 1 0 011 1v1zm-3-8V3.5L13.5 7H11z" clipRule="evenodd" /></svg>
                Download PDF
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                Delete
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
            <div className="bg-gradient-to-r from-blue-800 to-purple-800 px-8 py-10">
              <h1 className="text-4xl font-bold text-white">{resume.full_name}</h1>
              <p className="text-blue-200 text-lg mt-1">{resume.about}</p>
              <div className="flex flex-wrap gap-6 mt-4 text-sm text-blue-100">
                {resume.email && <span>📧 {resume.email}</span>}
                {resume.phone && <span>📞 {resume.phone}</span>}
                {resume.age && <span>🎂 {resume.age} years</span>}
              </div>
            </div>
            <div className="p-8 space-y-8">
              {sectionOrder.map(section => renderDisplaySection(section))}
              <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
                Created: {new Date(resume.created_at).toLocaleDateString()} · Updated: {new Date(resume.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----- Edit mode -----
  const sectionOrder = editData.section_order || DEFAULT_SECTIONS;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/cv" className="text-blue-400 hover:text-blue-300 transition">← Back to CV Manager</Link>
          <div className="flex gap-3">
            <button onClick={cancelEditing} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition">Cancel</button>
            <button onClick={handleSave} disabled={saveLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition">
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-800 space-y-6">
          {/* Basic Info - unchanged */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Full Name *</label><input type="text" value={editData.full_name || ''} onChange={(e) => handleFieldChange('full_name', e.target.value)} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required /></div>
            <div><label className="block text-sm font-medium mb-1">About *</label><textarea rows="2" value={editData.about || ''} onChange={(e) => handleFieldChange('about', e.target.value)} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required /></div>
            <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" value={editData.email || ''} onChange={(e) => handleFieldChange('email', e.target.value)} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required /></div>
            <div><label className="block text-sm font-medium mb-1">Phone *</label><input type="text" value={editData.phone || ''} onChange={(e) => handleFieldChange('phone', e.target.value)} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required /></div>
            <div><label className="block text-sm font-medium mb-1">Age</label><input type="number" value={editData.age || ''} onChange={(e) => handleFieldChange('age', e.target.value)} className="w-full p-2 bg-gray-700 rounded border border-gray-600" /></div>
          </div>

          {/* Sections in order with reorder controls */}
          {sectionOrder.map((sectionName, idx) => {
            const label = SECTION_LABELS[sectionName] || sectionName;
            const items = editData[sectionName] || [];
            const emptyItem = {
              educations: { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '', order: items.length },
              experiences: { company: '', position: '', start_date: '', end_date: '', description: '', location: '', order: items.length },
              projects: { name: '', description: '', url: '', start_date: '', end_date: '', order: items.length },
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
                    <h3 className="text-lg font-medium">{label} <span className="text-xs text-gray-400">(required: {requiredFields.join(', ')})</span></h3>
                    <button type="button" onClick={() => moveSection(sectionName, 'up')} disabled={idx === 0} className="text-gray-400 hover:text-white text-sm disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => moveSection(sectionName, 'down')} disabled={idx === sectionOrder.length - 1} className="text-gray-400 hover:text-white text-sm disabled:opacity-30">↓</button>
                  </div>
                  <button type="button" onClick={() => addItem(sectionName, { ...emptyItem, order: items.length })} className="text-sm text-blue-400 hover:text-blue-300">+ Add {label.slice(0, -1)}</button>
                </div>
                {items.map((item, idx2) => (
                  <div key={idx2} className="flex gap-2 items-start mb-2">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.keys(item).filter(key => key !== 'id' && key !== 'order').map((key) => {
                        const isRequired = requiredFields.includes(key);
                        let inputType = 'text';
                        if (key.includes('date')) inputType = 'date';
                        if (key === 'url') inputType = 'url';
                        return (
                          <div key={key} className="relative">
                            <input
                              type={inputType}
                              placeholder={`${key.replace(/_/g, ' ')}${isRequired ? ' *' : ''}`}
                              value={item[key] || ''}
                              onChange={(e) => handleNestedChange(sectionName, idx2, key, e.target.value)}
                              className={`w-full p-1 bg-gray-700 rounded border ${isRequired ? 'border-blue-500' : 'border-gray-600'} text-sm`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button type="button" onClick={() => moveItem(sectionName, idx2, 'up')} className="text-gray-400 hover:text-white text-sm" disabled={idx2 === 0}>↑</button>
                      <button type="button" onClick={() => moveItem(sectionName, idx2, 'down')} className="text-gray-400 hover:text-white text-sm" disabled={idx2 === items.length - 1}>↓</button>
                      <button type="button" onClick={() => removeItem(sectionName, idx2)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={cancelEditing} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg">Cancel</button>
            <button type="submit" disabled={saveLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

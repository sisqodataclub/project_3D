import React, { useState, useEffect } from 'react';

const API_BASE = 'https://api.franciscodes.com/cv/api';

export default function CVManager() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
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

  // Fetch all resumes on mount
  useEffect(() => {
    fetch(`${API_BASE}/resumes/`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch resumes');
        return res.json();
      })
      .then(data => {
        // Ensure we always set an array
        setResumes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching resumes:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.full_name || !formData.about || !formData.email || !formData.phone) {
      alert('Please fill in all required fields (full name, about, email, phone).');
      return;
    }

    fetch(`${API_BASE}/resumes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create resume');
        return res.json();
      })
      .then(newResume => {
        setResumes(prev => [...prev, newResume]);
        setFormData({
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
      })
      .catch(err => {
        console.error('Error creating resume:', err);
        alert('Error creating resume: ' + err.message);
      });
  };

  if (loading) return <div className="text-center py-8">Loading resumes...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#0b0e14] text-slate-100">
      <h1 className="text-3xl font-bold mb-6">📄 CV Manager</h1>

      <h2 className="text-xl font-semibold mb-4">Your Resumes</h2>
      {resumes.length === 0 ? (
        <p className="text-gray-400">No resumes yet. Create one below.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {resumes.map((r) => (
            <div key={r.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold">{r.full_name}</h3>
              <p className="text-sm text-gray-300">{r.about}</p>
              <p className="text-sm text-gray-400">📧 {r.email}</p>
              <p className="text-sm text-gray-400">📞 {r.phone}</p>
              {r.skills && (
                <p className="text-sm text-gray-300 mt-1">
                  <span className="font-semibold">Skills:</span> {r.skills}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">Created: {new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <hr className="my-8 border-gray-700" />

      <h2 className="text-xl font-semibold mb-4">Create New Resume</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">About *</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows="2"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Languages</label>
            <input
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Education</label>
            <input
              type="text"
              name="education1"
              value={formData.education1}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <input
              type="text"
              name="project1"
              value={formData.project1}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Experience</label>
            <input
              type="text"
              name="experience1"
              value={formData.experience1}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Achievements</label>
            <input
              type="text"
              name="achievements"
              value={formData.achievements}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
        >
          Create Resume
        </button>
      </form>
    </div>
  );
}

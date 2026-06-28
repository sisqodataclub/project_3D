// src/pages/CVManager.jsx
import React, { useState, useEffect } from 'react';

const API_BASE = 'https://api.franciscodes.com/cv/api';

export default function CVManager() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
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
      .then(res => res.json())
      .then(data => {
        setResumes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching resumes:', err);
        setLoading(false);
      });
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit new resume
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/resumes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(newResume => {
        setResumes([...resumes, newResume]); // update list
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
      .catch(err => console.error('Error creating resume:', err));
  };

  if (loading) return <div>Loading resumes...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>CV Manager</h1>

      <h2>Your Resumes</h2>
      {resumes.length === 0 ? (
        <p>No resumes yet. Create one below.</p>
      ) : (
        <ul>
          {resumes.map(r => (
            <li key={r.id}>
              <strong>{r.full_name}</strong> – {r.email}
              <br />
              <small>{r.about}</small>
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h2>Create New Resume</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name</label>
          <input name="full_name" value={formData.full_name} onChange={handleChange} required />
        </div>
        <div>
          <label>About</label>
          <textarea name="about" value={formData.about} onChange={handleChange} required />
        </div>
        <div>
          <label>Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
        <div>
          <label>Skills (comma-separated)</label>
          <input name="skills" value={formData.skills} onChange={handleChange} />
        </div>
        <div>
          <label>Languages</label>
          <input name="languages" value={formData.languages} onChange={handleChange} />
        </div>
        <div>
          <label>Education</label>
          <input name="education1" value={formData.education1} onChange={handleChange} />
        </div>
        <div>
          <label>Project</label>
          <input name="project1" value={formData.project1} onChange={handleChange} />
        </div>
        <div>
          <label>Experience</label>
          <input name="experience1" value={formData.experience1} onChange={handleChange} />
        </div>
        <div>
          <label>Achievements</label>
          <input name="achievements" value={formData.achievements} onChange={handleChange} />
        </div>
        <button type="submit">Create Resume</button>
      </form>
    </div>
  );
}

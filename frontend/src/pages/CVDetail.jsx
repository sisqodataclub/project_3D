import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHVT } from '../context/HVTContext';

const API_BASE = 'https://api.franciscodes.com/cv/api';

export default function CVDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, isAuthenticated } = useHVT();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
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
          setResume(data);
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
  }, [id, isAuthenticated, accessToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">
        <div>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => navigate('/cvmanager')}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Back to CV Manager
          </button>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">
        <p>No resume data found.</p>
      </div>
    );
  }

  // Helper to ensure we always have an array for list fields
  const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      // If it's a comma-separated string, split it
      if (value.includes(',')) return value.split(',').map(s => s.trim());
      return [value];
    }
    return [];
  };

  const skills = safeArray(resume.skills);
  const languages = safeArray(resume.languages);
  const achievements = safeArray(resume.achievements);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#0b0e14] text-slate-100">
      <button
        onClick={() => navigate('/cvmanager')}
        className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
      >
        ← Back to CV Manager
      </button>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{resume.full_name}</h1>
        <p className="text-gray-300 mb-4">{resume.about}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <span className="font-semibold">Email:</span> {resume.email}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {resume.phone}
          </div>
          {resume.age && (
            <div>
              <span className="font-semibold">Age:</span> {resume.age}
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span key={idx} className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang, idx) => (
              <span key={idx} className="bg-green-600 px-3 py-1 rounded-full text-sm">
                {lang}
              </span>
            ))}
          </div>
        </div>

        {resume.education1 && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Education</h3>
            <p>{resume.education1}</p>
            {resume.education2 && <p>{resume.education2}</p>}
            {resume.education3 && <p>{resume.education3}</p>}
          </div>
        )}

        {resume.project1 && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Projects</h3>
            <p>{resume.project1}</p>
            {resume.project2 && <p>{resume.project2}</p>}
          </div>
        )}

        {resume.experience1 && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Experience</h3>
            <p>{resume.experience1}</p>
            {resume.experience2 && <p>{resume.experience2}</p>}
          </div>
        )}

        {achievements.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Achievements</h3>
            <ul className="list-disc pl-5">
              {achievements.map((ach, idx) => (
                <li key={idx}>{ach}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-400">
          Created: {new Date(resume.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

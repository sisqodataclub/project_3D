import React, { useState, useEffect, useRef } from 'react';
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
  const contentRef = useRef(null);

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

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      // Dynamically import html2pdf to keep bundle size small
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = contentRef.current;
      const opt = {
        margin: 1,
        filename: `${resume.full_name || 'resume'}_${id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

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
            onClick={() => navigate('/cv')}
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

  const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
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
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/cv')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          ← Back to CV Manager
        </button>
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* PDF Content */}
      <div ref={contentRef} className="bg-gray-800 rounded-lg p-6 shadow-lg">
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

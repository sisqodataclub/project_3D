import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCVData } from '../hooks/useCVData';
import { useHVT } from '../context/HVTContext';

const API_BASE = 'https://api.franciscodes.com/cv/api';

export default function CVDetail() {
  const { id } = useParams();
  const { token, isAuthenticated } = useHVT();
  const { fetchResume } = useCVData();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const data = await fetchResume(id);
        setResume(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadResume();
  }, [id, fetchResume]);

  const downloadPDF = () => {
    const url = `${API_BASE}/resumes/${id}/pdf/`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100">Loading...</div>;
  }

  if (error || !resume) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-red-400">{error || 'Not found'}</div>;
  }

  const toList = (str) =>
    str && typeof str === 'string'
      ? str.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  const skillsList = toList(resume.skills);
  const languagesList = toList(resume.languages);
  const achievementsList = toList(resume.achievements);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/cv" className="text-blue-400 hover:text-blue-300 transition">
            ← Back to CV Manager
          </Link>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-5-5H6zm8 13a1 1 0 01-1 1H7a1 1 0 01-1-1v-1a1 1 0 011-1h6a1 1 0 011 1v1zm-3-8V3.5L13.5 7H11z"
                clipRule="evenodd"
              />
            </svg>
            Download PDF
          </button>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
          <div className="bg-gradient-to-r from-blue-800 to-purple-800 px-8 py-10">
            <h1 className="text-4xl font-bold text-white">{resume.full_name}</h1>
            <p className="text-blue-200 text-lg mt-1">{resume.about}</p>
            <div className="flex flex-wrap gap-6 mt-4 text-sm text-blue-100">
              {resume.email && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {resume.email}
                </span>
              )}
              {resume.phone && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {resume.phone}
                </span>
              )}
              {resume.age && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {resume.age} years
                </span>
              )}
            </div>
          </div>

          <div className="p-8 space-y-8">
            {skillsList.length > 0 && (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {languagesList.length > 0 && (
              <Section title="Languages">
                <div className="flex flex-wrap gap-2">
                  {languagesList.map((lang, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {[resume.education1, resume.education2, resume.education3].filter(Boolean).length > 0 && (
              <Section title="Education">
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {[resume.education1, resume.education2, resume.education3]
                    .filter(Boolean)
                    .map((edu, idx) => (
                      <li key={idx}>{edu}</li>
                    ))}
                </ul>
              </Section>
            )}

            {[resume.project1, resume.project2].filter(Boolean).length > 0 && (
              <Section title="Projects">
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {[resume.project1, resume.project2]
                    .filter(Boolean)
                    .map((proj, idx) => (
                      <li key={idx}>{proj}</li>
                    ))}
                </ul>
              </Section>
            )}

            {[resume.experience1, resume.experience2].filter(Boolean).length > 0 && (
              <Section title="Experience">
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {[resume.experience1, resume.experience2]
                    .filter(Boolean)
                    .map((exp, idx) => (
                      <li key={idx}>{exp}</li>
                    ))}
                </ul>
              </Section>
            )}

            {achievementsList.length > 0 && (
              <Section title="Achievements">
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {achievementsList.map((ach, idx) => (
                    <li key={idx}>{ach}</li>
                  ))}
                </ul>
              </Section>
            )}

            <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
              Created: {new Date(resume.created_at).toLocaleDateString()} &middot;
              Updated: {new Date(resume.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Section component
function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

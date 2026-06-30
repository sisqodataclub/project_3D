import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHVT } from '../context/HVTContext';

const API_BASE = 'https://api.franciscodes.com/cv/api';

export default function CVDetail() {
  const { id } = useParams();
  const { accessToken, isAuthenticated, loading: authLoading } = useHVT();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [id, isAuthenticated, accessToken, authLoading]);

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

  if (authLoading || loading) {
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

  if (!resume) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] text-slate-100"><p>No resume data found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/cv" className="text-blue-400 hover:text-blue-300 transition">← Back to CV Manager</Link>
          <button onClick={downloadPDF} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-5-5H6zm8 13a1 1 0 01-1 1H7a1 1 0 01-1-1v-1a1 1 0 011-1h6a1 1 0 011 1v1zm-3-8V3.5L13.5 7H11z" clipRule="evenodd" /></svg>
            Download PDF
          </button>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
          <div className="bg-gradient-to-r from-blue-800 to-purple-800 px-8 py-10">
            <h1 className="text-4xl font-bold text-white">{resume.full_name}</h1>
            <p className="text-blue-200 text-lg mt-1">{resume.about}</p>
            <div className="flex flex-wrap gap-6 mt-4 text-sm text-blue-100">
              {resume.email && <span className="flex items-center gap-1">📧 {resume.email}</span>}
              {resume.phone && <span className="flex items-center gap-1">📞 {resume.phone}</span>}
              {resume.age && <span className="flex items-center gap-1">🎂 {resume.age} years</span>}
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Educations */}
            {resume.educations?.length > 0 && (
              <Section title="Education">
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {resume.educations.map((edu) => (
                    <li key={edu.id}>
                      {edu.institution} {edu.degree && `– ${edu.degree}`} {edu.field_of_study && `(${edu.field_of_study})`}
                      {edu.start_date && ` (${edu.start_date}${edu.end_date ? ` - ${edu.end_date}` : ''})`}
                      {edu.description && <p className="ml-6 text-sm text-gray-400">{edu.description}</p>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Experiences */}
            {resume.experiences?.length > 0 && (
              <Section title="Experience">
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {resume.experiences.map((exp) => (
                    <li key={exp.id}>
                      {exp.position} at {exp.company} {exp.location && `(${exp.location})`}
                      {exp.start_date && ` (${exp.start_date}${exp.end_date ? ` - ${exp.end_date}` : ''})`}
                      {exp.description && <p className="ml-6 text-sm text-gray-400">{exp.description}</p>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Projects */}
            {resume.projects?.length > 0 && (
              <Section title="Projects">
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {resume.projects.map((proj) => (
                    <li key={proj.id}>
                      {proj.name} {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">🔗</a>}
                      {proj.start_date && ` (${proj.start_date}${proj.end_date ? ` - ${proj.end_date}` : ''})`}
                      {proj.description && <p className="ml-6 text-sm text-gray-400">{proj.description}</p>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Skills */}
            {resume.skills?.length > 0 && (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill) => (
                    <span key={skill.id} className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">
                      {skill.name} {skill.proficiency && `(${skill.proficiency})`}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Languages */}
            {resume.languages?.length > 0 && (
              <Section title="Languages">
                <div className="flex flex-wrap gap-2">
                  {resume.languages.map((lang) => (
                    <span key={lang.id} className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">
                      {lang.name} {lang.proficiency && `(${lang.proficiency})`}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Achievements */}
            {resume.achievements?.length > 0 && (
              <Section title="Achievements">
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {resume.achievements.map((ach) => (
                    <li key={ach.id}>{ach.description}</li>
                  ))}
                </ul>
              </Section>
            )}

            <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
              Created: {new Date(resume.created_at).toLocaleDateString()} &middot; Updated: {new Date(resume.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2 mb-4">{title}</h2>
      {children}
    </div>
  );
}

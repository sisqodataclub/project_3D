// src/hooks/useProfileLibrary.js
import { useState, useEffect, useCallback } from 'react';
import { useHVT } from '../context/HVTContext';

const API_BASE = 'https://api.franciscodes.com/cv/api';

export function useProfileLibrary() {
  const { isAuthenticated, accessToken } = useHVT();
  
  // State for each section type
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to fetch all sections
  const fetchAll = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setExperiences([]);
      setEducations([]);
      setProjects([]);
      setSkills([]);
      setLanguages([]);
      setAchievements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      const [
        expRes, eduRes, projRes, skillRes, langRes, achRes
      ] = await Promise.all([
        fetch(`${API_BASE}/profile/experiences/`, { headers }),
        fetch(`${API_BASE}/profile/educations/`, { headers }),
        fetch(`${API_BASE}/profile/projects/`, { headers }),
        fetch(`${API_BASE}/profile/skills/`, { headers }),
        fetch(`${API_BASE}/profile/languages/`, { headers }),
        fetch(`${API_BASE}/profile/achievements/`, { headers }),
      ]);

      const expData = expRes.ok ? await expRes.json() : [];
      const eduData = eduRes.ok ? await eduRes.json() : [];
      const projData = projRes.ok ? await projRes.json() : [];
      const skillData = skillRes.ok ? await skillRes.json() : [];
      const langData = langRes.ok ? await langRes.json() : [];
      const achData = achRes.ok ? await achRes.json() : [];

      setExperiences(expData.results || expData || []);
      setEducations(eduData.results || eduData || []);
      setProjects(projData.results || projData || []);
      setSkills(skillData.results || skillData || []);
      setLanguages(langData.results || langData || []);
      setAchievements(achData.results || achData || []);
    } catch (e) {
      console.error('Failed to fetch profile library:', e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken]);

  // Auto-fetch when auth changes
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---- Generic add helper ----
  const addSection = async (endpoint, data, setter) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || `Failed to add ${endpoint}`);
    }
    const newItem = await res.json();
    setter(prev => [...prev, newItem]);
    return newItem;
  };

  // ---- Specific add functions ----
  const addExperience = async (data) => addSection('profile/experiences/', data, setExperiences);
  const addEducation = async (data) => addSection('profile/educations/', data, setEducations);
  const addProject = async (data) => addSection('profile/projects/', data, setProjects);
  const addSkill = async (data) => addSection('profile/skills/', data, setSkills);
  const addLanguage = async (data) => addSection('profile/languages/', data, setLanguages);
  const addAchievement = async (data) => addSection('profile/achievements/', data, setAchievements);

  return {
    experiences,
    educations,
    projects,
    skills,
    languages,
    achievements,
    loading,
    refresh: fetchAll,
    addExperience,
    addEducation,
    addProject,
    addSkill,
    addLanguage,
    addAchievement,
  };
}

// frontend/src/pages/pdf/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  apiGeneratePDF,
  apiListTemplates,
  apiLogout,
  apiUploadDocument,
  apiGetUserInfo,
  refreshUserStats,
} from '../../services/pdfService';

export default function PDFDashboard() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [user, setUser] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // Form state
  const [html, setHtml] = useState('<h1>Hello {{ name }}</h1>');
  const [context, setContext] = useState('{"name": "World"}');
  const [css, setCss] = useState('');
  const [filename, setFilename] = useState('document.pdf');
  const [templateSlug, setTemplateSlug] = useState('');

  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ============================================================
  // Fetch user info and templates on mount
  // ============================================================
  useEffect(() => {
    const storedKey = localStorage.getItem('pdf_api_key');
    const storedUser = localStorage.getItem('pdf_user');

    if (!storedKey) {
      navigate('/pdf/login');
      return;
    }

    setApiKey(storedKey);

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchUserInfo = async () => {
      try {
        const data = await apiGetUserInfo();
        setUser(data);
        localStorage.setItem('pdf_user', JSON.stringify(data));
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    };

    fetchUserInfo();
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const data = await apiListTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  };

  // ============================================================
  // Handle PDF generation from HTML
  // ============================================================
  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let contextData;
      try {
        contextData = JSON.parse(context);
      } catch {
        contextData = {};
      }
      const params = {
        context: contextData,
        filename: filename || 'document.pdf',
      };
      if (templateSlug) params.template_slug = templateSlug;
      else if (html) params.html = html;
      else {
        alert('Please provide either HTML or select a template.');
        setLoading(false);
        return;
      }
      if (css) params.css = css;

      const pdfBlob = await apiGeneratePDF(params);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await refreshUserStats();
      const updatedUser = JSON.parse(localStorage.getItem('pdf_user') || '{}');
      setUser(updatedUser);
    } catch (err) {
      alert(`Error generating PDF: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Handle file upload and conversion
  // ============================================================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      alert('Please select a file first.');
      return;
    }
    setUploading(true);
    try {
      const pdfBlob = await apiUploadDocument(uploadedFile);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = uploadedFile.name.replace(/\.[^.]+$/, '') + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await refreshUserStats();
      const updatedUser = JSON.parse(localStorage.getItem('pdf_user') || '{}');
      setUser(updatedUser);
    } catch (err) {
      alert(`Error converting document: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ============================================================
  // Utility Functions
  // ============================================================
  const handleLogout = () => {
    apiLogout();
    navigate('/pdf/login');
  };

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      // Ideally replace this with a modern toast notification in the future
      alert('API key copied to clipboard!'); 
    }
  };

  const displayApiKey = apiKey || 'No API key found';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Document Engine</h1>
                <p className="text-xs font-medium text-slate-500">{user?.email || 'Authenticated User'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-4 border-r border-slate-200 pr-4 mr-2">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Conversions</span>
                  <span className="text-sm font-bold text-slate-700">{user?.total_conversions || 0}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Uploads</span>
                  <span className="text-sm font-bold text-slate-700">{user?.total_uploads || 0}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* ============================================================
              LEFT COLUMN: PRIMARY WORKSPACE
              ============================================================ */}
          <div className="lg:col-span-8 space-y-8">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-800">Generate PDF from Data</h2>
                <p className="text-sm text-slate-500 mt-1">Select a template or write raw HTML to compile a new document.</p>
              </div>

              <div className="p-6">
                <form onSubmit={handleGenerate} className="space-y-6">
                  {/* Template selection & Filename row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Template Strategy
                      </label>
                      <select
                        value={templateSlug}
                        onChange={(e) => setTemplateSlug(e.target.value)}
                        className="block w-full rounded-lg border-slate-300 bg-slate-50 py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        disabled={templatesLoading}
                      >
                        <option value="">-- Manual HTML Input --</option>
                        {Array.isArray(templates) &&
                          templates.map((t) => (
                            <option key={t.slug || t.id} value={t.slug}>
                              {t.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Output Filename
                      </label>
                      <input
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        className="block w-full rounded-lg border-slate-300 bg-slate-50 py-2.5 px-3 text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        placeholder="report_2024.pdf"
                      />
                    </div>
                  </div>

                  {/* HTML Content (Only visible if no template selected to reduce clutter) */}
                  <div className={`transition-all duration-300 ${templateSlug ? 'opacity-50 pointer-events-none hidden' : 'block'}`}>
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-sm font-semibold text-slate-700">HTML Structure</label>
                      <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">{'{{ variable }}'}</span>
                    </div>
                    <textarea
                      value={html}
                      onChange={(e) => setHtml(e.target.value)}
                      rows={8}
                      className="block w-full rounded-lg border-slate-300 bg-[#1e1e1e] text-slate-300 p-4 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="<h1>Hello {{ name }}</h1>"
                      disabled={!!templateSlug}
                    />
                  </div>

                  {/* Context & CSS row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Context (JSON)
                      </label>
                      <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        rows={5}
                        className="block w-full rounded-lg border-slate-300 bg-slate-50 p-3 font-mono text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                        placeholder='{"name": "World"}'
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Global CSS
                      </label>
                      <textarea
                        value={css}
                        onChange={(e) => setCss(e.target.value)}
                        rows={5}
                        className="block w-full rounded-lg border-slate-300 bg-slate-50 p-3 font-mono text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="body { font-family: sans-serif; }"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Compiling PDF...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          Generate & Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* ============================================================
              RIGHT COLUMN: UTILITIES & SYSTEM
              ============================================================ */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload Utility Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                <h3 className="font-bold text-slate-800">Quick Convert</h3>
              </div>
              <p className="text-sm text-slate-500 mb-5">
                Transform existing documents to PDF. Accepts <strong>.docx</strong>, <strong>.md</strong>, <strong>.txt</strong>, or <strong>.html</strong>.
              </p>

              <form onSubmit={handleUpload} className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept=".docx,.doc,.md,.markdown,.txt,.text,.html,.htm"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer"
                  />
                </div>

                {uploadedFile && (
                  <div className="bg-slate-50 rounded-md p-3 text-sm flex justify-between items-center border border-slate-100">
                    <span className="truncate max-w-[200px] font-medium text-slate-700">{uploadedFile.name}</span>
                    <span className="text-slate-400 text-xs">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!uploadedFile || uploading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-900 focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Processing...' : 'Convert to PDF'}
                </button>
              </form>
            </div>

            {/* API Identity Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3">API Credentials</h3>
              <p className="text-sm text-slate-500 mb-4">
                Authenticate programmatic requests using the <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-xs font-mono">X-API-Key</code> header.
              </p>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-xs text-slate-600 truncate">
                  {displayApiKey}
                </div>
                <button
                  onClick={copyApiKey}
                  className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors focus:ring-2 focus:ring-indigo-500"
                  title="Copy to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
            </div>

            {/* System Links Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Resources</h3>
              <nav className="space-y-3">
                <a
                  href="https://api.franciscodes.com/admin/pdf_converter/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors group"
                >
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Template Administration
                </a>
                <a
                  href="https://api.franciscodes.com/pdf/api/pdf/generate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors group"
                >
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  REST API Documentation
                </a>
              </nav>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

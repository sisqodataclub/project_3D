// frontend/src/pages/pdf/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGeneratePDF, apiListTemplates, apiLogout, apiUploadDocument } from '../../services/pdfService';

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

  // 🆕 File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('pdf_api_key');
    const storedUser = localStorage.getItem('pdf_user');
    if (!storedKey) {
      navigate('/pdf/login');
      return;
    }
    setApiKey(storedKey);
    setUser(storedUser ? JSON.parse(storedUser) : null);
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let contextData;
      try { contextData = JSON.parse(context); } catch { contextData = {}; }
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
    } catch (err) {
      alert(`Error generating PDF: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiLogout();
    navigate('/pdf/login');
  };

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      alert('API key copied to clipboard!');
    }
  };

  // 🆕 File upload handlers
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
    } catch (err) {
      alert(`Error converting document: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const displayApiKey = apiKey || 'No API key found';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between rounded-lg bg-white p-4 shadow">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PDF Converter</h1>
            <p className="text-sm text-gray-500">
              Logged in as <strong>{user?.email || 'User'}</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyApiKey}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Copy API Key
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* API Key Display */}
        <div className="mb-6 rounded-lg bg-gray-100 p-3 text-sm">
          <span className="font-mono text-gray-700">
            API Key: {displayApiKey.slice(0, 8)}...{displayApiKey.slice(-8)}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* PDF Generator Form */}
          <div className="md:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">Generate PDF from HTML</h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Use stored template (optional)
                  </label>
                  <select
                    value={templateSlug}
                    onChange={(e) => setTemplateSlug(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 p-2"
                    disabled={templatesLoading}
                  >
                    <option value="">-- Use raw HTML instead --</option>
                    {Array.isArray(templates) && templates.map((t) => (
                      <option key={t.slug || t.id} value={t.slug}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    HTML content
                  </label>
                  <textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    rows={6}
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 font-mono text-sm"
                    placeholder="<h1>Hello {{ name }}</h1>"
                    disabled={!!templateSlug}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use {'{{ variable }}'} syntax for dynamic content.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Context data (JSON)
                  </label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 font-mono text-sm"
                    placeholder='{"name": "World"}'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Custom CSS (optional)
                  </label>
                  <textarea
                    value={css}
                    onChange={(e) => setCss(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 font-mono text-sm"
                    placeholder="body { color: red; }"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Filename
                  </label>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="document.pdf"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate PDF'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* 🆕 File Upload Section */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-2 font-semibold">Upload Document</h3>
              <p className="mb-4 text-sm text-gray-600">
                Upload a <strong>.docx</strong>, <strong>.md</strong>, <strong>.txt</strong>, or <strong>.html</strong> file to convert it to PDF.
              </p>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <input
                    type="file"
                    accept=".docx,.doc,.md,.markdown,.txt,.text,.html,.htm"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                {uploadedFile && (
                  <p className="text-sm text-gray-600">
                    Selected: <strong>{uploadedFile.name}</strong> ({(uploadedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!uploadedFile || uploading}
                  className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {uploading ? 'Converting...' : 'Convert to PDF'}
                </button>
              </form>
            </div>

            {/* API Key Info */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-2 font-semibold">Your API Key</h3>
              <p className="text-sm text-gray-600">
                Use this key in the <code className="rounded bg-gray-100 px-1">X-API-Key</code> header
                when calling the PDF API from other apps.
              </p>
              <div className="mt-3 rounded bg-gray-100 p-2 font-mono text-xs break-all">
                {displayApiKey}
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-2 font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://api.franciscodes.com/admin/pdf_converter/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    Manage Templates (Admin)
                  </a>
                </li>
                <li>
                  <a
                    href="https://api.franciscodes.com/pdf/api/pdf/generate/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    API Documentation
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

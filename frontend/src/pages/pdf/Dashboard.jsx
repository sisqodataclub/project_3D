import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGeneratePDF, apiListTemplates, apiLogout } from '../../services/pdfService';

export default function PDFDashboard() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [user, setUser] = useState(null);
  const [templates, setTemplates] = useState([]); // ✅ Always an array
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // Form state
  const [html, setHtml] = useState('<h1>Hello {{ name }}</h1>');
  const [context, setContext] = useState('{"name": "World"}');
  const [css, setCss] = useState('');
  const [filename, setFilename] = useState('document.pdf');
  const [templateSlug, setTemplateSlug] = useState('');

  // Check authentication
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
      // ✅ Ensure data is always an array
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
      try {
        contextData = JSON.parse(context);
      } catch {
        contextData = {};
      }

      const params = {
        context: contextData,
        filename: filename || 'document.pdf',
      };

      if (templateSlug) {
        params.template_slug = templateSlug;
      } else if (html) {
        params.html = html;
      } else {
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

  // ✅ Guard against null apiKey when displaying
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
          <div className="md:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">Generate PDF</h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Template selection */}
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

                {/* HTML */}
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

                {/* Context JSON */}
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

                {/* Custom CSS */}
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

                {/* Filename */}
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

          <div className="space-y-6">
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

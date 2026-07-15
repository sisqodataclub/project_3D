// frontend/src/pages/pdf/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGeneratePDF, apiListTemplates, apiLogout } from '../../services/pdfService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

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

    // Fetch templates
    fetchTemplates(storedKey);
  }, [navigate]);

  const fetchTemplates = async (key) => {
    setTemplatesLoading(true);
    try {
      const data = await apiListTemplates(key);
      setTemplates(data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
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

      // Download the PDF
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
    navigator.clipboard.writeText(apiKey);
    alert('API key copied to clipboard!');
  };

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
            <Button variant="outline" size="sm" onClick={copyApiKey}>
              Copy API Key
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* API Key Display */}
        <div className="mb-6 rounded-lg bg-gray-100 p-3 text-sm">
          <span className="font-mono text-gray-700">
            API Key: {apiKey?.slice(0, 8)}...{apiKey?.slice(-8)}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* PDF Generator Form */}
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
                    {templates.map((t) => (
                      <option key={t.slug} value={t.slug}>
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
                  <Textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    rows={6}
                    className="mt-1 font-mono text-sm"
                    placeholder="<h1>Hello {{ name }}</h1>"
                    disabled={!!templateSlug}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use {{ variable }} syntax for dynamic content.
                  </p>
                </div>

                {/* Context JSON */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Context data (JSON)
                  </label>
                  <Textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={3}
                    className="mt-1 font-mono text-sm"
                    placeholder='{"name": "World"}'
                  />
                </div>

                {/* Custom CSS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Custom CSS (optional)
                  </label>
                  <Textarea
                    value={css}
                    onChange={(e) => setCss(e.target.value)}
                    rows={3}
                    className="mt-1 font-mono text-sm"
                    placeholder="body { color: red; }"
                  />
                </div>

                {/* Filename */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Filename
                  </label>
                  <Input
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="document.pdf"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate PDF'}
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* API Key Info */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-2 font-semibold">Your API Key</h3>
              <p className="text-sm text-gray-600">
                Use this key in the <code className="rounded bg-gray-100 px-1">X-API-Key</code> header
                when calling the PDF API from other apps.
              </p>
              <div className="mt-3 rounded bg-gray-100 p-2 font-mono text-xs break-all">
                {apiKey}
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
                    className="text-blue-600 hover:underline"
                  >
                    Manage Templates (Admin)
                  </a>
                </li>
                <li>
                  <a
                    href="https://api.franciscodes.com/pdf/api/pdf/generate/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
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

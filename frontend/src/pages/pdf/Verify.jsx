// frontend/src/pages/pdf/Verify.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiVerifyLogin } from '../../services/pdfService';

export default function PDFVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setStatus('error');
      setError('No verification code provided.');
      return;
    }

    const verify = async () => {
      try {
        const result = await apiVerifyLogin(code);

        // Store the API key and user info
        localStorage.setItem('pdf_api_key', result.user.api_key);
        localStorage.setItem('pdf_user', JSON.stringify(result.user));

        setStatus('success');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/pdf/dashboard');
        }, 1500);
      } catch (err) {
        setStatus('error');
        setError(err.message || 'Failed to verify login link.');
      }
    };

    verify();
  }, [searchParams, navigate]);

  if (status === 'verifying') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <h2 className="text-xl font-semibold text-gray-700">Verifying your login...</h2>
          <p className="mt-2 text-sm text-gray-500">Please wait while we log you in.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-6xl">✅</div>
          <h2 className="text-2xl font-bold text-green-600">Login successful!</h2>
          <p className="mt-2 text-gray-600">Redirecting you to the dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h2 className="text-2xl font-bold text-red-600">Verification failed</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/pdf/login')}
            className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

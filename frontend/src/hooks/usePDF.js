// frontend/src/hooks/usePDF.js
import { useState } from 'react';
import { apiGeneratePDF } from '../services/pdfService';

export const usePDF = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  const generatePDF = async (params) => {
    setLoading(true);
    setError(null);
    setPdfBlob(null);

    try {
      const blob = await apiGeneratePDF(params);
      setPdfBlob(blob);
      return blob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (blob, filename = 'document.pdf') => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { generatePDF, downloadPDF, loading, error, pdfBlob };
};

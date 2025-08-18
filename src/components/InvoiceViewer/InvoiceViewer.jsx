import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../config/api';
import './InvoiceViewer.css';

const InvoiceViewer = ({ orderId, onClose }) => {
  const { i18n } = useTranslation();
  const [invoiceHTML, setInvoiceHTML] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchInvoiceHTML();
    }
  }, [orderId, i18n.language]);

  const fetchInvoiceHTML = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(
        `${API_ENDPOINTS.ORDER_INVOICE(orderId)}?lang=${i18n.language}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInvoiceHTML(data.data.html);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Create a new window with the invoice HTML
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleDownload = () => {
    // Open invoice in new tab for download/save
    const newWindow = window.open('', '_blank');
    newWindow.document.write(invoiceHTML);
    newWindow.document.close();
  };

  if (loading) {
    return (
      <div className="invoice-viewer-overlay">
        <div className="invoice-viewer-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{i18n.language === 'ar' ? 'جاري تحميل الفاتورة...' : 'Loading invoice...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-viewer-overlay">
        <div className="invoice-viewer-content">
          <div className="error-message">
            <h3>{i18n.language === 'ar' ? 'خطأ' : 'Error'}</h3>
            <p>{error}</p>
            <button onClick={onClose} className="close-btn">
              {i18n.language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-viewer-overlay">
      <div className="invoice-viewer-content">
        <div className="invoice-viewer-header">
          <h3>{i18n.language === 'ar' ? 'معاينة الفاتورة' : 'Invoice Preview'}</h3>
          <div className="invoice-actions">
            <button onClick={handlePrint} className="print-btn">
              {i18n.language === 'ar' ? 'طباعة' : 'Print'}
            </button>
            <button onClick={handleDownload} className="download-btn">
              {i18n.language === 'ar' ? 'تحميل' : 'Download'}
            </button>
            <button onClick={onClose} className="close-btn">
              {i18n.language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
        
        <div className="invoice-frame-container">
          <iframe
            srcDoc={invoiceHTML}
            title="Invoice Preview"
            className="invoice-frame"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewer;

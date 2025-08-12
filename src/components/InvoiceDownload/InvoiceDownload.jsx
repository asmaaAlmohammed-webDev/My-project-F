import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaDownload, FaEye, FaFileInvoiceDollar } from 'react-icons/fa';
import invoiceService from '../../services/invoiceService';
import './InvoiceDownload.css';

const InvoiceDownload = ({ orderId, orderNumber, className = '', showPreview = true }) => {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError('');
      
      await invoiceService.triggerDownload(orderId);
      
      // Show success message (optional)
      console.log('Invoice downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      setError(t('failedDownloadInvoice') || 'Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setError('');
      await invoiceService.openPreview(orderId);
    } catch (err) {
      console.error('Preview error:', err);
      setError(t('failedPreviewInvoice') || 'Failed to preview invoice');
    }
  };

  return (
    <div className={`invoice-download ${className}`}>
      {error && (
        <div className="invoice-error">
          <small>{error}</small>
        </div>
      )}
      
      <div className="invoice-actions">
        {showPreview && (
          <button
            onClick={handlePreview}
            className="btn btn-preview"
            title={t('previewInvoice') || 'Preview Invoice'}
          >
            <FaEye />
            <span>{t('preview') || 'Preview'}</span>
          </button>
        )}
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn btn-download"
          title={t('downloadInvoice') || 'Download Invoice'}
        >
          {downloading ? (
            <>
              <div className="spinner"></div>
              <span>{t('downloading') || 'Downloading...'}</span>
            </>
          ) : (
            <>
              <FaDownload />
              <span>{t('downloadInvoice') || 'Download Invoice'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InvoiceDownload;

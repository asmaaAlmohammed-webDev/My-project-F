import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaDownload, FaFileInvoiceDollar } from 'react-icons/fa';
import invoiceService from '../../services/invoiceService';
import './InvoiceDownload.css';

const InvoiceDownload = ({ orderId, orderNumber, className = '' }) => {
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

  return (
    <div className={`invoice-download ${className}`}>
      {error && (
        <div className="invoice-error">
          <small>{error}</small>
        </div>
      )}
      
      <div className="invoice-actions">
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

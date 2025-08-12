import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

class InvoiceService {
  /**
   * Download invoice PDF for an order
   * @param {string} orderId - Order ID
   * @returns {Promise<Blob>} PDF blob
   */
  async downloadInvoice(orderId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${API_ENDPOINTS.ORDERS}/${orderId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob', // Important for PDF download
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  }

  /**
   * Get invoice preview URL
   * @param {string} orderId - Order ID
   * @returns {string} Preview URL
   */
  getInvoicePreviewUrl(orderId) {
    const token = localStorage.getItem('token');
    return `${API_ENDPOINTS.ORDERS}/${orderId}/invoice/preview`;
  }

  /**
   * Trigger download of invoice PDF
   * @param {string} orderId - Order ID
   * @param {string} filename - Optional filename
   */
  async triggerDownload(orderId, filename = null) {
    try {
      const pdfBlob = await this.downloadInvoice(orderId);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `invoice-${orderId.slice(-8).toUpperCase()}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  /**
   * Open invoice preview in new tab
   * @param {string} orderId - Order ID
   */
  async openPreview(orderId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Instead of opening a direct URL, we'll fetch the HTML content and open it in a new window
      const response = await axios.get(
        `${API_ENDPOINTS.ORDERS}/${orderId}/invoice/preview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Open a new window and write the HTML content
      const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
      if (newWindow) {
        newWindow.document.write(response.data);
        newWindow.document.close();
      } else {
        throw new Error('Popup blocked or failed to open');
      }
    } catch (error) {
      console.error('Preview error:', error);
      throw error;
    }
  }
}

export default new InvoiceService();

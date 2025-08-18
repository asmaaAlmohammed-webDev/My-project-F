import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import jsPDF from 'jspdf';

class InvoiceService {
  /**
   * Generate professional PDF from order data using jsPDF
   * @param {Object} orderData - Order data from API
   * @returns {Promise<void>} Downloads the PDF
   */
  async generateAndDownloadPDF(orderData) {
    try {
      console.log('Generating PDF with order data:', orderData);
      
      if (!orderData) {
        throw new Error('Order data is required');
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Set default font
      pdf.setFont('helvetica');

      // Helper function to add text with word wrapping
      const addText = (text, x, y, options = {}) => {
        const {
          fontSize = 10,
          fontStyle = 'normal',
          color = [0, 0, 0],
          maxWidth = pageWidth - 2 * margin,
          align = 'left'
        } = options;

        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(color[0], color[1], color[2]);

        // Convert to string and handle null/undefined
        const textStr = String(text || '');
        
        if (maxWidth && textStr.length > 0) {
          try {
            const lines = pdf.splitTextToSize(textStr, maxWidth);
            lines.forEach((line, index) => {
              const adjustedX = align === 'center' ? pageWidth / 2 : 
                              align === 'right' ? pageWidth - margin : x;
              pdf.text(line, adjustedX, y + (index * fontSize * 0.4), { align });
            });
            return y + (lines.length * fontSize * 0.4) + 3;
          } catch (error) {
            // Fallback for any text processing errors
            const adjustedX = align === 'center' ? pageWidth / 2 : 
                            align === 'right' ? pageWidth - margin : x;
            pdf.text(textStr, adjustedX, y, { align });
            return y + fontSize * 0.4 + 3;
          }
        } else {
          const adjustedX = align === 'center' ? pageWidth / 2 : 
                          align === 'right' ? pageWidth - margin : x;
          pdf.text(textStr, adjustedX, y, { align });
          return y + fontSize * 0.4 + 3;
        }
      };

      // Helper function to draw a line
      const drawLine = (x1, y1, x2, y2, color = [0, 0, 0], width = 0.5) => {
        pdf.setDrawColor(color[0], color[1], color[2]);
        pdf.setLineWidth(width);
        pdf.line(x1, y1, x2, y2);
      };

      // Helper function to draw a rectangle
      const drawRect = (x, y, width, height, fillColor = null, borderColor = [0, 0, 0]) => {
        pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        if (fillColor) {
          pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
          pdf.rect(x, y, width, height, 'FD');
        } else {
          pdf.rect(x, y, width, height);
        }
      };

      // Start with invoice title (no company header to save space)
      yPosition = 20;
      yPosition = addText('INVOICE', pageWidth / 2, yPosition, {
        fontSize: 28,
        fontStyle: 'bold',
        color: [142, 68, 173],
        align: 'center'
      });

      // Invoice details box
      const invoiceBoxY = yPosition + 5;
      drawRect(pageWidth - 70, invoiceBoxY, 50, 25, [248, 248, 248], [142, 68, 173]);

      const orderId = orderData._id || orderData.id || 'UNKNOWN';
      const invoiceNumber = `INV-${orderId.toString().slice(-8).toUpperCase()}`;
      const invoiceDate = new Date(orderData.createdAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      yPosition = invoiceBoxY + 6;
      yPosition = addText(`# ${invoiceNumber}`, pageWidth - 68, yPosition, {
        fontSize: 9,
        fontStyle: 'bold'
      });
      yPosition = addText(invoiceDate, pageWidth - 68, yPosition, { fontSize: 8 });
      yPosition = addText((orderData.status || 'PENDING').toUpperCase(), pageWidth - 68, yPosition, {
        fontSize: 8,
        fontStyle: 'bold',
        color: orderData.status === 'done' ? [39, 174, 96] : [241, 196, 15]
      });

      // Company details (compact)
      yPosition = invoiceBoxY;
      yPosition = addText('Book Store Inc.', margin, yPosition, {
        fontSize: 12,
        fontStyle: 'bold',
        color: [142, 68, 173]
      });
      yPosition = addText('123 Book Street, Reading City', margin, yPosition, {
        fontSize: 8,
        color: [100, 100, 100]
      });
      yPosition = addText('Phone: +1 (555) 123-4567', margin, yPosition, {
        fontSize: 8,
        color: [100, 100, 100]
      });

      // Customer section
      yPosition += 10;
      drawLine(margin, yPosition, pageWidth - margin, yPosition, [142, 68, 173], 1);
      yPosition += 8;

      // Customer info section with proper layout
      const customerSectionY = yPosition;
      yPosition = addText('BILL TO:', margin, yPosition, {
        fontSize: 11,
        fontStyle: 'bold',
        color: [142, 68, 173]
      });

      yPosition = addText(orderData.userId?.name || 'Customer', margin, yPosition, {
        fontSize: 11,
        fontStyle: 'bold'
      });
      yPosition = addText(orderData.userId?.email || 'No email provided', margin, yPosition, {
        fontSize: 9,
        color: [100, 100, 100]
      });
      yPosition = addText(orderData.userId?.phone || 'No phone provided', margin, yPosition, {
        fontSize: 9,
        color: [100, 100, 100]
      });

      // Shipping address (if available) - positioned on the right, only if data exists
      if (orderData.address && (orderData.address.street || orderData.address.region || orderData.address.descreption)) {
        const shipToY = customerSectionY;
        addText('SHIP TO:', pageWidth - 80, shipToY, {
          fontSize: 11,
          fontStyle: 'bold',
          color: [142, 68, 173]
        });
        
        let shipYPos = shipToY + 12;
        if (orderData.address.street) {
          addText(orderData.address.street, pageWidth - 80, shipYPos, {
            fontSize: 9,
            maxWidth: 70
          });
          shipYPos += 10;
        }
        if (orderData.address.region) {
          addText(orderData.address.region, pageWidth - 80, shipYPos, {
            fontSize: 9,
            maxWidth: 70
          });
          shipYPos += 10;
        }
        if (orderData.address.descreption) {
          addText(orderData.address.descreption, pageWidth - 80, shipYPos, {
            fontSize: 9,
            maxWidth: 70
          });
        }
      }

      yPosition += 8;

      // Items table header
      const tableStartY = yPosition;
      const tableHeight = 10;
      
      // Table header background
      drawRect(margin, tableStartY, pageWidth - 2 * margin, tableHeight, [142, 68, 173]);

      // Table headers with proper spacing
      yPosition = tableStartY + 7;
      addText('ITEM', margin + 2, yPosition, {
        fontSize: 10,
        fontStyle: 'bold',
        color: [255, 255, 255]
      });
      addText('QTY', margin + 90, yPosition, {
        fontSize: 10,
        fontStyle: 'bold',
        color: [255, 255, 255]
      });
      addText('PRICE', margin + 120, yPosition, {
        fontSize: 10,
        fontStyle: 'bold',
        color: [255, 255, 255]
      });
      addText('TOTAL', pageWidth - margin - 30, yPosition, {
        fontSize: 10,
        fontStyle: 'bold',
        color: [255, 255, 255],
        align: 'right'
      });

      yPosition = tableStartY + tableHeight + 2;

      // Table items with simple layout
      let subtotal = 0;
      const cartItems = orderData.cart || [];

      cartItems.forEach((item, index) => {
        const itemPrice = item.price || 0;
        const itemAmount = item.amount || 0;
        const itemTotal = itemPrice * itemAmount;
        subtotal += itemTotal;

        const rowHeight = 14;
        const currentRowY = yPosition;

        // Item name
        const itemName = item.productId?.name || item.name || 'Product';
        addText(itemName, margin + 2, currentRowY + 4, {
          fontSize: 9,
          fontStyle: 'bold'
        });

        // Quantities and prices with proper spacing
        addText(String(itemAmount), margin + 90, currentRowY + 6, {
          fontSize: 9
        });
        addText(`$${itemPrice.toFixed(2)}`, margin + 120, currentRowY + 6, {
          fontSize: 9
        });
        addText(`$${itemTotal.toFixed(2)}`, pageWidth - margin - 30, currentRowY + 6, {
          fontSize: 9,
          fontStyle: 'bold',
          align: 'right'
        });

        yPosition += rowHeight;
      });

      // Simple box around all products
      const tableEndY = yPosition;
      // Top border (already exists as header background)
      // Left border
      drawLine(margin, tableStartY, margin, tableEndY, [142, 68, 173], 1);
      // Right border  
      drawLine(pageWidth - margin, tableStartY, pageWidth - margin, tableEndY, [142, 68, 173], 1);
      // Bottom border
      drawLine(margin, yPosition, pageWidth - margin, yPosition, [142, 68, 173], 1);
      yPosition += 8;

      // Totals section - compact and properly aligned
      const totalsX = pageWidth - 60;
      const tax = subtotal * 0.1;
      const total = orderData.total || subtotal + tax;

      yPosition = addText('Subtotal:', totalsX - 25, yPosition, { fontSize: 10 });
      addText(`$${subtotal.toFixed(2)}`, pageWidth - margin, yPosition - 3, {
        fontSize: 10,
        align: 'right'
      });

      yPosition = addText('Tax (10%):', totalsX - 25, yPosition + 2, { fontSize: 10 });
      addText(`$${tax.toFixed(2)}`, pageWidth - margin, yPosition - 3, {
        fontSize: 10,
        align: 'right'
      });

      // Total line
      drawLine(totalsX - 25, yPosition + 1, pageWidth - margin, yPosition + 1, [0, 0, 0], 1);
      yPosition += 6;

      yPosition = addText('TOTAL:', totalsX - 25, yPosition, {
        fontSize: 12,
        fontStyle: 'bold',
        color: [142, 68, 173]
      });
      addText(`$${total.toFixed(2)}`, pageWidth - margin, yPosition - 3, {
        fontSize: 12,
        fontStyle: 'bold',
        color: [142, 68, 173],
        align: 'right'
      });

      // Payment information - compact
      yPosition += 12;
      drawLine(margin, yPosition, pageWidth - margin, yPosition, [200, 200, 200], 0.5);
      yPosition += 6;

      yPosition = addText('PAYMENT INFORMATION', margin, yPosition, {
        fontSize: 10,
        fontStyle: 'bold',
        color: [142, 68, 173]
      });

      yPosition = addText(`Payment Method: ${(orderData.methodePayment === 'cash') ? 'Cash on Delivery' : 'Bank Transfer'}`, 
                         margin, yPosition + 2, { fontSize: 9 });
      yPosition = addText(`Order ID: ${orderId}`, margin, yPosition + 2, { fontSize: 9 });

      // Footer - compact
      yPosition += 8;
      drawLine(margin, yPosition, pageWidth - margin, yPosition, [200, 200, 200], 0.5);
      
      addText('Thank you for your business!', pageWidth / 2, yPosition + 6, {
        fontSize: 10,
        fontStyle: 'bold',
        color: [142, 68, 173],
        align: 'center'
      });
      addText('This is a computer-generated invoice. No signature required.', pageWidth / 2, yPosition + 12, {
        fontSize: 8,
        color: [100, 100, 100],
        align: 'center'
      });

      // Download the PDF
      const filename = `invoice-${orderId.toString().slice(-8).toUpperCase()}.pdf`;
      console.log('Downloading PDF:', filename);
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Download invoice by fetching order data and generating PDF in frontend
   * @param {string} orderId - Order ID
   */
  async downloadInvoice(orderId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Fetching order data for invoice generation...');

      // Fetch order data instead of PDF
      const response = await axios.get(
        `${API_ENDPOINTS.ORDERS}/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Order response:', response.data);

      // The API returns data in response.data.doc format
      const orderData = response.data.doc || response.data.data || response.data;
      
      if (!orderData) {
        throw new Error('No order data received');
      }

      console.log('Order data for PDF generation:', orderData);

      // Generate PDF in frontend
      await this.generateAndDownloadPDF(orderData);
      
      return true;
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  }

  /**
   * Trigger download of invoice PDF (using frontend generation)
   * @param {string} orderId - Order ID
   */
  async triggerDownload(orderId) {
    try {
      return await this.downloadInvoice(orderId);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }
}

export default new InvoiceService();

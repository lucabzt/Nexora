// src/utils/pdfDownload.js
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

/**
 * Downloads a React component/HTML element as PDF
 * @param {HTMLElement} element - The DOM element to convert to PDF
 * @param {string} filename - The filename for the downloaded PDF
 * @param {Object} options - Additional options for PDF generation
 */
export const downloadElementAsPDF = async (element, filename = 'chapter-content.pdf', options = {}) => {
  if (!element) {
    console.error('Element not found for PDF generation');
    return;
  }

  try {
    // Default options
    const defaultOptions = {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      ...options
    };

    // Generate canvas from HTML element
    const canvas = await html2canvas(element, defaultOptions);

    // Get canvas dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add the first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the PDF
    pdf.save(filename);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Downloads chapter content as PDF with proper formatting
 * @param {HTMLElement} contentElement - The chapter content element
 * @param {string} chapterTitle - The chapter title for filename
 */
export const downloadChapterContentAsPDF = async (contentElement, chapterTitle = 'Chapter') => {
  if (!contentElement) {
    throw new Error('Content element not found');
  }

  // Sanitize filename
  const sanitizedTitle = chapterTitle
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50);

  const filename = `${sanitizedTitle}_content.pdf`;

  // PDF generation options optimized for chapter content
  const options = {
    scale: 1.5, // Good balance between quality and file size
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: contentElement.scrollWidth,
    height: contentElement.scrollHeight,
    scrollX: 0,
    scrollY: 0
  };

  return await downloadElementAsPDF(contentElement, filename, options);
};

/**
 * Prepares element for PDF generation by temporarily adjusting styles
 * @param {HTMLElement} element - The element to prepare
 * @returns {Function} - Cleanup function to restore original styles
 */
export const prepareElementForPDF = (element) => {
  if (!element) return () => {};

  // Store original styles
  const originalStyles = {
    maxHeight: element.style.maxHeight,
    overflow: element.style.overflow,
    boxShadow: element.style.boxShadow,
    border: element.style.border
  };

  // Apply PDF-friendly styles
  element.style.maxHeight = 'none';
  element.style.overflow = 'visible';
  element.style.boxShadow = 'none';
  element.style.border = 'none';

  // Return cleanup function
  return () => {
    Object.keys(originalStyles).forEach(key => {
      if (originalStyles[key] !== null) {
        element.style[key] = originalStyles[key];
      } else {
        element.style.removeProperty(key);
      }
    });
  };
};
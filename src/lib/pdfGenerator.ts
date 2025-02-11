import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generatePDF(elementId: string, fileName: string) {
  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    // Force desktop-like width for consistent rendering
    const originalWidth = element.style.width;
    element.style.width = '1024px';

    // Add print class to body during PDF generation
    document.body.classList.add('print');

    // Create canvas with optimized settings
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024, // Force desktop width
      width: 1024,
      height: element.offsetHeight,
      // Improve text rendering
      letterRendering: true,
      // Ensure proper font rendering
      allowTaint: true,
      removeContainer: true,
      // Optimize for text
      scrollX: 0,
      scrollY: 0,
      // Honor print styles
      onclone: (clonedDoc) => {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .print\\:hidden {
              display: none !important;
            }
            .screen\\:block {
              display: none !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          .print\\:hidden {
            display: none !important;
          }
          .screen\\:block {
            display: none !important;
          }
        `;
        clonedDoc.head.appendChild(styleSheet);

        // Force desktop-like styling on the clone
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.width = '1024px';
          clonedElement.style.margin = '0 auto';
          clonedElement.style.padding = '0';
          clonedElement.style.boxSizing = 'border-box';
        }
      }
    });

    // Restore original width
    element.style.width = originalWidth;

    // Remove print class after canvas generation
    document.body.classList.remove('print');

    // Create PDF (A4 format)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      hotfixes: ['px_scaling']
    });

    // Get dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate margins and content area
    const margin = 10; // Reduced margins for better space usage
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Calculate scale to fit content while maintaining aspect ratio
    const canvasAspectRatio = canvas.height / canvas.width;
    const maxContentAspectRatio = contentHeight / contentWidth;

    let finalWidth = contentWidth;
    let finalHeight = contentWidth * canvasAspectRatio;

    if (canvasAspectRatio > maxContentAspectRatio) {
      finalHeight = contentHeight;
      finalWidth = contentHeight / canvasAspectRatio;
    }

    // Center content horizontally
    const xOffset = margin + (contentWidth - finalWidth) / 2;

    // Add image with high quality
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      xOffset,
      margin,
      finalWidth,
      finalHeight,
      undefined,
      'FAST'
    );

    // Save PDF
    pdf.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}
import html2pdf from 'html2pdf.js';

export function generatePDF({ element, fileName = 'document.pdf', options = {} }) {
  const defaultOpts = {
    margin:       0.5,
    filename:     fileName,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
    ...options
  };
  return html2pdf().from(element).set(defaultOpts).save();
}

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Semester, GradingSystem } from '../types/calculator';

export const exportToPdf = (
  cgpa: number, 
  semesters: Semester[], 
  gradingSystem: GradingSystem,
  collegeName?: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Primary Blue
  doc.text('V-CGPA Academic Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Muted
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

  // College Info
  if (collegeName) {
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // Foreground
    doc.text(`Institution: ${collegeName}`, 14, 42);
  }

  // Final Score Card
  doc.setDrawColor(226, 232, 240); // Border
  doc.setFillColor(248, 250, 252); // Background
  doc.roundedRect(14, 50, pageWidth - 28, 40, 4, 4, 'FD');

  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  doc.text('FINAL CUMULATIVE GPA', 24, 65);

  doc.setFontSize(36);
  doc.setTextColor(15, 23, 42);
  doc.text(cgpa.toFixed(2), 24, 82);
  
  doc.setFontSize(16);
  doc.setTextColor(100, 116, 139);
  doc.text(`/ ${gradingSystem === '10-point' ? '10.00' : '4.00'}`, 65, 82);

  // Breakdown Table
  const tableData = semesters.map(s => [
    s.name,
    s.totalCredits?.toString() || '0',
    s.sgpa?.toFixed(2) || '0.00'
  ]);

  autoTable(doc, {
    startY: 100,
    head: [['Semester', 'Total Credits', 'SGPA']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 100 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Validated by V-CGPA Smart Engine',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`CGPA_Report_${new Date().getTime()}.pdf`);
};

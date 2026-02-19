import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Export all tasks to PDF (simple version)
export const exportTasksToPDF = (tasks) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('1A-genda Task Report', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${date}`, 14, 28);
  doc.text(`Total Tasks: ${tasks.length}`, 14, 34);

  let yPos = 45;

  tasks.forEach((task, index) => {
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    // Task number
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${task.title || 'Untitled'}`, 14, yPos);
    yPos += 7;

    // Task details
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);

    const dueDate = task.dueDate
      ? (task.dueDate.toDate ? task.dueDate.toDate().toLocaleDateString() : new Date(task.dueDate).toLocaleDateString())
      : 'No due date';

    doc.text(`Subject: ${task.subject || 'N/A'}  |  Batch: ${task.batch || 'All'}  |  Priority: ${task.priority || 'N/A'}  |  Due: ${dueDate}`, 14, yPos);
    yPos += 6;

    // Description
    if (task.description) {
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(task.description, 180);
      doc.text(lines, 14, yPos);
      yPos += (lines.length * 5) + 8;
    } else {
      yPos += 8;
    }
  });

  // Save PDF
  doc.save(`tasks_export_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export student progress to PDF
export const exportStudentProgressToPDF = (studentData, tasks, progressData) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const studentName = studentData.displayName || studentData.email || 'Student';
  const studentBatch = studentData.batch || 'N/A';

  // Calculate stats
  const completedTasks = progressData.filter(p => p.status === 'done').length;
  const totalTasks = tasks.filter(t => !t.batch || t.batch === 'all' || t.batch === studentBatch).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('1A-genda Student Progress Report', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Student: ${studentName}`, 14, 32);
  doc.text(`Batch: ${studentBatch}`, 14, 40);
  doc.text(`Report Date: ${date}`, 14, 48);

  // Summary box
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.rect(14, 55, 180, 25);

  doc.setFontSize(10);
  doc.text(`Completion Rate: ${completionRate}%`, 20, 63);
  doc.text(`Completed Tasks: ${completedTasks}`, 20, 70);
  doc.text(`Total Tasks: ${totalTasks}`, 20, 77);

  // Task breakdown table
  const taskBreakdown = progressData.map(progress => {
    const task = tasks.find(t => t.id === progress.taskId);
    if (!task) return null;

    const dueDate = task.dueDate
      ? (task.dueDate.toDate ? task.dueDate.toDate().toLocaleDateString() : new Date(task.dueDate).toLocaleDateString())
      : 'N/A';

    return [
      task.title || 'Untitled',
      task.subject || 'N/A',
      progress.status === 'done' ? '✓ Completed' : '◯ To Do',
      dueDate
    ];
  }).filter(Boolean);

  if (taskBreakdown.length > 0) {
    doc.autoTable({
      startY: 88,
      head: [['Task', 'Subject', 'Status', 'Due Date']],
      body: taskBreakdown,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255]
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }

  const fileName = `student_progress_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Export announcements to PDF
export const exportAnnouncementsToPDF = (announcements) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('1A-genda Announcements', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${date}`, 14, 28);
  doc.text(`Total Announcements: ${announcements.length}`, 14, 34);

  let yPosition = 45;
  const pageHeight = doc.internal.pageSize.height;
  const marginBottom = 25;

  announcements.forEach((announcement) => {
    // Type badge color
    let typeColor = [59, 130, 246]; // Blue for info
    if (announcement.type === 'urgent') typeColor = [239, 68, 68]; // Red
    if (announcement.type === 'celebration') typeColor = [34, 197, 94]; // Green

    // Calculate space needed with proper text wrapping (max width: 165 for content area)
    const maxWidth = 165; // Reduced from 180 to add more right margin
    const titleLines = doc.splitTextToSize(announcement.title, 135); // Reduced from 150
    const messageLines = doc.splitTextToSize(announcement.message, maxWidth);
    const spaceNeeded = 15 + (titleLines.length * 6) + (messageLines.length * 5.5) + 15;

    // Check if we need a new page
    if (yPosition + spaceNeeded > pageHeight - marginBottom) {
      doc.addPage();
      yPosition = 20;
    }

    // Type badge
    doc.setFillColor(...typeColor);
    doc.roundedRect(14, yPosition - 4, 22, 7, 1, 1, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text(announcement.type.toUpperCase(), 25, yPosition + 1, { align: 'center' });

    // Title (multi-line support with word wrap)
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(titleLines, 40, yPosition);

    // Date
    const announcementDate = announcement.createdAt
      ? (announcement.createdAt.toDate ? announcement.createdAt.toDate().toLocaleDateString() : new Date(announcement.createdAt).toLocaleDateString())
      : date;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text(announcementDate, 180, yPosition, { align: 'right' }); // Adjusted from 190 to 180

    // Message (with proper line spacing and wrapping)
    yPosition += (titleLines.length * 6) + 5;
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.setFont(undefined, 'normal');

    // Manually render each line to control spacing better
    messageLines.forEach((line) => {
      if (yPosition > pageHeight - marginBottom) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 14, yPosition);
      yPosition += 5.5; // Consistent line height
    });

    yPosition += 5;

    // Divider (only if not last item on page)
    if (yPosition + 20 < pageHeight - marginBottom) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(14, yPosition, 180, yPosition); // Adjusted from 196 to 180
      yPosition += 12;
    } else {
      yPosition += 5;
    }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }

  doc.save(`announcements_${new Date().toISOString().split('T')[0]}.pdf`);
};

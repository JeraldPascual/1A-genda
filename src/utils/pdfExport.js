import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export all tasks to PDF
export const exportTasksToPDF = (tasks) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text('1A-genda Task Report', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${date}`, 14, 28);
  doc.text(`Total Tasks: ${tasks.length}`, 14, 34);

  // Prepare table data
  const tableData = tasks.map(task => {
    const dueDate = task.dueDate
      ? (task.dueDate.toDate ? task.dueDate.toDate().toLocaleDateString() : new Date(task.dueDate).toLocaleDateString())
      : 'No due date';

    return [
      task.title || 'Untitled',
      task.subject || 'N/A',
      task.batch || 'All',
      task.priority ? task.priority.toUpperCase() : 'N/A',
      dueDate,
      task.description ? (task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description) : 'No description'
    ];
  });

  // Generate table
  doc.autoTable({
    startY: 40,
    head: [['Title', 'Subject', 'Batch', 'Priority', 'Due Date', 'Description']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: 15 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 60 }
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

  announcements.forEach((announcement, index) => {
    // Check if we need a new page
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }

    // Type badge color
    let typeColor = [59, 130, 246]; // Blue for info
    if (announcement.type === 'urgent') typeColor = [239, 68, 68]; // Red
    if (announcement.type === 'celebration') typeColor = [34, 197, 94]; // Green

    // Type badge
    doc.setFillColor(...typeColor);
    doc.rect(14, yPosition - 4, 20, 6, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(announcement.type.toUpperCase(), 24, yPosition, { align: 'center' });

    // Title
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(announcement.title, 38, yPosition);

    // Date
    const announcementDate = announcement.createdAt
      ? (announcement.createdAt.toDate ? announcement.createdAt.toDate().toLocaleDateString() : new Date(announcement.createdAt).toLocaleDateString())
      : date;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text(announcementDate, 190, yPosition, { align: 'right' });

    // Message
    yPosition += 8;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const splitMessage = doc.splitTextToSize(announcement.message, 180);
    doc.text(splitMessage, 14, yPosition);

    yPosition += splitMessage.length * 5 + 10;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 10;
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

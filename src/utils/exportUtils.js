import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from './dateUtils';

export const exportToExcel = (data, filename, sheetName = 'Datos') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToCSV = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (title, headers, data, filename) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Fecha
  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
  
  // Tabla
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  doc.save(`${filename}.pdf`);
};

export const exportReporteToPDF = (reportData, filename) => {
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFontSize(20);
  doc.text('RV Park Manager', 14, 20);
  doc.setFontSize(16);
  doc.text(reportData.titulo, 14, 30);
  
  // Información general
  doc.setFontSize(10);
  let yPos = 40;
  if (reportData.subtitulo) {
    doc.text(reportData.subtitulo, 14, yPos);
    yPos += 8;
  }
  doc.text(`Fecha: ${formatDate(new Date())}`, 14, yPos);
  yPos += 15;
  
  // Tabla principal
  if (reportData.tabla) {
    doc.autoTable({
      head: [reportData.tabla.headers],
      body: reportData.tabla.data,
      startY: yPos,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }
  
  // Resumen o totales
  if (reportData.resumen) {
    doc.setFontSize(12);
    doc.text('Resumen', 14, yPos);
    yPos += 8;
    doc.setFontSize(10);
    reportData.resumen.forEach(item => {
      doc.text(`${item.label}: ${item.value}`, 14, yPos);
      yPos += 6;
    });
  }
  
  doc.save(`${filename}.pdf`);
};

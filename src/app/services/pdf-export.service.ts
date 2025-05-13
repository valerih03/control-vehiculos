import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from '@angular/common';
import { ExportColumn } from '../interfaces/export-column';
@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  constructor() { }
  exportToPDF<T>(
    data: T[],
    columns: ExportColumn<T>[],
    title: string = 'Reporte',
    fileName?: string
  ): void {
    // 1) Crear documento
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // 2) Cabecera
    if (title) {
      doc.setFontSize(14);
      doc.text(title, pageWidth / 2, 15, { align: 'center' });
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const fecha = new Date().toLocaleString();
    doc.text(`Generado: ${fecha}`, pageWidth / 2, 20, { align: 'center' });

    // 3) Preparar head y body para autoTable
    const head = [columns.map(col => col.header)];
    const body = data.map(item =>
      columns.map(col => {
        let value = typeof col.field === 'function'
          ? col.field(item)
          : (item as any)[col.field];

        // Formatear fechas
        if (value instanceof Date) {
          return formatDate(value, 'yyyy-MM-dd', 'en-US');
        }
        return value != null ? value.toString() : '';
      })
    );

    // 4) Opciones de columna (ancho)
    const columnStyles = columns.reduce<Record<number, { cellWidth: number }>>((acc, col, idx) => {
      if (col.width != null) {
        acc[idx] = { cellWidth: col.width };
      }
      return acc;
    }, {});

    // 5) Generar la tabla
    (doc as any).autoTable({
      head,
      body,
      startY: 25,
      margin: { horizontal: 10 },
      styles: {
        fontSize: 7,
        cellPadding: 1,
        overflow: 'linebreak',
        lineWidth: 0.1,
        halign: 'center'
      },
      headStyles: {
        fillColor: [13, 71, 161],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 7
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles
    });

    // 6) Pie de página con numeración
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(6);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 15,
        doc.internal.pageSize.getHeight() - 5
      );
    }

    // 7) Guardar el PDF
    const outName = fileName ?? `reporte_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(outName);
  }
}

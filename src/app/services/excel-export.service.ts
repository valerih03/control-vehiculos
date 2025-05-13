import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ExportColumn } from '../interfaces/export-column';
@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  exportToExcel<T>(
    data: T[],
    columns: ExportColumn<T>[],
    fileName: string = `export_${new Date().toISOString().slice(0,10)}.xlsx`
  ): void {
    if (!data || !data.length) {
      console.warn('ExcelExportService: no hay datos para exportar.');
      return;
    }

    // Construir un array de objetos planos con keys de header
    const sheetData = data.map(item => {
      const row: Record<string, any> = {};
      columns.forEach(col => {
        let value = typeof col.field === 'function'
          ? col.field(item)
          : (item[col.field] as any);
        row[col.header] = value;
      });
      return row;
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(sheetData);

    // Ajustar anchos de columna opcionalmente
    if (columns.some(c => c.width)) {
      ws['!cols'] = columns.map(c => ({ wch: c.width || 10 }));
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  }


}

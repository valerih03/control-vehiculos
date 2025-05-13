import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
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
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Datos');

    // Preparar definición de columnas de la tabla
    const tableColumns = columns.map(col => ({
      name: col.header,
      filterButton: true
    }));

    // Preparar filas de datos (sin cabecera)
    const tableRows = data.map(item =>
      columns.map(col =>
        typeof col.field === 'function'
          ? col.field(item)
          : (item as any)[col.field]
      )
    );

    // Crear la tabla en A1 con estilo y filas alternadas
    ws.addTable({
      name: 'TablaDatos',
      ref: 'A1',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleMedium2',  // cabecera azul + filas rayadas
        showRowStripes: true
      },
      columns: tableColumns,
      rows: tableRows
    });

    // Ajustar ancho de columnas
    columns.forEach((col, idx) => {
      const excelCol = ws.getColumn(idx + 1);
      excelCol.width = col.width ?? col.header.length + 5;
      excelCol.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // Generar y descargar
    wb.xlsx.writeBuffer().then(buffer => {
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
    });
  }

}

import { jsPDF } from 'jspdf';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: AutoTableOptions) => jsPDF;
    }
}

interface AutoTableOptions {
    head?: any[][];
    body?: any[][];
    styles?: any;
    headStyles?: any;
    columnStyles?: any;
    // ... otras opciones que necesites
}

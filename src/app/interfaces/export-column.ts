export interface ExportColumn<T> {
  header: string;
  field: keyof T | ((item: T) => any);
  width?: number;
}

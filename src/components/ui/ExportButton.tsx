'use client';

import React from 'react';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import { Button } from './Button';

interface ExportButtonProps {
  data: any[];
  fileName: string;
  sheetName?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  fileName,
  sheetName = 'Sheet1',
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const handleExport = () => {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      // Generate the file name with .xlsx extension
      const fullFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
      
      // Write the file
      XLSX.writeFile(workbook, fullFileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Wystąpił błąd podczas eksportowania danych.');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      className={`inline-flex items-center gap-2 ${className}`}
      disabled={!data || data.length === 0}
    >
      <Download size={16} />
      Eksportuj do Excel
    </Button>
  );
};
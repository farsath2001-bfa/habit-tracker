import { useState } from 'react';
import { Download, FileText, FileJson, Printer, FileType } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToCSV, exportToJSON, exportToPDF } from '../../utils/exportUtils';

export default function ExportMenu({ rows }) {
  const [open, setOpen] = useState(false);

  const handleCSV = () => {
    exportToCSV(rows);
    toast.success('CSV report downloaded');
    setOpen(false);
  };

  const handleJSON = () => {
    exportToJSON(rows);
    toast.success('JSON report downloaded');
    setOpen(false);
  };

  const handlePDF = async () => {
    try {
      await exportToPDF(rows);
      toast.success('PDF report downloaded');
    } catch (err) {
      toast.error('Could not generate PDF report');
    }
    setOpen(false);
  };

  const handlePrint = () => {
    setOpen(false);
    window.open('/print-report', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Download size={16} /> Download Report
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="fade-in absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={handleCSV}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FileText size={15} /> Export as CSV
            </button>
            <button
              type="button"
              onClick={handleJSON}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FileJson size={15} /> Export as JSON
            </button>
            <button
              type="button"
              onClick={handlePDF}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FileType size={15} /> Export as PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Printer size={15} /> Printable view
            </button>
          </div>
        </>
      )}
    </div>
  );
}

import Modal from './Modal';
import Spinner from './Spinner';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            danger
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
              : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
          }`}
        >
          <AlertTriangle size={20} />
        </div>
        <p className="pt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-70 ${
            danger ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-md' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
          }`}
        >
          {loading && <Spinner size="xs" tone="white" />}
          {loading ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

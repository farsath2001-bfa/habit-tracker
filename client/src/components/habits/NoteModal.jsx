import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import { formatFriendlyDate } from '../../utils/dateUtils';

const MAX_LENGTH = 500;

/**
 * Small note/journal entry for a single habit + day. Editable for today's
 * entry (readOnly=false); a past day's saved note is shown but locked, same
 * spirit as the grid's completion lock - history isn't rewritable.
 */
export default function NoteModal({ open, onClose, onSave, target, readOnly, saving }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (open) {
      setText(target?.note || '');
    }
  }, [open, target]);

  if (!target) return null;

  const handleSave = () => {
    if (text.length > MAX_LENGTH) {
      toast.error(`Keep it under ${MAX_LENGTH} characters`);
      return;
    }
    onSave(text.trim());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={readOnly ? 'Note' : 'Add a note'}
      maxWidth="max-w-md"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{target.habit.icon}</span>
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {target.habit.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatFriendlyDate(target.dateKey)}
            </p>
          </div>
        </div>

        {readOnly ? (
          <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            {target.note || 'No note for this day.'}
          </p>
        ) : (
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={MAX_LENGTH}
              placeholder="How did it go today? (optional)"
              autoFocus
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {text.length}/{MAX_LENGTH}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving && <Spinner size="xs" tone="white" />}
              {saving ? 'Saving…' : 'Save Note'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
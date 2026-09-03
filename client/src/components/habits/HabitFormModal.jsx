import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import { EMOJI_OPTIONS, COLOR_OPTIONS, FREQUENCY_OPTIONS, CATEGORY_OPTIONS } from '../../utils/constants';
import { WEEKDAY_LABELS } from '../../utils/dateUtils';
import { HABIT_TEMPLATES } from '../../utils/habitTemplates';
import { HabitIcon } from '../../utils/habitIcons';

const emptyForm = {
  name: '',
  description: '',
  icon: EMOJI_OPTIONS[0],
  color: COLOR_OPTIONS[0].value,
  frequency: 'Daily',
  customDays: [],
  startDate: new Date().toISOString().slice(0, 10),
  goal: 1,
  reminderTime: '',
  category: 'Other',
};

export default function HabitFormModal({ open, onClose, onSubmit, initialHabit, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialHabit) {
        setForm({
          name: initialHabit.name || '',
          description: initialHabit.description || '',
          icon: initialHabit.icon || EMOJI_OPTIONS[0],
          color: initialHabit.color || COLOR_OPTIONS[0].value,
          frequency: initialHabit.frequency || 'Daily',
          customDays: initialHabit.customDays || [],
          startDate: initialHabit.startDate
            ? new Date(initialHabit.startDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          goal: initialHabit.goal || 1,
          reminderTime: initialHabit.reminderTime || '',
          category: initialHabit.category || 'Other',
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [open, initialHabit]);

  // Prefills the form from a preset - the user still reviews and can tweak
  // everything before saving, so this never creates a habit by itself.
  const applyTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      name: template.name,
      icon: template.icon,
      color: template.color,
      frequency: template.frequency,
      goal: template.goal,
      category: template.category,
    }));
    setErrors({});
  };

  const toggleCustomDay = (day) => {
    setForm((prev) => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter((d) => d !== day)
        : [...prev.customDays, day].sort(),
    }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Habit name is required';
    if (form.frequency === 'Custom' && form.customDays.length === 0) {
      next.customDays = 'Select at least one day';
    }
    if (!form.goal || form.goal < 1) next.goal = 'Goal must be at least 1';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, goal: Number(form.goal) });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialHabit ? 'Edit Habit' : 'Create New Habit'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {!initialHabit && (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Quick start <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {HABIT_TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors duration-150 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
                >
                  <HabitIcon emoji={t.icon} size={13} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-500/20 ${
              errors.name ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
            }`}
            placeholder="e.g. Drink 2L Water"
          />
          {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-500/20"
            placeholder="Optional details about this habit"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
          <label className="mb-2.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Icon
          </label>
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
            {EMOJI_OPTIONS.map((emoji) => {
              const selected = form.icon === emoji;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm({ ...form, icon: emoji })}
                  aria-pressed={selected}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 ${
                    selected
                      ? 'bg-white text-indigo-600 shadow-sm ring-2 ring-indigo-500 dark:bg-slate-900 dark:text-indigo-400'
                      : 'bg-white/70 text-slate-500 hover:scale-110 hover:bg-white hover:text-slate-700 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <HabitIcon emoji={emoji} size={18} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
          <label className="mb-2.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Color
          </label>
          <div className="flex flex-wrap gap-2.5">
            {COLOR_OPTIONS.map((c) => {
              const selected = form.color === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  title={c.name}
                  aria-pressed={selected}
                  onClick={() => setForm({ ...form, color: c.value })}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    boxShadow: selected
                      ? `0 0 0 2px var(--accent-50, #fff), 0 0 0 4px ${c.value}`
                      : 'none',
                  }}
                >
                  {selected && <Check size={14} strokeWidth={3} className="text-white drop-shadow" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.value}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Frequency
            </label>
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Goal (per day)
            </label>
            <input
              type="number"
              min={1}
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800 dark:text-white ${
                errors.goal ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          </div>
        </div>

        {form.frequency === 'Custom' && (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Repeat on
            </label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleCustomDay(index)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                    form.customDays.includes(index)
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.customDays && <p className="mt-1 text-xs text-rose-500">{errors.customDays}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Start date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Reminder (optional)
            </label>
            <input
              type="time"
              value={form.reminderTime}
              onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting && <Spinner size="xs" tone="white" />}
            {submitting ? 'Saving…' : initialHabit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, ChevronDown, Archive, FileDown, Sprout, PauseCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import * as habitService from '../services/habitService';
import * as completionService from '../services/completionService';
import { getStreakAnalytics } from '../services/analyticsService';
import { getErrorMessage } from '../services/api';
import { toDateKey, monthRangeKeys, daysInMonth, MONTH_LABELS, isHabitScheduledOnDate } from '../utils/dateUtils';
import { CATEGORY_OPTIONS } from '../utils/constants';
import { generateMonthlyReportPdf } from '../utils/monthlyReport';
import HabitGrid from '../components/habits/HabitGrid';
import MonthProgressSummary from '../components/habits/MonthProgressSummary';
import HabitFormModal from '../components/habits/HabitFormModal';
import ArchivedHabitsList from '../components/habits/ArchivedHabitsList';
import NoteModal from '../components/habits/NoteModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { HabitsGridSkeleton } from '../components/common/Skeleton';

const now = new Date();

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [streaks, setStreaks] = useState({ habits: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [year, setYear] = useState(now.getFullYear());

  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [togglingCell, setTogglingCell] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const [noteTarget, setNoteTarget] = useState(null); // { habit, dateKey, note }
  const [noteReadOnly, setNoteReadOnly] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { from, to } = monthRangeKeys(year, month);
      const [habitList, completionList, streakData] = await Promise.all([
        habitService.getHabits(),
        completionService.getCompletions({ from, to }),
        getStreakAnalytics(),
      ]);
      setHabits(habitList);
      setCompletions(completionList);
      setStreaks(streakData);
    } catch (err) {
      const message = getErrorMessage(err, 'Could not load your habits');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Built with local-time dates (not UTC) so each column's dateKey always
  // matches the user's real calendar day - see the note on buildMonthGrid
  // in dateUtils.js for why that matters.
  const days = useMemo(() => {
    const total = daysInMonth(year, month);
    return Array.from({ length: total }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return { day: i + 1, dateKey: toDateKey(d) };
    });
  }, [year, month]);

  // Paused habits are hidden from the active grid/scheduling entirely, but
  // their row and completion history stay in the database untouched.
  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);
  const archivedHabits = useMemo(() => habits.filter((h) => h.archived), [habits]);

  const completionKeysByHabit = useMemo(() => {
    const map = new Map();
    completions.forEach((c) => {
      if (!c.completed) return;
      const key = toDateKey(c.date);
      const id = String(c.habit);
      if (!map.has(id)) map.set(id, new Set());
      map.get(id).add(key);
    });
    return map;
  }, [completions]);

  const streaksByHabit = useMemo(() => {
    const map = new Map();
    (streaks.habits || []).forEach((s) => map.set(String(s.habitId), s));
    return map;
  }, [streaks]);

  const notesByHabit = useMemo(() => {
    const map = new Map();
    completions.forEach((c) => {
      if (!c.note) return;
      const id = String(c.habit);
      const key = toDateKey(c.date);
      if (!map.has(id)) map.set(id, new Map());
      map.get(id).set(key, c.note);
    });
    return map;
  }, [completions]);

  // Overall month progress: aggregated across active habits only (a paused
  // habit shouldn't drag the month's percentage down). Only counts days up
  // to today - future days aren't "missed" yet.
  const monthStats = useMemo(() => {
    const todayKey = toDateKey(new Date());
    let scheduled = 0;
    let completed = 0;
    const perDay = days.map((d) => ({ dateKey: d.dateKey, scheduled: 0, completed: 0 }));
    const perDayIndex = new Map(perDay.map((d, i) => [d.dateKey, i]));
    const perHabit = [];

    activeHabits.forEach((habit) => {
      const completedKeys = completionKeysByHabit.get(String(habit._id)) || new Set();
      let hScheduled = 0;
      let hCompleted = 0;

      days.forEach((d) => {
        if (d.dateKey > todayKey) return;
        if (!isHabitScheduledOnDate(habit, d.dateKey)) return;
        hScheduled += 1;
        scheduled += 1;
        const idx = perDayIndex.get(d.dateKey);
        perDay[idx].scheduled += 1;
        if (completedKeys.has(d.dateKey)) {
          hCompleted += 1;
          completed += 1;
          perDay[idx].completed += 1;
        }
      });

      perHabit.push({
        habit,
        scheduled: hScheduled,
        completed: hCompleted,
        percent: hScheduled === 0 ? 0 : Math.round((hCompleted / hScheduled) * 100),
      });
    });

    const percent = scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
    const topHabit =
      perHabit.filter((p) => p.scheduled > 0).sort((a, b) => b.percent - a.percent)[0] || null;
    const perDayWithPercent = perDay.map((d) => ({
      dateKey: d.dateKey,
      percent: d.scheduled === 0 ? null : Math.round((d.completed / d.scheduled) * 100),
    }));

    return { percent, completed, scheduled, topHabit, perDay: perDayWithPercent, perHabit };
  }, [activeHabits, days, completionKeysByHabit]);

  const filteredHabits = useMemo(() => {
    let list = activeHabits.filter((h) => h.name.toLowerCase().includes(search.trim().toLowerCase()));
    if (frequencyFilter !== 'All') {
      list = list.filter((h) => h.frequency === frequencyFilter);
    }
    if (categoryFilter !== 'All') {
      list = list.filter((h) => (h.category || 'Other') === categoryFilter);
    }
    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'streak') {
        const sa = streaksByHabit.get(String(a._id))?.currentStreak ?? 0;
        const sb = streaksByHabit.get(String(b._id))?.currentStreak ?? 0;
        return sb - sa;
      }
      return 0;
    });
    return list;
  }, [activeHabits, search, frequencyFilter, categoryFilter, sortBy, streaksByHabit]);

  const handleCreate = () => {
    setEditingHabit(null);
    setFormOpen(true);
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editingHabit) {
        await habitService.updateHabit(editingHabit._id, payload);
        toast.success('Habit updated successfully');
      } else {
        await habitService.createHabit(payload);
        toast.success('Habit created successfully');
      }
      setFormOpen(false);
      await loadAll();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save this habit'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await habitService.deleteHabit(deleteTarget._id);
      toast.success('Habit deleted successfully');
      setDeleteTarget(null);
      await loadAll();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete this habit'));
    } finally {
      setDeleting(false);
    }
  };

  const handleArchiveToggle = async (habit, archived) => {
    try {
      await habitService.setHabitArchived(habit._id, archived);
      toast.success(archived ? `"${habit.name}" paused` : `"${habit.name}" restored`);
      await loadAll();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update this habit'));
    }
  };

  const handleToggleDate = async (habit, dateKey) => {
    const cellKey = `${habit._id}:${dateKey}`;
    const completedSet = completionKeysByHabit.get(String(habit._id)) || new Set();
    const nextCompleted = !completedSet.has(dateKey);

    setTogglingCell(cellKey);
    // Optimistic update
    setCompletions((prev) => {
      const others = prev.filter(
        (c) => !(String(c.habit) === String(habit._id) && toDateKey(c.date) === dateKey)
      );
      return [...others, { habit: habit._id, date: dateKey, completed: nextCompleted }];
    });

    try {
      await completionService.upsertCompletion({ habitId: habit._id, date: dateKey, completed: nextCompleted });
      toast.success(nextCompleted ? 'Great job! Habit completed 🎉' : 'Habit marked incomplete');
      const streakData = await getStreakAnalytics();
      setStreaks(streakData);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update this habit'));
      await loadAll();
    } finally {
      setTogglingCell(null);
    }
  };

  const handleEditNote = (habit, dateKey) => {
    const todayKey = toDateKey(new Date());
    const note = notesByHabit.get(String(habit._id))?.get(dateKey) || '';
    setNoteTarget({ habit, dateKey, note });
    setNoteReadOnly(dateKey !== todayKey);
  };

  const handleSaveNote = async (text) => {
    if (!noteTarget) return;
    const { habit, dateKey } = noteTarget;
    const completedSet = completionKeysByHabit.get(String(habit._id)) || new Set();
    setSavingNote(true);
    try {
      // Always pass the current completed status explicitly, so saving a
      // note never accidentally marks (or unmarks) the habit as done.
      await completionService.upsertCompletion({
        habitId: habit._id,
        date: dateKey,
        completed: completedSet.has(dateKey),
        note: text,
      });
      toast.success('Note saved');
      setNoteTarget(null);
      await loadAll();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save this note'));
    } finally {
      setSavingNote(false);
    }
  };

  const goToPrevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); } else { setMonth((m) => m - 1); }
  };
  const goToNextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); } else { setMonth((m) => m + 1); }
  };

  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    try {
      await generateMonthlyReportPdf({
        monthLabel: MONTH_LABELS[month],
        year,
        monthStats,
        streaksByHabit,
        archivedCount: archivedHabits.length,
      });
      toast.success('Monthly report downloaded');
    } catch (err) {
      toast.error('Could not generate the report');
    } finally {
      setDownloadingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Habits</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track and manage the habits you're building
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md active:translate-y-0"
        >
          <Plus size={16} /> Add Habit
        </button>
      </div>

      {!loading && !error && activeHabits.length > 0 && (
        <MonthProgressSummary
          percent={monthStats.percent}
          completed={monthStats.completed}
          scheduled={monthStats.scheduled}
          topHabit={monthStats.topHabit}
          monthLabel={MONTH_LABELS[month]}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search habits…"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-500/20"
            />
          </div>
          <select
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All frequencies</option>
            <option value="Daily">Daily</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekends">Weekends</option>
            <option value="Custom">Custom</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.value}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors duration-150 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="name">Sort by name</option>
            <option value="streak">Sort by streak</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-1.5 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="rounded-md p-1.5 text-slate-500 transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[130px] text-center text-sm font-medium text-slate-700 dark:text-slate-200">
              {MONTH_LABELS[month]} {year}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="rounded-md p-1.5 text-slate-500 transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={downloadingReport || (!loading && activeHabits.length === 0)}
            title={`Download the ${MONTH_LABELS[month]} ${year} report as PDF`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileDown size={16} />
            {downloadingReport ? 'Generating…' : 'Monthly Report'}
          </button>
        </div>
      </div>

      {loading && <HabitsGridSkeleton />}

      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      )}

      {!loading && !error && habits.length === 0 && (
        <EmptyState
          icon={<Sprout size={32} />}
          title="Start Building Your Better Routine"
          description="You haven't created any habits yet. Add your first habit to start tracking streaks and progress."
          action={
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md active:translate-y-0"
            >
              <Plus size={16} /> Create Habit
            </button>
          }
        />
      )}

      {!loading && !error && habits.length > 0 && activeHabits.length === 0 && (
        <EmptyState
          icon={<PauseCircle size={32} />}
          title="All your habits are paused"
          description="Restore one from the archived list below, or create a new habit to start tracking again."
        />
      )}

      {!loading && !error && activeHabits.length > 0 && filteredHabits.length === 0 && (
        <EmptyState icon={<Search size={32} />} title="No habits match your filters" description="Try a different search term or filter." />
      )}

      {!loading && !error && filteredHabits.length > 0 && (
        <HabitGrid
          habits={filteredHabits}
          days={days}
          completionKeysByHabit={completionKeysByHabit}
          streaksByHabit={streaksByHabit}
          onToggleDate={handleToggleDate}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          onArchive={(habit) => handleArchiveToggle(habit, true)}
          togglingCell={togglingCell}
          perDayStats={monthStats.perDay}
          notesByHabit={notesByHabit}
          onEditNote={handleEditNote}
        />
      )}

      {!loading && !error && archivedHabits.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors duration-150 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <Archive size={14} />
            Paused habits ({archivedHabits.length})
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${showArchived ? 'rotate-180' : ''}`}
            />
          </button>
          {showArchived && (
            <div className="mt-3">
              <ArchivedHabitsList
                habits={archivedHabits}
                onRestore={(habit) => handleArchiveToggle(habit, false)}
                onDelete={setDeleteTarget}
              />
            </div>
          )}
        </div>
      )}

      <HabitFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialHabit={editingHabit}
        submitting={saving}
      />

      <NoteModal
        open={Boolean(noteTarget)}
        onClose={() => setNoteTarget(null)}
        onSave={handleSaveNote}
        target={noteTarget}
        readOnly={noteReadOnly}
        saving={savingNote}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete this habit?"
        message={`This will permanently delete "${deleteTarget?.name}" and all of its completion history. This can't be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
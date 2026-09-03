import { Sparkles } from 'lucide-react';
import dashboardHero from '../../assets/habit1.png';

/**
 * Dashboard hero greeting - a soft gradient banner with a gradient-text
 * name, an animated wave, and the date/motivational line as a small pill
 * instead of plain paragraph text. A decorative habit illustration bleeds
 * in from the right edge at every screen size (narrower on phones, wider
 * on desktop), faded via a mask-image so it blends into the gradient
 * rather than showing a hard edge - purely visual, sits behind the text
 * so nothing readable is ever covered.
 */
export default function GreetingBanner({ greeting, firstName, dateLabel, line }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 shadow-sm dark:border-slate-800 dark:from-indigo-950/40 dark:via-slate-900 dark:to-violet-950/30 sm:p-7">
      {/* Decorative blurred orbs - purely visual, no layout impact */}
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/10" />

      {/* Decorative hero illustration - shown at every breakpoint (narrower
          on phones, wider on desktop) and faded on its left edge so it
          blends into the banner background instead of a hard image edge */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-1/3 sm:w-2/5 md:w-1/2"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 22%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 22%)',
        }}
      >
        <img
          src={dashboardHero}
          alt=""
          className="h-full w-full object-cover object-center opacity-90 dark:opacity-60"
        />
      </div>

      <div className="relative">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {greeting},{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
            {firstName}
          </span>{' '}
          <span className="wave-emoji inline-block">👋</span>
        </h1>

        <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-300">
          <Sparkles size={13} className="text-indigo-500 dark:text-indigo-400" />
          <span>{dateLabel}</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span>{line}</span>
        </div>
      </div>
    </div>
  );
}
import type { ChallengeState, DayEntry } from '../lib/storage'
import { formatDateDots } from '../lib/storage'
import { PillGrid } from './pill-grid'
import { TaskRow } from './task-row'

type Props = {
  state: ChallengeState
  today: number
  completedDays: number
  progressPct: number
  todayEntry: DayEntry | undefined
  kmInput: string
  setKmInput: (v: string) => void
  logToday: () => void
  toggleReading: () => void
}

export function Ticket({
  state,
  today,
  completedDays,
  progressPct,
  todayEntry,
  kmInput,
  setKmInput,
  logToday,
  toggleReading,
}: Props) {
  return (
    <div className="relative w-full max-w-[480px] bg-cream min-h-screen">
      {/* Header */}
      <div className="px-7 pt-7 pb-5">
        <div className="flex items-start justify-between font-mono text-[11px] uppercase text-pomegranate-600 tracking-wider">
          <div>
            <div className="opacity-80">start:</div>
            <div className="font-bold">{formatDateDots(state.startDate)}</div>
          </div>
          <div className="text-right">
            <div className="opacity-80">day:</div>
            <div className="font-bold">
              {String(today).padStart(2, '0')} / {state.totalDays}
            </div>
          </div>
        </div>

        <div className="relative mt-6">
          <h1 className="font-slab font-black text-pomegranate-600 leading-[0.92] tracking-tight text-[58px]">
            {state.totalDays} DAY
            <br />
            CHALLENGE
          </h1>
          <div className="absolute right-0 bottom-1 [writing-mode:vertical-rl] rotate-180 font-mono text-[10px] uppercase text-pomegranate-300 tracking-widest leading-tight">
            target:
            <br />
            consistency
          </div>
        </div>
      </div>

      {/* Wavy divider */}
      <svg
        className="w-full text-pomegranate-600"
        viewBox="0 0 420 16"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 8 Q 26 -2 52 8 T 104 8 T 156 8 T 208 8 T 260 8 T 312 8 T 364 8 T 416 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      </svg>

      {/* Lane info */}
      <div className="px-7 pt-6 pb-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-xs uppercase text-pomegranate-600 font-bold">
              lane 01
            </div>
            <div className="font-slab font-black text-pomegranate-600 text-[34px] leading-none mt-1">
              {state.dailyTargetKm}KM WALK
            </div>
          </div>
          <div className="text-right">
            <div className="font-slab font-black text-pomegranate-600 text-[36px] leading-none">
              {progressPct}%
            </div>
            <div className="font-mono text-[11px] uppercase text-pomegranate-600 mt-1">
              streak: {String(completedDays).padStart(2, '0')} dgn
            </div>
          </div>
        </div>
        <div className="h-[2px] bg-pomegranate-600 mt-4" />
      </div>

      {/* Pill grid */}
      <div className="px-6 pt-4 pb-2">
        <PillGrid total={state.totalDays} filled={completedDays} cols={15} />
      </div>

      {/* Today's drill banner */}
      <div className="bg-pomegranate-600 text-cream py-3 mt-2">
        <div className="font-mono text-[13px] tracking-[0.2em] uppercase text-center">
          today's drill — day {today}
        </div>
      </div>

      {/* Tasks */}
      <div className="px-7 pt-5 pb-7 space-y-4">
        <TaskRow
          checked={!!todayEntry?.done}
          label={`${state.dailyTargetKm}KM WALKING PAD`}
          status={todayEntry?.done ? 'done' : 'pending'}
        />
        {!todayEntry?.done && (
          <div className="flex gap-2 pl-[60px] -mt-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={kmInput}
              onChange={(e) => setKmInput(e.target.value)}
              placeholder="km"
              className="flex-1 bg-transparent border-2 border-pomegranate-600 px-3 py-2 font-mono text-pomegranate-700 placeholder:text-pomegranate-300 focus:outline-none focus:bg-pomegranate-600/5"
            />
            <button
              onClick={logToday}
              className="bg-pomegranate-600 text-cream font-mono text-xs uppercase tracking-widest px-4 py-2 hover:bg-pomegranate-700 active:scale-95 transition"
            >
              log
            </button>
          </div>
        )}
        <div className="h-[2px] bg-pomegranate-600/80" />
        <TaskRow
          checked={!!todayEntry?.reading}
          label="DAILY READING PAGES"
          status={todayEntry?.reading ? 'done' : 'pending'}
          onToggle={toggleReading}
        />
        <div className="h-[2px] bg-pomegranate-600/80" />
      </div>
    </div>
  )
}

import type { ChallengeState, DayEntry } from '../lib/storage'
import { formatDateDots, dateForDay, dayKm } from '../lib/storage'
import type { GithubConfig, SyncStatus } from '../lib/github-sync'
import { PillGrid } from './pill-grid'
import { KmRoller } from './km-roller'
import { BottomSheet } from './bottom-sheet'
import { Fab } from './fab'
import { SessionList } from './session-list'
import { SettingsButton } from './settings-button'
import { SettingsSheet } from './settings-sheet'

type Props = {
  state: ChallengeState
  today: number
  completedDays: number
  progressPct: number
  totalKm: number
  todayEntry: DayEntry | undefined
  editingDay: number | null
  pendingKm: number
  setPendingKm: (n: number) => void
  addSession: () => void
  removeSession: (day: number, sessionIndex: number) => void
  openSheet: (day: number) => void
  closeSheet: () => void
  settingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  config: GithubConfig
  setConfig: (c: GithubConfig) => void
  syncStatus: SyncStatus
  setSyncStatus: (s: SyncStatus) => void
  replaceState: (s: ChallengeState) => void
  resetChallenge: () => void
}

export function Ticket({
  state,
  today,
  completedDays,
  progressPct,
  totalKm,
  todayEntry,
  editingDay,
  pendingKm,
  setPendingKm,
  addSession,
  removeSession,
  openSheet,
  closeSheet,
  settingsOpen,
  openSettings,
  closeSettings,
  config,
  setConfig,
  syncStatus,
  setSyncStatus,
  replaceState,
  resetChallenge,
}: Props) {
  const sheetOpen = editingDay !== null
  const editingIsToday = editingDay === today
  const editingEntry = editingDay !== null ? state.entries[editingDay] : undefined
  const editingDate = editingDay !== null ? dateForDay(state.startDate, editingDay) : null
  const editingTotal = dayKm(editingEntry)

  return (
    <div className="relative w-full max-w-[480px] bg-cream min-h-screen flex flex-col overflow-x-clip">
      <SettingsButton onClick={openSettings} />

      {/* Header */}
      <div className="px-7 pt-7 pb-5">
        <div className="flex items-start justify-between font-mono text-[11px] uppercase text-pomegranate-600 tracking-wider">
          <div>
            <div className="opacity-80">start:</div>
            <div className="font-bold">{formatDateDots(state.startDate)}</div>
          </div>
          <div className="text-right pr-12">
            <div className="opacity-80">day:</div>
            <div className="font-bold">
              {String(today).padStart(2, '0')} / {state.totalDays}
            </div>
          </div>
        </div>

        <div className="relative mt-6">
          <h1 className="font-slab font-black text-pomegranate-600 leading-[0.92] tracking-tight text-[clamp(44px,14vw,62px)]">
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
              DAILY WALK
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

      {/* Pill grid heatmap */}
      <div className="px-6 pt-4 pb-2">
        <PillGrid
          total={state.totalDays}
          entries={state.entries}
          today={today}
          cols={15}
          onSelectDay={openSheet}
        />
      </div>

      {/* Heatmap legend */}
      <div className="px-7 pt-3 pb-2 flex items-center justify-end gap-2 font-mono text-[9px] uppercase tracking-widest text-pomegranate-400">
        <span>less</span>
        <span className="w-3 h-3 rounded-full border-2 border-pomegranate-300" />
        <span className="w-3 h-3 rounded-full bg-pomegranate-300" />
        <span className="w-3 h-3 rounded-full bg-pomegranate-500" />
        <span className="w-3 h-3 rounded-full bg-pomegranate-600" />
        <span className="w-3 h-3 rounded-full bg-pomegranate-800" />
        <span>more</span>
      </div>

      {/* Today's drill banner */}
      <div className="bg-pomegranate-600 text-cream py-4 mt-6">
        <div className="font-mono text-[13px] tracking-[0.2em] uppercase text-center pl-[0.2em]">
          today's drill — day {today}
        </div>
      </div>

      {/* Stats strip — total + today */}
      <div className="px-7 pt-6 pb-2 flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-pomegranate-400">
            total logged
          </div>
          <div className="font-slab font-black text-pomegranate-600 text-[28px] leading-none mt-1">
            {totalKm.toFixed(1)}
            <span className="font-mono text-[11px] tracking-widest ml-1">KM</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-pomegranate-400">
            today &middot; {todayEntry?.sessions.length ?? 0} sess
          </div>
          <div className="font-slab font-black text-pomegranate-600 text-[28px] leading-none mt-1">
            {todayEntry ? dayKm(todayEntry).toFixed(1) : '—'}
            <span className="font-mono text-[11px] tracking-widest ml-1">KM</span>
          </div>
        </div>
      </div>

      {/* Bottom safe area for the FAB */}
      <div className="flex-1" />
      <div className="h-[120px]" aria-hidden="true" />

      {/* Floating action button */}
      <Fab onClick={() => openSheet(today)} />

      {/* Log sheet — adds a new session OR shows past day's sessions */}
      <BottomSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={editingIsToday ? 'log a walk' : `day ${editingDay}`}
      >
        <div className="px-7 pt-3 pb-8 max-h-[78vh] overflow-y-auto no-scrollbar">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-pomegranate-400 text-center mb-3 pl-[0.22em]">
            day {editingDay ?? today}
            {editingDate && (
              <span className="opacity-60"> &middot; {formatDateDots(editingDate)}</span>
            )}
            {!editingIsToday && <span className="opacity-60"> &middot; past day</span>}
          </div>

          {editingEntry && (
            <div className="mb-4">
              <SessionList
                sessions={editingEntry.sessions}
                onDelete={
                  editingDay !== null
                    ? (i) => removeSession(editingDay, i)
                    : undefined
                }
              />
            </div>
          )}

          {editingIsToday ? (
            <>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-pomegranate-400 text-center mb-1 pl-[0.22em]">
                {editingTotal > 0 ? 'add another session' : 'dial in distance'}
              </div>
              <KmRoller value={pendingKm} onChange={setPendingKm} />
              <button
                onClick={addSession}
                disabled={pendingKm <= 0}
                className="mt-4 w-full bg-pomegranate-600 text-cream font-mono text-xs uppercase tracking-[0.25em] py-4 hover:bg-pomegranate-700 active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                log {pendingKm.toFixed(1)} km
              </button>
              {editingTotal > 0 && (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-pomegranate-300 text-center">
                  total today will be{' '}
                  <span className="text-pomegranate-600 font-bold">
                    {(editingTotal + pendingKm).toFixed(1)} km
                  </span>
                </p>
              )}
            </>
          ) : (
            <p className="font-mono text-[11px] text-pomegranate-400 text-center leading-relaxed py-2">
              past days are read-only. you can remove a wrong entry, but new
              sessions are always logged to today.
            </p>
          )}
        </div>
      </BottomSheet>

      {/* Settings sheet — backup + GitHub sync */}
      <SettingsSheet
        open={settingsOpen}
        onClose={closeSettings}
        state={state}
        setState={replaceState}
        config={config}
        setConfig={setConfig}
        syncStatus={syncStatus}
        setSyncStatus={setSyncStatus}
        onReset={resetChallenge}
      />
    </div>
  )
}

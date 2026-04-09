import { useCallback, useMemo, useState } from 'react'
import { Ticket } from './components/ticket'
import {
  useChallenge,
  currentDayNumber,
  todayIso,
  dayKm,
  isDayDone,
} from './lib/storage'
import type { ChallengeState } from './lib/storage'
import {
  useGithubConfig,
  useAutoSync,
  type SyncStatus,
} from './lib/github-sync'

function App() {
  const [state, setState] = useChallenge()
  const [pendingKm, setPendingKm] = useState<number>(5)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // GitHub sync state lives at the top so the auto-push effect can watch it.
  const [config, setConfig] = useGithubConfig()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: 'idle' })
  const onStatus = useCallback(setSyncStatus, [])
  useAutoSync(state, config, onStatus)

  const today = useMemo(
    () =>
      Math.min(state.totalDays, Math.max(1, currentDayNumber(state.startDate))),
    [state.startDate, state.totalDays],
  )

  const todayEntry = state.entries[today]

  const completedDays = useMemo(
    () => Object.values(state.entries).filter(isDayDone).length,
    [state.entries],
  )

  const totalKm = useMemo(
    () =>
      Object.values(state.entries).reduce((sum, e) => sum + dayKm(e), 0),
    [state.entries],
  )

  const progressPct = Math.min(
    100,
    Math.round((completedDays / state.totalDays) * 100),
  )

  function openSheet(day: number) {
    if (day > today) return // future days locked
    setPendingKm(5)
    setEditingDay(day)
  }

  function closeSheet() {
    setEditingDay(null)
  }

  /**
   * Append a new session. The day is *always* "today" — derived from the
   * system clock at the moment of logging — even if the user opened the
   * sheet from today's pill. Past days are read-only.
   */
  function addSession() {
    if (pendingKm <= 0) return
    const at = new Date().toISOString()
    setState((s) => {
      const startDate = s.startDate ?? todayIso()
      const day = Math.min(
        s.totalDays,
        Math.max(1, currentDayNumber(startDate)),
      )
      const existing = s.entries[day]?.sessions ?? []
      return {
        ...s,
        startDate,
        entries: {
          ...s.entries,
          [day]: { sessions: [...existing, { km: pendingKm, at }] },
        },
      }
    })
    setPendingKm(5)
  }

  /** Remove a single session from a specific day. Used to fix mistakes. */
  function removeSession(day: number, sessionIndex: number) {
    setState((s) => {
      const existing = s.entries[day]?.sessions
      if (!existing) return s
      const next = existing.filter((_, i) => i !== sessionIndex)
      const nextEntries = { ...s.entries }
      if (next.length === 0) {
        delete nextEntries[day]
      } else {
        nextEntries[day] = { sessions: next }
      }
      return { ...s, entries: nextEntries }
    })
  }

  function replaceState(next: ChallengeState) {
    setState(next)
  }

  /**
   * Wipe all walking data and start the challenge over. Does not touch
   * the GitHub sync config — if auto-sync is on, the cleared state will
   * be pushed on the next debounce, which is probably what you want
   * (a fresh start on every device).
   */
  function resetChallenge() {
    setState((s) => ({
      startDate: null,
      totalDays: s.totalDays,
      entries: {},
    }))
    setEditingDay(null)
  }

  return (
    <div className="min-h-screen w-full bg-cream flex justify-center">
      <Ticket
        state={state}
        today={today}
        completedDays={completedDays}
        progressPct={progressPct}
        totalKm={totalKm}
        todayEntry={todayEntry}
        editingDay={editingDay}
        pendingKm={pendingKm}
        setPendingKm={setPendingKm}
        addSession={addSession}
        removeSession={removeSession}
        openSheet={openSheet}
        closeSheet={closeSheet}
        settingsOpen={settingsOpen}
        openSettings={() => setSettingsOpen(true)}
        closeSettings={() => setSettingsOpen(false)}
        config={config}
        setConfig={setConfig}
        syncStatus={syncStatus}
        setSyncStatus={setSyncStatus}
        replaceState={replaceState}
        resetChallenge={resetChallenge}
      />
    </div>
  )
}

export default App

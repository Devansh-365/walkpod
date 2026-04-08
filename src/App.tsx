import { useMemo, useState } from 'react'
import { Ticket } from './components/ticket'
import { useChallenge, currentDayNumber, todayIso } from './lib/storage'

function App() {
  const [state, setState] = useChallenge()
  const [pendingKm, setPendingKm] = useState<number>(5)
  const [editingDay, setEditingDay] = useState<number | null>(null)

  const today = useMemo(
    () =>
      Math.min(state.totalDays, Math.max(1, currentDayNumber(state.startDate))),
    [state.startDate, state.totalDays],
  )

  const todayEntry = state.entries[today]

  const completedDays = useMemo(
    () => Object.values(state.entries).filter((e) => e.done).length,
    [state.entries],
  )

  const totalKm = useMemo(
    () =>
      Object.values(state.entries).reduce(
        (sum, e) => sum + (e.done ? e.km || 0 : 0),
        0,
      ),
    [state.entries],
  )

  const progressPct = Math.min(
    100,
    Math.round((completedDays / state.totalDays) * 100),
  )

  function openSheet(day: number) {
    // Disallow logging future days.
    if (day > today) return
    const existing = state.entries[day]
    setPendingKm(existing?.km && existing.km > 0 ? existing.km : 5)
    setEditingDay(day)
  }

  function closeSheet() {
    setEditingDay(null)
  }

  function logEntry() {
    if (pendingKm <= 0 || editingDay == null) return
    setState((s) => ({
      ...s,
      // First-ever log seeds the start date so day 1 == today.
      startDate: s.startDate ?? todayIso(),
      entries: {
        ...s.entries,
        [editingDay]: { km: pendingKm, done: true },
      },
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
        logEntry={logEntry}
        openSheet={openSheet}
        closeSheet={closeSheet}
      />
    </div>
  )
}

export default App

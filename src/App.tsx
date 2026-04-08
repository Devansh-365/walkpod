import { useMemo, useState } from 'react'
import { Ticket } from './components/ticket'
import { useChallenge, currentDayNumber } from './lib/storage'

function App() {
  const [state, setState] = useChallenge()
  const [pendingKm, setPendingKm] = useState<number>(5)
  const [sheetOpen, setSheetOpen] = useState(false)

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

  // Consistency-based progress: % of days completed in the challenge.
  const progressPct = Math.min(
    100,
    Math.round((completedDays / state.totalDays) * 100),
  )

  function openSheet() {
    // Prefill the roller with today's logged value if it exists, otherwise
    // keep the current scratch value.
    if (todayEntry?.km) setPendingKm(todayEntry.km)
    setSheetOpen(true)
  }

  function closeSheet() {
    setSheetOpen(false)
  }

  function logToday() {
    if (pendingKm <= 0) return
    setState((s) => ({
      ...s,
      entries: {
        ...s.entries,
        [today]: { km: pendingKm, done: true },
      },
    }))
    setSheetOpen(false)
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
        pendingKm={pendingKm}
        setPendingKm={setPendingKm}
        logToday={logToday}
        sheetOpen={sheetOpen}
        openSheet={openSheet}
        closeSheet={closeSheet}
      />
    </div>
  )
}

export default App

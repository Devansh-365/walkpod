import { useMemo, useState } from 'react'
import { Ticket } from './components/ticket'
import { useChallenge, currentDayNumber } from './lib/storage'

function App() {
  const [state, setState] = useChallenge()
  const [pendingKm, setPendingKm] = useState<number>(state.dailyTargetKm)

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

  const targetKm = state.dailyTargetKm * state.totalDays
  const progressPct = Math.min(100, Math.round((totalKm / targetKm) * 100))

  function logToday() {
    if (pendingKm <= 0) return
    setState((s) => ({
      ...s,
      entries: {
        ...s.entries,
        [today]: { km: pendingKm, done: true },
      },
    }))
  }

  return (
    <div className="min-h-screen w-full bg-cream flex justify-center">
      <Ticket
        state={state}
        today={today}
        completedDays={completedDays}
        progressPct={progressPct}
        todayEntry={todayEntry}
        pendingKm={pendingKm}
        setPendingKm={setPendingKm}
        logToday={logToday}
      />
    </div>
  )
}

export default App

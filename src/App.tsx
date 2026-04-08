import { useMemo, useState } from 'react'
import { Ticket } from './components/ticket'
import { useChallenge, currentDayNumber } from './lib/storage'

function App() {
  const [state, setState] = useChallenge()
  const [kmInput, setKmInput] = useState('')

  const today = useMemo(
    () => Math.min(state.totalDays, Math.max(1, currentDayNumber(state.startDate))),
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
  const progressPct = Math.round((totalKm / targetKm) * 100)

  function logToday() {
    const km = parseFloat(kmInput)
    if (!Number.isFinite(km) || km <= 0) return
    setState((s) => ({
      ...s,
      entries: {
        ...s.entries,
        [today]: { km, done: true, reading: s.entries[today]?.reading ?? false },
      },
    }))
    setKmInput('')
  }

  function toggleReading() {
    setState((s) => ({
      ...s,
      entries: {
        ...s.entries,
        [today]: {
          km: s.entries[today]?.km ?? 0,
          done: s.entries[today]?.done ?? false,
          reading: !s.entries[today]?.reading,
        },
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
        kmInput={kmInput}
        setKmInput={setKmInput}
        logToday={logToday}
        toggleReading={toggleReading}
      />
    </div>
  )
}

export default App

import { useEffect, useState } from 'react'

export type DayEntry = {
  km: number
  done: boolean
}

export type ChallengeState = {
  // null until the user logs their first km — day 1 is whenever that happens.
  startDate: string | null
  totalDays: number
  entries: Record<number, DayEntry> // keyed by 1-based day index
}

const STORAGE_KEY = 'walkpod:challenge:v1'

const defaultState: ChallengeState = {
  startDate: null,
  totalDays: 75,
  entries: {},
}

function load(): ChallengeState {
  if (typeof localStorage === 'undefined') return defaultState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

export function useChallenge() {
  const [state, setState] = useState<ChallengeState>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return [state, setState] as const
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Returns the current 1-based day number of the challenge. If the
 * challenge hasn't started yet (no startDate), returns 1 — meaning
 * "today is day 1 if you log right now".
 */
export function currentDayNumber(startDate: string | null): number {
  if (!startDate) return 1
  const start = new Date(startDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  )
  return diff + 1
}

/**
 * Convert a 1-based day number into the calendar date for that day,
 * using startDate as day 1. Returns null if the challenge hasn't started.
 */
export function dateForDay(
  startDate: string | null,
  day: number,
): string | null {
  if (!startDate) return null
  const start = new Date(startDate + 'T00:00:00')
  start.setDate(start.getDate() + (day - 1))
  return start.toISOString().slice(0, 10)
}

export function formatDateDots(iso: string | null): string {
  if (!iso) return '-- . -- . ----'
  const [y, m, d] = iso.split('-')
  return `${d} . ${m} . ${y}`
}

import { useEffect, useState } from 'react'

export type WalkSession = {
  km: number
  at: string // ISO timestamp, or 'unknown' for migrated entries
}

export type DayEntry = {
  sessions: WalkSession[]
}

export type ChallengeState = {
  // null until the user logs their first session — day 1 is whenever that happens.
  startDate: string | null
  totalDays: number
  entries: Record<number, DayEntry> // 1-based day index
}

const STORAGE_KEY = 'walkpod:challenge:v1'

const defaultState: ChallengeState = {
  startDate: null,
  totalDays: 75,
  entries: {},
}

/**
 * Migrate any prior on-disk shape to the current sessions-array model.
 * The previous shape was { km: number; done: boolean }; we lift the
 * scalar km into a single-session array so the rest of the app can use
 * one code path.
 */
function migrate(raw: unknown): ChallengeState {
  if (!raw || typeof raw !== 'object') return defaultState
  const obj = raw as Record<string, unknown>
  const entriesRaw =
    obj.entries && typeof obj.entries === 'object'
      ? (obj.entries as Record<string, unknown>)
      : {}

  const entries: Record<number, DayEntry> = {}
  for (const [key, value] of Object.entries(entriesRaw)) {
    const day = Number(key)
    if (!Number.isFinite(day) || !value || typeof value !== 'object') continue
    const v = value as Record<string, unknown>

    if (Array.isArray(v.sessions)) {
      const sessions = (v.sessions as unknown[])
        .map((s) => {
          if (!s || typeof s !== 'object') return null
          const sObj = s as Record<string, unknown>
          const km = Number(sObj.km)
          if (!Number.isFinite(km) || km <= 0) return null
          const at = typeof sObj.at === 'string' ? sObj.at : 'unknown'
          return { km, at } as WalkSession
        })
        .filter((s): s is WalkSession => s !== null)
      if (sessions.length > 0) entries[day] = { sessions }
      continue
    }

    // Legacy { km, done } shape — lift into a single session.
    const km = Number(v.km)
    if (Number.isFinite(km) && km > 0 && v.done) {
      entries[day] = { sessions: [{ km, at: 'unknown' }] }
    }
  }

  return {
    startDate: typeof obj.startDate === 'string' ? obj.startDate : null,
    totalDays: typeof obj.totalDays === 'number' ? obj.totalDays : 75,
    entries,
  }
}

function load(): ChallengeState {
  if (typeof localStorage === 'undefined') return defaultState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return migrate(JSON.parse(raw))
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

/** Sum of all session km on a given day. Returns 0 for missing days. */
export function dayKm(entry: DayEntry | undefined): number {
  if (!entry) return 0
  return entry.sessions.reduce((sum, s) => sum + s.km, 0)
}

/** A day is "done" if it has at least one session. */
export function isDayDone(entry: DayEntry | undefined): boolean {
  return !!entry && entry.sessions.length > 0
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

export const STORAGE_KEYS = {
  challenge: STORAGE_KEY,
  github: 'walkpod:github-config:v1',
} as const

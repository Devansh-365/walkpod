import { useEffect, useState } from 'react'

export type DayEntry = {
  km: number
  done: boolean
}

export type ChallengeState = {
  startDate: string // ISO yyyy-mm-dd
  totalDays: number
  dailyTargetKm: number
  entries: Record<number, DayEntry> // keyed by 1-based day index
}

const STORAGE_KEY = 'walkpod:challenge:v1'

const defaultState: ChallengeState = {
  startDate: new Date().toISOString().slice(0, 10),
  totalDays: 75,
  dailyTargetKm: 10,
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

export function currentDayNumber(startDate: string): number {
  const start = new Date(startDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return diff + 1 // day 1 on the start date
}

export function formatDateDots(iso: string): string {
  // 01 . 10 . 2023
  const [y, m, d] = iso.split('-')
  return `${d} . ${m} . ${y}`
}

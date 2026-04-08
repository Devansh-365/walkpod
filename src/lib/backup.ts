import type { ChallengeState } from './storage'
import { STORAGE_KEYS } from './storage'

/**
 * Tier 1 — manual backup. Export the challenge state as a JSON file
 * the user downloads. The GitHub config (which contains the PAT) is
 * deliberately NOT included, so a shared backup file never leaks
 * credentials.
 */
export function exportToFile(state: ChallengeState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const date = new Date().toISOString().slice(0, 10)
  a.download = `walkpod-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Read a backup file the user picked. Returns the parsed state on
 * success, or throws with a human-readable message on failure. The
 * caller is responsible for confirming the destructive replace.
 */
export function readBackupFile(file: File): Promise<ChallengeState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('could not read the file'))
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('not a walkpod backup')
        }
        if (typeof parsed.totalDays !== 'number' || !parsed.entries) {
          throw new Error('not a walkpod backup')
        }
        resolve(parsed as ChallengeState)
      } catch (err) {
        reject(
          err instanceof Error
            ? err
            : new Error('could not parse the file as JSON'),
        )
      }
    }
    reader.readAsText(file)
  })
}

/** Wipe everything (challenge data only — leaves the GitHub config alone). */
export function wipeLocalChallenge(): void {
  localStorage.removeItem(STORAGE_KEYS.challenge)
}

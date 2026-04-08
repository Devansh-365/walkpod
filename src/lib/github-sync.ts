import { useEffect, useRef, useState } from 'react'
import type { ChallengeState } from './storage'
import { STORAGE_KEYS } from './storage'

export type GithubConfig = {
  token: string
  owner: string
  repo: string
  path: string
  branch: string
  autoSync: boolean
}

export type SyncStatus =
  | { state: 'idle' }
  | { state: 'syncing' }
  | { state: 'ok'; at: string }
  | { state: 'error'; message: string; at: string }

const defaultConfig: GithubConfig = {
  token: '',
  owner: '',
  repo: 'walkpod-data',
  path: 'walks.json',
  branch: 'main',
  autoSync: true,
}

function loadConfig(): GithubConfig {
  if (typeof localStorage === 'undefined') return defaultConfig
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.github)
    if (!raw) return defaultConfig
    return { ...defaultConfig, ...JSON.parse(raw) }
  } catch {
    return defaultConfig
  }
}

export function useGithubConfig() {
  const [config, setConfig] = useState<GithubConfig>(loadConfig)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.github, JSON.stringify(config))
  }, [config])
  return [config, setConfig] as const
}

export function isConfigured(c: GithubConfig): boolean {
  return !!(c.token && c.owner && c.repo && c.path)
}

// ---------- GitHub Contents API helpers ----------

type ContentsResponse = {
  sha: string
  content: string
  encoding: string
}

const API = 'https://api.github.com'

function headers(token: string): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function getContent(c: GithubConfig): Promise<ContentsResponse | null> {
  const url = `${API}/repos/${c.owner}/${c.repo}/contents/${encodeURIComponent(
    c.path,
  )}?ref=${encodeURIComponent(c.branch)}`
  const res = await fetch(url, { headers: headers(c.token) })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`GET ${c.path} failed (${res.status})`)
  }
  return (await res.json()) as ContentsResponse
}

/**
 * Push the current challenge state to GitHub. If the file already
 * exists we include the prior sha so GitHub does an update commit
 * rather than a 422 conflict.
 */
export async function pushState(
  state: ChallengeState,
  c: GithubConfig,
): Promise<void> {
  if (!isConfigured(c)) throw new Error('GitHub sync not configured')

  const existing = await getContent(c).catch(() => null)
  const json = JSON.stringify(state, null, 2)
  // btoa handles only Latin-1; encode UTF-8 first to be safe.
  const content = btoa(unescape(encodeURIComponent(json)))

  const url = `${API}/repos/${c.owner}/${c.repo}/contents/${encodeURIComponent(
    c.path,
  )}`
  const body = {
    message: `walkpod sync · ${new Date().toISOString()}`,
    content,
    branch: c.branch,
    ...(existing ? { sha: existing.sha } : {}),
  }
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...headers(c.token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`PUT ${c.path} failed (${res.status}): ${msg.slice(0, 120)}`)
  }
}

/** Pull the latest state from GitHub. Returns null if the file doesn't exist yet. */
export async function pullState(
  c: GithubConfig,
): Promise<ChallengeState | null> {
  if (!isConfigured(c)) throw new Error('GitHub sync not configured')
  const existing = await getContent(c)
  if (!existing) return null
  // Decode base64 → UTF-8 → JSON
  const decoded = decodeURIComponent(escape(atob(existing.content)))
  const parsed = JSON.parse(decoded)
  if (!parsed || typeof parsed !== 'object' || !parsed.entries) {
    throw new Error('cloud file is not a valid walkpod backup')
  }
  return parsed as ChallengeState
}

// ---------- Hook: debounced auto-sync on state change ----------

/**
 * Watches the challenge state and pushes it to GitHub a few seconds
 * after the last edit. Re-runs on every state change so rapid edits
 * coalesce into one push. No-ops if sync is unconfigured or disabled.
 */
export function useAutoSync(
  state: ChallengeState,
  config: GithubConfig,
  onStatus: (s: SyncStatus) => void,
  delayMs = 4000,
) {
  // Skip the very first render so we don't push the boot-state.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!config.autoSync || !isConfigured(config)) return

    const t = window.setTimeout(async () => {
      onStatus({ state: 'syncing' })
      try {
        await pushState(state, config)
        onStatus({ state: 'ok', at: new Date().toISOString() })
      } catch (err) {
        onStatus({
          state: 'error',
          message: err instanceof Error ? err.message : 'unknown error',
          at: new Date().toISOString(),
        })
      }
    }, delayMs)

    return () => window.clearTimeout(t)
  }, [state, config, onStatus, delayMs])
}

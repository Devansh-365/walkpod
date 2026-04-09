import { useRef, useState, type ReactNode } from 'react'
import type { ChallengeState } from '../lib/storage'
import type { GithubConfig, SyncStatus } from '../lib/github-sync'
import { isConfigured, pullState, pushState } from '../lib/github-sync'
import { exportToFile, readBackupFile } from '../lib/backup'
import { BottomSheet } from './bottom-sheet'
import { Dialog } from './dialog'

type DialogSpec = {
  title: string
  body?: ReactNode
  confirmLabel?: string
  danger?: boolean
  alert?: boolean // no cancel button
  onConfirm: () => void
}

type Props = {
  open: boolean
  onClose: () => void
  state: ChallengeState
  setState: (next: ChallengeState) => void
  config: GithubConfig
  setConfig: (next: GithubConfig) => void
  syncStatus: SyncStatus
  setSyncStatus: (s: SyncStatus) => void
  onReset: () => void
}

function relativeTime(iso: string): string {
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
    return `${Math.round(diff / 86400)}d ago`
  } catch {
    return ''
  }
}

export function SettingsSheet({
  open,
  onClose,
  state,
  setState,
  config,
  setConfig,
  syncStatus,
  setSyncStatus,
  onReset,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<null | 'push' | 'pull'>(null)
  const [dialog, setDialog] = useState<DialogSpec | null>(null)

  function closeDialog() {
    setDialog(null)
  }

  function handleImportClick() {
    fileInput.current?.click()
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    try {
      const next = await readBackupFile(file)
      setDialog({
        title: 'replace current data?',
        body: 'Importing this backup will overwrite every session currently on this device. Your GitHub sync settings stay put.',
        confirmLabel: 'replace',
        danger: true,
        onConfirm: () => setState(next),
      })
    } catch (err) {
      setDialog({
        title: 'import failed',
        body: err instanceof Error ? err.message : 'could not read that file',
        confirmLabel: 'ok',
        alert: true,
        onConfirm: () => {},
      })
    }
  }

  async function handlePushNow() {
    if (!isConfigured(config)) return
    setBusy('push')
    setSyncStatus({ state: 'syncing' })
    try {
      await pushState(state, config)
      setSyncStatus({ state: 'ok', at: new Date().toISOString() })
    } catch (err) {
      setSyncStatus({
        state: 'error',
        message: err instanceof Error ? err.message : 'unknown error',
        at: new Date().toISOString(),
      })
    } finally {
      setBusy(null)
    }
  }

  async function doPull() {
    setBusy('pull')
    setSyncStatus({ state: 'syncing' })
    try {
      const cloud = await pullState(config)
      if (!cloud) {
        setDialog({
          title: 'nothing in the cloud yet',
          body: 'There’s no backup file in your GitHub repo. Push once from this device before you can restore.',
          confirmLabel: 'ok',
          alert: true,
          onConfirm: () => {},
        })
        setSyncStatus({ state: 'idle' })
      } else {
        setState(cloud)
        setSyncStatus({ state: 'ok', at: new Date().toISOString() })
      }
    } catch (err) {
      setSyncStatus({
        state: 'error',
        message: err instanceof Error ? err.message : 'unknown error',
        at: new Date().toISOString(),
      })
    } finally {
      setBusy(null)
    }
  }

  function handlePullNow() {
    if (!isConfigured(config)) return
    setDialog({
      title: 'restore from cloud?',
      body: 'This replaces the walkpod data on this device with whatever is in your GitHub repo. Local changes since the last sync will be lost.',
      confirmLabel: 'restore',
      danger: true,
      onConfirm: () => {
        doPull()
      },
    })
  }

  function setField<K extends keyof GithubConfig>(key: K, value: GithubConfig[K]) {
    setConfig({ ...config, [key]: value })
  }

  function handleReset() {
    setDialog({
      title: 'reset walkpod?',
      body: (
        <>
          Wipes every logged session and unsets day 1. Day 1 becomes whenever
          you log next, not the moment you tap reset.
          <br />
          <br />
          <span className="text-pomegranate-700 font-bold">
            Export a backup first
          </span>{' '}
          if you want to keep your history. GitHub sync settings stay put.
        </>
      ),
      confirmLabel: 'reset',
      danger: true,
      onConfirm: () => {
        onReset()
        onClose()
      },
    })
  }

  const configured = isConfigured(config)

  return (
    <BottomSheet open={open} onClose={onClose} title="Settings">
      <div className="px-7 pt-2 pb-8 max-h-[80vh] overflow-y-auto no-scrollbar">
        <h2 className="font-slab font-black text-pomegranate-600 text-[28px] leading-none mb-1">
          settings
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-pomegranate-400 mb-5">
          backup &middot; sync &middot; restore
        </p>

        {/* ---------- Tier 1: file backup ---------- */}
        <Section title="file backup">
          <p className="font-mono text-[11px] text-pomegranate-500 leading-relaxed mb-3">
            Download your walkpod data as a JSON file. Keep it anywhere safe.
            Importing replaces everything currently on this device.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => exportToFile(state)}
              className="flex-1 bg-pomegranate-600 text-cream font-mono text-[10px] uppercase tracking-[0.2em] py-3 hover:bg-pomegranate-700 active:translate-y-[1px] transition cursor-pointer"
            >
              export json
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              className="flex-1 border-2 border-pomegranate-600 text-pomegranate-600 font-mono text-[10px] uppercase tracking-[0.2em] py-3 hover:bg-pomegranate-600/5 active:translate-y-[1px] transition cursor-pointer"
            >
              import json
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </Section>

        {/* ---------- Tier 2: GitHub sync ---------- */}
        <Section title="github sync">
          <p className="font-mono text-[11px] text-pomegranate-500 leading-relaxed mb-3">
            Auto-push your data to a private GitHub repo. Use a fine-grained PAT
            scoped to a single repo with{' '}
            <code className="bg-pomegranate-100 px-1">contents:write</code>. The
            token is stored on this device only and never leaves it except in
            the request to api.github.com.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="owner">
              <input
                value={config.owner}
                onChange={(e) => setField('owner', e.target.value.trim())}
                placeholder="github-username"
                spellCheck={false}
                autoCapitalize="off"
                className={inputClass}
              />
            </Field>
            <Field label="repo">
              <input
                value={config.repo}
                onChange={(e) => setField('repo', e.target.value.trim())}
                spellCheck={false}
                autoCapitalize="off"
                className={inputClass}
              />
            </Field>
            <Field label="path">
              <input
                value={config.path}
                onChange={(e) => setField('path', e.target.value.trim())}
                spellCheck={false}
                autoCapitalize="off"
                className={inputClass}
              />
            </Field>
            <Field label="branch">
              <input
                value={config.branch}
                onChange={(e) => setField('branch', e.target.value.trim())}
                spellCheck={false}
                autoCapitalize="off"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="token (fine-grained PAT)">
            <input
              type="password"
              value={config.token}
              onChange={(e) => setField('token', e.target.value.trim())}
              placeholder="github_pat_..."
              spellCheck={false}
              autoCapitalize="off"
              className={inputClass}
            />
          </Field>

          <label className="flex items-center gap-2 mt-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => setField('autoSync', e.target.checked)}
              className="accent-pomegranate-600 w-4 h-4 cursor-pointer"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-pomegranate-600">
              auto-push 4s after every change
            </span>
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePushNow}
              disabled={!configured || busy !== null}
              className="flex-1 bg-pomegranate-600 text-cream font-mono text-[10px] uppercase tracking-[0.2em] py-3 hover:bg-pomegranate-700 active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {busy === 'push' ? 'pushing…' : 'push now'}
            </button>
            <button
              type="button"
              onClick={handlePullNow}
              disabled={!configured || busy !== null}
              className="flex-1 border-2 border-pomegranate-600 text-pomegranate-600 font-mono text-[10px] uppercase tracking-[0.2em] py-3 hover:bg-pomegranate-600/5 active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {busy === 'pull' ? 'pulling…' : 'restore'}
            </button>
          </div>

          <SyncStatusLine status={syncStatus} configured={configured} />
        </Section>

        {/* ---------- Danger zone: wipe local data ---------- */}
        <Section title="danger zone">
          <p className="font-mono text-[11px] text-pomegranate-500 leading-relaxed mb-3">
            Start the 75-day challenge over from scratch. Clears every logged
            session and unsets day 1 until you log again. Export a backup first
            if you want to keep the history.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="w-full bg-pomegranate-950 text-cream font-mono text-[10px] uppercase tracking-[0.2em] py-3 hover:bg-pomegranate-900 active:translate-y-[1px] transition cursor-pointer"
          >
            reset walkpod
          </button>
        </Section>
      </div>

      <Dialog
        open={dialog !== null}
        title={dialog?.title ?? ''}
        body={dialog?.body}
        confirmLabel={dialog?.confirmLabel}
        cancelLabel={dialog?.alert ? null : 'cancel'}
        danger={dialog?.danger}
        onConfirm={() => {
          dialog?.onConfirm()
          closeDialog()
        }}
        onCancel={closeDialog}
      />
    </BottomSheet>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-pomegranate-700 font-bold border-b-2 border-pomegranate-600 pb-1 mb-3">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mt-3">
      <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-pomegranate-400 mb-1">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'block w-full bg-transparent border-2 border-pomegranate-300 focus:border-pomegranate-600 focus:outline-none px-2 py-1.5 font-mono text-[12px] text-pomegranate-700 placeholder:text-pomegranate-300'

function SyncStatusLine({
  status,
  configured,
}: {
  status: SyncStatus
  configured: boolean
}) {
  if (!configured) {
    return (
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-pomegranate-300">
        not configured
      </p>
    )
  }
  if (status.state === 'idle') {
    return (
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-pomegranate-400">
        idle &middot; ready
      </p>
    )
  }
  if (status.state === 'syncing') {
    return (
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-pomegranate-600">
        syncing…
      </p>
    )
  }
  if (status.state === 'ok') {
    return (
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-pomegranate-600">
        synced {relativeTime(status.at)}
      </p>
    )
  }
  return (
    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-pomegranate-700 break-words">
      error: {status.message}
    </p>
  )
}

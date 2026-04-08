import type { WalkSession } from '../lib/storage'

type Props = {
  sessions: WalkSession[]
  onDelete?: (index: number) => void
  emptyHint?: string
}

function formatTime(at: string): string {
  if (at === 'unknown' || !at) return ''
  try {
    const d = new Date(at)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export function SessionList({ sessions, onDelete, emptyHint }: Props) {
  if (sessions.length === 0) {
    return emptyHint ? (
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-pomegranate-300 text-center py-2">
        {emptyHint}
      </div>
    ) : null
  }

  const total = sessions.reduce((sum, s) => sum + s.km, 0)

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-pomegranate-400">
        <span>logged sessions</span>
        <span className="text-pomegranate-600">
          total <span className="font-bold">{total.toFixed(1)} km</span>
        </span>
      </div>
      <ul className="border border-pomegranate-300">
        {sessions.map((s, i) => {
          const time = formatTime(s.at)
          return (
            <li
              key={i}
              className={
                'flex items-center justify-between gap-3 px-3 py-2 ' +
                (i > 0 ? 'border-t border-pomegranate-200' : '')
              }
            >
              <div className="flex items-baseline gap-3">
                <span className="font-slab font-black text-pomegranate-600 text-[20px] leading-none">
                  {s.km.toFixed(1)}
                  <span className="font-mono text-[10px] tracking-widest ml-1">
                    KM
                  </span>
                </span>
                {time && (
                  <span className="font-mono text-[9px] uppercase tracking-widest text-pomegranate-300">
                    {time}
                  </span>
                )}
              </div>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(i)}
                  aria-label={`delete session ${i + 1}`}
                  className="font-mono text-[10px] uppercase tracking-widest text-pomegranate-400 hover:text-pomegranate-700 active:translate-y-[1px] transition cursor-pointer px-2 py-1"
                >
                  remove
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

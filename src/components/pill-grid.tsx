import type { DayEntry } from '../lib/storage'

type Props = {
  total: number
  entries: Record<number, DayEntry>
  cols?: number
}

/**
 * Vertical capsule grid — each pill represents one day of the challenge.
 * Pills are shaded relative to the user's max km in the dataset, like a
 * GitHub contribution graph: more km = darker pomegranate. Empty days
 * stay outlined.
 */
export function PillGrid({ total, entries, cols = 15 }: Props) {
  // Max km across all completed days. The scale is *relative* — as the
  // user pushes their max higher, lighter days re-bucket downward.
  const maxKm = Object.values(entries).reduce(
    (m, e) => (e.done && e.km > m ? e.km : m),
    0,
  )

  function shadeClass(day: number): string {
    const e = entries[day]
    if (!e?.done || e.km <= 0) {
      // Empty: outlined only
      return 'bg-transparent border-2 border-pomegranate-300'
    }
    if (maxKm <= 0) return 'bg-pomegranate-300 border-2 border-pomegranate-300'
    const ratio = e.km / maxKm
    if (ratio >= 0.85) return 'bg-pomegranate-800 border-2 border-pomegranate-800'
    if (ratio >= 0.6) return 'bg-pomegranate-600 border-2 border-pomegranate-600'
    if (ratio >= 0.35) return 'bg-pomegranate-500 border-2 border-pomegranate-500'
    return 'bg-pomegranate-300 border-2 border-pomegranate-300'
  }

  const completed = Object.values(entries).filter((e) => e.done).length

  return (
    <div
      className="grid gap-x-[6px] gap-y-[8px]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      aria-label={`${completed} of ${total} days complete`}
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((day) => {
        const e = entries[day]
        const title = e?.done
          ? `Day ${day} — ${e.km.toFixed(1)} km`
          : `Day ${day} — not logged`
        return (
          <div
            key={day}
            title={title}
            className={'h-[34px] rounded-full transition-colors ' + shadeClass(day)}
          />
        )
      })}
    </div>
  )
}

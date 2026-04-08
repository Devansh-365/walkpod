import type { DayEntry } from '../lib/storage'

type Props = {
  total: number
  entries: Record<number, DayEntry>
  today: number
  cols?: number
  onSelectDay: (day: number) => void
}

/**
 * Vertical capsule grid — each pill represents one day of the challenge.
 * Pills are shaded relative to the user's max km in the dataset, like a
 * GitHub contribution graph: more km = darker pomegranate. Empty days
 * stay outlined.
 *
 * Each pill is clickable: tapping a past or current day opens the
 * editor sheet via onSelectDay. Future days are non-interactive.
 * Hover reveals a small popover with the day's status.
 */
export function PillGrid({
  total,
  entries,
  today,
  cols = 15,
  onSelectDay,
}: Props) {
  const maxKm = Object.values(entries).reduce(
    (m, e) => (e.done && e.km > m ? e.km : m),
    0,
  )

  function shadeClass(day: number, isFuture: boolean): string {
    const e = entries[day]
    if (!e?.done || e.km <= 0) {
      return isFuture
        ? 'bg-transparent border-2 border-pomegranate-200'
        : 'bg-transparent border-2 border-pomegranate-300'
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
        const isFuture = day > today
        const isToday = day === today

        const label = e?.done
          ? `${e.km.toFixed(1)} km`
          : isFuture
            ? 'locked'
            : isToday
              ? 'tap to log'
              : 'missed'

        return (
          <div key={day} className="group/pill relative">
            <button
              type="button"
              disabled={isFuture}
              onClick={() => onSelectDay(day)}
              aria-label={`Day ${day}, ${label}`}
              className={
                'block w-full h-[34px] rounded-full transition-transform duration-150 ' +
                shadeClass(day, isFuture) +
                (isFuture
                  ? ' cursor-not-allowed'
                  : ' cursor-pointer hover:scale-110 active:scale-95') +
                (isToday ? ' outline outline-2 outline-offset-1 outline-pomegranate-700' : '')
              }
            />

            {/* Hover popover — pure CSS, no JS state */}
            <div
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 z-30 opacity-0 group-hover/pill:opacity-100 transition-opacity duration-150 whitespace-nowrap"
            >
              <div className="bg-pomegranate-700 text-cream px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider rounded-sm shadow-lg">
                <span className="opacity-70">day </span>
                <span className="font-bold">{String(day).padStart(2, '0')}</span>
                <span className="opacity-50 mx-1.5">·</span>
                <span className="font-bold">{label}</span>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-pomegranate-700" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

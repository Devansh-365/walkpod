type Props = {
  total: number
  filled: number
  cols?: number
}

/**
 * Vertical capsule grid — each pill represents one day of the challenge.
 * Filled (solid) pills = days completed. Outline pills = days remaining.
 */
export function PillGrid({ total, filled, cols = 15 }: Props) {
  const pills = Array.from({ length: total }, (_, i) => i < filled)

  return (
    <div
      className="grid gap-x-[6px] gap-y-[8px]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      aria-label={`${filled} of ${total} days complete`}
    >
      {pills.map((isFilled, i) => (
        <div
          key={i}
          className={
            'h-[34px] rounded-full border-2 border-pomegranate-600 ' +
            (isFilled ? 'bg-pomegranate-600' : 'bg-transparent')
          }
        />
      ))}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'

const ITEM_H = 48
const VISIBLE = 5 // odd: center row is the selection
const PAD = ((VISIBLE - 1) / 2) * ITEM_H

type WheelProps = {
  values: (string | number)[]
  initial: number
  onSelect: (i: number) => void
  ariaLabel: string
}

/**
 * One column of the roller. CSS scroll-snap drives the physics —
 * no JS animation loop, no library. Local state tracks the live
 * active index for visual feedback; the parent only hears about
 * settled values via onSelect.
 */
function Wheel({ values, initial, onSelect, ariaLabel }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const settleRef = useRef<number | null>(null)
  const [active, setActive] = useState(initial)

  // Set the initial scroll position once.
  useEffect(() => {
    if (!ref.current) return
    ref.current.scrollTop = initial * ITEM_H
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleScroll() {
    const el = ref.current
    if (!el) return

    // Live highlight: snap-to-nearest in real time as the user drags.
    const live = Math.max(
      0,
      Math.min(values.length - 1, Math.round(el.scrollTop / ITEM_H)),
    )
    if (live !== active) setActive(live)

    // Debounced commit + clean snap.
    if (settleRef.current) window.clearTimeout(settleRef.current)
    settleRef.current = window.setTimeout(() => {
      const node = ref.current
      if (!node) return
      const snapped = Math.max(
        0,
        Math.min(values.length - 1, Math.round(node.scrollTop / ITEM_H)),
      )
      const target = snapped * ITEM_H
      if (Math.abs(node.scrollTop - target) > 0.5) {
        node.scrollTo({ top: target, behavior: 'smooth' })
      }
      onSelect(snapped)
    }, 90)
  }

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={ariaLabel}
      onScroll={handleScroll}
      className="km-wheel relative h-[240px] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      <div style={{ height: PAD }} aria-hidden="true" />
      {values.map((v, i) => {
        const isActive = i === active
        return (
          <div
            key={i}
            className={
              'flex items-center justify-center snap-center font-slab font-black leading-none transition-all duration-150 ' +
              (isActive
                ? 'text-pomegranate-600 text-[44px]'
                : 'text-pomegranate-300 text-[32px]')
            }
            style={{ height: ITEM_H, scrollSnapAlign: 'center' }}
          >
            {typeof v === 'number' ? String(v).padStart(2, '0') : v}
          </div>
        )
      })}
      <div style={{ height: PAD }} aria-hidden="true" />
    </div>
  )
}

type Props = {
  value: number
  onChange: (n: number) => void
}

const INTS = Array.from({ length: 31 }, (_, i) => i) // 0–30 km
const DECS = Array.from({ length: 10 }, (_, i) => i) // .0–.9

export function KmRoller({ value, onChange }: Props) {
  const initialInt = Math.max(0, Math.min(30, Math.floor(value)))
  const initialDec = Math.max(
    0,
    Math.min(9, Math.round((value - initialInt) * 10)),
  )

  // Track parts locally so the two wheels can update each other through
  // the parent without forcing remounts.
  const intRef = useRef(initialInt)
  const decRef = useRef(initialDec)

  return (
    <div className="relative select-none">
      {/* Center selection band */}
      <div
        className="pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2 z-10"
        style={{ height: ITEM_H }}
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-pomegranate-600" />
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-pomegranate-600" />
      </div>

      <div className="km-roller-mask flex items-center justify-center gap-2 px-4">
        <Wheel
          values={INTS}
          initial={initialInt}
          onSelect={(i) => {
            intRef.current = i
            onChange(i + decRef.current / 10)
          }}
          ariaLabel="kilometers, whole part"
        />
        <span className="font-slab font-black text-[40px] text-pomegranate-600 leading-none mb-2 self-center">
          .
        </span>
        <Wheel
          values={DECS}
          initial={initialDec}
          onSelect={(d) => {
            decRef.current = d
            onChange(intRef.current + d / 10)
          }}
          ariaLabel="kilometers, tenths"
        />
        <span className="ml-1 font-mono text-[11px] uppercase tracking-widest text-pomegranate-600 self-center">
          km
        </span>
      </div>
    </div>
  )
}

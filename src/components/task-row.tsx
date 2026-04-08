type Props = {
  checked: boolean
  label: string
  status: string
  onToggle?: () => void
}

export function TaskRow({ checked, label, status, onToggle }: Props) {
  const interactive = !!onToggle
  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={onToggle}
        disabled={!interactive}
        aria-pressed={checked}
        className={
          'relative w-12 h-12 border-[3px] border-pomegranate-600 flex items-center justify-center shrink-0 ' +
          (checked ? 'bg-pomegranate-600' : 'bg-transparent') +
          (interactive ? ' cursor-pointer active:scale-95 transition' : '')
        }
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="w-full h-full text-cream" aria-hidden="true">
            <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="3" />
            <line x1="21" y1="3" x2="3" y2="21" stroke="currentColor" strokeWidth="3" />
          </svg>
        )}
      </button>
      <div className="flex-1">
        <div
          className={
            'font-slab font-bold text-[20px] tracking-wide ' +
            (checked
              ? 'text-pomegranate-300 line-through'
              : 'text-pomegranate-600')
          }
        >
          {label}
        </div>
        <div
          className={
            'font-mono text-xs uppercase mt-0.5 ' +
            (checked ? 'text-pomegranate-300' : 'text-pomegranate-400')
          }
        >
          {status}
        </div>
      </div>
    </div>
  )
}

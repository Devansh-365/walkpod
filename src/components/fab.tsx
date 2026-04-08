type Props = {
  onClick: () => void
  isDone: boolean
}

/**
 * Floating action button anchored to the bottom-right of the centered
 * ticket column. Uses a fixed-position outer wrapper so the FAB stays
 * inside the ticket's right edge on desktop and the viewport edge on
 * mobile.
 */
export function Fab({ onClick, isDone }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none flex justify-center">
      <div className="relative w-full max-w-[480px] h-0">
        <button
          onClick={onClick}
          aria-label={isDone ? 'edit today’s logged distance' : 'log today’s distance'}
          className={
            'pointer-events-auto absolute bottom-6 right-6 w-[64px] h-[64px] rounded-full ' +
            'bg-pomegranate-600 text-cream flex items-center justify-center ' +
            'shadow-[0_14px_30px_-10px_rgba(229,75,28,0.55),0_4px_10px_-2px_rgba(118,38,24,0.25)] ' +
            'hover:bg-pomegranate-700 active:translate-y-[2px] active:shadow-[0_6px_14px_-6px_rgba(229,75,28,0.55)] ' +
            'transition-all duration-200 cursor-pointer ring-2 ring-cream'
          }
        >
          {isDone ? (
            // Pencil — affords editing
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          ) : (
            // Plus
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              className="w-7 h-7"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

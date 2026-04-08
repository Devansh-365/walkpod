type Props = {
  onClick: () => void
}

/**
 * Floating action button anchored to the bottom-right of the centered
 * ticket column. Always shows a + icon — every tap opens the log
 * sheet for today, regardless of whether today already has sessions.
 */
export function Fab({ onClick }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none flex justify-center">
      <div className="relative w-full max-w-[480px] h-0">
        <button
          onClick={onClick}
          aria-label="log a walking session"
          className={
            'pointer-events-auto absolute bottom-6 right-6 w-[64px] h-[64px] rounded-full ' +
            'bg-pomegranate-600 text-cream flex items-center justify-center ' +
            'shadow-[0_14px_30px_-10px_rgba(229,75,28,0.55),0_4px_10px_-2px_rgba(118,38,24,0.25)] ' +
            'hover:bg-pomegranate-700 active:translate-y-[2px] active:shadow-[0_6px_14px_-6px_rgba(229,75,28,0.55)] ' +
            'transition-all duration-200 cursor-pointer ring-2 ring-cream'
          }
        >
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
        </button>
      </div>
    </div>
  )
}

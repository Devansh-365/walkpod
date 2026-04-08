import { useEffect, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

/**
 * A constrained bottom sheet that slides up from below the ticket.
 * The outer wrapper is fixed + flex-centered so on desktop the sheet
 * stays inside the same 480px column as the ticket; on mobile it
 * fills the viewport width.
 */
export function BottomSheet({ open, onClose, children, title }: Props) {
  // Lock body scroll while the sheet is open and close on Escape.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={
          'fixed inset-0 z-40 bg-pomegranate-950/40 backdrop-blur-[2px] transition-opacity duration-300 ' +
          (open ? 'opacity-100' : 'opacity-0 pointer-events-none')
        }
      />

      {/* Sheet container — centers a max-width sheet on desktop */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none"
        aria-hidden={!open}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={
            'pointer-events-auto w-full max-w-[480px] bg-cream border-t-2 border-pomegranate-600 ' +
            'transition-transform duration-[420ms] will-change-transform ' +
            (open ? 'translate-y-0' : 'translate-y-full')
          }
          style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-[3px] rounded-full bg-pomegranate-300" />
          </div>
          {children}
        </div>
      </div>
    </>
  )
}

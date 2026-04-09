import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  title: string
  body?: ReactNode
  confirmLabel?: string
  cancelLabel?: string | null // null = no cancel button (alert mode)
  danger?: boolean
  onConfirm: () => void
  onCancel?: () => void
}

/**
 * Styled confirm/alert dialog that replaces native window.confirm and
 * window.alert. Renders via a portal to document.body so it stacks
 * above the BottomSheet's transformed container (a position:fixed
 * descendant of a transformed ancestor would otherwise be positioned
 * relative to the ancestor, not the viewport).
 */
export function Dialog({
  open,
  title,
  body,
  confirmLabel = 'confirm',
  cancelLabel = 'cancel',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && onCancel) onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onCancel, onConfirm])

  if (!open) return null

  const showCancel = cancelLabel !== null && !!onCancel

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={showCancel ? onCancel : undefined}
        aria-hidden="true"
        className="fixed inset-0 z-[60] bg-pomegranate-950/55 backdrop-blur-[3px] animate-[fade_200ms_ease-out_forwards]"
        style={{ opacity: 1 }}
      />

      {/* Dialog card — centered */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="walkpod-dialog-title"
        className="fixed inset-0 z-[70] flex items-center justify-center p-6 pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-[380px] bg-cream border-2 border-pomegranate-600 px-7 pt-6 pb-6 shadow-[0_30px_60px_-20px_rgba(63,17,11,0.55)]"
          style={{
            animation: 'walkpod-dialog-in 260ms cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          <h3
            id="walkpod-dialog-title"
            className="font-slab font-black text-pomegranate-600 text-[24px] leading-[1.05] tracking-tight mb-2"
          >
            {title}
          </h3>
          {body && (
            <div className="font-mono text-[11px] text-pomegranate-500 leading-relaxed mb-5">
              {body}
            </div>
          )}
          <div className="flex gap-2">
            {showCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 border-2 border-pomegranate-600 text-pomegranate-600 font-mono text-[10px] uppercase tracking-[0.2em] py-3 hover:bg-pomegranate-600/5 active:translate-y-[1px] transition cursor-pointer"
              >
                {cancelLabel}
              </button>
            )}
            <button
              type="button"
              onClick={onConfirm}
              autoFocus
              className={
                'flex-1 text-cream font-mono text-[10px] uppercase tracking-[0.2em] py-3 active:translate-y-[1px] transition cursor-pointer ' +
                (danger
                  ? 'bg-pomegranate-950 hover:bg-pomegranate-900'
                  : 'bg-pomegranate-600 hover:bg-pomegranate-700')
              }
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Entry animation keyframes — scoped inline to keep it self-contained */}
      <style>{`
        @keyframes walkpod-dialog-in {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </>,
    document.body,
  )
}

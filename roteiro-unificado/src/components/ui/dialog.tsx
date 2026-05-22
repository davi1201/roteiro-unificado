import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  className?: string
  children?: ReactNode
}

export function Dialog({ open, onClose, className, children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    // Block body scroll while dialog is open
    document.body.style.overflow = 'hidden'

    // Close on Escape key
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    // Focus first focusable element inside the panel
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'input, button, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Overlay — closes dialog on click */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Panel — stops propagation so clicks inside don't close dialog */}
      <div
        ref={panelRef}
        className={cn('relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className, children }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5', className)}>{children}</div>
}

export function DialogTitle({ className, children }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 id="dialog-title" className={cn('text-xl font-semibold text-gray-900', className)}>
      {children}
    </h2>
  )
}

export function DialogDescription({ className, children }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-1 text-sm text-gray-500', className)}>{children}</p>
}

export function DialogContent({ className, children }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-4', className)}>{children}</div>
}

export function DialogFooter({ className, children }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex justify-end gap-3', className)}>{children}</div>
}

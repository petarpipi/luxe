import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEventHandler, ReactNode } from 'react'
import { X } from 'lucide-react'
import { images } from '../data'
import type { ImageName } from '../data'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Photo({
  name,
  alt,
  className = '',
  eager = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: {
  name: ImageName
  alt: string
  className?: string
  eager?: boolean
  sizes?: string
}) {
  const { width, height } = images[name]
  const widths = [...new Set([480, 960, width])]
  return (
    <img
      className={`photo ${className}`}
      src={`/images/${name}-960.webp`}
      srcSet={widths.map((w) => `/images/${name}-${w}.webp ${w}w`).join(', ')}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding={eager ? 'sync' : 'async'}
    />
  )
}

export function SectionHeader({
  id,
  index,
  eyebrow,
  title,
  intro,
}: {
  id: string
  index: string
  eyebrow: string
  title: ReactNode
  intro?: ReactNode
}) {
  return (
    <header className="section-head" data-reveal>
      <p className="eyebrow">
        <span className="eyebrow-index">{index}</span>
        {eyebrow}
      </p>
      <h2 id={id}>{title}</h2>
      {intro && <p className="section-intro">{intro}</p>}
    </header>
  )
}

/** Scrolls to an in-page section, updates the URL and moves keyboard focus to it. */
export function goToSection(hash: string) {
  const target = document.querySelector<HTMLElement>(hash)
  if (!target) return
  if (location.hash !== hash) history.pushState(null, '', hash)
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  target.focus({ preventScroll: true })
}

/** Reveals `[data-reveal]` blocks as they enter the viewport. Content already on screen is never hidden. */
export function useReveal() {
  useEffect(() => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    )
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
      const box = element.getBoundingClientRect()
      if (box.top < window.innerHeight && box.bottom > 0) element.classList.add('is-visible')
      else observer.observe(element)
    })
    document.documentElement.classList.add('reveal-ready')
    return () => observer.disconnect()
  }, [])
}

/** Returns the id of the section currently under the header. */
export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join('|')
  useEffect(() => {
    const sections = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => !!element)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length) setActive(visible.at(-1)!.target.id)
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.5) setActive(null)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [key])
  return active
}

export function Dialog({
  children,
  labelledBy,
  label,
  className = '',
  onClose,
  onKeyDown,
}: {
  children: ReactNode
  labelledBy?: string
  label?: string
  className?: string
  onClose: () => void
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement>
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [closing, setClosing] = useState(false)
  const requestClose = useCallback(() => {
    if (prefersReducedMotion()) onClose()
    else setClosing(true)
  }, [onClose])
  useEffect(() => {
    if (!closing) return
    // Fallback in case `animationend` never fires (e.g. the tab is in the background).
    const timer = window.setTimeout(onClose, 320)
    return () => window.clearTimeout(timer)
  }, [closing, onClose])
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const previous = document.activeElement as HTMLElement | null
    const { overflow, paddingRight } = document.body.style
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    if (!dialog.open) dialog.showModal()
    // Some engines focus the <dialog> itself; start on the close button instead.
    dialog.querySelector<HTMLElement>('.dialog-close')?.focus()
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [])
  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={`dialog ${className} ${closing ? 'is-closing' : ''}`}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.key !== 'Tab') return
        const focusable = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
          ),
        ).filter((element) => element.getClientRects().length > 0)
        const first = focusable[0]
        const last = focusable.at(-1)
        const atStart =
          document.activeElement === first || document.activeElement === event.currentTarget
        if (event.shiftKey && atStart) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
      onAnimationEnd={(event) => {
        if (closing && event.target === event.currentTarget) onClose()
      }}
    >
      <div className="dialog-surface">
        <button
          type="button"
          className="icon-button dialog-close"
          onClick={requestClose}
          aria-label="Close"
        >
          <X size={22} strokeWidth={1.4} aria-hidden="true" />
        </button>
        {children}
      </div>
    </dialog>
  )
}

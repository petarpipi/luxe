import { useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react'
import { journal, pad } from '../data'
import { Dialog, Photo, SectionHeader } from './Primitives'

const SWIPE_DISTANCE = 48

export default function Lookbook() {
  const [active, setActive] = useState<number | null>(null)
  const [direction, setDirection] = useState(1)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const count = journal.length
  const go = (next: number, dir: number) => {
    setDirection(dir)
    setActive((next + count) % count)
  }
  const step = (dir: number) => active !== null && go(active + dir, dir)
  function onKeys(event: KeyboardEvent) {
    if (active === null) return
    const moves: Record<string, [number, number]> = {
      ArrowRight: [active + 1, 1],
      ArrowLeft: [active - 1, -1],
      Home: [0, -1],
      End: [count - 1, 1],
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    go(...move)
  }
  const onPointerDown = (event: PointerEvent) => {
    pointer.current = { x: event.clientX, y: event.clientY }
  }
  const onPointerUp = (event: PointerEvent) => {
    const start = pointer.current
    pointer.current = null
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1)
  }
  const item = active === null ? null : journal[active]
  return (
    <section id="journal" className="section journal" aria-labelledby="journal-title" tabIndex={-1}>
      <SectionHeader
        id="journal-title"
        index="05"
        eyebrow="Journal"
        title={
          <>
            Rooms, in <em>daylight.</em>
          </>
        }
        intro="Reference rooms we return to for light, proportion and quiet. Select an image to view it larger."
      />
      <ul className="journal-grid">
        {journal.map((entry, index) => (
          <li
            key={entry.image}
            className="journal-item"
            data-reveal
            style={{ '--delay': `${(index % 2) * 80}ms` } as CSSProperties}
          >
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={`${entry.title}, view larger`}
              onClick={() => go(index, 1)}
            >
              <span className="journal-photo">
                <Photo
                  name={entry.image}
                  alt=""
                  sizes="(max-width: 699px) 100vw, (max-width: 1023px) 50vw, 40vw"
                />
                <span className="journal-expand" aria-hidden="true">
                  <Plus size={18} strokeWidth={1.5} />
                </span>
              </span>
            </button>
            <p className="journal-caption">
              <span className="journal-title">{entry.title}</span>
              <span className="journal-label">{entry.label}</span>
            </p>
          </li>
        ))}
      </ul>
      {item && active !== null && (
        <Dialog
          label="Journal gallery"
          className="lightbox"
          onClose={() => setActive(null)}
          onKeyDown={onKeys}
        >
          <div className="lightbox-content">
            <div
              className="lightbox-stage"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => (pointer.current = null)}
            >
              <AnimatePresence initial={false} custom={direction}>
                <m.div
                  key={active}
                  className="lightbox-layer"
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({ opacity: 0, x: dir * 28 }),
                    center: { opacity: 1, x: 0 },
                    exit: (dir: number) => ({ opacity: 0, x: dir * -28 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Photo
                    name={item.image}
                    alt={item.alt}
                    eager
                    sizes="(max-width: 899px) 100vw, 80vw"
                  />
                </m.div>
              </AnimatePresence>
            </div>
            <div className="lightbox-footer">
              <button
                type="button"
                className="icon-button"
                onClick={() => step(-1)}
                aria-label="Previous image"
              >
                <ArrowLeft size={22} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <div className="lightbox-caption" aria-live="polite">
                <h3>{item.title}</h3>
                <p>
                  {item.label} <span>{`${pad(active + 1)} / ${pad(count)}`}</span>
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => step(1)}
                aria-label="Next image"
              >
                <ArrowRight size={22} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  )
}

import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { formatPrice, pad, signaturePieces } from '../data'
import { Photo, SectionHeader } from './Primitives'
import { ProductDialog } from './Collection'

const ease = [0.22, 1, 0.36, 1] as const

export default function Signature() {
  const [active, setActive] = useState(0)
  const [details, setDetails] = useState(false)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const count = signaturePieces.length
  const piece = signaturePieces[active]
  function select(next: number, focus = false) {
    setActive(next)
    if (focus) tabs.current[next]?.focus()
  }
  function handleKeys(event: KeyboardEvent, index: number) {
    const keys: Record<string, number> = {
      ArrowRight: (index + 1) % count,
      ArrowLeft: (index - 1 + count) % count,
      Home: 0,
      End: count - 1,
    }
    if (!(event.key in keys)) return
    event.preventDefault()
    select(keys[event.key], true)
  }
  return (
    <section
      id="signature"
      className="section signature"
      aria-labelledby="signature-title"
      tabIndex={-1}
    >
      <SectionHeader
        id="signature-title"
        index="02"
        eyebrow="Signature"
        title={
          <>
            Three pieces we keep <em>returning</em> to.
          </>
        }
        intro="Larger, quieter pieces that anchor a room. Each one is built around a single idea."
      />
      <div className="signature-layout" data-reveal>
        <div className="signature-tabs" role="tablist" aria-label="Signature pieces">
          {signaturePieces.map((item, index) => (
            <button
              type="button"
              key={item.id}
              ref={(element) => {
                tabs.current[index] = element
              }}
              id={`signature-tab-${item.id}`}
              role="tab"
              aria-selected={index === active}
              aria-controls="signature-panel"
              tabIndex={index === active ? 0 : -1}
              onKeyDown={(event) => handleKeys(event, index)}
              onClick={() => select(index)}
            >
              <span className="tab-index">{pad(index + 1)}</span>
              <span className="tab-name">{item.name}</span>
              <span className="tab-note">{item.note}</span>
            </button>
          ))}
        </div>
        <div
          id="signature-panel"
          className="signature-panel"
          role="tabpanel"
          aria-labelledby={`signature-tab-${piece.id}`}
        >
          <div className="signature-media">
            <AnimatePresence initial={false}>
              <m.div
                key={piece.id}
                className="signature-layer"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease }}
              >
                <Photo name={piece.image} alt={piece.alt} sizes="(max-width: 899px) 100vw, 55vw" />
              </m.div>
            </AnimatePresence>
          </div>
          <div className="signature-copy">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={piece.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.28, ease }}
              >
                <p className="eyebrow">
                  {pad(active + 1)} / {pad(count)}
                </p>
                <h3>{piece.name}</h3>
                <p className="signature-description">{piece.description}</p>
                <dl className="spec-list">
                  <div>
                    <dt>Materials</dt>
                    <dd>{piece.material}</dd>
                  </div>
                  <div>
                    <dt>Dimensions</dt>
                    <dd>{piece.dimensions}</dd>
                  </div>
                </dl>
                <p className="signature-price">
                  {formatPrice(piece.price)} <span>indicative</span>
                </p>
              </m.div>
            </AnimatePresence>
            <button
              type="button"
              className="text-link"
              aria-haspopup="dialog"
              onClick={() => setDetails(true)}
            >
              View details <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      {details && <ProductDialog product={piece} onClose={() => setDetails(false)} />}
    </section>
  )
}

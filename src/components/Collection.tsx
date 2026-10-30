import { useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { m } from 'motion/react'
import { categories, formatPrice, pad, products } from '../data'
import type { Category, Product } from '../data'
import { Dialog, Photo, SectionHeader, goToSection } from './Primitives'

export const ENQUIRE_EVENT = 'luxe:enquire'

export function ProductDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const titleId = `product-${product.id}-title`
  return (
    <Dialog labelledBy={titleId} className="product-dialog" onClose={onClose}>
      <div className="product-dialog-media">
        <Photo
          name={product.image}
          alt={product.alt}
          sizes="(max-width: 760px) 100vw, 520px"
          eager
        />
      </div>
      <div className="product-dialog-copy">
        <p className="eyebrow">{product.category}</p>
        <h2 id={titleId}>{product.name}</h2>
        <p className="dialog-price">{formatPrice(product.price)}</p>
        <p className="dialog-description">{product.description}</p>
        <dl className="spec-list">
          <div>
            <dt>Materials</dt>
            <dd>{product.material}</dd>
          </div>
          <div>
            <dt>Dimensions</dt>
            <dd>{product.dimensions}</dd>
          </div>
        </dl>
        <button
          type="button"
          className="button button-dark"
          onClick={() => {
            window.dispatchEvent(new CustomEvent(ENQUIRE_EVENT, { detail: product.name }))
            onClose()
            window.setTimeout(() => goToSection('#contact'), 0)
          }}
        >
          Enquire about this piece <ArrowUpRight size={18} aria-hidden="true" />
        </button>
        <p className="fine-print">
          A design concept. Photography is illustrative; specifications and prices are indicative
          and the piece is not for sale.
        </p>
      </div>
    </Dialog>
  )
}

export default function Collection() {
  const [category, setCategory] = useState<Category>('All pieces')
  const [selected, setSelected] = useState<Product | null>(null)
  const filtered = useRef(false)
  const visible =
    category === 'All pieces'
      ? products
      : products.filter((product) => product.category === category)
  return (
    <section
      id="collection"
      className="section collection"
      aria-labelledby="collection-title"
      tabIndex={-1}
    >
      <SectionHeader
        id="collection-title"
        index="01"
        eyebrow="Collection"
        title={
          <>
            Six pieces for <em>everyday</em> rooms.
          </>
        }
        intro="Seating, tables, light and storage in oak, wool, linen and stone. Prices are indicative for this concept."
      />
      <div className="collection-toolbar">
        <div className="filters" role="group" aria-label="Filter by category">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={item === category}
              onClick={() => {
                filtered.current = true
                setCategory(item)
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="piece-count" aria-live="polite">
          {pad(visible.length)} {visible.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>
      <div className="product-grid" data-testid="product-grid">
        {visible.map((product, index) => (
          <m.article
            className="product-card"
            key={`${category}-${product.id}`}
            initial={filtered.current ? { opacity: 0, y: 14 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="product-media">
              <Photo
                name={product.image}
                alt=""
                sizes="(max-width: 559px) 50vw, (max-width: 1023px) 50vw, 30vw"
              />
            </div>
            <div className="product-meta">
              <h3>
                <button
                  type="button"
                  className="card-trigger"
                  aria-haspopup="dialog"
                  onClick={() => setSelected(product)}
                >
                  {product.name}
                </button>
              </h3>
              <p className="product-material">{product.material}</p>
              <p className="product-price">{formatPrice(product.price)}</p>
            </div>
            <span className="product-hint" aria-hidden="true">
              View <ArrowRight size={14} />
            </span>
          </m.article>
        ))}
      </div>
      {selected && <ProductDialog product={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}

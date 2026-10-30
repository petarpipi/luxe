import { ArrowRight, ArrowUp } from 'lucide-react'
import Navigation, { navigation } from './components/Navigation'
import Collection from './components/Collection'
import Signature from './components/Signature'
import Lookbook from './components/Lookbook'
import Contact from './components/Contact'
import { Photo, SectionHeader, useReveal } from './components/Primitives'
import { pad } from './data'
import credits from '../public/images/sources.json'

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">Collection 01 · Oak, stone, wool</p>
        <h1 id="hero-title">
          <span className="hero-line">Furniture for</span>{' '}
          <span className="hero-line">
            <em>slower</em> rooms.
          </span>
        </h1>
        <p className="hero-lead">
          Oak, travertine and wool, shaped into a short collection of pieces designed to be lived
          with for decades.
        </p>
        <div className="hero-actions">
          <a href="#collection" className="button button-dark">
            View the collection <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a href="#contact" className="text-link">
            Book a consultation
          </a>
        </div>
      </div>
      <figure className="hero-media">
        <Photo
          name="hero"
          alt="Oak dining chairs around a stone-topped table on a fluted pedestal in warm late-afternoon sunlight, with open oak shelving behind"
          eager
          sizes="(max-width: 959px) 100vw, 56vw"
        />
        <figcaption>
          <span>In the picture</span>
          Colonna dining table, travertine
        </figcaption>
      </figure>
    </section>
  )
}

function Statement() {
  return (
    <section className="statement" aria-label="Studio statement">
      <p data-reveal>
        We design a few pieces each year. Every one begins with a material and the room it belongs
        in, and is refined until its proportions feel <em>quiet.</em>
      </p>
    </section>
  )
}

const principles = [
  {
    title: 'Solid materials',
    text: 'Oak, walnut, stone and wool, chosen for how they age rather than how they look on day one.',
  },
  {
    title: 'Made to be kept',
    text: 'Covers come off, oiled surfaces can be renewed, and parts can be replaced instead of the whole.',
  },
  {
    title: 'Tested in real rooms',
    text: 'Proportions are checked at full size, in daylight, before a finish is chosen.',
  },
]

function Approach() {
  return (
    <section
      id="approach"
      className="section approach"
      aria-labelledby="approach-title"
      tabIndex={-1}
    >
      <figure className="approach-media" data-reveal>
        <div className="approach-photo parallax">
          <Photo
            name="philosophy"
            alt="Two textured stoneware vases with bare branches on a sunlit windowsill beside linen curtains"
            sizes="(max-width: 899px) 100vw, 45vw"
          />
        </div>
        <figcaption>
          Stoneware, linen and late sun: the palette the collection is built from.
        </figcaption>
      </figure>
      <div className="approach-copy">
        <SectionHeader
          id="approach-title"
          index="03"
          eyebrow="Approach"
          title={
            <>
              Fewer pieces, <em>made to stay.</em>
            </>
          }
          intro="LUXE is a design concept for a small furniture studio. Each piece starts with one material and is drawn around what that material does well."
        />
        <ol className="principles" data-reveal>
          {principles.map((item, index) => (
            <li key={item.title}>
              <span className="principle-index">{pad(index + 1)}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <figure className="approach-detail" data-reveal>
          <Photo
            name="detail"
            alt="Speckled stoneware bottle on a travertine shelf in a band of sunlight"
            sizes="(max-width: 899px) 40vw, 200px"
          />
          <figcaption>Speckled stoneware on honed travertine.</figcaption>
        </figure>
      </div>
    </section>
  )
}

const materials = [
  {
    image: 'wood',
    name: 'Oak',
    title: 'Oiled by hand',
    text: 'European oak, finished with natural oil. It deepens slowly toward honey in daylight.',
    alt: 'Hands marking a pale oak board with a pencil on a workbench covered in wood shavings',
  },
  {
    image: 'stone',
    name: 'Travertine',
    title: 'Honed, never polished',
    text: 'Unfilled travertine keeps its pores and veins, so no two tops are the same.',
    alt: 'Row of travertine columns casting long shadows in low sunlight',
  },
  {
    image: 'linen',
    name: 'Linen',
    title: 'Washed and heavy',
    text: 'Stonewashed linen for covers and shades. It softens with use and takes colour gently.',
    alt: 'Shadow of a plant falling across a draped sheet of natural linen',
  },
] as const

function Materials() {
  return (
    <section
      id="materials"
      className="section materials"
      aria-labelledby="materials-title"
      tabIndex={-1}
    >
      <SectionHeader
        id="materials-title"
        index="04"
        eyebrow="Materials"
        title={
          <>
            Material <em>first.</em>
          </>
        }
        intro="Three materials define the collection. They are chosen for how they wear, and left honest enough to show it."
      />
      <ul className="materials-grid">
        {materials.map((item) => (
          <li key={item.name} className="material" data-reveal>
            <div className="material-photo parallax">
              <Photo name={item.image} alt={item.alt} sizes="(max-width: 899px) 100vw, 32vw" />
            </div>
            <p className="eyebrow">{item.name}</p>
            <h3>{item.title}</h3>
            <p className="material-text">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <a href="#top" className="wordmark" aria-label="LUXE, back to top">
            LUXE<span aria-hidden="true">.</span>
          </a>
          <p>Furniture in oak, stone and wool, for rooms that are lived in slowly.</p>
        </div>
        <nav aria-label="Footer" className="footer-nav">
          <p className="eyebrow">Explore</p>
          <ul>
            {navigation.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
            <li>
              <a href="#contact">Consultation</a>
            </li>
          </ul>
        </nav>
        <div className="footer-credits">
          <p className="eyebrow">Photography</p>
          <details>
            <summary>Image credits ({credits.length})</summary>
            <ul>
              {credits.map((credit) => (
                <li key={credit.name}>
                  <a href={credit.source} target="_blank" rel="noreferrer">
                    {credit.author}
                  </a>{' '}
                  on Unsplash
                </li>
              ))}
            </ul>
          </details>
        </div>
        <a className="back-to-top" href="#top">
          Back to top
          <span aria-hidden="true">
            <ArrowUp size={18} />
          </span>
        </a>
      </div>
      <div className="footer-bottom">
        <p>© 2026 LUXE. A fictional brand and self-initiated portfolio concept.</p>
        <p>No products are offered for sale. Photography used under the Unsplash License.</p>
      </div>
    </footer>
  )
}

export default function App() {
  useReveal()
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="top" tabIndex={-1} />
      <Navigation />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Statement />
        <Collection />
        <Signature />
        <Approach />
        <Materials />
        <Lookbook />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

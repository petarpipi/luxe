import { useEffect, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { ArrowUpRight, Menu } from 'lucide-react'
import { pad } from '../data'
import { Dialog, goToSection, useScrollSpy } from './Primitives'

export const navigation = [
  { label: 'Collection', href: '#collection' },
  { label: 'Signature', href: '#signature' },
  { label: 'Approach', href: '#approach' },
  { label: 'Materials', href: '#materials' },
  { label: 'Journal', href: '#journal' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useScrollSpy([...navigation.map((link) => link.href.slice(1)), 'contact'])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 960px)')
    const onChange = () => desktop.matches && setOpen(false)
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])
  const fromMenu = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault()
    setOpen(false)
    // Wait for the dialog to unmount so its focus restoration does not win.
    window.setTimeout(() => goToSection(href), 0)
  }
  return (
    <>
      <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="wordmark" href="#top" aria-label="LUXE, back to top">
          LUXE<span aria-hidden="true">.</span>
        </a>
        <nav aria-label="Main" className="desktop-nav">
          {navigation.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={active === link.href.slice(1) ? 'true' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          className="header-cta"
          href="#contact"
          aria-current={active === 'contact' ? 'true' : undefined}
        >
          Book a consultation
        </a>
        <button
          type="button"
          className="icon-button menu-toggle"
          aria-label="Open menu"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          <Menu size={24} strokeWidth={1.4} aria-hidden="true" />
        </button>
      </header>
      {open && (
        <Dialog label="Menu" className="menu-dialog" onClose={() => setOpen(false)}>
          <p className="wordmark menu-wordmark" aria-hidden="true">
            LUXE.
          </p>
          <nav aria-label="Menu">
            <ol className="menu-links">
              {navigation.map((link, index) => (
                <li key={link.href} style={{ '--i': index } as CSSProperties}>
                  <a href={link.href} onClick={(event) => fromMenu(event, link.href)}>
                    <span className="menu-index">{pad(index + 1)}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <a
            className="button button-dark menu-cta"
            href="#contact"
            onClick={(event) => fromMenu(event, '#contact')}
          >
            Book a consultation <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <p className="menu-note">
            Furniture in oak, stone and wool.
            <br />A design concept by LUXE.
          </p>
        </Dialog>
      )}
    </>
  )
}

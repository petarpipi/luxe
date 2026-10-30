import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import type { ReactNode } from 'react'
import App from '../App'
import Collection from '../components/Collection'
import Contact, { validateContact } from '../components/Contact'
import Signature from '../components/Signature'
import Lookbook from '../components/Lookbook'
import Navigation from '../components/Navigation'
import { Dialog } from '../components/Primitives'
import { journal, products, signaturePieces } from '../data'
import sources from '../../public/images/sources.json'

const mount = (node: ReactNode) =>
  render(
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="always">{node}</MotionConfig>
    </LazyMotion>,
  )

describe('Collection', () => {
  it('filters by category and restores all six pieces', async () => {
    const user = userEvent.setup()
    mount(<Collection />)
    expect(screen.getAllByRole('article')).toHaveLength(6)
    await user.click(screen.getByRole('button', { name: 'Seating' }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Seating' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('01 piece')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'All pieces' }))
    expect(screen.getAllByRole('article')).toHaveLength(6)
  })

  it('gives every product card exactly one keyboard stop', () => {
    mount(<Collection />)
    for (const card of screen.getAllByRole('article')) {
      expect(card.querySelectorAll('button, a[href], [tabindex="0"]')).toHaveLength(1)
    }
  })

  it('opens honest product details, locks scrolling and restores focus', async () => {
    const user = userEvent.setup()
    mount(<Collection />)
    const trigger = screen.getByRole('button', { name: 'Arca Lounge Chair' })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Arca Lounge Chair' })
    expect(within(dialog).getByText(/not for sale/)).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
    await user.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
  })

  it('pre-fills the consultation form when enquiring about a piece', async () => {
    const user = userEvent.setup()
    mount(
      <>
        <Collection />
        <Contact />
      </>,
    )
    await user.click(screen.getByRole('button', { name: 'Linea Dining Table' }))
    await user.click(screen.getByRole('button', { name: /Enquire about this piece/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText('What are you planning?')).toHaveValue('A single piece')
    expect(screen.getByLabelText('About the space')).toHaveValue(
      'I would like to know more about the Linea Dining Table.',
    )
  })
})

describe('Dialog', () => {
  it('plays its exit animation before closing when motion is allowed', () => {
    vi.useFakeTimers()
    const original = window.matchMedia
    window.matchMedia = (() => ({ matches: false })) as unknown as typeof window.matchMedia
    try {
      const onClose = vi.fn()
      render(
        <Dialog label="Test" onClose={onClose}>
          <p>Body</p>
        </Dialog>,
      )
      const dialog = screen.getByRole('dialog', { name: 'Test' })
      fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
      expect(dialog).toHaveClass('is-closing')
      expect(onClose).not.toHaveBeenCalled()
      act(() => vi.advanceTimersByTime(400))
      expect(onClose).toHaveBeenCalledOnce()
    } finally {
      window.matchMedia = original
      vi.useRealTimers()
    }
  })
})

describe('Signature selector', () => {
  it('supports roving tabs, wraparound, Home and End', async () => {
    const user = userEvent.setup()
    mount(<Signature />)
    const tabs = screen.getAllByRole('tab')
    tabs[0].focus()
    await user.keyboard('{ArrowLeft}')
    expect(tabs[2]).toHaveFocus()
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tabs[2].id)
    await user.keyboard('{Home}')
    expect(tabs[0]).toHaveFocus()
    await user.keyboard('{End}')
    expect(tabs[2]).toHaveFocus()
  })

  it('opens the details of the selected signature piece', async () => {
    const user = userEvent.setup()
    mount(<Signature />)
    await user.click(screen.getByRole('tab', { name: /Dune Sofa/ }))
    await user.click(screen.getByRole('button', { name: /View details/ }))
    expect(screen.getByRole('dialog', { name: 'Dune Sofa' })).toBeInTheDocument()
  })
})

describe('Journal lightbox', () => {
  it('navigates with keys, wraps around and closes', async () => {
    const user = userEvent.setup()
    mount(<Lookbook />)
    await user.click(screen.getByRole('button', { name: /The reading alcove/ }))
    const dialog = screen.getByRole('dialog', { name: 'Journal gallery' })
    within(dialog).getByRole('button', { name: 'Close' }).focus()
    await user.keyboard('{ArrowLeft}')
    await waitFor(() =>
      expect(within(dialog).getByRole('heading', { name: journal.at(-1)!.title })).toBeVisible(),
    )
    await user.keyboard('{ArrowRight}')
    await waitFor(() =>
      expect(within(dialog).getByRole('heading', { name: journal[0].title })).toBeVisible(),
    )
    fireEvent(dialog, new Event('cancel', { bubbles: false, cancelable: true }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('changes image with a horizontal swipe', async () => {
    const user = userEvent.setup()
    mount(<Lookbook />)
    await user.click(screen.getByRole('button', { name: /The reading alcove/ }))
    const dialog = screen.getByRole('dialog', { name: 'Journal gallery' })
    const stage = dialog.querySelector('.lightbox-stage')!
    fireEvent.pointerDown(stage, { clientX: 300, clientY: 200 })
    fireEvent.pointerUp(stage, { clientX: 180, clientY: 210 })
    await waitFor(() =>
      expect(within(dialog).getByRole('heading', { name: journal[1].title })).toBeVisible(),
    )
    fireEvent.pointerDown(stage, { clientX: 100, clientY: 200 })
    fireEvent.pointerUp(stage, { clientX: 260, clientY: 200 })
    await waitFor(() =>
      expect(within(dialog).getByRole('heading', { name: journal[0].title })).toBeVisible(),
    )
  })
})

describe('Contact validation', () => {
  it('rejects blank or whitespace-only values', () => {
    expect(
      Object.keys(
        validateContact({ name: '  ', email: ' ', project: '', message: ' '.repeat(20) }),
      ),
    ).toHaveLength(4)
  })
  it('rejects malformed email and short messages', () => {
    expect(
      validateContact({ name: 'Alex', email: 'alex@', project: 'A full home', message: 'Short' }),
    ).toEqual({ email: expect.any(String), message: expect.any(String) })
  })
  it('accepts a well-formed enquiry', () => {
    expect(
      validateContact({
        name: 'Alex',
        email: 'alex@example.com',
        project: 'A full home',
        message: 'A quiet living room with natural materials.',
      }),
    ).toEqual({})
  })
  it('focuses the first error and marks invalid fields accessibly', async () => {
    const user = userEvent.setup()
    mount(<Contact />)
    await user.click(screen.getByRole('button', { name: /Preview enquiry/ }))
    const name = screen.getByLabelText('Name')
    expect(name).toHaveFocus()
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription(/Please enter your name/)
    expect(screen.getByText(/Please choose what you are planning/)).toBeInTheDocument()
  })
  it('confirms a local preview without sending a request and resets', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    mount(<Contact />)
    await user.type(screen.getByLabelText('Name'), 'Alex Morgan')
    await user.type(screen.getByLabelText('Email'), 'alex@example.com')
    await user.selectOptions(screen.getByLabelText('What are you planning?'), 'A full home')
    await user.type(
      screen.getByLabelText('About the space'),
      'A quiet living room with natural materials.',
    )
    await user.click(screen.getByRole('button', { name: /Preview enquiry/ }))
    expect(screen.getByRole('status')).toHaveTextContent('nothing has been sent or stored')
    expect(fetchSpy).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: /Start a new enquiry/ }))
    expect(screen.getByLabelText('Name')).toHaveValue('')
    fetchSpy.mockRestore()
  })
})

describe('Mobile navigation', () => {
  it('closes and moves focus to the chosen section', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mount(
      <>
        <Navigation />
        <section id="materials" tabIndex={-1} aria-label="Materials section" />
      </>,
    )
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    await user.click(within(dialog).getByRole('link', { name: /Materials/ }))
    act(() => vi.runAllTimers())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Materials section' })).toHaveFocus()
    expect(location.hash).toBe('#materials')
    vi.useRealTimers()
  })
})

describe('Content integrity', () => {
  it('uses every photograph once and credits every one of them', () => {
    const { container } = mount(<App />)
    const used = Array.from(container.querySelectorAll('img')).map(
      (image) => image.getAttribute('src')!.match(/\/images\/([a-z]+)-/)![1],
    )
    expect(new Set(used).size).toBe(used.length)
    // Only the selected signature piece is rendered; the other two appear when their tab is chosen.
    const everything = new Set([...used, ...signaturePieces.map((piece) => piece.image)])
    expect([...everything].sort()).toEqual(sources.map((source) => source.name).sort())
    expect(everything.size).toBe(used.length + signaturePieces.length - 1)
    for (const source of sources) expect(source.license).toBe('https://unsplash.com/license')
  })

  it('does not repeat any paragraph or slogan', () => {
    const { container } = mount(<App />)
    const paragraphs = Array.from(container.querySelectorAll('p'))
      .map((paragraph) => paragraph.textContent!.trim())
      .filter((text) => text.split(' ').length > 3)
    expect(new Set(paragraphs).size).toBe(paragraphs.length)
  })

  it('keeps product and signature data distinct', () => {
    const ids = [...products, ...signaturePieces].map((piece) => piece.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

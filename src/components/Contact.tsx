import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUpRight, Check, RotateCcw } from 'lucide-react'
import { ENQUIRE_EVENT } from './Collection'

export interface ContactValues {
  name: string
  email: string
  project: string
  message: string
}
export function validateContact(values: ContactValues) {
  const errors: Partial<Record<keyof ContactValues, string>> = {}
  if (values.name.trim().length < 2) errors.name = 'Please enter your name (at least 2 characters).'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'Please enter a valid email address.'
  if (!values.project) errors.project = 'Please choose what you are planning.'
  if (values.message.trim().length < 20)
    errors.message = 'Please tell us a little more (at least 20 characters).'
  return errors
}
export const projectTypes = [
  'A single piece',
  'Furnishing a room',
  'A full home',
  'Interior design collaboration',
  'Something else',
]
const emptyValues: ContactValues = { name: '', email: '', project: '', message: '' }

export default function Contact() {
  const [values, setValues] = useState<ContactValues>(emptyValues)
  const [errors, setErrors] = useState<ReturnType<typeof validateContact>>({})
  const [complete, setComplete] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onEnquire = (event: Event) => {
      const piece = (event as CustomEvent<string>).detail
      setComplete(false)
      setErrors({})
      setValues((current) => ({
        ...current,
        project: 'A single piece',
        message: current.message || `I would like to know more about the ${piece}.`,
      }))
    }
    window.addEventListener(ENQUIRE_EVENT, onEnquire)
    return () => window.removeEventListener(ENQUIRE_EVENT, onEnquire)
  }, [])
  function update(key: keyof ContactValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    const result = validateContact(values)
    setErrors(result)
    const firstError = Object.keys(result)[0]
    if (firstError) formRef.current?.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus()
    else {
      setComplete(true)
      requestAnimationFrame(() => successRef.current?.focus())
    }
  }
  const describedBy = (key: keyof ContactValues, hint?: string) =>
    errors[key] ? `error-${key}` : hint
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title" tabIndex={-1}>
      <div className="contact-copy" data-reveal>
        <p className="eyebrow">
          <span className="eyebrow-index">06</span>Consultation
        </p>
        <h2 id="contact-title">
          Plan a room <em>with us.</em>
        </h2>
        <p className="contact-lead">
          Tell us about the space, the light and how you live in it. A consultation starts with a
          floor plan and a few photographs.
        </p>
        <ul className="contact-steps">
          <li>
            <span>01</span>Share the room and what it is for.
          </li>
          <li>
            <span>02</span>Review a short proposal with material samples.
          </li>
          <li>
            <span>03</span>Refine sizes and finishes before anything is made.
          </li>
        </ul>
      </div>
      <div className="contact-form-wrap" data-reveal>
        <p className="demo-notice">
          <span className="notice-dot" aria-hidden="true" />
          Portfolio demonstration: this form validates in your browser and sends nothing.
        </p>
        {complete ? (
          <div className="form-success" role="status" tabIndex={-1} ref={successRef}>
            <span className="success-icon" aria-hidden="true">
              <Check size={28} strokeWidth={1.4} />
            </span>
            <h3>Thank you, {values.name.trim().split(' ')[0]}.</h3>
            <p>
              Your enquiry passed validation. Because this is a design concept, nothing has been
              sent or stored.
            </p>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setComplete(false)
                setValues(emptyValues)
                requestAnimationFrame(() =>
                  formRef.current?.querySelector<HTMLInputElement>('input')?.focus(),
                )
              }}
            >
              Start a new enquiry <RotateCcw size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={submit} noValidate>
            <div className="form-row">
              <div className="field">
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  value={values.name}
                  maxLength={100}
                  required
                  aria-invalid={!!errors.name}
                  aria-describedby={describedBy('name')}
                  onChange={(event) => update('name', event.target.value)}
                />
                {errors.name && (
                  <p className="field-error" id="error-name">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="field">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={values.email}
                  maxLength={200}
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={describedBy('email')}
                  onChange={(event) => update('email', event.target.value)}
                />
                {errors.email && (
                  <p className="field-error" id="error-email">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
            <div className="field">
              <label htmlFor="contact-project">What are you planning?</label>
              <select
                id="contact-project"
                name="project"
                value={values.project}
                required
                aria-invalid={!!errors.project}
                aria-describedby={describedBy('project')}
                onChange={(event) => update('project', event.target.value)}
              >
                <option value="">Choose one</option>
                {projectTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
              {errors.project && (
                <p className="field-error" id="error-project">
                  {errors.project}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="contact-message">About the space</label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                value={values.message}
                maxLength={3000}
                required
                aria-invalid={!!errors.message}
                aria-describedby={describedBy('message', 'message-hint')}
                onChange={(event) => update('message', event.target.value)}
              />
              {errors.message ? (
                <p className="field-error" id="error-message">
                  {errors.message}
                </p>
              ) : (
                <p className="field-hint" id="message-hint">
                  Room size, light, and how you use it. 20 characters minimum. All fields are
                  required.
                </p>
              )}
            </div>
            <button className="button button-dark submit-button" type="submit">
              Preview enquiry <ArrowUpRight size={18} aria-hidden="true" />
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

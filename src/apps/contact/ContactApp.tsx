import { useState } from 'react'
import type { FormEvent } from 'react'

import { Mail, Send } from '@/components/PixelIcon'

import {
  osAppHeight,
  osAppShellClass,
  osBtnPrimaryClass,
  osInputClass,
  osPanelBareClass,
  osScrollClass,
} from '@/apps/shared/appStyles'
import { cn } from '@/lib/cn'

const contactEmail = 'felix.wohnhaas@outlook.com'

export function ContactApp() {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(description)}`

    window.location.href = mailto
    setSent(true)
  }

  return (
    <section className={cn(osAppShellClass, osAppHeight.compact)} aria-label="Contact Felix">
      <div className="os-section-header">
        <div>
          <p className="os-section-header__kicker">CONTACT</p>
          <strong className="os-section-header__title">Send Felix an email</strong>
        </div>
      </div>

      <div className={cn('min-h-0 flex-1 overflow-auto p-4', osScrollClass)}>
        <div className={cn(osPanelBareClass, 'p-4')}>
          <header className="mb-3 flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center border-2 border-ink bg-lagoon text-ink shadow-chip">
              <Mail aria-hidden="true" size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="m-0 text-[1.12rem] tracking-normal">Get in touch</h2>
              <p className="mt-1 mb-0 text-meta leading-relaxed text-os-ink-muted">
                For projects, questions, or sharp ideas, write to{' '}
                <a
                  className="font-black text-os-ink underline decoration-os-border-strong underline-offset-2"
                  href={`mailto:${contactEmail}`}
                >
                  {contactEmail}
                </a>
                .
              </p>
            </div>
          </header>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-caption font-black text-os-ink-muted">
              Subject
              <input
                className={osInputClass}
                maxLength={160}
                minLength={2}
                onChange={(event) => {
                  setSubject(event.currentTarget.value)
                  setSent(false)
                }}
                placeholder="What's this about?"
                required
                value={subject}
              />
            </label>
            <label className="grid gap-1.5 text-caption font-black text-os-ink-muted">
              Description
              <textarea
                className={cn(osInputClass, 'min-h-40 resize-y leading-relaxed')}
                maxLength={6000}
                onChange={(event) => {
                  setDescription(event.currentTarget.value)
                  setSent(false)
                }}
                placeholder="Write your message..."
                required
                value={description}
              />
            </label>
            <button
              type="submit"
              className={osBtnPrimaryClass}
              disabled={!subject.trim() || !description.trim()}
            >
              <Send aria-hidden="true" size={16} />
              Open in email client
            </button>
          </form>

          {sent ? (
            <p className="mt-3 mb-0 border-2 border-ink bg-foam p-3 text-meta font-extrabold leading-relaxed text-os-ink-muted">
              Email client opened. If nothing happened, write to{' '}
              <a className="font-black text-os-ink" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
              .
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

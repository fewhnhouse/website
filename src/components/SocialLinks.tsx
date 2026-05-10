import { Github, Linkedin } from 'lucide-react'

const GITHUB = 'https://github.com/fewhnhouse'
const LINKEDIN = 'https://www.linkedin.com/in/felix-wohnhaas-b44623142/'

type SocialLinksProps = {
  className?: string
  iconClassName?: string
}

export default function SocialLinks({
  className = '',
  iconClassName = 'h-5 w-5',
}: SocialLinksProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <a
        href={GITHUB}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
      >
        <span className="sr-only">Felix on GitHub</span>
        <Github className={iconClassName} aria-hidden />
      </a>
      <a
        href={LINKEDIN}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
      >
        <span className="sr-only">Felix on LinkedIn</span>
        <Linkedin className={iconClassName} aria-hidden />
      </a>
    </div>
  )
}

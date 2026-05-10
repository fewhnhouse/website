import SocialLinks from './SocialLinks'

const pageWrapClass = 'mx-auto w-[min(1080px,calc(100%_-_2rem))]'
const kickerClass =
  'text-[0.69rem] font-bold uppercase tracking-[0.16em] text-kicker'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-line bg-[color-mix(in_oklab,var(--header-bg)_84%,transparent_16%)] px-4 pt-10 pb-14 text-ink-soft">
      <div className={`${pageWrapClass} flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left`}>
        <p className="m-0 text-sm">
          &copy; {year} Felix Wohnhaas. Crafted with care.
        </p>
        <p className={`${kickerClass} m-0`}>TanStack Start · React · TypeScript</p>
      </div>
      <div className="mt-4 flex justify-center sm:hidden">
        <SocialLinks iconClassName="h-6 w-6" />
      </div>
    </footer>
  )
}

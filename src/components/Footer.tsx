import SocialLinks from './SocialLinks'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer mt-20 px-4 pb-14 pt-10 text-[var(--sea-ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">
          &copy; {year} Felix Wohnhaas. Crafted with care.
        </p>
        <p className="island-kicker m-0">TanStack Start · React · TypeScript</p>
      </div>
      <div className="mt-4 flex justify-center sm:hidden">
        <SocialLinks iconClassName="h-6 w-6" />
      </div>
    </footer>
  )
}

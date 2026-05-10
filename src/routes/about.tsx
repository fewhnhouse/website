import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

const pageWrapClass = 'mx-auto w-[min(1080px,calc(100%_-_2rem))]'
const islandShellClass =
  'rounded-2xl border border-line bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] p-6 shadow-island backdrop-blur-sm sm:p-8'
const kickerClass =
  'text-[0.69rem] font-bold uppercase tracking-[0.16em] text-kicker'

function About() {
  return (
    <main className={`${pageWrapClass} px-4 py-12`}>
      <section className={islandShellClass}>
        <p className={`${kickerClass} mb-2`}>About</p>
        <h1 className="mb-3 font-display text-4xl font-bold text-ink sm:text-5xl">
          A small starter with room to grow.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-ink-soft">
          TanStack Start gives you type-safe routing, server functions, and
          modern SSR defaults. Use this as a clean foundation, then layer in
          your own routes, styling, and add-ons.
        </p>
      </section>
    </main>
  )
}

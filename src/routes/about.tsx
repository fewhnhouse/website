import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

const pageWrapClass = 'mx-auto w-[min(1080px,calc(100%_-_2rem))]'
const islandShellClass =
  'rounded-2xl border border-[var(--line)] bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] p-6 shadow-[inset_0_1px_0_var(--inset-glint),0_22px_44px_rgba(30,90,72,0.1),0_6px_18px_rgba(23,58,64,0.08)] backdrop-blur-sm sm:p-8'
const kickerClass =
  'text-[0.69rem] font-bold uppercase tracking-[0.16em] text-[var(--kicker)]'

function About() {
  return (
    <main className={`${pageWrapClass} px-4 py-12`}>
      <section className={islandShellClass}>
        <p className={`${kickerClass} mb-2`}>About</p>
        <h1 className="mb-3 font-['Fraunces',Georgia,serif] text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          A small starter with room to grow.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          TanStack Start gives you type-safe routing, server functions, and
          modern SSR defaults. Use this as a clean foundation, then layer in
          your own routes, styling, and add-ons.
        </p>
      </section>
    </main>
  )
}

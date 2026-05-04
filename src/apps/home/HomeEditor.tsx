import type { RefObject } from 'react'

type HomeEditorProps = {
  documentRef: RefObject<HTMLElement | null>
}

const toolbarButtonClass =
  'rounded-control border border-os-border bg-white/65 px-2.5 py-1.5 text-caption font-black text-os-ink-muted'
const documentClass =
  'min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-6 pt-5 pb-6 text-os-ink [max-height:calc(min(640px,calc(100svh_-_7.25rem))_-_86px)] [scrollbar-color:rgba(50,143,151,0.46)_transparent] [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-lagoon-deep/45 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-track]:bg-transparent [&_h1]:mt-0 [&_h2]:mt-0 [&_p]:mt-0 [&_pre]:mt-0 [&_ul]:mt-0 [.os-window--maximized_&]:[max-height:calc(100svh_-_218px)] max-[720px]:p-4 max-[720px]:[max-height:calc(100svh_-_14rem)]'

export function HomeEditor({ documentRef }: HomeEditorProps) {
  return (
    <>
      <div
        className="flex flex-wrap gap-2 border-b border-os-border bg-foam/80 px-3 py-2.5"
        aria-label="Editor toolbar"
      >
        <button type="button" className={toolbarButtonClass}>
          Preview
        </button>
        <button type="button" className={toolbarButtonClass}>
          Markdown
        </button>
        <button type="button" className={toolbarButtonClass}>
          Word wrap
        </button>
      </div>

      <article ref={documentRef} className={documentClass}>
        <p className="font-mono text-[0.76rem] font-extrabold text-lagoon-deep">
          ~/felix-website/home.mdx
        </p>
        <div className="mb-5 grid grid-cols-[10.5rem_minmax(0,1fr)] items-center gap-5 max-[720px]:grid-cols-1 max-[720px]:justify-items-start">
          <img
            className="aspect-square w-[10.5rem] rounded-full border border-os-border object-cover object-[50%_30%] shadow-avatar max-[720px]:w-30"
            src="/felix-portrait.jpg"
            alt="Felix Wohnhaas"
          />
          <div>
            <p className="mb-1.5 font-mono text-meta font-black text-palm">
              home.mdx
            </p>
            <h1 className="mb-3.5 text-[clamp(1.85rem,4vw,3.3rem)] leading-none tracking-normal">
              Felix Wohnhaas
            </h1>
            <p className="text-[0.94rem] leading-[1.78]">
              I build software and infrastructure, and I like systems that are direct, reliable,
              and easy to reason about.
            </p>
          </div>
        </div>

        <h2 className="mb-1.5 pt-2 text-base">What I care about</h2>
        <p className="text-[0.94rem] leading-[1.78]">
          My work tends to sit where product engineering meets operations: turning ideas into
          usable interfaces, wiring them to dependable backend systems, and keeping the deployment
          path boring enough that teams can move quickly.
        </p>
        <p className="text-[0.94rem] leading-[1.78]">
          I enjoy clean TypeScript, pragmatic architecture, good developer experience,
          observability, automation, and infrastructure that does not require heroics to operate.
          The best systems feel calm because the important tradeoffs have already been made
          explicit.
        </p>

        <h2 className="mb-1.5 pt-2 text-base">Outside the editor</h2>
        <p className="text-[0.94rem] leading-[1.78]">
          A lot of my free time is spent moving through terrain: backcountry skiing, road biking,
          mountain biking, running, tennis, and whatever else fits the season. I like long efforts,
          good lines, and sports where preparation matters but conditions still get a vote.
        </p>
        <p className="text-[0.94rem] leading-[1.78]">
          That mindset overlaps with engineering more than it sounds like it should. Read the
          terrain, choose the line, keep enough margin, and adjust when reality disagrees with the
          plan.
        </p>

        <h2 className="mb-1.5 pt-2 text-base">What this desktop will become</h2>
        <ul className="pl-5">
          <li className="text-[0.94rem] leading-[1.78]">
            <strong>Projects:</strong> selected work, experiments, and tools I have built.
          </li>
          <li className="text-[0.94rem] leading-[1.78]">
            <strong>Infra:</strong> notes on systems, deployments, observability, and operating
            software.
          </li>
          <li className="text-[0.94rem] leading-[1.78]">
            <strong>Outside:</strong> routes, photos, activities, and the sports that keep me away
            from the keyboard.
          </li>
          <li className="text-[0.94rem] leading-[1.78]">
            <strong>Writing:</strong> short technical notes and decisions worth remembering.
          </li>
        </ul>

        <h2 className="mb-1.5 pt-2 text-base">Now</h2>
        <p className="text-[0.94rem] leading-[1.78]">
          This is the first window on the desktop: a small starting point for the rest of the site.
          The goal is for it to feel less like a portfolio page and more like opening a machine
          that reflects what I actually do.
        </p>
      </article>
    </>
  )
}

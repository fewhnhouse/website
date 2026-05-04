import type { RefObject } from 'react'

type HomeEditorProps = {
  documentRef: RefObject<HTMLElement | null>
}

export function HomeEditor({ documentRef }: HomeEditorProps) {
  return (
    <>
      <div className="editor-toolbar" aria-label="Editor toolbar">
        <button type="button">Preview</button>
        <button type="button">Markdown</button>
        <button type="button">Word wrap</button>
      </div>

      <article ref={documentRef} className="editor-document">
        <p className="editor-path">~/felix-website/home.mdx</p>
        <div className="editor-hero">
          <img src="/felix-portrait.jpg" alt="Felix Wohnhaas" />
          <div>
            <p className="editor-kicker">home.mdx</p>
            <h1>Felix Wohnhaas</h1>
            <p>
              I build software and infrastructure, and I like systems that are direct, reliable,
              and easy to reason about.
            </p>
          </div>
        </div>

        <h2>What I care about</h2>
        <p>
          My work tends to sit where product engineering meets operations: turning ideas into
          usable interfaces, wiring them to dependable backend systems, and keeping the deployment
          path boring enough that teams can move quickly.
        </p>
        <p>
          I enjoy clean TypeScript, pragmatic architecture, good developer experience,
          observability, automation, and infrastructure that does not require heroics to operate.
          The best systems feel calm because the important tradeoffs have already been made
          explicit.
        </p>

        <h2>Outside the editor</h2>
        <p>
          A lot of my free time is spent moving through terrain: backcountry skiing, road biking,
          mountain biking, running, tennis, and whatever else fits the season. I like long efforts,
          good lines, and sports where preparation matters but conditions still get a vote.
        </p>
        <p>
          That mindset overlaps with engineering more than it sounds like it should. Read the
          terrain, choose the line, keep enough margin, and adjust when reality disagrees with the
          plan.
        </p>

        <h2>What this desktop will become</h2>
        <ul>
          <li>
            <strong>Projects:</strong> selected work, experiments, and tools I have built.
          </li>
          <li>
            <strong>Infra:</strong> notes on systems, deployments, observability, and operating
            software.
          </li>
          <li>
            <strong>Outside:</strong> routes, photos, activities, and the sports that keep me away
            from the keyboard.
          </li>
          <li>
            <strong>Writing:</strong> short technical notes and decisions worth remembering.
          </li>
        </ul>

        <h2>Now</h2>
        <p>
          This is the first window on the desktop: a small starting point for the rest of the site.
          The goal is for it to feel less like a portfolio page and more like opening a machine
          that reflects what I actually do.
        </p>
      </article>
    </>
  )
}

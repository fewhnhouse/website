import type { RefObject } from 'react'

import type { NotesDocumentId } from '@/desktop/types'

type NotesAppProps = {
  document: NotesDocumentId
  documentRef: RefObject<HTMLElement | null>
  onOpenDocument: (document: NotesDocumentId) => void
}

type TimelineItem = {
  period: string
  title: string
  subtitle: string
  body: string
  tags: string[]
}

const toolbarButtonClass =
  'rounded-control border border-os-border bg-white/65 px-2.5 py-1.5 text-caption font-black text-os-ink-muted'
const documentClass =
  'min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-6 pt-5 pb-6 text-os-ink [max-height:calc(min(640px,calc(100svh_-_7.25rem))_-_86px)] [scrollbar-color:rgba(50,143,151,0.46)_transparent] [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-lagoon-deep/45 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-track]:bg-transparent [&_h1]:mt-0 [&_h2]:mt-0 [&_p]:mt-0 [&_pre]:mt-0 [&_ul]:mt-0 [.os-window--maximized_&]:[max-height:calc(100svh_-_218px)] max-[720px]:p-4 max-[720px]:[max-height:calc(100svh_-_14rem)]'
const proseClass = 'text-[0.94rem] leading-[1.78]'
const timelineClass =
  'relative grid gap-3 pl-7 before:absolute before:top-5 before:bottom-5 before:left-[0.44rem] before:w-px before:bg-os-border before:content-[""]'

const cvRoles = [
  {
    title: 'Software engineer',
    meta: 'Product engineering, infrastructure, and operations',
    body:
      'I work across frontend, backend, and infrastructure, with a bias toward systems that are direct to operate and easy for teams to reason about.',
  },
  {
    title: 'Core stack',
    meta: 'TypeScript, React, Node.js, Kubernetes, Docker',
    body:
      'Most of my day-to-day work sits in TypeScript application code, API design, deployment automation, and the operational details that make software reliable after it ships.',
  },
  {
    title: 'Working style',
    meta: 'Pragmatic, explicit, calm systems',
    body:
      'I care about clean interfaces, good developer experience, observability, automation, and infrastructure that keeps release paths boring.',
  },
]

const professionalTimeline: TimelineItem[] = [
  {
    period: 'Feb 2021 - present',
    title: 'Chief Technology Officer',
    subtitle: 'Pricenow',
    body:
      'Architected and built the product suite, including a customer-facing e-commerce solution, a large-scale dynamic pricing system, a scalable forecasting pipeline, and a data-first analytics platform built on top of data warehousing solutions. Helped make the strategic technical and product decisions needed to build the company from the ground up, while managing a team of seven people across data, forecasting, full-stack engineering, and design.',
    tags: ['Strategy', 'Architecture', 'Team leadership', 'Dynamic pricing', 'Forecasting'],
  },
  {
    period: 'Month YYYY - Month YYYY',
    title: 'Technical team lead',
    subtitle: 'Motius GmbH, Munich',
    body:
      'Led teams of up to four developers on client projects, coordinating implementation work while staying hands-on with architecture, delivery, and technical decisions.',
    tags: ['Team leadership', 'Client projects', 'Architecture', 'Delivery'],
  },
  {
    period: 'Month YYYY - Month YYYY',
    title: 'Working student, web and full-stack developer',
    subtitle: 'Motius GmbH, Munich',
    body:
      'Worked as a web developer and full-stack developer across several client projects, building product interfaces and backend functionality for different project contexts.',
    tags: ['Full-stack', 'Web development', 'Client projects', 'React'],
  },
  {
    period: 'Month YYYY - Month YYYY',
    title: 'Working student',
    subtitle: 'Gigatronik GmbH, Munich',
    body:
      'Developed an Arduino board that read OBD data from cars and combined it with GPS data to build an automated fleet tracking system.',
    tags: ['Arduino', 'OBD', 'GPS', 'Fleet tracking'],
  },
  {
    period: 'Month YYYY - Month YYYY',
    title: 'Production management',
    subtitle: 'Mecanomatic, Queretaro, Mexico',
    body:
      'Managed and optimized production chains for a metalworking manufacturing environment focused largely on CNC-based production, including workload planning for a team of about 20 people operating the CNC machines.',
    tags: ['Production management', 'CNC', 'Metalworking', 'Workload planning'],
  },
]

const educationTimeline: TimelineItem[] = [
  {
    period: 'Oct 2018 - present',
    title: 'Master of Media Informatics',
    subtitle: 'Ludwig Maximilian University of Munich',
    body:
      'Graduate studies in media informatics with a focus on software systems, human-computer interaction, product interfaces, and applied computer science.',
    tags: ['Media informatics', 'LMU Munich', 'Software systems'],
  },
  {
    period: 'Oct 2015 - Mar 2018',
    title: 'Bachelor of Science in Computer Science: Games Engineering',
    subtitle: 'Technical University of Munich',
    body:
      'Completed the Bachelor of Science degree in March 2018, combining computer science foundations with games engineering and interactive systems.',
    tags: ['Computer science', 'Games engineering', 'TUM'],
  },
  {
    period: 'Sep 2009 - Jul 2013',
    title: 'Abitur',
    subtitle: 'Robert-Bosch-Gymnasium, Langenau',
    body:
      'Completed the German Abitur in July 2013.',
    tags: ['Abitur', 'Robert-Bosch-Gymnasium'],
  },
  {
    period: 'Sep 2007 - Jul 2009',
    title: 'Secondary education',
    subtitle: 'Colegio Humboldt, Puebla, Mexico',
    body:
      'Continued secondary school education in Mexico in a bilingual, international school environment.',
    tags: ['Colegio Humboldt', 'Puebla', 'Mexico'],
  },
  {
    period: 'Sep 2005 - Jul 2007',
    title: 'Secondary education',
    subtitle: 'Robert-Bosch-Gymnasium, Langenau',
    body:
      'Attended Robert-Bosch-Gymnasium before continuing secondary education in Mexico.',
    tags: ['Robert-Bosch-Gymnasium', 'Langenau'],
  },
  {
    period: 'Sep 2001 - Jul 2005',
    title: 'Primary school',
    subtitle: 'Grundschule, Bernstadt',
    body:
      'Completed primary school education in Bernstadt.',
    tags: ['Primary school', 'Bernstadt'],
  },
]

export function NotesApp({ document, documentRef, onOpenDocument }: NotesAppProps) {
  const filename = `${document}.mdx`

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
          ~/felix-website/{filename}
        </p>
        {document === 'cv' ? <CvDocument /> : <HomeDocument onOpenDocument={onOpenDocument} />}
      </article>
    </>
  )
}

function HomeDocument({
  onOpenDocument,
}: {
  onOpenDocument: (document: NotesDocumentId) => void
}) {
  return (
    <>
      <div className="mb-5 grid grid-cols-[10.5rem_minmax(0,1fr)] items-center gap-5 max-[720px]:grid-cols-1 max-[720px]:justify-items-start">
        <img
          className="aspect-square w-[10.5rem] rounded-full border border-os-border object-cover object-[50%_30%] shadow-avatar max-[720px]:w-30"
          src="/felix-portrait.jpg"
          alt="Felix Wohnhaas"
        />
        <div>
          <p className="mb-1.5 font-mono text-meta font-black text-palm">home.mdx</p>
          <h1 className="mb-3.5 text-[clamp(1.85rem,4vw,3.3rem)] leading-none tracking-normal">
            Felix Wohnhaas
          </h1>
          <p className={proseClass}>
            I build software and infrastructure, and I like systems that are direct, reliable,
            and easy to reason about.
          </p>
        </div>
      </div>

      <h2 className="mb-1.5 pt-2 text-base">What I care about</h2>
      <p className={proseClass}>
        My work tends to sit where product engineering meets operations: turning ideas into
        usable interfaces, wiring them to dependable backend systems, and keeping the deployment
        path boring enough that teams can move quickly.
      </p>
      <p className={proseClass}>
        I enjoy clean TypeScript, pragmatic architecture, good developer experience,
        observability, automation, and infrastructure that does not require heroics to operate.
        The best systems feel calm because the important tradeoffs have already been made
        explicit.
      </p>
      <p className={proseClass}>
        For a structured version of my background, open{' '}
        <button
          type="button"
          className="cursor-pointer appearance-none border-0 bg-transparent p-0 font-[inherit] font-black text-lagoon-deep underline decoration-lagoon-deep/40 underline-offset-2"
          onClick={() => onOpenDocument('cv')}
        >
          cv.mdx
        </button>
        .
      </p>

      <h2 className="mb-1.5 pt-2 text-base">Outside the editor</h2>
      <p className={proseClass}>
        A lot of my free time is spent moving through terrain: backcountry skiing, road biking,
        mountain biking, running, tennis, and whatever else fits the season. I like long efforts,
        good lines, and sports where preparation matters but conditions still get a vote.
      </p>
      <p className={proseClass}>
        That mindset overlaps with engineering more than it sounds like it should. Read the
        terrain, choose the line, keep enough margin, and adjust when reality disagrees with the
        plan.
      </p>
    </>
  )
}

function CvDocument() {
  return (
    <>
      <p className="mb-1.5 font-mono text-meta font-black text-palm">cv.mdx</p>
      <h1 className="mb-3.5 text-[clamp(1.85rem,4vw,3.1rem)] leading-none tracking-normal">
        Curriculum vitae
      </h1>
      <p className={proseClass}>
        Software engineer focused on product engineering, backend systems, and the infrastructure
        that keeps teams shipping with confidence.
      </p>

      <h2 className="mb-2 pt-3 text-base">Profile</h2>
      <div className="grid gap-3">
        {cvRoles.map((role) => (
          <section key={role.title} className="rounded-card border border-os-border bg-white/55 p-3">
            <h3 className="m-0 text-[0.98rem]">{role.title}</h3>
            <p className="mt-1 mb-2 text-caption font-black text-palm">{role.meta}</p>
            <p className="m-0 text-[0.88rem] leading-[1.65] text-os-ink-muted">{role.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <Timeline title="Professional experience" items={professionalTimeline} />
        <Timeline title="Education" items={educationTimeline} />
      </div>

      <h2 className="mb-1.5 pt-4 text-base">Highlights</h2>
      <ul className="pl-5">
        <li className={proseClass}>Builds full-stack TypeScript products with React and Node.js.</li>
        <li className={proseClass}>Operates services on Kubernetes with Docker-based delivery.</li>
        <li className={proseClass}>Designs async systems with queues, workflows, and observable jobs.</li>
        <li className={proseClass}>Bridges product detail with infrastructure tradeoffs.</li>
      </ul>
    </>
  )
}

function Timeline({ items, title }: { items: TimelineItem[]; title: string }) {
  return (
    <section className="rounded-card border border-os-border bg-white/45 p-3.5">
      <h2 className="mt-0 mb-3 text-base">{title}</h2>
      <div className={timelineClass}>
        {items.map((item) => (
          <article key={`${item.period}-${item.title}`} className="relative rounded-card border border-os-border bg-white/65 p-3 shadow-chip">
            <span className="absolute top-4 -left-[1.93rem] size-3 rounded-full border-2 border-white bg-lagoon-deep shadow-[0_0_0_1px_rgba(20,38,45,0.14)]" />
            <p className="m-0 font-mono text-caption font-black text-lagoon-deep">{item.period}</p>
            <h3 className="mt-1 mb-1 text-[0.98rem] tracking-normal">{item.title}</h3>
            <p className="mt-0 mb-2 text-caption font-black text-palm">{item.subtitle}</p>
            <p className="m-0 text-[0.84rem] leading-[1.65] text-os-ink-muted">{item.body}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-os-border bg-foam/85 px-2 py-0.5 text-[0.66rem] font-extrabold text-os-ink-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

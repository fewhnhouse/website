import { Cloud, Code2, Container, Cpu } from 'lucide-react'
import type { ComponentType } from 'react'

type Skill = {
  name: string
  level: number
  detail?: string
}

type SkillGroup = {
  title: string
  summary: string
  icon: ComponentType<{ 'aria-hidden': true; size: number }>
  skills: Skill[]
  suggestions?: string[]
}

const skillGroups: SkillGroup[] = [
  {
    title: 'Languages',
    summary: 'Daily application code, querying, and interface work.',
    icon: Code2,
    skills: [
      { name: 'TypeScript', level: 8, detail: 'Frontend and backend application code' },
      { name: 'SQL', level: 7, detail: 'Data modeling, reporting, and operational queries' },
      { name: 'Python', level: 5, detail: 'Automation, scripts, and backend utilities' },
      { name: 'HTML', level: 8, detail: 'Semantic markup for product interfaces' },
      { name: 'CSS', level: 8, detail: 'Responsive layouts and design systems' },
    ],
  },
  {
    title: 'Frameworks & tools',
    summary: 'Product engineering stack and backend building blocks.',
    icon: Cpu,
    skills: [
      { name: 'React', level: 9, detail: 'Complex UI state and component systems' },
      { name: 'Next.js', level: 9, detail: 'Full-stack React applications' },
      { name: 'Express', level: 9, detail: 'HTTP APIs and service glue' },
      { name: 'Node.js', level: 9, detail: 'Runtime, tooling, and services' },
      { name: 'Argo Workflows', level: 8, detail: 'Batch jobs and orchestration' },
      { name: 'RabbitMQ', level: 8, detail: 'Queues, workers, and async processing' },
      { name: 'TanStack Router', level: 8, detail: 'Typed routing and data loading' },
      { name: 'Vite', level: 8, detail: 'Fast local development and builds' },
    ],
    suggestions: ['PostgreSQL', 'Tailwind CSS', 'Vitest', 'tRPC'],
  },
  {
    title: 'Infra',
    summary: 'Shipping services and keeping deployments understandable.',
    icon: Container,
    skills: [
      { name: 'Kubernetes', level: 8, detail: 'Workloads, services, debugging, and operations' },
      { name: 'Helm', level: 8, detail: 'Reusable deployment charts' },
      { name: 'Docker', level: 9, detail: 'Images, local stacks, and runtime packaging' },
      { name: 'GitHub Actions', level: 8, detail: 'CI pipelines and release automation' },
      { name: 'Terraform', level: 7, detail: 'Infrastructure-as-code foundations' },
      { name: 'Prometheus / Grafana', level: 7, detail: 'Metrics, dashboards, and alerting' },
    ],
    suggestions: ['OpenTelemetry', 'External Secrets', 'nginx / ingress', 'Flux CD or Argo CD'],
  },
  {
    title: 'Cloud',
    summary: 'Cloud platforms and the primitives worth calling out separately.',
    icon: Cloud,
    skills: [
      { name: 'AWS', level: 7, detail: 'EKS, ECS, S3, IAM, Lambda, RDS' },
      { name: 'Azure', level: 5, detail: 'AKS, Container Apps, App Service, Key Vault' },
      { name: 'GCP', level: 5, detail: 'GKE, Cloud Run, Cloud Storage, IAM' },
    ],
    suggestions: ['Cloud networking', 'Managed databases', 'Identity and access design', 'Cost controls'],
  },
]

const appShellClass =
  'flex min-h-0 flex-1 flex-col text-os-ink [max-height:calc(min(700px,calc(100svh_-_7.25rem))_-_42px)] [.os-window--maximized_&]:[max-height:calc(100svh_-_174px)]'
const panelClass = 'rounded-card border border-os-border bg-white/62 p-4 shadow-chip'

export function SkillsApp() {
  const allSkills = skillGroups.flatMap((group) => group.skills)
  const averageLevel = Math.round(
    allSkills.reduce((total, skill) => total + skill.level, 0) / allSkills.length,
  )

  return (
    <section className={appShellClass} aria-label="Programming skills">
      <div className="flex items-center justify-between gap-4 border-b border-os-border bg-foam/85 px-4 py-3">
        <div>
          <p className="m-0 text-caption font-black tracking-[0.14em] text-palm">SKILLS</p>
          <strong className="block text-[0.95rem]">Programming stack</strong>
        </div>
        <div className="rounded-control border border-os-border bg-white/70 px-3 py-1.5 text-meta font-black text-os-ink-muted">
          Avg {averageLevel}/10
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 [scrollbar-color:rgba(50,143,151,0.42)_transparent]">
        <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 max-sm:grid-cols-1">
          <div>
            <h2 className="m-0 text-[1.55rem] tracking-normal">Skills matrix</h2>
            <p className="mt-1.5 mb-0 max-w-[46rem] text-body-compact leading-relaxed text-os-ink-muted">
              A practical view of the technologies I use to build products, services, workflows,
              and the infrastructure they run on.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-right max-sm:grid-cols-4 max-sm:text-left">
            <Metric label="Groups" value={skillGroups.length} />
            <Metric label="Skills" value={allSkills.length} />
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
          {skillGroups.map((group) => (
            <SkillGroupCard key={group.title} group={group} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-os-border bg-white/60 px-3 py-2">
      <span className="block text-caption font-extrabold text-os-ink-soft">{label}</span>
      <strong className="block text-base">{value}</strong>
    </div>
  )
}

function SkillGroupCard({ group }: { group: SkillGroup }) {
  const Icon = group.icon

  return (
    <section className={panelClass}>
      <header className="mb-3 flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-card border border-os-border bg-[linear-gradient(145deg,rgba(96,215,207,0.26),rgba(246,200,95,0.2))] text-palm">
          <Icon aria-hidden={true} size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="m-0 text-base tracking-normal">{group.title}</h3>
          <p className="mt-1 mb-0 text-meta leading-relaxed text-os-ink-muted">{group.summary}</p>
        </div>
      </header>

      <div className="grid gap-3">
        {group.skills.map((skill) => (
          <SkillMeter key={skill.name} skill={skill} />
        ))}
      </div>

      {group.suggestions?.length ? (
        <footer className="mt-4 border-t border-os-border pt-3">
          <span className="block text-caption font-black uppercase tracking-[0.12em] text-os-ink-soft">
            Worth adding detail
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.suggestions.map((suggestion) => (
              <span
                key={suggestion}
                className="rounded-full border border-os-border bg-foam/80 px-2.5 py-1 text-caption font-extrabold text-os-ink-muted"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </footer>
      ) : null}
    </section>
  )
}

function SkillMeter({ skill }: { skill: Skill }) {
  return (
    <article>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h4 className="m-0 text-sm font-black">{skill.name}</h4>
          {skill.detail ? (
            <p className="mt-0.5 mb-0 text-caption font-bold leading-snug text-os-ink-soft">
              {skill.detail}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-control border border-os-border bg-white/70 px-2 py-1 text-caption font-black text-os-ink-muted">
          {skill.level}/10
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full border border-os-border bg-white/70"
        role="meter"
        aria-label={`${skill.name} skill level`}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={skill.level}
      >
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#328f97,#60d7cf,#f6c85f)]"
          style={{ width: `${skill.level * 10}%` }}
        />
      </div>
    </article>
  )
}

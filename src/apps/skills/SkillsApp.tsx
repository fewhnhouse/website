import { Cloud, Code2, Container, Cpu } from '@/components/PixelIcon'
import type { ComponentType } from 'react'

import { cn } from '@/lib/cn'

import {
  osAppHeight,
  osAppShellClass,
  osChipClass,
  osPanelClass,
  osScrollClass,
} from '@/apps/shared/appStyles'

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

export function SkillsApp() {
  const allSkills = skillGroups.flatMap((group) => group.skills)
  const averageLevel = Math.round(
    allSkills.reduce((total, skill) => total + skill.level, 0) / allSkills.length,
  )

  return (
    <section className={cn(osAppShellClass, osAppHeight.default)} aria-label="Programming skills">
      <div className="os-section-header">
        <div>
          <p className="os-section-header__kicker">SKILLS</p>
          <strong className="os-section-header__title">Programming stack</strong>
        </div>
        <div className={osChipClass}>Avg {averageLevel}/10</div>
      </div>

      <div className={cn('min-h-0 flex-1 overflow-auto p-4', osScrollClass)}>
        <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 max-sm:grid-cols-1">
          <div>
            <h2 className="m-0 font-display text-[1.4rem] font-normal lowercase tracking-normal text-ink">
              Skills matrix
            </h2>
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
    <div className="os-panel--bare px-3 py-2">
      <span className="block text-caption font-extrabold uppercase tracking-[0.1em] text-lagoon-deep">{label}</span>
      <strong className="block font-mono text-base text-ink">{value}</strong>
    </div>
  )
}

function SkillGroupCard({ group }: { group: SkillGroup }) {
  const Icon = group.icon

  return (
    <section className={osPanelClass}>
      <header className="mb-3 flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center border-2 border-ink bg-lagoon text-ink shadow-chip">
          <Icon aria-hidden={true} size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="m-0 text-base font-extrabold tracking-normal text-ink">{group.title}</h3>
          <p className="mt-1 mb-0 text-meta leading-relaxed text-ink-soft">{group.summary}</p>
        </div>
      </header>

      <div className="grid gap-3">
        {group.skills.map((skill) => (
          <SkillMeter key={skill.name} skill={skill} />
        ))}
      </div>

      {group.suggestions?.length ? (
        <footer className="mt-4 border-t-2 border-ink pt-3">
          <span className="block text-caption font-black uppercase tracking-[0.12em] text-lagoon-deep">
            Worth adding detail
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.suggestions.map((suggestion) => (
              <span key={suggestion} className={osChipClass}>
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
          <h4 className="m-0 text-sm font-black text-ink">{skill.name}</h4>
          {skill.detail ? (
            <p className="mt-0.5 mb-0 text-caption font-bold leading-snug text-ink-soft">
              {skill.detail}
            </p>
          ) : null}
        </div>
        <span className={cn(osChipClass, 'shrink-0 font-mono')}>{skill.level}/10</span>
      </div>
      <div
        className="h-3 overflow-hidden border-2 border-ink bg-foam"
        role="meter"
        aria-label={`${skill.name} skill level`}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={skill.level}
      >
        <div
          className="h-full bg-lagoon"
          style={{ width: `${skill.level * 10}%` }}
        />
      </div>
    </article>
  )
}

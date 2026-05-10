import type { NotesDocumentId } from '@/desktop/types'

export type NotesMarkdownByDocument = Record<NotesDocumentId, string>

export const initialNotesMarkdown = {
  home: `![Felix Wohnhaas](/felix-portrait.jpg)

# Felix Wohnhaas

I build software and infrastructure, and I like systems that are direct, reliable, and easy to reason about.

## What I care about

My work tends to sit where product engineering meets operations: turning ideas into usable interfaces, wiring them to dependable backend systems, and keeping the deployment path boring enough that teams can move quickly.

I enjoy clean TypeScript, pragmatic architecture, good developer experience, observability, automation, and infrastructure that does not require heroics to operate. The best systems feel calm because the important tradeoffs have already been made explicit.

For a structured version of my background, open [\`cv.mdx\`](/cv).

## Outside the editor

A lot of my free time is spent moving through terrain: backcountry skiing, road biking, mountain biking, running, tennis, and whatever else fits the season. I like long efforts, good lines, and sports where preparation matters but conditions still get a vote.

That mindset overlaps with engineering more than it sounds like it should. Read the terrain, choose the line, keep enough margin, and adjust when reality disagrees with the plan.
`,
  cv: `# Curriculum vitae

Software engineer focused on product engineering, backend systems, and the infrastructure that keeps teams shipping with confidence.

## Profile

### Software engineer

Product engineering, infrastructure, and operations

I work across frontend, backend, and infrastructure, with a bias toward systems that are direct to operate and easy for teams to reason about.

### Core stack

TypeScript, React, Node.js, Kubernetes, Docker

Most of my day-to-day work sits in TypeScript application code, API design, deployment automation, and the operational details that make software reliable after it ships.

### Working style

Pragmatic, explicit, calm systems

I care about clean interfaces, good developer experience, observability, automation, and infrastructure that keeps release paths boring.

## Professional experience

### Chief Technology Officer, Pricenow

Feb 2021 - present

Architected and built the product suite, including a customer-facing e-commerce solution, a large-scale dynamic pricing system, a scalable forecasting pipeline, and a data-first analytics platform built on top of data warehousing solutions. Helped make the strategic technical and product decisions needed to build the company from the ground up, while managing a team of seven people across data, forecasting, full-stack engineering, and design.

### Technical team lead, Motius GmbH, Munich

Month YYYY - Month YYYY

Led teams of up to four developers on client projects, coordinating implementation work while staying hands-on with architecture, delivery, and technical decisions.

### Working student, web and full-stack developer, Motius GmbH, Munich

Month YYYY - Month YYYY

Worked as a web developer and full-stack developer across several client projects, building product interfaces and backend functionality for different project contexts.

### Working student, Gigatronik GmbH

Month YYYY - Month YYYY

Developed an Arduino board that read OBD data from cars and combined it with GPS data to build an automated fleet tracking system.

### Production management, Mecanomatic, Queretaro, Mexico

Month YYYY - Month YYYY

Managed and optimized production chains for a metalworking manufacturing environment focused largely on CNC-based production, including workload planning for a team of about 20 people operating the CNC machines.

## Education

### Master of Media Informatics, Ludwig Maximilian University of Munich

Oct 2018 - present

Graduate studies in media informatics with a focus on software systems, human-computer interaction, product interfaces, and applied computer science.

### Bachelor of Science in Computer Science: Games Engineering, Technical University of Munich

Oct 2015 - Mar 2018

Completed the Bachelor of Science degree in March 2018, combining computer science foundations with games engineering and interactive systems.

### Abitur, Robert-Bosch-Gymnasium, Langenau

Sep 2009 - Jul 2013

Completed the German Abitur in July 2013.

### Secondary education, Colegio Humboldt, Puebla, Mexico

Sep 2007 - Jul 2009

Continued secondary school education in Mexico in a bilingual, international school environment.

### Secondary education, Robert-Bosch-Gymnasium, Langenau

Sep 2005 - Jul 2007

Attended Robert-Bosch-Gymnasium before continuing secondary education in Mexico.

### Primary school, Grundschule, Bernstadt

Sep 2001 - Jul 2005

Completed primary school education in Bernstadt.

## Highlights

- Builds full-stack TypeScript products with React and Node.js.
- Operates services on Kubernetes with Docker-based delivery.
- Designs async systems with queues, workflows, and observable jobs.
- Bridges product detail with infrastructure tradeoffs.
`,
} satisfies NotesMarkdownByDocument

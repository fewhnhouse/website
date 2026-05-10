import type { NotesDocumentId } from "@/desktop/types";

export type NotesMarkdownByDocument = Record<NotesDocumentId, string>;

export const initialNotesMarkdown = {
  home: `![Felix Wohnhaas](/felix-portrait.jpg)

# Felix Wohnhaas

Hi, there, glad you are here!
As you are on my website, I assume you are here to learn about me, my work, and my interests.
I have always been interested in building things. It started with building Lego models as a kid. I could spend hours and hours in my grandpa's living room building stuff. Soon thereafter, I got into Minecraft, building whole worlds as a teenager. I was fascinated by the possibility of simply creating things from nothing.
This is also one of the main reasons why I started getting into Games Engineering for my Bachelor's degree. While Minecraft allowed me to build things *within* a game, what I learned in my studies taught me to build the game itself.
During my studies, I started working some jobs as a working student, which eventually got me into web development. I had connected a Raspberry Pi to an OBD port (a port for reading data from a car) and a GPS device to gather fleet data for my companies car fleet.
To visualize the results, I got into Angular.JS and built a dashboard to display the fleet data. From that time on, my love for building for the web was born. Soon thereafter, I started working as a frontend engineer, at a different company called Motius in Munich. I delivered some really cool projects, such as a web-based VISA application app, or app to visualize electricity consumption and their predicted development on an interactive map.
Working at Motius, I got into backend engineering more and more, as I wanted to not only build the interfaces for web apps, but also their business logic. I soon became a team lead for smaller customer projects, leading the full-stack development process. I also built several smaller side projects in my free time, such as a build editor for one of my favorite games at the time.
I finished my time at Motius with my master thesis, where I built a complete issue tracking system on the back of Taiga, as an alternative to the bloated Jira at the time. With more and more teams adopting Linear, I guess I had a hunch back then ;)
After that, I got contacted by Reto, the CEO of Pricenow AG, who was engaged to my cousin at the time. They had just started their company, Pricenow. As the founders were all economists, they started with an external contractor building their platform, soon realizing that they would need to bring their core product in house. Reto trusted me to join Pricenow as a CTO with my limited experience back then, giving me a huge chance and opportunity to apply my skills to lead the technical direction of the company. As a result, I have also gotten into software architecture and infrastructure (DevOps), building Pricenow's whole product from scratch. I have learned a lot along the way, but I am not done and I am constantly looking for ways to improve and grow!

While I do enjoy learning more about my field of work in my free time as well, I also appreciate spending some time off the screen. I love doing sports and I am very active on the road bike, mountainbike and running, as well as playing tennis. In the winter, I love backcountry skiing and cross-country skiing (skating). Overall, I am a huge fan of the mountains and being in the nature to recharge my batteries.
Doing sports also gives me a lot of time to think clear my head, which eventually helps me take better decisions. Sometimes, it is important to take a step back to move forward ;)
To me, a healthy lifestyle also means spending time with my friends and family, which luckily I can usually combine with the above.

For a structured version of my background, open [\`cv.mdx\`](/cv).

## What I care about

I love to tackle problems head-on and moving fast. Places where people are not free to voice their opinions and ideas and try stuff out are not for me. Mistakes can happen, but I always try to learn from them and improve. Either way, it is better than being stuck and not trying at all.
It is important to me that I can trust the people around me, just as I expect to be trusted by them. Being able to rely on my team gives me the confidence to take tough decisions and also take responsibility for them. I am convinced that a team works more efficiently in an environment where everyone can openly express their opinions.
My work is my passion. This means that delivering high quality work is important to me, and I expect the same for my team.
While I do think KPIs and metrics are important and can provide value, I believe that in the end, they are just tools. I value the gut feeling and opinions of myself and those around me more than any numbers.

Building Software is not just code (especially not these days). It's understanding people, finding clever solutions for complex problems, and delivering value to users. It's being creative and open to new ideas. It's a constant journey of learning and improvement.
Building Software is an art.
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
} satisfies NotesMarkdownByDocument;

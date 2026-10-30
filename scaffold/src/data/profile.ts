/* ============================================================
   EDIT YOUR CONTENT HERE. Anything in [brackets] is a placeholder.
   ============================================================ */

export const profile = {
  name: "Lee",
  handle: "lee",
  host: "portfolio",
  initials: "L",
  photo: "", // e.g. "/me.jpg" (put the file in /public). Empty = show initials.
  role: "Senior Backend Engineer · Python / Django",
  bio: [
    "I build the parts of products people never see: APIs, data models, queues and the plumbing that keeps them fast under load. About five years of shipping backend systems in Python and Django on PostgreSQL.",
    "[One line on what you care about most, e.g. \"I like turning slow, fragile services into boring, reliable ones.\"]",
  ],
  facts: [
    { before: "", value: "~5", after: "yrs backend" },
    { before: "based in", value: "Bengaluru", after: "" },
    { before: "open to", value: "senior backend", after: "roles" },
  ],
}

export type Job = { from: string; to: string; title: string; org: string; points: string[] }
export const experience: Job[] = [
  {
    from: "[2023]", to: "present", title: "[Senior Software Engineer]", org: "[Company]",
    points: ["[Led X: cut p95 latency of Y API from 800 ms to 120 ms]", "[Owned Z service handling N requests/day]"],
  },
  {
    from: "[2021]", to: "[2023]", title: "[Software Engineer]", org: "[Company]",
    points: ["[Built feature / migration with measurable result]", "[Mentored / introduced a practice the team adopted]"],
  },
  {
    from: "[2019]", to: "[2021]", title: "[Backend Developer]", org: "[Company]",
    points: ["[What you shipped and its impact]"],
  },
]

export type Project = { slug: string; problem: string; decision: string; stack: string[]; metric: string; href?: string }
export const projects: Project[] = [
  {
    slug: "[project-one]",
    problem: "[What was broken or missing]",
    decision: "[e.g. Moved fan-out to Celery + Redis instead of doing it inside the request]",
    stack: ["Django", "Celery", "Redis"],
    metric: "[impact metric]",
  },
  {
    slug: "[project-two]",
    problem: "[What was broken or missing]",
    decision: "[The trade-off you chose and why]",
    stack: ["PostgreSQL", "DRF"],
    metric: "[impact metric]",
  },
  {
    slug: "[project-three]",
    problem: "[What was broken or missing]",
    decision: "[The trade-off you chose and why]",
    stack: ["AWS", "Docker"],
    metric: "[impact metric]",
  },
]

export const stack: { group: string; items: string[] }[] = [
  { group: "languages", items: ["Python", "SQL", "C++"] },
  { group: "frameworks", items: ["Django", "Django REST Framework", "Celery"] },
  { group: "data", items: ["PostgreSQL", "Redis"] },
  { group: "infra", items: ["[AWS]", "[Docker]", "[Nginx]"] },
  { group: "practices", items: ["[API design]", "[query tuning]", "[async jobs]"] },
]

export const contact = {
  email: "[you@example.com]",
  links: [
    { label: "github", text: "github.com/[handle]", href: "https://github.com/" },
    { label: "linkedin", text: "linkedin.com/in/[handle]", href: "https://www.linkedin.com/" },
    { label: "resume", text: "[resume.pdf]", href: "#" },
  ],
}

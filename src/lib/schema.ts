// The shape of every API resource. The same schemas validate the local JSON and a real API's responses, so a
// malformed or partial response fails the build instead of shipping an empty page.
import { z } from 'astro/zod';

const text = z.string().min(1);
const load = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const profileSchema = z.object({
  name: text,
  partNumber: text,
  role: text,
  headline: text,
  summary: text,
  location: text,
  city: text,
  workMode: text,
  years: text,
  timezone: text,
  status: z.object({ active: z.boolean(), text }),
  coreStack: z.array(text).min(1),
  email: text,
  resumeUrl: text,
  replyTime: text,
});

// the drawings place these by name (about.astro), so only these exist
export const ABOUT_PINS = ['python', 'postgresql', 'apis', 'email', 'resume', 'years', 'timezone'] as const;

export const aboutSchema = z.object({
  pins: z.array(z.object({
    id: z.enum(ABOUT_PINS),
    label: text,
    type: z.enum(['I/O', 'Output', 'Clock']),
    lines: z.array(text).min(1),
    action: z.object({ text, href: text }).optional(),
  })).min(1),
});

const skillChip = z.object({ name: text, load, note: text.optional() });
export const skillsSchema = z.object({
  strongest: z.array(text),
  next: text,
  loadLegend: z.object({ '1': text, '2': text, '3': text }),
  modules: z.array(z.object({
    id: z.enum(['A1', 'A2', 'B1', 'B2']),
    group: text,
    short: text,
    chips: z.array(skillChip.nullable()).length(3),
  })).length(4),
});

export const experienceSchema = z.object({
  roles: z.array(z.object({
    id: text,
    kind: z.enum(['NAND', 'CTRL']),
    company: text,
    title: text,
    from: text,
    to: text.nullable(),
    impact: text,
  })).length(3).refine(
    (roles) => roles.every((r, i) => (i === roles.length - 1) === (r.to === null && r.kind === 'CTRL')),
    'the drive draws three roles, oldest first: two finished (kind NAND) and the current one last (to: null, kind CTRL)',
  ),
});

export const projectsSchema = z.object({
  projects: z.array(z.object({
    id: text,
    name: text,
    stack: z.array(text).min(1),
    problem: text,
    fix: text,
    result: text,
  })).length(3),
});

export const schemas = {
  profile: profileSchema,
  about: aboutSchema,
  skills: skillsSchema,
  experience: experienceSchema,
  projects: projectsSchema,
};

export type Resource = keyof typeof schemas;
export type ResourceMap = { [R in Resource]: z.infer<(typeof schemas)[R]> };
export type Profile = ResourceMap['profile'];
export type About = ResourceMap['about'];
export type Skills = ResourceMap['skills'];
export type SkillChip = z.infer<typeof skillChip>;
export type Experience = ResourceMap['experience'];
export type Role = Experience['roles'][number];
export type Projects = ResourceMap['projects'];
export type Project = Projects['projects'][number];

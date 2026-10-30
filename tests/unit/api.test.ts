import { describe, it, expect } from 'vitest';
import { getResource, RESOURCES } from '../../src/lib/api';
import { GET, getStaticPaths } from '../../src/pages/api/v1/[resource].json';
import skillsFile from '../../src/data/api/v1/skills.json';

describe('getResource (local JSON)', () => {
  it('parses every resource', async () => {
    for (const name of RESOURCES) await expect(getResource(name)).resolves.toBeTruthy();
  });

  it('skills: exactly 4 modules of 3 chip sites, one free socket', async () => {
    const skills = await getResource('skills');
    expect(skills.modules).toHaveLength(4);
    for (const m of skills.modules) expect(m.chips).toHaveLength(3);
    expect(skills.modules.flatMap((m) => m.chips).filter((c) => c === null)).toHaveLength(1);
  });

  it('experience: oldest first, the current role last with no end and on the controller', async () => {
    const { roles } = await getResource('experience');
    expect(roles.at(-1)?.to).toBeNull();
    expect(roles.at(-1)?.kind).toBe('CTRL');
  });

  it('projects: exactly three', async () => {
    expect((await getResource('projects')).projects).toHaveLength(3);
  });

  it('about: the seven fact pins', async () => {
    expect((await getResource('about')).pins.map((p) => p.label)).toEqual(
      ['PYTHON', 'POSTGRESQL', 'APIS', 'EMAIL', 'RÉSUMÉ', '~5 YEARS', 'IST UTC+5:30']);
  });

  it('keeps placeholders exactly, brackets included', async () => {
    const profile = await getResource('profile');
    expect(profile.email).toBe('[you@example.com]');
    expect(profile.replyTime).toBe('[24 hours]');
    expect((await getResource('experience')).roles[0].company).toBe('[Company]');
  });
});

describe('getResource (remote API)', () => {
  it('fetches <base>/v1/<resource> and validates it', async () => {
    const seen: string[] = [];
    const fetchImpl = async (url: string) => { seen.push(url); return new Response(JSON.stringify(skillsFile)); };
    const skills = await getResource('skills', { base: 'https://api.example.test', fetchImpl });
    expect(seen).toEqual(['https://api.example.test/v1/skills']);
    expect(skills.modules).toHaveLength(4);
  });

  it('loader throws on fetch failure, naming the resource', async () => {
    const fetchImpl = async () => { throw new Error('connect ECONNREFUSED'); };
    await expect(getResource('projects', { base: 'https://api.example.test', fetchImpl })).rejects.toThrow(/projects/);
  });

  it('throws on a non-OK response', async () => {
    const fetchImpl = async () => new Response('nope', { status: 503 });
    await expect(getResource('profile', { base: 'https://api.example.test', fetchImpl })).rejects.toThrow(/profile.*503/);
  });

  it('names the resource when a 200 response is not JSON', async () => {
    const fetchImpl = async () => new Response('<html>Bad gateway</html>', { status: 200 });
    await expect(getResource('profile', { base: 'https://api.example.test', fetchImpl })).rejects.toThrow(/profile/);
  });

  it('gives up on a hanging API, naming the resource', async () => {
    const fetchImpl = (_url: string, init?: RequestInit) => new Promise<Response>((_, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal!.reason));
    });
    await expect(getResource('skills', { base: 'https://api.example.test', fetchImpl, timeoutMs: 20 })).rejects.toThrow(/skills/);
  });

  it('rejects data that does not match the schema', async () => {
    const fetchImpl = async () => new Response(JSON.stringify({ projects: [] }));
    await expect(getResource('projects', { base: 'https://api.example.test', fetchImpl })).rejects.toThrow();
  });
});

describe('schemas only accept what the drawings can draw', () => {
  const remote = (body: unknown) => ({ base: 'https://api.example.test', fetchImpl: async () => new Response(JSON.stringify(body)) });
  const experienceFile = { roles: [
    { id: 'r1', kind: 'NAND', company: 'A', title: 'T', from: '2019', to: '2021', impact: 'I' },
    { id: 'r2', kind: 'NAND', company: 'B', title: 'T', from: '2021', to: '2023', impact: 'I' },
    { id: 'r3', kind: 'CTRL', company: 'C', title: 'T', from: '2023', to: null, impact: 'I' },
  ] };

  it('experience: three roles draw', async () => {
    await expect(getResource('experience', remote(experienceFile))).resolves.toBeTruthy();
  });

  it('experience: four roles are refused, naming the resource', async () => {
    const roles = [experienceFile.roles[0], ...experienceFile.roles];
    await expect(getResource('experience', remote({ roles }))).rejects.toThrow(/experience/);
  });

  it('experience: the last role must be current, on the controller', async () => {
    const roles = [...experienceFile.roles.slice(0, 2), { ...experienceFile.roles[2], to: '2024' }];
    await expect(getResource('experience', remote({ roles }))).rejects.toThrow(/experience/);
  });

  it('about: an unknown pin is refused, naming the resource', async () => {
    const pins = [{ id: 'golang', label: 'GO', type: 'I/O', lines: ['Go'] }];
    await expect(getResource('about', remote({ pins }))).rejects.toThrow(/about/);
  });
});

describe('/api/v1/<resource>.json endpoint', () => {
  it('builds one path per resource', async () => {
    const paths = await getStaticPaths();
    expect(paths.map((p) => p.params.resource).sort()).toEqual([...RESOURCES].sort());
  });

  it('serves the same body as the JSON file', async () => {
    const res = await GET({ params: { resource: 'skills' } } as never);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
    expect(await res.json()).toEqual(skillsFile);
  });
});

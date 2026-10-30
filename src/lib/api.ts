// The one door to site content. Pages call getResource() at build time. By default it reads the API-shaped JSON in
// src/data/api/v1; with LEE_API_BASE set it fetches `${LEE_API_BASE}/v1/<resource>` instead. Either way the data is
// validated, and any failure throws with the resource's name so the build stops rather than shipping a blank page.
import { schemas, type Resource, type ResourceMap } from './schema';

export type { Resource, ResourceMap } from './schema';
export const RESOURCES = Object.keys(schemas) as Resource[];

const local = import.meta.glob<{ default: unknown }>('../data/api/v1/*.json', { eager: true });

type Fetch = (url: string) => Promise<Response>;
interface Options { base?: string; fetchImpl?: Fetch }

export async function getResource<R extends Resource>(name: R, opts: Options = {}): Promise<ResourceMap[R]> {
  const base = opts.base ?? import.meta.env.LEE_API_BASE;
  let raw: unknown;
  if (base) {
    const url = `${base.replace(/\/$/, '')}/v1/${name}`;
    let res: Response;
    try {
      res = await (opts.fetchImpl ?? fetch)(url);
    } catch (err) {
      throw new Error(`API resource "${name}" could not be fetched from ${url}: ${(err as Error).message}`);
    }
    if (!res.ok) throw new Error(`API resource "${name}" returned ${res.status} from ${url}`);
    raw = await res.json();
  } else {
    const file = local[`../data/api/v1/${name}.json`];
    if (!file) throw new Error(`API resource "${name}" has no file at src/data/api/v1/${name}.json`);
    raw = file.default;
  }
  const parsed = schemas[name].safeParse(raw);
  if (!parsed.success) throw new Error(`API resource "${name}" failed validation: ${parsed.error.message}`);
  return parsed.data as ResourceMap[R];
}

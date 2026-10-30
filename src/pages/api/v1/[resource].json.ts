// /api/v1/<resource>.json: the same responses the site is built from, published as static files so the URL shape
// matches the real API that will replace them
import type { APIRoute, GetStaticPaths } from 'astro';
import { getResource, RESOURCES, type Resource } from '../../../lib/api';

export const getStaticPaths = (() => RESOURCES.map((resource) => ({ params: { resource } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const data = await getResource(params.resource as Resource);
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};

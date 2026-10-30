# lee.sh — portfolio v2

Single-page terminal portfolio. A centred terminal stays on screen; each scroll step
(or `j` / `k`) types the next command and swaps the output.

Stack: Vite · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (new-york style).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
```

## Edit your content

Everything you'd change lives in **`src/data/profile.ts`**: bio, experience,
projects, stack and contact links. Anything in `[brackets]` is a placeholder.
Put a photo in `public/` and set `profile.photo` to `"/me.jpg"`.

To add, remove or reorder commands, edit the `SECTIONS` list at the bottom of
`src/components/sections.tsx`.

## shadcn/ui

`components.json` is set up, so you can add more components with the CLI:

```bash
npx shadcn@latest add tooltip
```

Included: `button`, `badge`, `card` in `src/components/ui/`.
Theme colours are the CSS variables at the top of `src/index.css`.

## Deploy

`dist/` is plain static files. Any of these work:

- **Vercel / Netlify**: import the repo, framework "Vite", build `npm run build`, output `dist`.
- **GitHub Pages**: build, then publish `dist/`. If it's served from
  `https://<user>.github.io/<repo>/`, add `base: "/<repo>/"` to `vite.config.ts`.
- **Custom domain** (e.g. lee.sh / lee.dev): point DNS at whichever host you use.

# 🌻 Minimalist JS|TS full stack template

## Features

-   SSR
-   Binary
-   Desktop (Tauri app.)
-   Cloudflare Pages
-   Edge
-   Routing (Hono/Wouter JS)
-   Tailwind/Shadcn (can be replaced by any UI library, or raw CSS)
-   Easily extensible

## Why?

I was seeking a straightforward boilerplate with minimal dependencies and no unnecessary complexities—something simple yet efficient.
A single `app.tsx` file would suffice, although additional files may be included if desired.

## Install

```
bun i
```

## Commands

### Dev (local)

```
bun run dev
```

### Dev (Cloudflare pages)

```
bun run dev:pages
```

### Build and run (binary)

```
bun run build:binary && \
./simple-app
```

### Build (Cloudflare Pages)

```
bun run build:pages
```

### Deploy (Cloudflare Pages)

> First you'll need to create a Pages project `bun run wrangler pages project create` (call it `simple-app` or modify `package.json` with the name you want).

Then, run:

```
bun run deploy:pages
```

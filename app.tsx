import { ThemeModeScript } from "@shadcn/components/theme-mode-script";
import { ModeToggle } from "@shadcn/components/ui/mode-toggle";
import { type ReactNode } from "react";
import {
  Link,
  STATIC_OUTPUT_DIR,
  app,
  isComponentRoute,
  useLoaderData,
  type ApiRoute,
  type ComponentRoute,
  type LoaderParams,
  type Routes,
} from "simple";
import { Route, Switch } from "wouter";

export const routes = {
  "/": {
    component: Home,
    loader: homeLoader,
  },
  "/user/:id": {
    get: {
      component: User,
      loader: userLoader,
    },
    post: () =>
      new Response(JSON.stringify({ status: "connected" }), {
        headers: { "Content-Type": "application/json" },
      }),
  },
  "/routing": { component: Routing },
  "/api/healthcheck": {
    get: () =>
      new Response(JSON.stringify({ status: "healthy" }), {
        headers: { "Content-Type": "application/json" },
      }),
  },
  "/:rest*": { component: Error404 },
} satisfies Routes;

export function App() {
  return (
    <html lang="en">
      <head>
        <title>Simple</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href={`/${STATIC_OUTPUT_DIR}/output.css`} rel="stylesheet" />
        <ThemeModeScript />
      </head>
      <body className="min-h-screen w-screen">
        <Switch>
          {(Object.keys(routes) as (keyof typeof routes)[])
            .map((k) => {
              const route = routes[k];
              let component: ComponentRoute["component"] | null = null;

              if (isComponentRoute(route)) {
                component = route.component;
              } else {
                const get = (route as ApiRoute).get;
                if (get && isComponentRoute(get)) {
                  component = get.component;
                }
              }

              return component === null ? null : (
                <Route key={`_route_${k}`} path={k} component={component} />
              );
            })
            .filter((r) => r !== null)}
        </Switch>
      </body>
    </html>
  );
}

function Error404() {
  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center space-y-12">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        404.
      </h1>
      <Link className="text-foreground underline underline-offset-4" href="/">
        Home
      </Link>
    </div>
  );
}

function User({ params: { id } }: { params: { id: string } }) {
  const {
    user: { name },
  } = useLoaderData<Awaited<ReturnType<typeof userLoader>>>();

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center space-y-12">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Hello <span>{name ?? id}</span>
      </h1>
      <Link className="text-foreground underline underline-offset-4" href="/">
        Home
      </Link>
    </div>
  );
}

async function userLoader({ req, params: { id } }: LoaderParams) {
  return {
    user: {
      id,
      name: "John",
    },
  };
}

function Routing() {
  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center space-y-12">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Another route.
      </h1>
      <div className="flex space-x-3">
        <Link
          className="text-foreground underline underline-offset-4"
          href="https://github.com/molefrog/wouter"
          target="_blank"
          rel="noreferrer"
        >
          Wouter on Github
        </Link>
        <Link className="text-foreground underline underline-offset-4" href="/">
          Home
        </Link>
      </div>
    </div>
  );
}

function Home() {
  const { tags } = useLoaderData<Awaited<ReturnType<typeof homeLoader>>>();

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center space-y-12">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        One file, simple.
      </h1>

      <div className="flex max-w-md flex-wrap items-top justify-center space-x-2">
        {tags.map(({ label, href }) =>
          href ? (
            <Link
              key={`tag-${label}`}
              href={href}
              target={href.startsWith("http") ? "_blank" : "_self"}
            >
              <Code>{label}</Code>
            </Link>
          ) : (
            <Code key={`tag-${label}`}>{label}</Code>
          ),
        )}
      </div>
      <ModeToggle />
    </div>
  );
}

// function homeLoader({ env, req, params }: LoaderParams)
function homeLoader() {
  return Promise.resolve({
    tags: [
      { label: "JS/TS" },
      { label: "SSR" },
      { label: "Desktop" },
      { label: "Binary" },
      { label: "Web" },
      { label: "Cloudflare", href: "https://pages.cloudflare.com" },
      { label: "React", href: "https://react.dev" },
      { label: "Bun", href: "https://bun.sh" },
      { label: "Tauri", href: "https://tauri.app" },
      { label: "Tailwind", href: "https://tailwindcss.com" },
      { label: "Shadcn", href: "https://ui.shadcn.com" },
      { label: "Wouter", href: "/routing" },
      { label: "User", href: "/user/223" },
    ],
  });
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="mb-1 bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {children}
    </code>
  );
}

export default app;
